"""
Telemetry Service for processing robot state and action data
"""

import logging
import requests
import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
import json
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import config
from schemas.viewer import TelemetryData, TelemetryPoint

logger = logging.getLogger(__name__)

# Constants
DEFAULT_FPS = 30
DEFAULT_CHUNK_SIZE = 1000
REQUEST_TIMEOUT = 30


class TelemetryService:
    """Service for fetching and processing telemetry data from HuggingFace datasets"""
    
    def __init__(self, token: str):
        """Initialize telemetry service with HuggingFace token"""
        if not token or not isinstance(token, str):
            raise ValueError("token must be a non-empty string")
        
        self.token = token
        self.headers = {"Authorization": f"Bearer {token}"}
        self._cache = {}
        self._cache_ttl = timedelta(minutes=config.CACHE_TTL_MINUTES)
    
    def get_episode_telemetry(
        self, 
        repo_id: str, 
        episode_id: int,
        features_metadata: Optional[Dict] = None
    ) -> Optional[TelemetryData]:
        """
        Fetch and process telemetry data for a specific episode
        
        Args:
            repo_id: Dataset repository ID (e.g., "lerobot/pusht")
            episode_id: Episode index
            features_metadata: Optional metadata about dataset features
            
        Returns:
            TelemetryData object or None if not available
        """
        # Input validation
        if not repo_id or not isinstance(repo_id, str):
            raise ValueError("repo_id must be a non-empty string")
        
        if not isinstance(episode_id, int) or episode_id < 0:
            raise ValueError("episode_id must be a non-negative integer")
        
        if features_metadata is not None and not isinstance(features_metadata, dict):
            raise ValueError("features_metadata must be a dictionary or None")
        
        cache_key = f"telemetry_{repo_id}_{episode_id}"
        
        # Check cache
        if cache_key in self._cache:
            cached_data, cache_time = self._cache[cache_key]
            if datetime.now() - cache_time < self._cache_ttl:
                logger.debug(f"Using cached telemetry for {repo_id} episode {episode_id}")
                return cached_data
        
        try:
            # First, try to get metadata to understand the dataset structure
            if not features_metadata:
                features_metadata = self._get_dataset_features(repo_id)
            
            if not features_metadata:
                logger.warning(f"Could not get features metadata for {repo_id}")
                return None
            
            # Determine chunk size and data path pattern
            chunks_size = features_metadata.get("chunks_size", DEFAULT_CHUNK_SIZE)
            episode_chunk = episode_id // chunks_size
            
            # Try LeRobot pattern first - data/chunk-XXX/episode_XXXXXX.parquet
            data_url = f"https://huggingface.co/datasets/{repo_id}/resolve/main/data/chunk-{episode_chunk:03d}/episode_{episode_id:06d}.parquet"
            
            logger.info(f"Trying to fetch telemetry from: {data_url}")
            response = requests.head(data_url, headers=self.headers, timeout=5)
            
            if response.status_code == 404:
                # Try alternative pattern with different chunk padding
                data_url = f"https://huggingface.co/datasets/{repo_id}/resolve/main/data/chunk-{episode_chunk:04d}/episode_{episode_id:06d}.parquet"
                response = requests.head(data_url, headers=self.headers, timeout=5)
            
            if response.status_code == 404:
                # Try HuggingFace datasets pattern
                data_url = f"https://huggingface.co/datasets/{repo_id}/resolve/main/data/train-{episode_chunk:05d}-of-NNNNN.parquet"
                test_url = data_url.replace("NNNNN", "00001")
                response = requests.head(test_url, headers=self.headers, timeout=5)
                
            if response.status_code == 404:
                # Try fetching from episodes.jsonl for episode info
                logger.warning(f"Could not find parquet file for episode {episode_id}, falling back to episodes.jsonl")
                return self._get_telemetry_from_episodes_file(repo_id, episode_id, features_metadata)
            
            # Fetch the parquet file
            logger.info(f"Fetching telemetry data from {data_url}")
            # Download the file first then read it
            try:
                import io
                response = requests.get(data_url, headers=self.headers, timeout=REQUEST_TIMEOUT)
                if response.status_code == 200:
                    df = pd.read_parquet(io.BytesIO(response.content))
                else:
                    logger.error(f"Failed to fetch parquet file: HTTP {response.status_code}")
                    return None
            except Exception as e:
                logger.error(f"Failed to read parquet file: {e}")
                return None
            
            # Filter for the specific episode
            if "episode_index" in df.columns:
                episode_data = df[df["episode_index"] == episode_id]
            else:
                # Fallback: assume sequential episodes
                episode_data = df
            
            if episode_data.empty:
                logger.warning(f"No data found for episode {episode_id}")
                return None
            
            # Process the data
            telemetry = self._process_telemetry_data(
                episode_data, 
                episode_id, 
                features_metadata
            )
            
            # Cache the result
            self._cache[cache_key] = (telemetry, datetime.now())
            
            return telemetry
            
        except Exception as e:
            logger.error(f"Error fetching telemetry for {repo_id} episode {episode_id}: {e}")
            return None
    
    def _get_dataset_features(self, repo_id: str) -> Optional[Dict]:
        """Get dataset features metadata"""
        try:
            # Try to fetch meta/info.json
            info_url = f"https://huggingface.co/datasets/{repo_id}/resolve/main/meta/info.json"
            response = requests.get(info_url, headers=self.headers, timeout=5)
            
            if response.status_code == 200:
                return response.json()
            
            # Fallback: try to get from dataset card
            api_url = f"https://huggingface.co/api/datasets/{repo_id}"
            response = requests.get(api_url, headers=self.headers, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                return data.get("cardData", {})
                
        except Exception as e:
            logger.error(f"Error fetching features for {repo_id}: {e}")
        
        return None
    
    def _process_telemetry_data(
        self, 
        df: pd.DataFrame, 
        episode_id: int,
        features_metadata: Dict
    ) -> TelemetryData:
        """Process raw dataframe into TelemetryData format"""
        
        # Extract timestamps
        if "timestamp" in df.columns:
            timestamps = df["timestamp"].tolist()
        elif "index" in df.columns:
            # Generate timestamps based on fps
            fps = features_metadata.get("fps", DEFAULT_FPS)
            timestamps = [i / fps for i in range(len(df))]
        else:
            # Generate timestamps based on row indices
            fps = features_metadata.get("fps", DEFAULT_FPS)
            timestamps = [i / fps for i in range(len(df))]
        
        # Identify state and action columns from actual DataFrame columns
        state_columns = []
        action_columns = []
        
        # Look for state/observation columns
        for col in df.columns:
            if isinstance(col, str):
                if "observation.state" in col or "state" in col:
                    state_columns.append(col)
                elif "action" in col:
                    action_columns.append(col)
        
        # Process states
        states = {}
        feature_names = {}
        features = features_metadata.get("features", {})
        
        for col in state_columns:
            col_data = df[col].values
            
            # Check if each element is an array (common in LeRobot datasets)
            if col_data.dtype == object and len(col_data) > 0:
                # Each element is itself an array
                first_elem = col_data[0]
                if hasattr(first_elem, '__len__') and not isinstance(first_elem, str):
                    # Convert array of arrays to proper format
                    import numpy as np
                    # Stack all arrays into a 2D array
                    col_data = np.vstack(col_data)
                    # Transpose to get time series per dimension
                    col_data = col_data.T
                    n_dims = col_data.shape[0]
                    feature_names[col] = [f"{col}_{i}" for i in range(n_dims)]
                    # Convert to list of lists
                    states[col] = [dim.tolist() for dim in col_data]
                else:
                    # Single values
                    states[col] = [float(v) if not isinstance(v, (list, np.ndarray)) else float(v[0]) for v in col_data]
                    feature_names[col] = [col]
            elif len(col_data.shape) > 1 and col_data.shape[1] > 1:
                # Multi-dimensional numpy array
                col_data = col_data.T
                n_dims = col_data.shape[0]
                feature_names[col] = [f"{col}_{i}" for i in range(n_dims)]
                states[col] = col_data.tolist()
            else:
                # Single dimensional data
                if len(col_data.shape) > 1:
                    col_data = col_data.flatten()
                states[col] = col_data.tolist()
                feature_names[col] = [col]
        
        # Process actions
        actions = {}
        
        for col in action_columns:
            col_data = df[col].values
            
            # Check if each element is an array (common in LeRobot datasets)
            if col_data.dtype == object and len(col_data) > 0:
                # Each element is itself an array
                first_elem = col_data[0]
                if hasattr(first_elem, '__len__') and not isinstance(first_elem, str):
                    # Convert array of arrays to proper format
                    import numpy as np
                    # Stack all arrays into a 2D array
                    col_data = np.vstack(col_data)
                    # Transpose to get time series per dimension
                    col_data = col_data.T
                    n_dims = col_data.shape[0]
                    feature_names[col] = [f"{col}_{i}" for i in range(n_dims)]
                    # Convert to list of lists
                    actions[col] = [dim.tolist() for dim in col_data]
                else:
                    # Single values
                    actions[col] = [float(v) if not isinstance(v, (list, np.ndarray)) else float(v[0]) for v in col_data]
                    feature_names[col] = [col]
            elif len(col_data.shape) > 1 and col_data.shape[1] > 1:
                # Multi-dimensional numpy array
                col_data = col_data.T
                n_dims = col_data.shape[0]
                feature_names[col] = [f"{col}_{i}" for i in range(n_dims)]
                actions[col] = col_data.tolist()
            else:
                # Single dimensional data
                if len(col_data.shape) > 1:
                    col_data = col_data.flatten()
                actions[col] = col_data.tolist()
                feature_names[col] = [col]
        
        # Calculate duration
        duration = timestamps[-1] if timestamps else 0
        fps = features_metadata.get("fps", DEFAULT_FPS)
        
        return TelemetryData(
            episode_id=episode_id,
            duration=duration,
            fps=fps,
            timestamps=timestamps,
            states=states,
            actions=actions,
            feature_names=feature_names,
            feature_units=self._extract_units(features_metadata)
        )
    
    def _flatten_names(self, names_dict: Dict) -> List[str]:
        """Flatten nested naming structure"""
        result = []
        
        def flatten(d, prefix=""):
            if isinstance(d, dict):
                for k, v in d.items():
                    new_prefix = f"{prefix}.{k}" if prefix else k
                    if isinstance(v, (dict, list)):
                        flatten(v, new_prefix)
                    else:
                        result.append(f"{new_prefix}: {v}")
            elif isinstance(d, list):
                result.extend(d)
            else:
                result.append(str(d))
        
        flatten(names_dict)
        return result
    
    def _extract_units(self, features_metadata: Dict) -> Dict[str, str]:
        """Extract units information from metadata"""
        units = {}
        features = features_metadata.get("features", {})
        
        for feature_name, feature_info in features.items():
            if isinstance(feature_info, dict):
                # Check for units field
                if "unit" in feature_info:
                    units[feature_name] = feature_info["unit"]
                elif "units" in feature_info:
                    units[feature_name] = feature_info["units"]
                # Common robot units based on feature name
                elif "position" in feature_name or "angle" in feature_name:
                    units[feature_name] = "radians"
                elif "velocity" in feature_name:
                    units[feature_name] = "rad/s"
                elif "force" in feature_name or "torque" in feature_name:
                    units[feature_name] = "N⋅m"
        
        return units
    
    def _get_telemetry_from_episodes_file(
        self, 
        repo_id: str, 
        episode_id: int,
        features_metadata: Dict
    ) -> Optional[TelemetryData]:
        """Fallback method to generate basic telemetry structure from episodes file"""
        try:
            # Get episode info
            episodes_url = f"https://huggingface.co/datasets/{repo_id}/resolve/main/meta/episodes.jsonl"
            response = requests.get(episodes_url, headers=self.headers, timeout=10)
            
            if response.status_code != 200:
                return None
            
            # Parse JSONL
            episodes = []
            for line in response.text.strip().split('\n'):
                if line:
                    episodes.append(json.loads(line))
            
            # Find the specific episode
            episode_info = None
            for ep in episodes:
                if ep.get("episode_index") == episode_id:
                    episode_info = ep
                    break
            
            if not episode_info:
                return None
            
            # Generate basic telemetry structure
            length = episode_info.get("length", 100)
            fps = features_metadata.get("fps", DEFAULT_FPS)
            duration = length / fps
            timestamps = [i / fps for i in range(length)]
            
            # Create empty telemetry with correct structure
            return TelemetryData(
                episode_id=episode_id,
                duration=duration,
                fps=fps,
                timestamps=timestamps,
                states={},  # Will be populated when actual data is available
                actions={},
                feature_names={},
                feature_units={}
            )
            
        except Exception as e:
            logger.error(f"Error getting telemetry from episodes file: {e}")
            return None