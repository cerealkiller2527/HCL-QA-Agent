"""
HuggingFace Hub Service
Handles all interactions with HuggingFace API
"""

from huggingface_hub import HfApi
import requests
import json
import logging
from typing import List, Dict, Any, Optional, Union
from datetime import datetime, timedelta
import pandas as pd
import time
import sys
import os
import hashlib
import re
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import config

logger = logging.getLogger(__name__)

class HuggingFaceService:
    def __init__(self, token: str):
        """Initialize HuggingFace service with authentication token"""
        # Validate token format
        if not token or not isinstance(token, str):
            raise ValueError("Invalid HuggingFace token provided")
        
        # Store token securely (avoid keeping full token in memory when possible)
        self._token_hash = hashlib.sha256(token.encode()).hexdigest()[:16]
        self.api = HfApi(token=token)
        self.headers = {"Authorization": f"Bearer {token}"}
        self._user_info = None
        self._cache = {}
        self._cache_ttl = timedelta(minutes=config.CACHE_TTL_MINUTES)
        
        # Log token usage securely (don't expose actual token)
        if token.startswith("hf_"):
            masked_token = f"hf_{token[3:7]}***{token[-4:]}"
        else:
            masked_token = f"{token[:4]}***{token[-4:]}" if len(token) > 8 else "***"
        logger.info(f"HuggingFace service initialized with token: {masked_token}")
    
    def get_user_info(self) -> Dict[str, Any]:
        """Get authenticated user information with caching"""
        # Use token hash in cache key for security
        cache_key = f"user_info_{self._token_hash}"
        
        # Check cache first
        if cache_key in self._cache:
            cached_data, cache_time = self._cache[cache_key]
            if datetime.now() - cache_time < self._cache_ttl:
                logger.debug("Using cached user info")
                return cached_data
        
        try:
            # Only call API if not cached
            if not self._user_info:
                self._user_info = self.api.whoami()
            
            result = {
                "username": self._user_info.get("name"),
                "fullname": self._user_info.get("fullname"),
                "email": self._user_info.get("email"),
                "organizations": self._user_info.get("orgs", [])
            }
            
            # Cache the result
            self._cache[cache_key] = (result, datetime.now())
            return result
            
        except Exception as e:
            # Log with context but don't expose internal details
            logger.error(
                "Error getting user info",
                extra={
                    "error": str(e),
                    "error_type": type(e).__name__,
                    "user_hash": self._token_hash,
                    "endpoint": "get_user_info"
                }
            )
            # Return cached data if available, even if expired
            if cache_key in self._cache:
                cached_data, _ = self._cache[cache_key]
                logger.info("Returning expired cached user info due to API error")
                return cached_data
            # Don't expose internal error details
            raise Exception("Failed to fetch user information")
    
    def _extract_metadata_from_tags(self, dataset) -> Dict[str, Any]:
        """Extract metadata from dataset tags"""
        metadata = {
            "task_categories": [],
            "task_ids": [],
            "languages": [],
            "size_category": None,
            "license_info": None,
        }
        
        if not dataset.tags:
            return metadata
            
        for tag in dataset.tags:
            if tag.startswith("task_categories:"):
                metadata["task_categories"].append(tag.replace("task_categories:", ""))
            elif tag.startswith("task_ids:"):
                metadata["task_ids"].append(tag.replace("task_ids:", ""))
            elif tag.startswith("language:"):
                metadata["languages"].append(tag.replace("language:", ""))
            elif tag.startswith("size_categories:"):
                metadata["size_category"] = tag.replace("size_categories:", "")
            elif tag.startswith("license:"):
                metadata["license_info"] = tag.replace("license:", "")
        
        return metadata
    
    def _extract_card_metadata(self, dataset) -> Dict[str, Any]:
        """Extract metadata from dataset card data"""
        card_data = getattr(dataset, 'cardData', {}) or {}
        
        metadata = {
            "multilinguality": card_data.get('multilinguality'),
            "language_creators": card_data.get('language_creators'),
            "paperswithcode_id": card_data.get('paperswithcode_id'),
            "pretty_name": card_data.get('pretty_name'),
            "citation": card_data.get('citation'),
        }
        
        # Extract languages from card data if not in tags
        if card_data.get('language'):
            lang = card_data.get('language')
            if isinstance(lang, list):
                metadata["languages"] = lang
            elif isinstance(lang, str):
                metadata["languages"] = [lang]
        
        return metadata
    
    def _transform_dataset_to_response(self, dataset, meta_info: Optional[Dict] = None, 
                                      actual_size: Optional[int] = None) -> Dict[str, Any]:
        """Transform HuggingFace dataset to API response format"""
        # Convert datetime to ISO string format
        created_at = dataset.lastModified if dataset.lastModified else datetime.now()
        if isinstance(created_at, datetime):
            created_at = created_at.isoformat()
        
        # Extract metadata from tags
        tag_metadata = self._extract_metadata_from_tags(dataset)
        
        # Extract metadata from card data
        card_metadata = self._extract_card_metadata(dataset)
        
        # Combine languages from both sources
        languages = tag_metadata["languages"] or card_metadata.get("languages")
        
        transformed = {
            "id": dataset.id,
            "name": dataset.id.split("/")[-1],
            "description": getattr(dataset, 'description', '') or '',
            "tags": dataset.tags if dataset.tags else [],
            "createdAt": created_at,
            "private": dataset.private,
            "author": dataset.author,
            "likes": getattr(dataset, 'likes', 0),
            "downloads": getattr(dataset, 'downloads', 0),
            
            # Additional HuggingFace metadata
            "languages": languages if languages else None,
            "taskCategories": tag_metadata["task_categories"] if tag_metadata["task_categories"] else None,
            "taskIds": tag_metadata["task_ids"] if tag_metadata["task_ids"] else None,
            "sizeCategories": tag_metadata["size_category"],
            "multilinguality": card_metadata.get("multilinguality"),
            "languageCreators": card_metadata.get("language_creators"),
            "paperswithcodeId": card_metadata.get("paperswithcode_id"),
            "prettyName": card_metadata.get("pretty_name"),
            "license": tag_metadata["license_info"],
            "citation": card_metadata.get("citation"),
            
            # Default values - will be overridden if metadata exists
            "status": "ready",
            "robotType": "so101",
            "frameCount": 0,
            "duration": 0,
            "fileSize": actual_size if actual_size else 0,
        }
        
        # If LeRobot metadata exists, use it
        if meta_info:
            transformed.update({
                "frameCount": meta_info.get("total_frames", 0),
                "duration": meta_info.get("total_frames", 0) / meta_info.get("fps", config.DEFAULT_FPS),
                "episodeCount": meta_info.get("total_episodes", 0),
                "fps": meta_info.get("fps", config.DEFAULT_FPS),
            })
            
            # Try to determine robot type from metadata
            if "robotType" in meta_info:
                transformed["robotType"] = meta_info["robotType"]
        
        return transformed
    
    def get_user_datasets(self, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get all datasets accessible to the authenticated user with caching"""
        cache_key = f"datasets_{limit}"
        
        # Check cache first
        if cache_key in self._cache:
            cached_data, cache_time = self._cache[cache_key]
            if datetime.now() - cache_time < self._cache_ttl:
                logger.debug("Using cached datasets")
                return cached_data
        
        try:
            user_info = self.get_user_info()
            username = user_info["username"]
            
            # Get user's own datasets
            user_datasets = list(self.api.list_datasets(author=username))
            
            # Also get datasets from user's organizations
            for org in user_info.get("organizations", []):
                org_datasets = list(self.api.list_datasets(author=org["name"]))
                user_datasets.extend(org_datasets)
            
            # Remove duplicates based on id
            seen = set()
            unique_datasets = []
            for dataset in user_datasets:
                if dataset.id not in seen:
                    seen.add(dataset.id)
                    unique_datasets.append(dataset)
            
            # Apply limit if specified
            if limit:
                unique_datasets = unique_datasets[:limit]
            
            # Transform to frontend-friendly format
            transformed_datasets = []
            for dataset in unique_datasets:
                # Try to get additional metadata
                meta_info = self._get_lerobot_metadata(dataset.id)
                
                # Try to get actual size from datasets-server
                actual_size = self.get_dataset_size(dataset.id)
                
                # Transform dataset using helper method
                transformed = self._transform_dataset_to_response(dataset, meta_info, actual_size)
                transformed_datasets.append(transformed)
            
            # Cache the result
            self._cache[cache_key] = (transformed_datasets, datetime.now())
            return transformed_datasets
            
        except Exception as e:
            logger.error(f"Error getting user datasets: {e}")
            # Return cached data if available, even if expired
            if cache_key in self._cache:
                cached_data, _ = self._cache[cache_key]
                return cached_data
            # Return empty list instead of raising to prevent frontend crashes
            return []
    
    def _get_lerobot_metadata(self, repo_id: str) -> Optional[Dict[str, Any]]:
        """Fetch LeRobot-specific metadata from meta/info.json"""
        try:
            info_url = f"https://huggingface.co/datasets/{repo_id}/resolve/main/meta/info.json"
            response = requests.get(info_url, headers=self.headers, timeout=5)
            if response.status_code == 200:
                return response.json()
        except Exception as e:
            logger.debug(f"Could not fetch LeRobot metadata for {repo_id}: {e}")
        return None
    
    def get_dataset_details(self, repo_id: str) -> Optional[Dict[str, Any]]:
        """Get detailed information about a specific dataset"""
        try:
            # Get basic dataset info
            dataset_info = self.api.dataset_info(repo_id, files_metadata=True)
            
            # Get LeRobot metadata
            meta_info = self._get_lerobot_metadata(repo_id)
            
            # Try to get actual size from datasets-server first
            actual_size = self.get_dataset_size(repo_id)
            
            # Fallback: Calculate total file size from siblings
            if not actual_size:
                actual_size = sum(
                    file.get("size", 0) 
                    for file in dataset_info.siblings 
                    if file and isinstance(file, dict)
                )
            
            # Transform dataset using helper method
            details = self._transform_dataset_to_response(dataset_info, meta_info, actual_size)
            
            # Add additional detail fields specific to detailed view
            if meta_info:
                details.update({
                    "features": list(meta_info.get("features", {}).keys()),
                    "videoKeys": [k for k, v in meta_info.get("features", {}).items() 
                                 if v.get("dtype") == "video"],
                })
            
            return details
            
        except Exception as e:
            logger.error(f"Error getting dataset details for {repo_id}: {e}")
            return None
    
    def get_dataset_episodes(self, repo_id: str) -> List[Dict[str, Any]]:
        """Get list of episodes for a dataset"""
        episodes = []
        
        try:
            # Try to get episodes from episodes.jsonl
            episodes_url = f"https://huggingface.co/datasets/{repo_id}/resolve/main/meta/episodes.jsonl"
            response = requests.get(episodes_url, headers=self.headers, timeout=10)
            
            if response.status_code == 200:
                # Parse JSONL format
                for line in response.text.strip().split('\n'):
                    if line:
                        episode = json.loads(line)
                        episodes.append({
                            "id": episode.get("episode_index", len(episodes)),
                            "name": f"Episode {episode.get('episode_index', len(episodes))}",
                            "duration": episode.get("length", 0) / 30,  # Assuming 30 fps
                            "status": "completed" if episode.get("success", True) else "failed",
                            "tasks": episode.get("tasks", []),
                            "length": episode.get("length", 0),
                        })
            else:
                # Fallback: Generate episodes based on metadata
                meta_info = self._get_lerobot_metadata(repo_id)
                if meta_info:
                    total_episodes = meta_info.get("total_episodes", 0)
                    for i in range(total_episodes):
                        episodes.append({
                            "id": i,
                            "name": f"Episode {i}",
                            "duration": 60,  # Default duration
                            "status": "completed",
                            "tasks": [],
                        })
                        
        except Exception as e:
            logger.error(f"Error fetching episodes for {repo_id}: {e}")
        
        return episodes
    
    def get_episode_data(self, repo_id: str, episode_id: int) -> Optional[Dict[str, Any]]:
        """Get data for a specific episode"""
        try:
            # Get dataset metadata
            meta_info = self._get_lerobot_metadata(repo_id)
            if not meta_info:
                return None
            
            # Get episode info
            episodes = self.get_dataset_episodes(repo_id)
            episode = next((e for e in episodes if e["id"] == episode_id), None)
            
            if not episode:
                return None
            
            # Construct video URLs based on metadata patterns
            video_urls = []
            video_keys = [k for k, v in meta_info.get("features", {}).items() 
                         if v.get("dtype") == "video"]
            
            for video_key in video_keys:
                # Use the video path pattern from metadata
                if "video_path" in meta_info:
                    video_path = meta_info["video_path"]
                    # Replace placeholders
                    chunk = episode_id // meta_info.get("chunks_size", 1000)
                    video_url = video_path.format(
                        episode_chunk=chunk,
                        video_key=video_key,
                        episode_index=episode_id
                    )
                    full_url = f"https://huggingface.co/datasets/{repo_id}/resolve/main/{video_url}"
                    video_urls.append({
                        "camera": video_key,
                        "url": full_url
                    })
            
            # Try to get telemetry data from parquet file
            telemetry_data = self._get_episode_telemetry(repo_id, episode_id, meta_info)
            
            return {
                "episode": episode,
                "videoUrls": video_urls,
                "telemetryData": telemetry_data,
                "cameras": [{"id": vk, "name": vk.replace("observation.images.", "")} 
                           for vk in video_keys],
            }
            
        except Exception as e:
            logger.error(f"Error fetching episode data for {repo_id}/{episode_id}: {e}")
            return None
    
    def _get_episode_telemetry(self, repo_id: str, episode_id: int, 
                               meta_info: Dict[str, Any], 
                               features: Optional[List[str]] = None,
                               downsample: Optional[int] = None,
                               max_points: int = 1000) -> List[Dict[str, Any]]:
        """Fetch telemetry data from parquet file with selective column loading"""
        telemetry_data = []
        
        try:
            if "data_path" in meta_info:
                data_path = meta_info["data_path"]
                chunk = episode_id // meta_info.get("chunks_size", 1000)
                parquet_path = data_path.format(
                    episode_chunk=chunk,
                    episode_index=episode_id
                )
                parquet_url = f"https://huggingface.co/datasets/{repo_id}/resolve/main/{parquet_path}"
                
                # Selective column loading based on LeRobot approach
                selected_columns = self._select_telemetry_columns(meta_info, features)
                
                # Read parquet file with pandas - only selected columns
                if selected_columns:
                    df = pd.read_parquet(
                        parquet_url, 
                        columns=selected_columns,
                        storage_options={"headers": self.headers}
                    )
                else:
                    # Fallback to reading all columns and filtering
                    df = pd.read_parquet(
                        parquet_url, 
                        storage_options={"headers": self.headers}
                    )
                    # Filter to only numeric, 1D columns for visualization
                    numeric_cols = []
                    for col in df.columns:
                        if col == "timestamp" or col.startswith(("observation.state", "action")):
                            # Check if it's a simple numeric column (not nested)
                            if df[col].dtype in ['float32', 'float64', 'int32', 'int64']:
                                numeric_cols.append(col)
                    df = df[numeric_cols]
                
                # Apply downsampling
                if downsample and downsample > 1:
                    df = df.iloc[::downsample]
                
                # Limit points for visualization
                if len(df) > max_points:
                    step = max(1, len(df) // max_points)
                    df = df.iloc[::step]
                
                # Convert to frontend format
                for _, row in df.iterrows():
                    point = {"time": row.get("timestamp", 0)}
                    # Add all selected telemetry fields
                    for col in df.columns:
                        if col != "timestamp":
                            point[col] = row[col] if pd.notna(row[col]) else 0
                    telemetry_data.append(point)
                    
        except Exception as e:
            logger.debug(f"Could not fetch telemetry for {repo_id}/{episode_id}: {e}")
        
        return telemetry_data
    
    def _select_telemetry_columns(self, meta_info: Dict[str, Any], 
                                  requested_features: Optional[List[str]] = None) -> List[str]:
        """Select optimal columns for telemetry based on LeRobot filtering approach"""
        features = meta_info.get("features", {})
        selected_columns = ["timestamp"]  # Always include timestamp
        
        # Filter columns like LeRobot does: only 1D numeric data
        for feature_name, feature_info in features.items():
            dtype = feature_info.get("dtype")
            shape = feature_info.get("shape", [])
            
            # Only include 1D numeric features (like LeRobot visualization)
            if dtype in ["float32", "int32"] and len(shape) <= 1:
                # If specific features requested, filter to those
                if requested_features:
                    if any(req in feature_name for req in requested_features):
                        selected_columns.append(feature_name)
                else:
                    # Include state and action features by default
                    if any(category in feature_name for category in ["observation.state", "action"]):
                        selected_columns.append(feature_name)
        
        return selected_columns
    
    def get_episode_telemetry_enhanced(self, repo_id: str, episode_id: int,
                                       features: Optional[List[str]] = None,
                                       downsample: Optional[int] = None,
                                       max_points: int = 1000) -> List[Dict[str, Any]]:
        """Enhanced telemetry endpoint with selective loading and performance optimization"""
        try:
            meta_info = self._get_lerobot_metadata(repo_id)
            if not meta_info:
                return []
            
            return self._get_episode_telemetry(
                repo_id, episode_id, meta_info, 
                features=features, 
                downsample=downsample, 
                max_points=max_points
            )
            
        except Exception as e:
            logger.error(f"Error fetching enhanced telemetry for {repo_id}/{episode_id}: {e}")
            return []
    
    def estimate_episode_memory_usage(self, repo_id: str, episode_id: int, 
                                      features: Optional[List[str]] = None) -> Dict[str, Any]:
        """Estimate memory usage for loading episode data"""
        try:
            meta_info = self._get_lerobot_metadata(repo_id)
            if not meta_info:
                return {"error": "Cannot access dataset metadata"}
            
            selected_columns = self._select_telemetry_columns(meta_info, features)
            
            # Estimate based on typical datatypes and shapes
            estimated_bytes = 0
            column_estimates = {}
            
            features_info = meta_info.get("features", {})
            episode_length = self._estimate_episode_length(repo_id, episode_id, meta_info)
            
            for column in selected_columns:
                if column in features_info:
                    dtype = features_info[column].get("dtype", "float32")
                    shape = features_info[column].get("shape", [1])
                    
                    # Calculate bytes per sample
                    if dtype == "float32":
                        bytes_per_value = 4
                    elif dtype == "int32":
                        bytes_per_value = 4
                    elif dtype == "float64":
                        bytes_per_value = 8
                    else:
                        bytes_per_value = 4  # default
                    
                    # For 1D arrays, use shape[0], for 0D use 1
                    values_per_sample = shape[0] if shape else 1
                    column_bytes = episode_length * values_per_sample * bytes_per_value
                    
                    estimated_bytes += column_bytes
                    column_estimates[column] = {
                        "bytes": column_bytes,
                        "human_readable": self._format_bytes(column_bytes)
                    }
            
            return {
                "episode_id": episode_id,
                "estimated_memory_bytes": estimated_bytes,
                "estimated_memory_human": self._format_bytes(estimated_bytes),
                "episode_length_frames": episode_length,
                "columns_count": len(selected_columns),
                "column_estimates": column_estimates,
                "recommendation": self._get_memory_recommendation(estimated_bytes)
            }
            
        except Exception as e:
            logger.error(f"Error estimating memory for {repo_id}/{episode_id}: {e}")
            return {"error": str(e)}
    
    def _estimate_episode_length(self, repo_id: str, episode_id: int, meta_info: Dict[str, Any]) -> int:
        """Estimate episode length without loading full data"""
        try:
            # Try to get from episode metadata first
            episodes_url = f"https://huggingface.co/datasets/{repo_id}/resolve/main/meta/episodes.jsonl"
            response = requests.get(episodes_url, headers=self.headers, timeout=10)
            
            if response.status_code == 200:
                for line in response.text.strip().split('\n'):
                    if line:
                        episode_info = json.loads(line)
                        if episode_info.get("episode_index") == episode_id:
                            return episode_info.get("length", 1000)  # Default fallback
            
            # Fallback: estimate based on fps and typical episode duration
            fps = meta_info.get("fps", 30)
            return fps * 30  # Assume 30 second episodes as default
            
        except:
            return 1000  # Conservative fallback
    
    def _format_bytes(self, bytes_value: int) -> str:
        """Convert bytes to human readable format"""
        for unit in ['B', 'KB', 'MB', 'GB']:
            if bytes_value < 1024:
                return f"{bytes_value:.1f} {unit}"
            bytes_value /= 1024
        return f"{bytes_value:.1f} TB"
    
    def get_enhanced_video_urls(self, repo_id: str, episode_id: int) -> List[Dict[str, Any]]:
        """Get enhanced video URLs with metadata following LeRobot's approach"""
        try:
            meta_info = self._get_lerobot_metadata(repo_id)
            if not meta_info:
                return []
            
            enhanced_video_urls = []
            features = meta_info.get("features", {})
            
            # Get video features
            video_features = {k: v for k, v in features.items() if v.get("dtype") == "video"}
            
            for video_key, video_feature in video_features.items():
                try:
                    # Construct direct HuggingFace URL (LeRobot approach)
                    if "video_path" in meta_info:
                        video_path = meta_info["video_path"]
                        chunk = episode_id // meta_info.get("chunks_size", 1000)
                        
                        formatted_path = video_path.format(
                            episode_chunk=chunk,
                            video_key=video_key,
                            episode_index=episode_id
                        )
                        
                        direct_url = f"https://huggingface.co/datasets/{repo_id}/resolve/main/{formatted_path}"
                        
                        # Extract camera name (remove observation.images. prefix)
                        camera_name = video_key.replace("observation.images.", "")
                        
                        # Get video metadata
                        shape = video_feature.get("shape", [])
                        video_info = video_feature.get("info", {})
                        
                        enhanced_video_urls.append({
                            "camera_id": video_key,
                            "camera_name": camera_name,
                            "url": direct_url,
                            "direct_access": True,  # Indicates this is a direct HF URL
                            "metadata": {
                                "resolution": {
                                    "width": shape[1] if len(shape) > 1 else 640,
                                    "height": shape[0] if len(shape) > 0 else 480,
                                    "channels": shape[2] if len(shape) > 2 else 3
                                },
                                "fps": meta_info.get("fps", 30),
                                "codec": video_info.get("video.codec", "h264"),
                                "pixel_format": video_info.get("video.pix_fmt", "yuv420p"),
                                "is_depth": video_info.get("video.is_depth_map", False)
                            },
                            "streaming_info": {
                                "supports_range_requests": True,  # HF supports HTTP range
                                "recommended_preload": "metadata",  # Browser optimization
                                "cors_enabled": True
                            }
                        })
                        
                except Exception as e:
                    logger.warning(f"Failed to process video {video_key} for {repo_id}: {e}")
                    continue
            
            return enhanced_video_urls
            
        except Exception as e:
            logger.error(f"Error getting enhanced video URLs for {repo_id}/{episode_id}: {e}")
            return []
    
    def validate_video_accessibility(self, repo_id: str, episode_id: int) -> Dict[str, Any]:
        """Validate that video files are accessible and get streaming info"""
        try:
            video_urls = self.get_enhanced_video_urls(repo_id, episode_id)
            validation_results = {
                "episode_id": episode_id,
                "total_cameras": len(video_urls),
                "accessible_cameras": 0,
                "camera_status": [],
                "overall_status": "unknown"
            }
            
            for video_info in video_urls:
                camera_status = {
                    "camera_id": video_info["camera_id"],
                    "camera_name": video_info["camera_name"],
                    "url": video_info["url"],
                    "accessible": False,
                    "status_code": None,
                    "content_length": None,
                    "error": None
                }
                
                try:
                    # Use HEAD request to check accessibility without downloading
                    response = requests.head(
                        video_info["url"], 
                        headers=self.headers, 
                        timeout=10,
                        allow_redirects=True
                    )
                    
                    camera_status["status_code"] = response.status_code
                    camera_status["accessible"] = response.status_code == 200
                    
                    if response.status_code == 200:
                        camera_status["content_length"] = response.headers.get("Content-Length")
                        validation_results["accessible_cameras"] += 1
                    
                except Exception as e:
                    camera_status["error"] = str(e)
                
                validation_results["camera_status"].append(camera_status)
            
            # Determine overall status
            if validation_results["accessible_cameras"] == validation_results["total_cameras"]:
                validation_results["overall_status"] = "all_accessible"
            elif validation_results["accessible_cameras"] > 0:
                validation_results["overall_status"] = "partially_accessible"
            else:
                validation_results["overall_status"] = "not_accessible"
            
            return validation_results
            
        except Exception as e:
            logger.error(f"Error validating video accessibility for {repo_id}/{episode_id}: {e}")
            return {"error": str(e)}
    
    def get_episode_telemetry_csv(self, repo_id: str, episode_id: int,
                                  features: Optional[List[str]] = None,
                                  downsample: Optional[int] = None,
                                  max_points: int = 1000) -> str:
        """Get telemetry data in CSV format following LeRobot's approach"""
        try:
            import csv
            from io import StringIO
            
            # Get raw telemetry data
            telemetry_data = self.get_episode_telemetry_enhanced(
                repo_id, episode_id, features, downsample, max_points
            )
            
            if not telemetry_data:
                return ""
            
            # Create CSV buffer
            csv_buffer = StringIO()
            csv_writer = csv.writer(csv_buffer)
            
            # Build header from first data point
            if telemetry_data:
                first_point = telemetry_data[0]
                # Get all column names, starting with timestamp
                header = ["timestamp"]
                columns = [col for col in first_point.keys() if col != "time" and col != "timestamp"]
                header.extend(sorted(columns))  # Sort for consistency
                
                csv_writer.writerow(header)
                
                # Write data rows
                for point in telemetry_data:
                    row = [point.get("time", 0)]  # timestamp first
                    for col in columns:
                        value = point.get(col, 0)
                        # Handle array values - flatten if needed
                        if isinstance(value, list):
                            row.extend(value)
                        else:
                            row.append(value)
                    csv_writer.writerow(row)
            
            return csv_buffer.getvalue()
            
        except Exception as e:
            logger.error(f"Error generating CSV telemetry for {repo_id}/{episode_id}: {e}")
            return ""
    
    def get_episode_telemetry_with_format(self, repo_id: str, episode_id: int,
                                          output_format: str = "json",
                                          features: Optional[List[str]] = None,
                                          downsample: Optional[int] = None,
                                          max_points: int = 1000) -> Union[List[Dict[str, Any]], str]:
        """Get telemetry data in specified format (json or csv)"""
        if output_format.lower() == "csv":
            return self.get_episode_telemetry_csv(
                repo_id, episode_id, features, downsample, max_points
            )
        else:
            # Default to JSON format
            return self.get_episode_telemetry_enhanced(
                repo_id, episode_id, features, downsample, max_points
            )
    
    def _get_memory_recommendation(self, bytes_value: int) -> str:
        """Get recommendation based on memory usage"""
        mb = bytes_value / (1024 * 1024)
        
        if mb < 10:
            return "Safe to load - small memory footprint"
        elif mb < 100:
            return "Moderate memory usage - should load quickly"
        elif mb < 500:
            return "Large dataset - consider downsampling"
        else:
            return "Very large dataset - strongly recommend downsampling or feature filtering"
    
    def validate_lerobot_compatibility(self, repo_id: str) -> Dict[str, Any]:
        """Comprehensive LeRobot compatibility validation"""
        try:
            validation_result = {
                "repo_id": repo_id,
                "compatible": False,
                "compatibility_score": 0,
                "checks": {},
                "recommendations": [],
                "warnings": [],
                "supported_features": [],
                "unsupported_features": []
            }
            
            # Get metadata
            meta_info = self._get_lerobot_metadata(repo_id)
            if not meta_info:
                validation_result["checks"]["metadata"] = {
                    "passed": False,
                    "message": "Cannot access dataset metadata"
                }
                validation_result["recommendations"].append(
                    "Ensure dataset has proper LeRobot metadata structure"
                )
                return validation_result
            
            # Check 1: Metadata structure
            required_metadata = ["features", "total_episodes", "fps"]
            metadata_score = 0
            for field in required_metadata:
                if field in meta_info:
                    metadata_score += 1
            
            validation_result["checks"]["metadata"] = {
                "passed": metadata_score >= 2,
                "score": f"{metadata_score}/{len(required_metadata)}",
                "message": f"Found {metadata_score} of {len(required_metadata)} required metadata fields"
            }
            
            # Check 2: Feature compatibility
            features = meta_info.get("features", {})
            supported_count = 0
            unsupported_count = 0
            
            for feature_name, feature_info in features.items():
                dtype = feature_info.get("dtype", "unknown")
                shape = feature_info.get("shape", [])
                
                if dtype in config.SUPPORTED_DATATYPES:
                    if dtype == "video":
                        validation_result["supported_features"].append({
                            "name": feature_name,
                            "type": "video",
                            "details": f"Resolution: {shape[:2] if len(shape) >= 2 else 'unknown'}"
                        })
                        supported_count += 1
                    elif dtype in ["float32", "int32"] and len(shape) <= 1:
                        validation_result["supported_features"].append({
                            "name": feature_name,
                            "type": "telemetry",
                            "details": f"Shape: {shape}, Dtype: {dtype}"
                        })
                        supported_count += 1
                    else:
                        validation_result["unsupported_features"].append({
                            "name": feature_name,
                            "reason": f"Unsupported shape: {shape} (only 1D arrays supported for telemetry)"
                        })
                        unsupported_count += 1
                else:
                    validation_result["unsupported_features"].append({
                        "name": feature_name,
                        "reason": f"Unsupported dtype: {dtype}"
                    })
                    unsupported_count += 1
            
            feature_compatibility = supported_count / max(1, supported_count + unsupported_count)
            validation_result["checks"]["features"] = {
                "passed": feature_compatibility >= 0.5,
                "score": f"{supported_count}/{supported_count + unsupported_count}",
                "message": f"{supported_count} supported features, {unsupported_count} unsupported"
            }
            
            # Check 3: Video availability
            video_features = [f for f, info in features.items() if info.get("dtype") == "video"]
            video_check = len(video_features) > 0
            validation_result["checks"]["videos"] = {
                "passed": video_check,
                "count": len(video_features),
                "message": f"Found {len(video_features)} video streams" if video_check else "No video streams found"
            }
            
            # Check 4: Episode structure
            try:
                episodes = self.get_dataset_episodes(repo_id)
                episode_check = len(episodes) > 0
                validation_result["checks"]["episodes"] = {
                    "passed": episode_check,
                    "count": len(episodes),
                    "message": f"Found {len(episodes)} episodes" if episode_check else "No episodes found"
                }
            except:
                validation_result["checks"]["episodes"] = {
                    "passed": False,
                    "message": "Cannot access episode structure"
                }
                episode_check = False
            
            # Check 5: Data accessibility test (sample first episode)
            data_accessible = False
            if episode_check:
                try:
                    telemetry_data = self.get_episode_telemetry_enhanced(repo_id, 0, max_points=10)
                    data_accessible = len(telemetry_data) > 0
                    validation_result["checks"]["data_access"] = {
                        "passed": data_accessible,
                        "message": f"Successfully loaded {len(telemetry_data)} sample data points" if data_accessible else "Cannot access episode data"
                    }
                except Exception as e:
                    validation_result["checks"]["data_access"] = {
                        "passed": False,
                        "message": f"Data access failed: {str(e)[:50]}"
                    }
            
            # Calculate compatibility score
            checks_passed = sum(1 for check in validation_result["checks"].values() if check["passed"])
            total_checks = len(validation_result["checks"])
            validation_result["compatibility_score"] = int((checks_passed / total_checks) * 100)
            validation_result["compatible"] = validation_result["compatibility_score"] >= 60
            
            # Generate recommendations
            if validation_result["compatibility_score"] < 60:
                validation_result["recommendations"].append(
                    "Dataset has limited compatibility - some features may not work properly"
                )
            
            if unsupported_count > 0:
                validation_result["recommendations"].append(
                    f"Consider filtering out {unsupported_count} unsupported features for better performance"
                )
            
            if not video_check:
                validation_result["warnings"].append(
                    "No video streams found - video visualization will not be available"
                )
            
            if supported_count > 50:
                validation_result["recommendations"].append(
                    "Large number of features detected - consider using feature filtering for better performance"
                )
            
            # Memory estimation for first episode
            if episode_check:
                try:
                    memory_est = self.estimate_episode_memory_usage(repo_id, 0)
                    if "estimated_memory_bytes" in memory_est:
                        memory_mb = memory_est["estimated_memory_bytes"] / (1024 * 1024)
                        if memory_mb > config.MEMORY_WARNING_THRESHOLD_MB:
                            validation_result["recommendations"].append(
                                f"High memory usage detected ({memory_est['estimated_memory_human']}) - consider downsampling"
                            )
                except:
                    pass
            
            return validation_result
            
        except Exception as e:
            logger.error(f"Error validating LeRobot compatibility for {repo_id}: {e}")
            return {
                "repo_id": repo_id,
                "compatible": False,
                "error": str(e),
                "checks": {},
                "recommendations": ["Contact support - validation system error"]
            }
    
    def get_dataset_size(self, repo_id: str) -> Optional[int]:
        """Get the actual size of a dataset from HuggingFace datasets-server API"""
        try:
            # Use the datasets-server API to get size information
            size_url = f"https://datasets-server.huggingface.co/size?dataset={repo_id}"
            response = requests.get(size_url, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                # The API returns size information for different configs and splits
                # We'll sum up all sizes to get the total
                total_size = 0
                
                if "size" in data:
                    if "dataset" in data["size"]:
                        # Get the dataset size (sum of all configs)
                        dataset_info = data["size"]["dataset"]
                        if "num_bytes_original_files" in dataset_info:
                            total_size = dataset_info["num_bytes_original_files"]
                        elif "num_bytes_parquet_files" in dataset_info:
                            total_size = dataset_info["num_bytes_parquet_files"]
                        elif "num_bytes" in dataset_info:
                            total_size = dataset_info["num_bytes"]
                
                return total_size if total_size > 0 else None
            
            return None
            
        except Exception as e:
            logger.debug(f"Could not fetch size for {repo_id} from datasets-server: {e}")
            return None
    
    def delete_dataset(self, repo_id: str) -> bool:
        """Delete a dataset repository from HuggingFace
        
        WARNING: This action is irreversible!
        """
        try:
            # Use the HfApi to delete the repository
            self.api.delete_repo(repo_id=repo_id, repo_type="dataset")
            
            # Clear cache for this dataset
            cache_keys_to_remove = []
            for key in self._cache.keys():
                if repo_id in str(key):
                    cache_keys_to_remove.append(key)
            
            for key in cache_keys_to_remove:
                del self._cache[key]
            
            # Also clear the general datasets cache to refresh the list
            if "datasets_None" in self._cache:
                del self._cache["datasets_None"]
            
            logger.info(f"Successfully deleted dataset: {repo_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting dataset {repo_id}: {e}")
            raise
    
    # Enhanced methods for complete LeRobot data extraction
    
    def get_enhanced_episode_data(self, repo_id: str, episode_id: int) -> Optional[Dict[str, Any]]:
        """Enhanced episode data with complete LeRobot information"""
        try:
            # Get basic episode data
            basic_data = self.get_episode_data(repo_id, episode_id)
            if not basic_data:
                return None
            
            # Get enhanced telemetry
            enhanced_telemetry = self._get_enhanced_telemetry(repo_id, episode_id)
            
            # Get video metadata
            video_metadata = self._get_video_metadata(repo_id, episode_id)
            
            # Get episode statistics
            episode_stats = self._get_episode_statistics(repo_id, episode_id)
            
            return {
                **basic_data,
                "enhancedTelemetry": enhanced_telemetry,
                "videoMetadata": video_metadata,
                "statistics": episode_stats,
                "robotConfig": self._detect_robot_configuration(repo_id)
            }
            
        except Exception as e:
            logger.error(f"Error getting enhanced episode data for {repo_id}/{episode_id}: {e}")
            return None
    
    def _get_enhanced_telemetry(self, repo_id: str, episode_id: int) -> Dict[str, Any]:
        """Extract enhanced telemetry with sensor data and multi-robot support"""
        try:
            meta_info = self._get_lerobot_metadata(repo_id)
            if not meta_info:
                return {}
            
            # Get raw telemetry data
            telemetry_data = self._get_episode_telemetry(repo_id, episode_id, meta_info)
            
            # Process and enhance the telemetry
            enhanced = {
                "episode_id": episode_id,
                "duration": len(telemetry_data) / meta_info.get("fps", 30) if telemetry_data else 0,
                "fps": meta_info.get("fps", 30),
                "timestamps": [point.get("time", 0) for point in telemetry_data],
                "states": {},
                "actions": {},
                "observations": {},
                "sensors": {},
                "feature_names": {},
                "feature_types": {},
                "multi_robot_data": None
            }
            
            # Organize data by feature type
            features = meta_info.get("features", {})
            for feature_name, feature_info in features.items():
                feature_type = self._classify_feature_type(feature_name, feature_info)
                
                # Extract feature data from telemetry
                feature_data = [point.get(feature_name, 0) for point in telemetry_data]
                
                if feature_type == "state":
                    enhanced["states"][feature_name] = feature_data
                elif feature_type == "action":
                    enhanced["actions"][feature_name] = feature_data
                elif feature_type == "observation":
                    enhanced["observations"][feature_name] = feature_data
                elif feature_type in ["sensor", "force", "imu", "pressure"]:
                    enhanced["sensors"][feature_name] = feature_data
                
                # Add feature metadata
                enhanced["feature_names"][feature_name] = feature_info.get("names", [])
                enhanced["feature_types"][feature_name] = feature_info.get("dtype", "unknown")
            
            # Detect multi-robot configuration
            enhanced["multi_robot_data"] = self._detect_multi_robot_data(enhanced, features)
            
            return enhanced
            
        except Exception as e:
            logger.error(f"Error processing enhanced telemetry for {repo_id}/{episode_id}: {e}")
            return {}
    
    def _classify_feature_type(self, feature_name: str, feature_info: Dict[str, Any]) -> str:
        """Classify feature type based on name and metadata"""
        name_lower = feature_name.lower()
        
        if "observation.state" in name_lower or "joint" in name_lower:
            return "state"
        elif "action" in name_lower:
            return "action"
        elif "observation.images" in name_lower or "video" in feature_info.get("dtype", ""):
            return "observation"
        elif any(sensor in name_lower for sensor in ["force", "torque", "imu", "pressure"]):
            return "sensor"
        elif "observation" in name_lower:
            return "observation"
        else:
            return "unknown"
    
    def _detect_multi_robot_data(self, telemetry: Dict[str, Any], features: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Detect and organize multi-robot/multi-arm data"""
        try:
            # Look for arm-specific patterns in feature names
            arm_patterns = ["left", "right", "arm1", "arm2", "arm_1", "arm_2"]
            detected_arms = set()
            
            for feature_name in telemetry["states"].keys():
                for pattern in arm_patterns:
                    if pattern in feature_name.lower():
                        detected_arms.add(pattern)
            
            if len(detected_arms) > 1:
                # Organize data by arm
                arms_data = {}
                for arm in detected_arms:
                    arms_data[arm] = {
                        "states": {},
                        "actions": {},
                        "joint_names": []
                    }
                    
                    # Extract arm-specific data
                    for category in ["states", "actions"]:
                        for feature_name, data in telemetry[category].items():
                            if arm in feature_name.lower():
                                arms_data[arm][category][feature_name] = data
                                
                                # Extract joint names
                                if category == "states" and feature_name in features:
                                    joint_names = features[feature_name].get("names", [])
                                    if joint_names:
                                        arms_data[arm]["joint_names"] = joint_names
                
                return {
                    "detected_arms": list(detected_arms),
                    "arms_data": arms_data,
                    "synchronized": True  # Assume synchronized for now
                }
            
            return None
            
        except Exception as e:
            logger.error(f"Error detecting multi-robot data: {e}")
            return None
    
    def _get_video_metadata(self, repo_id: str, episode_id: int) -> Dict[str, Any]:
        """Extract video metadata including codec, resolution, etc."""
        try:
            meta_info = self._get_lerobot_metadata(repo_id)
            if not meta_info:
                return {}
            
            video_metadata = {}
            features = meta_info.get("features", {})
            
            for feature_name, feature_info in features.items():
                if feature_info.get("dtype") == "video":
                    video_info = feature_info.get("info", {})
                    camera_name = feature_name.replace("observation.images.", "")
                    
                    video_metadata[camera_name] = {
                        "codec": video_info.get("video.codec", "unknown"),
                        "fps": video_info.get("video.fps", meta_info.get("fps", 30)),
                        "resolution": f"{feature_info.get('shape', [0,0])[1]}x{feature_info.get('shape', [0,0])[0]}",
                        "pixel_format": video_info.get("video.pix_fmt", "unknown"),
                        "is_depth": video_info.get("video.is_depth_map", False),
                        "shape": feature_info.get("shape", [])
                    }
            
            return video_metadata
            
        except Exception as e:
            logger.error(f"Error extracting video metadata for {repo_id}: {e}")
            return {}
    
    def _get_episode_statistics(self, repo_id: str, episode_id: int) -> Optional[Dict[str, Any]]:
        """Get episode-level statistics if available"""
        try:
            # Try to get from episodes_stats.jsonl
            stats_url = f"https://huggingface.co/datasets/{repo_id}/resolve/main/meta/episodes_stats.jsonl"
            response = requests.get(stats_url, headers=self.headers, timeout=10)
            
            if response.status_code == 200:
                # Parse JSONL and find our episode
                for line in response.text.strip().split('\n'):
                    if line:
                        episode_stats = json.loads(line)
                        if episode_stats.get("episode_index") == episode_id:
                            return episode_stats
            
            return None
            
        except Exception as e:
            logger.debug(f"No episode statistics available for {repo_id}/{episode_id}: {e}")
            return None
    
    def _detect_robot_configuration(self, repo_id: str) -> Optional[Dict[str, Any]]:
        """Detect robot configuration from metadata"""
        try:
            meta_info = self._get_lerobot_metadata(repo_id)
            if not meta_info:
                return None
            
            features = meta_info.get("features", {})
            config = {
                "robot_type": meta_info.get("robot_type", "unknown"),
                "total_dof": 0,
                "cameras": [],
                "sensors": [],
                "multi_arm": False
            }
            
            # Analyze features to build configuration
            for feature_name, feature_info in features.items():
                if "observation.state" in feature_name:
                    shape = feature_info.get("shape", [])
                    if shape:
                        config["total_dof"] += shape[0] if len(shape) > 0 else 0
                
                elif "observation.images" in feature_name:
                    camera_name = feature_name.replace("observation.images.", "")
                    config["cameras"].append({
                        "name": camera_name,
                        "type": "rgb",  # Could be enhanced to detect depth
                        "resolution": feature_info.get("shape", [])
                    })
                
                elif any(sensor in feature_name.lower() for sensor in ["force", "imu", "pressure"]):
                    config["sensors"].append({
                        "name": feature_name,
                        "type": "force" if "force" in feature_name.lower() else "other",
                        "shape": feature_info.get("shape", [])
                    })
            
            # Detect multi-arm
            arm_indicators = ["left", "right", "arm1", "arm2"]
            for indicator in arm_indicators:
                if any(indicator in name.lower() for name in features.keys()):
                    config["multi_arm"] = True
                    break
            
            return config
            
        except Exception as e:
            logger.error(f"Error detecting robot configuration for {repo_id}: {e}")
            return None
    
    def get_dataset_analytics(self, repo_id: str) -> Dict[str, Any]:
        """Get simple analytics for a dataset"""
        try:
            # Get basic dataset info
            meta_info = self._get_lerobot_metadata(repo_id)
            episodes = self.get_dataset_episodes(repo_id)
            
            if not meta_info or not episodes:
                return {}
            
            analytics = {
                "total_episodes": len(episodes),
                "total_duration": sum(ep.get("duration", 0) for ep in episodes),
                "success_rate": 0,
                "average_episode_length": 0,
                "task_distribution": {},
                "robot_info": {
                    "type": meta_info.get("robot_type", "unknown"),
                    "total_frames": meta_info.get("total_frames", 0),
                    "fps": meta_info.get("fps", 30)
                }
            }
            
            # Calculate success rate
            successful_episodes = sum(1 for ep in episodes if ep.get("status") == "completed")
            if episodes:
                analytics["success_rate"] = successful_episodes / len(episodes)
                analytics["average_episode_length"] = analytics["total_duration"] / len(episodes)
            
            # Task distribution
            task_counts = {}
            for episode in episodes:
                for task in episode.get("tasks", []):
                    task_counts[task] = task_counts.get(task, 0) + 1
            analytics["task_distribution"] = task_counts
            
            return analytics
            
        except Exception as e:
            logger.error(f"Error getting analytics for {repo_id}: {e}")
            return {}
    
    def get_dataset_features(self, repo_id: str) -> Dict[str, Any]:
        """Get detailed feature information for a dataset"""
        try:
            meta_info = self._get_lerobot_metadata(repo_id)
            if not meta_info:
                return {}
            
            features = meta_info.get("features", {})
            organized_features = {
                "states": {},
                "actions": {},
                "observations": {},
                "sensors": {},
                "videos": {},
                "metadata": {
                    "total_features": len(features),
                    "robot_type": meta_info.get("robot_type", "unknown"),
                    "fps": meta_info.get("fps", 30)
                }
            }
            
            for feature_name, feature_info in features.items():
                feature_type = self._classify_feature_type(feature_name, feature_info)
                
                feature_details = {
                    "name": feature_name,
                    "dtype": feature_info.get("dtype", "unknown"),
                    "shape": feature_info.get("shape", []),
                    "names": feature_info.get("names", []),
                    "info": feature_info.get("info", {})
                }
                
                if feature_type == "state":
                    organized_features["states"][feature_name] = feature_details
                elif feature_type == "action":
                    organized_features["actions"][feature_name] = feature_details
                elif feature_type == "observation":
                    if feature_info.get("dtype") == "video":
                        organized_features["videos"][feature_name] = feature_details
                    else:
                        organized_features["observations"][feature_name] = feature_details
                elif feature_type == "sensor":
                    organized_features["sensors"][feature_name] = feature_details
            
            return organized_features
            
        except Exception as e:
            logger.error(f"Error getting features for {repo_id}: {e}")
            return {}