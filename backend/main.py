"""
FastAPI backend for LeRobot Dataset Viewer
Connects to HuggingFace Hub to fetch user's datasets
"""

from fastapi import FastAPI, HTTPException, Depends, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Dict, Any
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
import logging
import time
from collections import defaultdict

# Import configuration
from config import config

# Import our services
from services.huggingface_service import HuggingFaceService

# Import utilities
from utils.validators import validators

# Import Pydantic schemas
from schemas.common import ApiInfo, HealthResponse
from schemas.dataset import (
    DatasetResponse, 
    DatasetDetailResponse,
    EpisodeResponse,
    EpisodeDataResponse,
    UserInfoResponse
)

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=getattr(logging, config.LOG_LEVEL),
    format=config.LOG_FORMAT
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="LeRobot Dataset API",
    description="API for accessing LeRobot datasets from HuggingFace Hub",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=config.CORS_ALLOW_CREDENTIALS,
    allow_methods=config.CORS_ALLOW_METHODS,
    allow_headers=config.CORS_ALLOW_HEADERS,
)

# Simple in-memory rate limiter
class RateLimiter:
    def __init__(self, requests_per_minute: int = config.RATE_LIMIT_REQUESTS):
        self.requests_per_minute = requests_per_minute
        self.requests = defaultdict(list)
    
    def check_rate_limit(self, client_id: str) -> bool:
        now = datetime.now()
        minute_ago = now - timedelta(minutes=1)
        
        # Clean old requests
        self.requests[client_id] = [
            req_time for req_time in self.requests[client_id]
            if req_time > minute_ago
        ]
        
        # Check if limit exceeded
        if len(self.requests[client_id]) >= self.requests_per_minute:
            return False
        
        # Add current request
        self.requests[client_id].append(now)
        return True

rate_limiter = RateLimiter(requests_per_minute=30)

# Dependency to check rate limiting
async def check_rate_limit(request: Request):
    client_id = request.client.host if request.client else "unknown"
    if not rate_limiter.check_rate_limit(client_id):
        logger.warning(f"Rate limit exceeded for {client_id}")
        raise HTTPException(
            status_code=429, 
            detail="Too many requests. Please wait a moment before trying again."
        )

# Dependency to get HuggingFace service
def get_hf_service(
    authorization: Optional[str] = Header(None)
) -> HuggingFaceService:
    # Try to get token from Authorization header first
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")
        logger.debug("Using token from Authorization header")
    
    # Fall back to environment variable
    if not token:
        token = os.getenv("HF_TOKEN")
        logger.debug("Using token from environment variable")
    
    if not token:
        raise HTTPException(
            status_code=401, 
            detail="HF_TOKEN not provided. Please provide via Authorization header or configure in environment."
        )
    
    return HuggingFaceService(token)

# Root endpoint
@app.get("/", response_model=ApiInfo)
def read_root():
    return ApiInfo(
        message="LeRobot Dataset API",
        version="0.1.0",
        status="running"
    )

# Health check
@app.get("/health", response_model=HealthResponse)
def health_check():
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now()
    )


# Get authenticated user info
@app.get("/api/v1/user", response_model=UserInfoResponse, dependencies=[Depends(check_rate_limit)])
def get_user_info(hf_service: HuggingFaceService = Depends(get_hf_service)):
    """Get information about the authenticated HuggingFace user"""
    try:
        user_info = hf_service.get_user_info()
        return user_info
    except Exception as e:
        logger.error(f"Error fetching user info: {e}")
        if "429" in str(e) or "Too Many Requests" in str(e):
            raise HTTPException(
                status_code=429, 
                detail="HuggingFace API rate limit exceeded. Please wait a moment."
            )
        raise HTTPException(status_code=500, detail=str(e))

# List user's datasets
@app.get("/api/v1/datasets", response_model=List[DatasetResponse], dependencies=[Depends(check_rate_limit)])
def list_datasets(
    hf_service: HuggingFaceService = Depends(get_hf_service),
    limit: Optional[int] = None
):
    """List all datasets accessible to the authenticated user"""
    try:
        datasets = hf_service.get_user_datasets(limit=limit)
        logger.info(f"Found {len(datasets)} datasets")
        return datasets
    except Exception as e:
        logger.error(f"Error listing datasets: {e}")
        if "429" in str(e) or "Too Many Requests" in str(e):
            raise HTTPException(
                status_code=429, 
                detail="HuggingFace API rate limit exceeded. Please wait a moment."
            )
        raise HTTPException(status_code=500, detail=str(e))

# Get specific episode data (most specific route first)
@app.get("/api/v1/datasets/{owner}/{dataset_name}/episodes/{episode_id}", response_model=EpisodeDataResponse)
def get_episode_data(
    owner: str,
    dataset_name: str,
    episode_id: int,
    hf_service: HuggingFaceService = Depends(get_hf_service)
):
    """Get data for a specific episode including video URLs and telemetry"""
    # Validate inputs
    owner = validators.validate_repo_owner(owner)
    dataset_name = validators.validate_dataset_name(dataset_name)
    episode_id = validators.validate_episode_id(episode_id)
    
    repo_id = f"{owner}/{dataset_name}"
    try:
        episode_data = hf_service.get_episode_data(repo_id, episode_id)
        if not episode_data:
            raise HTTPException(status_code=404, detail=f"Episode {episode_id} not found")
        return episode_data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching episode {episode_id} for {repo_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get dataset episodes
@app.get("/api/v1/datasets/{owner}/{dataset_name}/episodes", response_model=List[EpisodeResponse])
def get_dataset_episodes(
    owner: str,
    dataset_name: str,
    hf_service: HuggingFaceService = Depends(get_hf_service)
):
    """Get list of episodes for a dataset"""
    # Validate inputs
    owner = validators.validate_repo_owner(owner)
    dataset_name = validators.validate_dataset_name(dataset_name)
    
    repo_id = f"{owner}/{dataset_name}"
    try:
        episodes = hf_service.get_dataset_episodes(repo_id)
        return episodes
    except Exception as e:
        logger.error(f"Error fetching episodes for {repo_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get specific dataset details
@app.get("/api/v1/datasets/{owner}/{dataset_name}", response_model=DatasetDetailResponse)
def get_dataset_details(
    owner: str,
    dataset_name: str,
    hf_service: HuggingFaceService = Depends(get_hf_service)
):
    """Get detailed information about a specific dataset"""
    # Validate inputs
    owner = validators.validate_repo_owner(owner)
    dataset_name = validators.validate_dataset_name(dataset_name)
    
    repo_id = f"{owner}/{dataset_name}"
    try:
        dataset_details = hf_service.get_dataset_details(repo_id)
        if not dataset_details:
            raise HTTPException(status_code=404, detail=f"Dataset {repo_id} not found")
        return dataset_details
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching dataset {repo_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get dataset size
@app.get("/api/v1/datasets/{owner}/{dataset_name}/size", dependencies=[Depends(check_rate_limit)])
def get_dataset_size(
    owner: str,
    dataset_name: str,
    hf_service: HuggingFaceService = Depends(get_hf_service)
):
    """Get the actual size of a dataset from HuggingFace datasets-server"""
    # Validate inputs
    owner = validators.validate_repo_owner(owner)
    dataset_name = validators.validate_dataset_name(dataset_name)
    
    repo_id = f"{owner}/{dataset_name}"
    try:
        size = hf_service.get_dataset_size(repo_id)
        if size is not None:
            return {"size": size, "formatted": format_file_size(size)}
        else:
            return {"size": 0, "formatted": "Size unavailable"}
    except Exception as e:
        logger.error(f"Error fetching size for dataset {repo_id}: {e}")
        return {"size": 0, "formatted": "Size unavailable"}

def format_file_size(bytes: int) -> str:
    """Format bytes to human readable string"""
    sizes = ["B", "KB", "MB", "GB", "TB"]
    if bytes == 0:
        return "0 B"
    i = 0
    while bytes >= 1024 and i < len(sizes) - 1:
        bytes /= 1024.0
        i += 1
    return f"{bytes:.2f} {sizes[i]}"

# Delete a dataset
@app.delete("/api/v1/datasets/{owner}/{dataset_name}", dependencies=[Depends(check_rate_limit)])
def delete_dataset(
    owner: str,
    dataset_name: str,
    hf_service: HuggingFaceService = Depends(get_hf_service)
):
    """Delete a dataset from HuggingFace. WARNING: This action is irreversible!"""
    # Validate inputs
    owner = validators.validate_repo_owner(owner)
    dataset_name = validators.validate_dataset_name(dataset_name)
    
    repo_id = f"{owner}/{dataset_name}"
    try:
        success = hf_service.delete_dataset(repo_id)
        if success:
            return {"message": f"Successfully deleted dataset: {repo_id}"}
        else:
            raise HTTPException(status_code=500, detail="Failed to delete dataset")
    except Exception as e:
        logger.error(f"Error deleting dataset {repo_id}: {e}")
        if "404" in str(e) or "Not Found" in str(e):
            raise HTTPException(status_code=404, detail=f"Dataset {repo_id} not found")
        elif "403" in str(e) or "Forbidden" in str(e):
            raise HTTPException(status_code=403, detail="You don't have permission to delete this dataset")
        raise HTTPException(status_code=500, detail=str(e))

# Run the server
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )