"""
Configuration settings for the backend application
"""

import os
from typing import Optional

class Config:
    """Application configuration"""
    
    # API Settings
    API_VERSION = "v1"
    API_PREFIX = f"/api/{API_VERSION}"
    
    # Server Settings
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", 8000))
    DEBUG = os.getenv("DEBUG", "false").lower() == "true"
    
    # CORS Settings
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    CORS_ALLOW_CREDENTIALS = True
    CORS_ALLOW_METHODS = ["*"]
    CORS_ALLOW_HEADERS = ["*"]
    
    # Rate Limiting
    RATE_LIMIT_REQUESTS = int(os.getenv("RATE_LIMIT_REQUESTS", 30))
    RATE_LIMIT_WINDOW_MINUTES = int(os.getenv("RATE_LIMIT_WINDOW", 1))
    
    # Cache Settings
    CACHE_TTL_MINUTES = int(os.getenv("CACHE_TTL_MINUTES", 5))
    
    # HuggingFace Settings
    HF_TOKEN: Optional[str] = os.getenv("HUGGINGFACE_TOKEN")
    HF_DATASETS_SERVER_URL = "https://datasets-server.huggingface.co"
    HF_DATASETS_URL = "https://huggingface.co/datasets"
    
    # Request Timeouts (in seconds)
    DEFAULT_REQUEST_TIMEOUT = int(os.getenv("REQUEST_TIMEOUT", 10))
    PARQUET_REQUEST_TIMEOUT = int(os.getenv("PARQUET_TIMEOUT", 30))
    
    # Data Processing (Enhanced)
    MAX_TELEMETRY_POINTS = int(os.getenv("MAX_TELEMETRY_POINTS", 1000))
    DEFAULT_FPS = int(os.getenv("DEFAULT_FPS", 30))
    DEFAULT_DOWNSAMPLE_FACTOR = int(os.getenv("DEFAULT_DOWNSAMPLE_FACTOR", 1))
    
    # Memory Management
    MEMORY_WARNING_THRESHOLD_MB = int(os.getenv("MEMORY_WARNING_MB", 100))
    MEMORY_CRITICAL_THRESHOLD_MB = int(os.getenv("MEMORY_CRITICAL_MB", 500))
    MAX_CLIENTS_RATE_LIMITER = int(os.getenv("MAX_CLIENTS", 1000))
    
    # Telemetry Data Settings
    TELEMETRY_DEFAULT_FORMAT = os.getenv("TELEMETRY_FORMAT", "json").lower()
    TELEMETRY_ENABLE_CSV = os.getenv("TELEMETRY_ENABLE_CSV", "true").lower() == "true"
    TELEMETRY_COLUMN_FILTER_ENABLED = True  # Enable selective column loading
    
    # Video Processing Settings
    VIDEO_VALIDATION_ENABLED = os.getenv("VIDEO_VALIDATION", "true").lower() == "true"
    VIDEO_VALIDATION_TIMEOUT = int(os.getenv("VIDEO_VALIDATION_TIMEOUT", 10))
    VIDEO_STREAMING_OPTIMIZED = True  # Use direct HF URLs
    
    # LeRobot Compatibility
    LEROBOT_COMPAT_CHECKS = os.getenv("LEROBOT_COMPAT_CHECKS", "true").lower() == "true"
    SUPPORTED_DATATYPES = ["float32", "int32", "video"]  # Supported datatypes for visualization
    IGNORED_FEATURE_PATTERNS = ["observation.images", "reward"]  # Features to ignore in telemetry
    
    # Performance Settings
    ENABLE_PARQUET_COLUMN_SELECTION = True  # Enable selective column loading
    ENABLE_MEMORY_ESTIMATION = True  # Enable memory usage estimation
    ENABLE_FEATURE_FILTERING = True  # Enable feature-based filtering
    CHUNK_SIZE_DEFAULT = int(os.getenv("CHUNK_SIZE", 1000))
    
    # File Size Limits
    MAX_FILE_SIZE_MB = int(os.getenv("MAX_FILE_SIZE_MB", 50))
    
    # Security Settings (Enhanced)
    MASK_TOKENS_IN_LOGS = True  # Mask HF tokens in logs
    SANITIZE_ERROR_MESSAGES = True  # Remove sensitive info from error messages
    
    # Logging
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    @classmethod
    def get_memory_recommendation_thresholds(cls) -> dict:
        """Get memory recommendation thresholds"""
        return {
            "safe": cls.MEMORY_WARNING_THRESHOLD_MB * 0.1,  # 10MB
            "moderate": cls.MEMORY_WARNING_THRESHOLD_MB,     # 100MB
            "large": cls.MEMORY_CRITICAL_THRESHOLD_MB,       # 500MB
        }
    
    @classmethod
    def get_telemetry_config(cls) -> dict:
        """Get telemetry-specific configuration"""
        return {
            "max_points": cls.MAX_TELEMETRY_POINTS,
            "default_format": cls.TELEMETRY_DEFAULT_FORMAT,
            "enable_csv": cls.TELEMETRY_ENABLE_CSV,
            "default_downsample": cls.DEFAULT_DOWNSAMPLE_FACTOR,
            "column_filtering": cls.TELEMETRY_COLUMN_FILTER_ENABLED,
            "supported_formats": ["json", "csv"] if cls.TELEMETRY_ENABLE_CSV else ["json"]
        }
    
    @classmethod
    def get_video_config(cls) -> dict:
        """Get video processing configuration"""
        return {
            "validation_enabled": cls.VIDEO_VALIDATION_ENABLED,
            "validation_timeout": cls.VIDEO_VALIDATION_TIMEOUT,
            "streaming_optimized": cls.VIDEO_STREAMING_OPTIMIZED,
            "direct_urls": True,  # Use direct HuggingFace URLs
            "supports_range_requests": True
        }

# Create a singleton instance
config = Config()