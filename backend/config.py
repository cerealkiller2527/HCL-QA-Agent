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
    
    # Data Processing
    MAX_TELEMETRY_POINTS = int(os.getenv("MAX_TELEMETRY_POINTS", 1000))
    DEFAULT_FPS = int(os.getenv("DEFAULT_FPS", 30))
    
    # File Size Limits
    MAX_FILE_SIZE_MB = int(os.getenv("MAX_FILE_SIZE_MB", 50))
    
    # Logging
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

# Create a singleton instance
config = Config()