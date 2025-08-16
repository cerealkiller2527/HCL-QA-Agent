"""
Dataset-related Pydantic models for API responses
"""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field, validator


class RobotType(str, Enum):
    """Robot type enumeration"""

    ARM = "arm"
    MOBILE = "mobile"
    HUMANOID = "humanoid"
    SO101 = "so101"
    CUSTOM = "custom"


class DatasetStatus(str, Enum):
    """Dataset status enumeration"""

    READY = "ready"
    PROCESSING = "processing"
    RECORDING = "recording"
    ERROR = "error"


class Multilinguality(str, Enum):
    """Dataset multilinguality enumeration"""

    MONOLINGUAL = "monolingual"
    MULTILINGUAL = "multilingual"
    TRANSLATION = "translation"


class DatasetResponse(BaseModel):
    """Dataset response model matching frontend expectations"""

    id: str = Field(..., description="Dataset repository ID")
    name: str = Field(..., description="Dataset name")
    description: str = Field("", description="Dataset description")
    tags: List[str] = Field(default_factory=list, description="Dataset tags")
    createdAt: str = Field(..., description="Creation timestamp")
    frameCount: int = Field(0, ge=0, description="Total number of frames")
    duration: float = Field(0, ge=0, description="Duration in seconds")
    fileSize: int = Field(0, ge=0, description="Total file size in bytes")
    status: DatasetStatus = Field(DatasetStatus.READY, description="Dataset status")
    robotType: RobotType = Field(RobotType.SO101, description="Type of robot")

    # Optional fields that may be available
    episodeCount: Optional[int] = Field(None, description="Number of episodes")
    fps: Optional[int] = Field(None, description="Frames per second")
    author: Optional[str] = Field(None, description="Dataset author")
    likes: Optional[int] = Field(None, description="Number of likes")
    downloads: Optional[int] = Field(None, description="Number of downloads")
    private: Optional[bool] = Field(None, description="Is private dataset")

    # Additional HuggingFace metadata fields
    languages: Optional[List[str]] = Field(None, description="Dataset languages")
    taskCategories: Optional[List[str]] = Field(None, description="Task categories")
    taskIds: Optional[List[str]] = Field(None, description="Specific task identifiers")
    sizeCategories: Optional[str] = Field(None, description="Dataset size category")
    multilinguality: Optional[Multilinguality] = Field(None, description="Multilinguality status")
    languageCreators: Optional[List[str]] = Field(None, description="How data was created")
    paperswithcodeId: Optional[str] = Field(None, description="Papers with Code ID")
    prettyName: Optional[str] = Field(None, description="Formatted display name")
    license: Optional[str] = Field(None, description="Dataset license")
    citation: Optional[str] = Field(None, description="Citation information")

    class Config:
        from_attributes = True  # Updated from orm_mode for Pydantic V2
        use_enum_values = True
        json_schema_extra = {  # Updated from schema_extra for Pydantic V2
            "example": {
                "id": "username/dataset-name",
                "name": "dataset-name",
                "description": "A LeRobot dataset for robotic manipulation",
                "tags": ["LeRobot", "manipulation", "robotics"],
                "createdAt": "2024-01-15T10:30:00Z",
                "frameCount": 10000,
                "duration": 333.33,
                "fileSize": 1073741824,
                "status": "ready",
                "robotType": "arm",
                "episodeCount": 10,
                "fps": 30,
            }
        }


class DatasetDetailResponse(DatasetResponse):
    """Extended dataset response with additional details"""

    features: Optional[List[str]] = Field(None, description="Available data features")
    videoKeys: Optional[List[str]] = Field(None, description="Available video streams")
    sensors: Optional[List[Dict[str, Any]]] = Field(None, description="Sensor configurations")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")


class EpisodeResponse(BaseModel):
    """Episode response model"""

    id: int = Field(..., description="Episode index")
    name: str = Field(..., description="Episode name")
    duration: float = Field(..., ge=0, description="Episode duration in seconds")
    status: str = Field("completed", description="Episode status")
    tasks: List[str] = Field(default_factory=list, description="Tasks performed")
    length: Optional[int] = Field(None, description="Number of frames")

    class Config:
        json_schema_extra = {
            "example": {
                "id": 0,
                "name": "Episode 0",
                "duration": 60.0,
                "status": "completed",
                "tasks": ["Pick and place object"],
                "length": 1800,
            }
        }


class VideoUrlResponse(BaseModel):
    """Video URL response model"""

    camera: str = Field(..., description="Camera identifier")
    url: str = Field(..., description="Video stream URL")
    resolution: Optional[str] = Field(None, description="Video resolution")
    fps: Optional[int] = Field(None, description="Frames per second")


class EpisodeDataResponse(BaseModel):
    """Complete episode data response"""

    episode: EpisodeResponse
    videoUrls: List[VideoUrlResponse] = Field(default_factory=list)
    telemetryData: List[Dict[str, Any]] = Field(default_factory=list)
    cameras: List[Dict[str, str]] = Field(default_factory=list)


class UserInfoResponse(BaseModel):
    """User information response"""

    username: str = Field(..., description="HuggingFace username")
    fullname: Optional[str] = Field(None, description="User's full name")
    email: Optional[str] = Field(None, description="User's email")
    organizations: List[Dict[str, Any]] = Field(
        default_factory=list, description="User's organizations"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "username": "john_doe",
                "fullname": "John Doe",
                "email": "john@example.com",
                "organizations": [],
            }
        }
