"""
Metadata Service for HuggingFace Datasets

This service fetches and parses metadata files from HuggingFace datasets
to understand the actual structure of the data, including video paths,
camera configurations, and episode information.
"""

import json
import logging
from typing import Dict, List, Optional, Any
from huggingface_hub import hf_hub_download, list_repo_files
import requests

logger = logging.getLogger(__name__)


class MetadataService:
    """Service for fetching and parsing dataset metadata from HuggingFace"""
    
    def __init__(self, hf_token: Optional[str] = None):
        self.hf_token = hf_token
    
    def fetch_meta_data(self, repo_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetch meta_data.json from HuggingFace dataset
        
        Args:
            repo_id: Repository ID (e.g., "lerobot/pusht")
            
        Returns:
            Parsed metadata dictionary or None if not found
        """
        try:
            # Try to download meta_data.json
            meta_path = hf_hub_download(
                repo_id=repo_id,
                filename="meta_data.json",
                repo_type="dataset",
                token=self.hf_token
            )
            
            with open(meta_path, 'r') as f:
                metadata = json.load(f)
            
            logger.info(f"Successfully fetched metadata for {repo_id}")
            return metadata
            
        except Exception as e:
            logger.warning(f"Could not fetch meta_data.json for {repo_id}: {e}")
            return None
    
    def fetch_dataset_info(self, repo_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetch dataset_info.json or README metadata
        
        Args:
            repo_id: Repository ID
            
        Returns:
            Dataset info dictionary or None
        """
        try:
            # Try dataset_info.json first
            info_path = hf_hub_download(
                repo_id=repo_id,
                filename="dataset_info.json",
                repo_type="dataset",
                token=self.hf_token
            )
            
            with open(info_path, 'r') as f:
                return json.load(f)
                
        except Exception:
            # If dataset_info.json doesn't exist, try to get info from README
            try:
                readme_path = hf_hub_download(
                    repo_id=repo_id,
                    filename="README.md",
                    repo_type="dataset",
                    token=self.hf_token
                )
                
                # Parse README for metadata (simplified)
                with open(readme_path, 'r') as f:
                    content = f.read()
                    # Extract YAML frontmatter if present
                    if content.startswith('---'):
                        import yaml
                        yaml_end = content.find('---', 3)
                        if yaml_end > 0:
                            yaml_content = content[3:yaml_end]
                            return yaml.safe_load(yaml_content)
            except Exception as e:
                logger.warning(f"Could not fetch dataset info for {repo_id}: {e}")
        
        return None
    
    def fetch_stats(self, repo_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetch stats.json with dataset statistics
        
        Args:
            repo_id: Repository ID
            
        Returns:
            Stats dictionary or None
        """
        try:
            stats_path = hf_hub_download(
                repo_id=repo_id,
                filename="stats.json",
                repo_type="dataset",
                token=self.hf_token
            )
            
            with open(stats_path, 'r') as f:
                return json.load(f)
                
        except Exception as e:
            logger.debug(f"Could not fetch stats.json for {repo_id}: {e}")
            return None
    
    def get_actual_video_paths(self, repo_id: str, episode: int) -> List[str]:
        """
        Get actual video file paths for a specific episode
        
        Args:
            repo_id: Repository ID
            episode: Episode number
            
        Returns:
            List of actual video file paths
        """
        video_paths = []
        
        try:
            # List all files in the repo
            files = list_repo_files(
                repo_id=repo_id,
                repo_type="dataset",
                token=self.hf_token
            )
            
            # Look for video files for this episode
            # Handle different naming patterns
            patterns = [
                f"videos/observation.images.",  # LeRobot style
                f"videos/observation_images_",  # Alternative style
                f"episode_{episode:06d}",       # Padded episode
                f"episode_{episode}",            # Unpadded episode
            ]
            
            for file in files:
                if file.startswith("videos/") and file.endswith(".mp4"):
                    # Check if this video is for our episode
                    episode_patterns = [
                        f"episode_{episode:06d}",  # Padded
                        f"episode_{episode:04d}",  # 4-digit padding
                        f"episode_{episode}",       # No padding
                    ]
                    
                    for pattern in episode_patterns:
                        if pattern in file:
                            video_paths.append(file)
                            break
            
            logger.info(f"Found {len(video_paths)} videos for episode {episode} in {repo_id}")
            
        except Exception as e:
            logger.error(f"Error listing video files for {repo_id}: {e}")
        
        return video_paths
    
    def get_camera_keys_from_metadata(self, repo_id: str) -> List[str]:
        """
        Extract camera keys from dataset metadata
        
        Args:
            repo_id: Repository ID
            
        Returns:
            List of camera keys (e.g., ["observation.images.cam_high", "observation.images.cam_low"])
        """
        # First try to get from meta/info.json
        try:
            info_url = f"https://huggingface.co/datasets/{repo_id}/resolve/main/meta/info.json"
            headers = {"Authorization": f"Bearer {self.hf_token}"} if self.hf_token else {}
            response = requests.get(info_url, headers=headers, timeout=5)
            
            if response.status_code == 200:
                info = response.json()
                # Check for video_keys in info
                if 'video_keys' in info:
                    logger.info(f"Found video keys in meta/info.json: {info['video_keys']}")
                    return info['video_keys']
                    
                # Check features for video dtype
                if 'features' in info:
                    video_keys = []
                    for key, feature in info['features'].items():
                        if isinstance(feature, dict) and feature.get('dtype') == 'video':
                            video_keys.append(key)
                    if video_keys:
                        logger.info(f"Found video keys from features: {video_keys}")
                        return video_keys
        except Exception as e:
            logger.debug(f"Could not fetch meta/info.json for {repo_id}: {e}")
        
        # Fallback: try to infer from actual video files with LeRobot structure
        try:
            files = list_repo_files(
                repo_id=repo_id,
                repo_type="dataset",
                token=self.hf_token
            )
            
            camera_keys = set()
            for file in files:
                # Look for video files with the LeRobot structure:
                # videos/chunk-XXX/camera_key/episode_XXXXXX.mp4
                if file.startswith("videos/chunk-") and file.endswith(".mp4"):
                    parts = file.split("/")
                    if len(parts) >= 3:
                        # The camera key is the directory after chunk-XXX
                        camera_key = parts[2]  # e.g., "observation.images.cam_high"
                        camera_keys.add(camera_key)
            
            if camera_keys:
                logger.info(f"Found camera keys from file listing: {list(camera_keys)}")
                return sorted(list(camera_keys))
            
        except Exception as e:
            logger.error(f"Could not determine camera keys for {repo_id}: {e}")
        
        # Default fallback for common camera names
        return ["observation.images.cam_high", "observation.images.cam_low"]
    
    def get_episode_video_mapping(self, repo_id: str, episode: int) -> Dict[str, str]:
        """
        Get mapping of camera keys to video file paths for an episode
        
        Args:
            repo_id: Repository ID
            episode: Episode number
            
        Returns:
            Dictionary mapping camera keys to video file paths
        """
        mapping = {}
        video_paths = self.get_actual_video_paths(repo_id, episode)
        
        for path in video_paths:
            # Extract camera key from path
            filename = path.replace("videos/", "").replace(".mp4", "")
            
            # Try different patterns to extract camera key
            if "_episode_" in filename:
                camera_key = filename.split("_episode_")[0]
                mapping[camera_key] = path
        
        return mapping