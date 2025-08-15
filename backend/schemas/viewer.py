"""
Viewer-specific Pydantic models for dataset visualization
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from enum import Enum


class CameraInfo(BaseModel):
    """Camera stream information for the viewer"""
    id: str = Field(..., description="Camera identifier (e.g., 'main', 'wrist')")
    name: str = Field(..., description="Display name for the camera")
    resolution: str = Field(..., description="Video resolution (e.g., '1920x1080')")
    fps: int = Field(..., description="Frames per second")
    active: bool = Field(True, description="Whether camera is active")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "main",
                "name": "Main Camera",
                "resolution": "1920x1080",
                "fps": 30,
                "active": True
            }
        }


class VideoUrl(BaseModel):
    """Video URL information for streaming"""
    camera: str = Field(..., description="Camera identifier")
    url: str = Field(..., description="Direct URL to video file")
    resolution: str = Field(..., description="Video resolution")
    fps: int = Field(..., description="Frames per second")
    
    class Config:
        json_schema_extra = {
            "example": {
                "camera": "observation.image",
                "url": "https://huggingface.co/datasets/lerobot/pusht/resolve/main/videos/observation.image_episode_0.mp4",
                "resolution": "480x640",
                "fps": 30
            }
        }


class TelemetryPoint(BaseModel):
    """Single telemetry data point"""
    time: float = Field(..., description="Time in seconds")
    timestamp: float = Field(..., description="Unix timestamp")
    # Dynamic fields for robot states and actions
    # We use a dict to allow flexible schema based on robot type
    states: Dict[str, float] = Field(default_factory=dict, description="Robot state values")
    actions: Dict[str, float] = Field(default_factory=dict, description="Robot action values")
    
    class Config:
        json_schema_extra = {
            "example": {
                "time": 0.033,
                "timestamp": 1234567890.123,
                "states": {
                    "shoulder_pan": 0.1,
                    "shoulder_lift": -0.5,
                    "elbow_flex": 0.3
                },
                "actions": {
                    "shoulder_pan": 0.15,
                    "shoulder_lift": -0.45,
                    "elbow_flex": 0.35
                }
            }
        }


class TelemetryData(BaseModel):
    """Complete telemetry data for an episode"""
    episode_id: int = Field(..., description="Episode identifier")
    duration: float = Field(..., description="Total duration in seconds")
    fps: int = Field(30, description="Data sampling rate")
    timestamps: List[float] = Field(..., description="Time points in seconds")
    
    # Robot state and action data organized by joint/feature
    states: Dict[str, List[float]] = Field(
        default_factory=dict, 
        description="Time series data for robot states"
    )
    actions: Dict[str, List[float]] = Field(
        default_factory=dict,
        description="Time series data for robot actions"
    )
    
    # Metadata about the data
    feature_names: Dict[str, List[str]] = Field(
        default_factory=dict,
        description="Human-readable names for features"
    )
    feature_units: Optional[Dict[str, str]] = Field(
        None,
        description="Units for each feature (e.g., 'radians', 'meters')"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "episode_id": 0,
                "duration": 10.5,
                "fps": 30,
                "timestamps": [0.0, 0.033, 0.066],
                "states": {
                    "observation.state": [
                        [0.1, -0.5, 0.3],
                        [0.11, -0.49, 0.31],
                        [0.12, -0.48, 0.32]
                    ]
                },
                "actions": {
                    "action": [
                        [0.15, -0.45, 0.35],
                        [0.16, -0.44, 0.36],
                        [0.17, -0.43, 0.37]
                    ]
                },
                "feature_names": {
                    "observation.state": ["shoulder_pan", "shoulder_lift", "elbow_flex"],
                    "action": ["shoulder_pan_cmd", "shoulder_lift_cmd", "elbow_flex_cmd"]
                },
                "feature_units": {
                    "observation.state": "radians",
                    "action": "radians"
                }
            }
        }


class VideoStreamInfo(BaseModel):
    """Information about available video streams for a dataset"""
    dataset_id: str = Field(..., description="Dataset repository ID")
    cameras: List[CameraInfo] = Field(..., description="Available camera streams")
    video_format: str = Field("mp4", description="Video file format")
    encoding: str = Field("h264", description="Video encoding")
    
    class Config:
        json_schema_extra = {
            "example": {
                "dataset_id": "lerobot/pusht",
                "cameras": [
                    {
                        "id": "observation.image",
                        "name": "Top Camera",
                        "resolution": "480x640",
                        "fps": 30,
                        "active": True
                    }
                ],
                "video_format": "mp4",
                "encoding": "h264"
            }
        }


class EpisodeVideos(BaseModel):
    """Video URLs for a specific episode"""
    episode_id: int = Field(..., description="Episode identifier")
    videos: List[VideoUrl] = Field(..., description="List of video URLs")
    duration: float = Field(..., description="Episode duration in seconds")
    frame_count: int = Field(..., description="Total number of frames")
    
    class Config:
        json_schema_extra = {
            "example": {
                "episode_id": 0,
                "videos": [
                    {
                        "camera": "observation.image",
                        "url": "https://huggingface.co/datasets/lerobot/pusht/resolve/main/videos/observation.image_episode_0.mp4",
                        "resolution": "480x640",
                        "fps": 30
                    }
                ],
                "duration": 10.5,
                "frame_count": 315
            }
        }