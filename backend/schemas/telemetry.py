"""
Telemetry and sensor data schemas for LeRobot datasets
"""

from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any, Union
from enum import Enum


class SensorType(str, Enum):
    """Sensor types supported by LeRobot"""
    FORCE_TORQUE = "force_torque"
    IMU = "imu"
    PRESSURE = "pressure"
    PROPRIOCEPTION = "proprioception"
    VISION = "vision"
    DEPTH = "depth"
    AUDIO = "audio"
    TACTILE = "tactile"
    CUSTOM = "custom"


class FeatureCategory(str, Enum):
    """Feature categories from LeRobot"""
    STATE = "state"
    ACTION = "action"
    OBSERVATION = "observation"
    SENSOR = "sensor"
    ENVIRONMENT = "environment"


class TelemetryPoint(BaseModel):
    """Single telemetry data point"""
    time: float = Field(..., description="Timestamp")
    timestamp: Optional[float] = Field(None, description="Alternative timestamp field")
    frame_index: Optional[int] = Field(None, description="Frame index")
    
    # Dynamic fields for different data types
    # These will be added dynamically based on the actual telemetry data


class EnhancedTelemetryData(BaseModel):
    """Enhanced telemetry data with complete LeRobot support"""
    episode_id: int = Field(..., description="Episode identifier")
    duration: float = Field(..., description="Episode duration in seconds")
    fps: int = Field(..., description="Frames per second")
    timestamps: List[float] = Field(..., description="All timestamps")
    
    # Organized data by category
    states: Dict[str, Union[List[float], List[List[float]]]] = Field(
        default_factory=dict, 
        description="Robot state data (joint positions, etc.)"
    )
    actions: Dict[str, Union[List[float], List[List[float]]]] = Field(
        default_factory=dict,
        description="Action commands"
    )
    observations: Dict[str, Union[List[float], List[List[float]]]] = Field(
        default_factory=dict,
        description="Observation data"
    )
    sensors: Optional[Dict[str, Union[List[float], List[List[float]]]]] = Field(
        None,
        description="Sensor readings (force, IMU, pressure, etc.)"
    )
    
    # Feature metadata
    feature_names: Dict[str, List[str]] = Field(
        default_factory=dict,
        description="Human-readable names for features"
    )
    feature_units: Optional[Dict[str, str]] = Field(
        None,
        description="Units for each feature"
    )
    feature_types: Dict[str, str] = Field(
        default_factory=dict,
        description="Data types for each feature"
    )
    
    # Multi-robot support
    multi_robot_data: Optional[Dict[str, Any]] = Field(
        None,
        description="Data organized by robot/arm if multi-robot"
    )
    robot_configs: Optional[Dict[str, Any]] = Field(
        None,
        description="Robot configuration information"
    )


class ArmTelemetryData(BaseModel):
    """Telemetry data for a single arm/robot"""
    arm_id: str = Field(..., description="Arm identifier (left, right, etc.)")
    joint_names: List[str] = Field(..., description="Joint names in order")
    dof: int = Field(..., description="Degrees of freedom")
    
    states: Dict[str, List[float]] = Field(..., description="Joint states")
    actions: Dict[str, List[float]] = Field(..., description="Joint actions")
    sensors: Optional[Dict[str, List[float]]] = Field(None, description="Arm sensors")


class MultiRobotTelemetryData(BaseModel):
    """Telemetry data for multi-robot/multi-arm systems"""
    robots: Dict[str, ArmTelemetryData] = Field(..., description="Data by robot/arm")
    synchronized: bool = Field(True, description="Are all robots synchronized")
    global_features: Optional[Dict[str, Any]] = Field(None, description="Global features")


class SensorReading(BaseModel):
    """Individual sensor reading"""
    sensor_id: str = Field(..., description="Sensor identifier")
    sensor_type: SensorType = Field(..., description="Type of sensor")
    timestamp: float = Field(..., description="Reading timestamp")
    value: Union[float, List[float]] = Field(..., description="Sensor value(s)")
    quality: Optional[str] = Field(None, description="Reading quality indicator")
    unit: Optional[str] = Field(None, description="Measurement unit")


class FeatureStatistics(BaseModel):
    """Statistical information for a feature"""
    min: Union[float, List[float]] = Field(..., description="Minimum values")
    max: Union[float, List[float]] = Field(..., description="Maximum values")
    mean: Union[float, List[float]] = Field(..., description="Mean values")
    std: Union[float, List[float]] = Field(..., description="Standard deviation")
    count: int = Field(..., description="Number of samples")


class EpisodeStatistics(BaseModel):
    """Statistics for an entire episode"""
    episode_id: int = Field(..., description="Episode identifier")
    feature_stats: Dict[str, FeatureStatistics] = Field(..., description="Statistics by feature")
    success: Optional[bool] = Field(None, description="Episode success status")
    task_completion: Optional[float] = Field(None, description="Task completion percentage")


class TelemetryQueryParams(BaseModel):
    """Parameters for querying telemetry data"""
    start_time: Optional[float] = Field(None, description="Start timestamp")
    end_time: Optional[float] = Field(None, description="End timestamp")
    features: Optional[List[str]] = Field(None, description="Specific features to include")
    downsample: Optional[int] = Field(None, description="Downsample factor")
    max_points: Optional[int] = Field(1000, description="Maximum data points to return")


class EnhancedEpisodeDataResponse(BaseModel):
    """Complete enhanced episode data response"""
    episode: Dict[str, Any] = Field(..., description="Episode metadata")
    telemetry: EnhancedTelemetryData = Field(..., description="Enhanced telemetry data")
    video_urls: List[Dict[str, str]] = Field(default_factory=list, description="Video URLs")
    camera_info: List[Dict[str, Any]] = Field(default_factory=list, description="Camera information")
    statistics: Optional[EpisodeStatistics] = Field(None, description="Episode statistics")
    
    # Additional metadata
    tasks: List[str] = Field(default_factory=list, description="Tasks performed in episode")
    robot_config: Optional[Dict[str, Any]] = Field(None, description="Robot configuration")
    environment_info: Optional[Dict[str, Any]] = Field(None, description="Environment information")