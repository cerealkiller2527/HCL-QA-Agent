"""
HuggingFace Hub Service
Handles all interactions with HuggingFace API
"""

from huggingface_hub import HfApi
import requests
import json
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import pandas as pd
import time
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import config
from schemas.viewer import CameraInfo, VideoUrl, EpisodeVideos, VideoStreamInfo
from services.video_service import VideoService
from services.metadata_service import MetadataService
from services.telemetry_service import TelemetryService

logger = logging.getLogger(__name__)

class HuggingFaceService:
    def __init__(self, token: str):
        """Initialize HuggingFace service with authentication token"""
        self.token = token
        self.api = HfApi(token=token)
        self.headers = {"Authorization": f"Bearer {token}"}
        self._user_info = None
        self._cache = {}
        self._cache_ttl = timedelta(minutes=config.CACHE_TTL_MINUTES)
        # Initialize video service
        self.video_service = VideoService(token)
        # Initialize metadata service
        self.metadata_service = MetadataService(token)
        # Initialize telemetry service
        self.telemetry_service = TelemetryService(token)
    
    def get_user_info(self) -> Dict[str, Any]:
        """Get authenticated user information with caching"""
        cache_key = "user_info"
        
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
            logger.error(f"Error getting user info: {e}")
            # Return cached data if available, even if expired
            if cache_key in self._cache:
                cached_data, _ = self._cache[cache_key]
                return cached_data
            raise
    
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
        # First try the metadata service for more comprehensive metadata
        metadata = self.metadata_service.fetch_meta_data(repo_id)
        if metadata:
            return metadata
        
        # Fallback to the original method if metadata service fails
        try:
            info_url = f"https://huggingface.co/datasets/{repo_id}/resolve/main/meta/info.json"
            response = requests.get(info_url, headers=self.headers, timeout=5)
            if response.status_code == 200:
                return response.json()
        except Exception as e:
            logger.debug(f"Could not fetch LeRobot metadata for {repo_id}: {e}")
        
        # Try to get dataset info as another fallback
        dataset_info = self.metadata_service.fetch_dataset_info(repo_id)
        if dataset_info:
            return dataset_info
        
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
                               meta_info: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Fetch telemetry data using TelemetryService"""
        try:
            # Use the telemetry service to get properly formatted data
            telemetry = self.telemetry_service.get_episode_telemetry(
                repo_id=repo_id,
                episode_id=episode_id,
                features_metadata=meta_info
            )
            
            if not telemetry:
                logger.warning(f"No telemetry data available for {repo_id} episode {episode_id}")
                return []
            
            # Convert TelemetryData to frontend format
            telemetry_data = []
            
            # Process timestamps
            timestamps = telemetry.timestamps if hasattr(telemetry, 'timestamps') else []
            
            # Get states and actions
            states = telemetry.states if hasattr(telemetry, 'states') else {}
            actions = telemetry.actions if hasattr(telemetry, 'actions') else {}
            
            # Combine into data points
            max_points = min(1000, len(timestamps))  # Limit for performance
            step = max(1, len(timestamps) // max_points)
            
            for i in range(0, len(timestamps), step):
                point = {"time": timestamps[i]}
                
                # Add state data
                for col_name, col_data in states.items():
                    if isinstance(col_data, list):
                        if isinstance(col_data[0], list):
                            # Multi-dimensional data
                            for j, series in enumerate(col_data):
                                if i < len(series):
                                    point[f"{col_name}_{j}"] = series[i]
                        else:
                            # Single dimensional data
                            if i < len(col_data):
                                point[col_name] = col_data[i]
                
                # Add action data
                for col_name, col_data in actions.items():
                    if isinstance(col_data, list):
                        if isinstance(col_data[0], list):
                            # Multi-dimensional data
                            for j, series in enumerate(col_data):
                                if i < len(series):
                                    point[f"{col_name}_{j}"] = series[i]
                        else:
                            # Single dimensional data
                            if i < len(col_data):
                                point[col_name] = col_data[i]
                
                telemetry_data.append(point)
            
            logger.info(f"Successfully processed {len(telemetry_data)} telemetry points for {repo_id} episode {episode_id}")
            return telemetry_data
                    
        except Exception as e:
            logger.error(f"Error getting telemetry for {repo_id}/{episode_id}: {e}")
            return []
    
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
    
    def get_video_urls(self, repo_id: str, episode_id: int) -> Optional[EpisodeVideos]:
        """Get video URLs for a specific episode - delegates to VideoService"""
        try:
            # Get dataset metadata
            meta_info = self._get_lerobot_metadata(repo_id)
            if not meta_info:
                logger.warning(f"No metadata available for {repo_id}")
                return None
            
            # Get episode info
            episodes = self.get_dataset_episodes(repo_id)
            episode = next((e for e in episodes if e["id"] == episode_id), None)
            
            if not episode:
                logger.warning(f"Episode {episode_id} not found in {repo_id}")
                return None
            
            # Delegate to video service
            return self.video_service.get_video_urls(repo_id, episode_id, episode, meta_info)
            
        except Exception as e:
            logger.error(f"Error getting video URLs for {repo_id} episode {episode_id}: {e}")
            return None
    
    def get_camera_info(self, repo_id: str) -> Optional[VideoStreamInfo]:
        """Get camera configuration information for a dataset - delegates to VideoService"""
        try:
            # Get dataset metadata
            meta_info = self._get_lerobot_metadata(repo_id)
            if not meta_info:
                return None
            
            # Delegate to video service
            return self.video_service.get_camera_info(repo_id, meta_info)
            
        except Exception as e:
            logger.error(f"Error getting camera info for {repo_id}: {e}")
            return None