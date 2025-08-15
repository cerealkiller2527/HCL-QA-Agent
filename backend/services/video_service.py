"""
Video Service for handling video URLs and camera configurations
Split from HuggingFaceService for better maintainability
"""

import logging
import requests
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import config
from schemas.viewer import CameraInfo, VideoUrl, EpisodeVideos, VideoStreamInfo

logger = logging.getLogger(__name__)


class VideoService:
    """Service for managing video URLs and camera configurations"""
    
    def __init__(self, token: str):
        """Initialize video service with HuggingFace token"""
        self.token = token
        self.headers = {"Authorization": f"Bearer {token}"}
        self._cache = {}
        self._cache_ttl = timedelta(minutes=config.CACHE_TTL_MINUTES)
    
    def get_video_urls(
        self, 
        repo_id: str, 
        episode_id: int,
        episode_info: Dict[str, Any],
        metadata: Dict[str, Any]
    ) -> Optional[EpisodeVideos]:
        """
        Get video URLs for a specific episode
        
        Args:
            repo_id: Dataset repository ID
            episode_id: Episode index
            episode_info: Episode information dict
            metadata: Dataset metadata from HuggingFace
            
        Returns:
            EpisodeVideos object with video URLs
        """
        cache_key = f"videos_{repo_id}_{episode_id}"
        
        # Check cache
        if cache_key in self._cache:
            cached_data, cache_time = self._cache[cache_key]
            if datetime.now() - cache_time < self._cache_ttl:
                return cached_data
        
        try:
            # Identify video features from metadata
            features = metadata.get("features", {})
            video_keys = self._extract_video_keys(features)
            
            if not video_keys:
                logger.warning(f"No video keys found for {repo_id}")
                # Try common patterns
                video_keys = self._get_fallback_video_keys()
            
            video_urls = []
            
            for video_key in video_keys:
                video_url_obj = self._create_video_url(
                    repo_id, 
                    episode_id, 
                    video_key, 
                    features.get(video_key, {})
                )
                if video_url_obj:
                    video_urls.append(video_url_obj)
            
            # Calculate episode duration
            episode_length = episode_info.get("length", 100)
            fps = metadata.get("fps", 30)
            duration = episode_length / fps
            
            result = EpisodeVideos(
                episode_id=episode_id,
                videos=video_urls,
                duration=duration,
                frame_count=episode_length
            )
            
            # Cache the result
            self._cache[cache_key] = (result, datetime.now())
            return result
            
        except Exception as e:
            logger.error(f"Error getting video URLs for {repo_id} episode {episode_id}: {e}")
            return None
    
    def get_camera_info(self, repo_id: str, metadata: Dict[str, Any]) -> Optional[VideoStreamInfo]:
        """
        Get camera configuration information for a dataset
        
        Args:
            repo_id: Dataset repository ID
            metadata: Dataset metadata from HuggingFace
            
        Returns:
            VideoStreamInfo object with camera configurations
        """
        cache_key = f"cameras_{repo_id}"
        
        # Check cache
        if cache_key in self._cache:
            cached_data, cache_time = self._cache[cache_key]
            if datetime.now() - cache_time < self._cache_ttl:
                return cached_data
        
        try:
            features = metadata.get("features", {})
            video_keys = self._extract_video_keys(features)
            
            if not video_keys:
                video_keys = self._get_fallback_video_keys()
            
            cameras = []
            
            for video_key in video_keys:
                camera = self._create_camera_info(video_key, features.get(video_key, {}))
                cameras.append(camera)
            
            result = VideoStreamInfo(
                dataset_id=repo_id,
                cameras=cameras,
                video_format="mp4",
                encoding="h264"
            )
            
            # Cache the result
            self._cache[cache_key] = (result, datetime.now())
            return result
            
        except Exception as e:
            logger.error(f"Error getting camera info for {repo_id}: {e}")
            return None
    
    def _extract_video_keys(self, features: Dict[str, Any]) -> List[str]:
        """Extract video feature keys from dataset features"""
        video_keys = []
        
        for key, feature_info in features.items():
            if isinstance(feature_info, dict):
                # Check for video dtype
                if feature_info.get("dtype") == "video":
                    video_keys.append(key)
                # Also check for image features that might be videos
                elif "image" in key.lower() and feature_info.get("_type") == "Video":
                    video_keys.append(key)
        
        return video_keys
    
    def _get_fallback_video_keys(self) -> List[str]:
        """Get common video key patterns as fallback"""
        return [
            "observation.image",
            "observation.images.top",
            "observation.images.wrist",
            "observation.images.side"
        ]
    
    def _create_video_url(
        self, 
        repo_id: str, 
        episode_id: int, 
        video_key: str,
        feature_info: Dict[str, Any]
    ) -> Optional[VideoUrl]:
        """Create a VideoUrl object for a specific camera"""
        try:
            # Construct video URL based on LeRobot standard pattern
            # Convert dots to underscores in filename
            video_filename = f"{video_key.replace('.', '_')}_episode_{episode_id}.mp4"
            video_url = f"https://huggingface.co/datasets/{repo_id}/resolve/main/videos/{video_filename}"
            
            # Extract resolution and fps
            resolution = self._extract_resolution(feature_info)
            fps = self._extract_fps(feature_info)
            
            return VideoUrl(
                camera=video_key,
                url=video_url,
                resolution=resolution,
                fps=fps
            )
        except Exception as e:
            logger.error(f"Error creating video URL for {video_key}: {e}")
            return None
    
    def _create_camera_info(self, video_key: str, feature_info: Dict[str, Any]) -> CameraInfo:
        """Create a CameraInfo object for a specific camera"""
        # Generate friendly name
        camera_name = self._generate_camera_name(video_key)
        
        # Extract resolution and fps
        resolution = self._extract_resolution(feature_info)
        fps = self._extract_fps(feature_info)
        
        return CameraInfo(
            id=video_key,
            name=camera_name,
            resolution=resolution,
            fps=fps,
            active=True
        )
    
    def _extract_resolution(self, feature_info: Dict[str, Any]) -> str:
        """Extract resolution from feature metadata"""
        if "shape" in feature_info:
            shape = feature_info["shape"]
            if isinstance(shape, list) and len(shape) >= 3:
                # Shape can be [frames, height, width, channels] or [height, width, channels]
                if len(shape) == 4:
                    # [frames, height, width, channels]
                    return f"{shape[2]}x{shape[1]}"
                elif len(shape) == 3:
                    # [height, width, channels]
                    return f"{shape[1]}x{shape[0]}"
        
        # Default resolution
        return "480x640"
    
    def _extract_fps(self, feature_info: Dict[str, Any]) -> int:
        """Extract FPS from feature metadata"""
        if "fps" in feature_info:
            return int(feature_info["fps"])
        elif "framerate" in feature_info:
            return int(feature_info["framerate"])
        
        # Default FPS
        return 30
    
    def _generate_camera_name(self, video_key: str) -> str:
        """Generate a user-friendly camera name from the key"""
        # Remove common prefixes
        name = video_key.replace("observation.", "").replace("images.", "")
        
        # Handle specific patterns
        if name == "image":
            return "Main Camera"
        elif "top" in name.lower():
            return "Top Camera"
        elif "wrist" in name.lower():
            return "Wrist Camera"
        elif "side" in name.lower():
            return "Side Camera"
        elif "front" in name.lower():
            return "Front Camera"
        else:
            # Convert underscores to spaces and capitalize
            return name.replace("_", " ").title()
    
    def verify_video_url(self, url: str) -> bool:
        """
        Verify if a video URL is accessible
        
        Args:
            url: Video URL to verify
            
        Returns:
            True if URL is accessible, False otherwise
        """
        try:
            response = requests.head(url, headers=self.headers, timeout=5)
            return response.status_code == 200
        except Exception as e:
            logger.debug(f"Video URL verification failed for {url}: {e}")
            return False