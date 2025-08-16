"""
FastAPI backend for LeRobot Dataset Viewer
Connects to HuggingFace Hub to fetch user's datasets
"""

from fastapi import FastAPI, HTTPException, Depends, Header, Request, Response
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
from utils.responses import success_response, error_response, paginated_response

# Import Pydantic schemas
from schemas.common import ApiInfo, HealthResponse
from schemas.dataset import (
    DatasetResponse, 
    DatasetDetailResponse,
    EpisodeResponse,
    EpisodeDataResponse,
    UserInfoResponse
)
from schemas.telemetry import EnhancedEpisodeDataResponse

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

# Simple in-memory rate limiter with memory bounds
class RateLimiter:
    def __init__(self, requests_per_minute: int = config.RATE_LIMIT_REQUESTS, max_clients: int = 1000):
        self.requests_per_minute = requests_per_minute
        self.max_clients = max_clients
        self.requests = defaultdict(list)
        self.last_cleanup = datetime.now()
    
    def _cleanup_old_clients(self):
        """Remove clients that haven't made requests recently"""
        if datetime.now() - self.last_cleanup < timedelta(minutes=5):
            return  # Only cleanup every 5 minutes
            
        cutoff_time = datetime.now() - timedelta(hours=1)
        clients_to_remove = []
        
        for client_id, request_times in self.requests.items():
            if not request_times or max(request_times) < cutoff_time:
                clients_to_remove.append(client_id)
        
        for client_id in clients_to_remove:
            del self.requests[client_id]
        
        self.last_cleanup = datetime.now()
        logger.debug(f"Cleaned up {len(clients_to_remove)} inactive clients from rate limiter")
    
    def check_rate_limit(self, client_id: str) -> bool:
        now = datetime.now()
        minute_ago = now - timedelta(minutes=1)
        
        # Perform cleanup if we have too many clients
        if len(self.requests) > self.max_clients:
            self._cleanup_old_clients()
        
        # Clean old requests for this client
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
        # Log token usage securely (don't expose actual token)
        logger.debug("Using token from Authorization header")
    
    # Fall back to environment variable
    if not token:
        token = os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_TOKEN")
        if token:
            logger.debug("Using token from environment variable")
    
    if not token:
        raise HTTPException(
            status_code=401, 
            detail="Authentication required. Please provide HuggingFace token via Authorization header."
        )
    
    # Validate token format
    if not token.startswith("hf_") and len(token) < 20:
        raise HTTPException(
            status_code=401,
            detail="Invalid token format. Please provide a valid HuggingFace token."
        )
    
    try:
        return HuggingFaceService(token)
    except ValueError as e:
        logger.warning(f"Invalid token provided: {str(e)}")
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token provided."
        )

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

# List user's datasets with TanStack Query support
@app.get("/api/v1/datasets", dependencies=[Depends(check_rate_limit)])
def list_datasets(
    response: Response,
    hf_service: HuggingFaceService = Depends(get_hf_service),
    page: int = 1,
    limit: int = 20
):
    """List all datasets accessible to the authenticated user with pagination"""
    try:
        # Add cache headers for TanStack Query
        response.headers["Cache-Control"] = "public, max-age=300"  # 5 minutes
        
        # Get all datasets
        all_datasets = hf_service.get_user_datasets()
        
        # Simple pagination
        start = (page - 1) * limit
        end = start + limit
        paginated_datasets = all_datasets[start:end]
        
        logger.info(f"Found {len(all_datasets)} total datasets, returning page {page}")
        
        return paginated_response(
            data=paginated_datasets,
            page=page,
            limit=limit,
            total=len(all_datasets)
        )
    except Exception as e:
        logger.error(f"Error listing datasets: {e}")
        if "429" in str(e) or "Too Many Requests" in str(e):
            return error_response(
                message="HuggingFace API rate limit exceeded. Please wait a moment.",
                code="RATE_LIMIT_EXCEEDED"
            )
        return error_response(
            message="Failed to fetch datasets",
            code="FETCH_ERROR"
        )

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

# Get dataset episodes with TanStack Query support
@app.get("/api/v1/datasets/{owner}/{dataset_name}/episodes")
def get_dataset_episodes(
    response: Response,
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
        # Add cache headers for TanStack Query
        response.headers["Cache-Control"] = "public, max-age=300"  # 5 minutes for episodes
        
        episodes = hf_service.get_dataset_episodes(repo_id)
        
        return success_response(
            data=episodes,
            meta={"repo_id": repo_id, "episode_count": len(episodes)}
        )
    except Exception as e:
        logger.error(f"Error fetching episodes for {repo_id}: {e}")
        return error_response(
            message="Failed to fetch episodes",
            code="FETCH_ERROR"
        )

# Get specific dataset details with TanStack Query support
@app.get("/api/v1/datasets/{owner}/{dataset_name}")
def get_dataset_details(
    response: Response,
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
        # Add cache headers for TanStack Query
        response.headers["Cache-Control"] = "public, max-age=600"  # 10 minutes for individual datasets
        
        dataset_details = hf_service.get_dataset_details(repo_id)
        if not dataset_details:
            return error_response(
                message=f"Dataset {repo_id} not found",
                code="DATASET_NOT_FOUND"
            )
        
        return success_response(
            data=dataset_details,
            meta={"repo_id": repo_id}
        )
    except Exception as e:
        logger.error(f"Error fetching dataset {repo_id}: {e}")
        return error_response(
            message="Failed to fetch dataset details",
            code="FETCH_ERROR"
        )

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

# Enhanced API endpoints for complete LeRobot integration

@app.get("/api/v1/datasets/{owner}/{dataset_name}/enhanced", dependencies=[Depends(check_rate_limit)])
def get_enhanced_dataset_details(
    owner: str,
    dataset_name: str,
    hf_service: HuggingFaceService = Depends(get_hf_service)
):
    """Get enhanced dataset details with complete LeRobot metadata"""
    # Validate inputs
    try:
        owner = validators.validate_repo_owner(owner)
        dataset_name = validators.validate_dataset_name(dataset_name)
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid dataset identifier format")
    
    repo_id = f"{owner}/{dataset_name}"
    try:
        # Get basic details
        dataset_details = hf_service.get_dataset_details(repo_id)
        if not dataset_details:
            raise HTTPException(status_code=404, detail=f"Dataset {repo_id} not found")
        
        # Get enhanced features information
        features = hf_service.get_dataset_features(repo_id)
        dataset_details["enhancedFeatures"] = features
        
        # Get robot configuration
        robot_config = hf_service._detect_robot_configuration(repo_id)
        dataset_details["robotConfig"] = robot_config
        
        return dataset_details
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching enhanced dataset details for {repo_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch enhanced dataset details")

@app.get("/api/v1/datasets/{owner}/{dataset_name}/features", dependencies=[Depends(check_rate_limit)])
def get_dataset_features(
    owner: str,
    dataset_name: str,
    hf_service: HuggingFaceService = Depends(get_hf_service)
):
    """Get complete feature information for a dataset"""
    # Validate inputs
    owner = validators.validate_repo_owner(owner)
    dataset_name = validators.validate_dataset_name(dataset_name)
    
    repo_id = f"{owner}/{dataset_name}"
    try:
        features = hf_service.get_dataset_features(repo_id)
        if not features:
            raise HTTPException(status_code=404, detail=f"No features found for dataset {repo_id}")
        return features
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching features for {repo_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/datasets/{owner}/{dataset_name}/analytics", dependencies=[Depends(check_rate_limit)])
def get_dataset_analytics(
    owner: str,
    dataset_name: str,
    hf_service: HuggingFaceService = Depends(get_hf_service)
):
    """Get analytics and statistics for a dataset"""
    # Validate inputs
    owner = validators.validate_repo_owner(owner)
    dataset_name = validators.validate_dataset_name(dataset_name)
    
    repo_id = f"{owner}/{dataset_name}"
    try:
        analytics = hf_service.get_dataset_analytics(repo_id)
        if not analytics:
            raise HTTPException(status_code=404, detail=f"No analytics available for dataset {repo_id}")
        return analytics
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching analytics for {repo_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/datasets/{owner}/{dataset_name}/episodes/{episode_id}/enhanced")
def get_enhanced_episode_data(
    owner: str,
    dataset_name: str,
    episode_id: int,
    hf_service: HuggingFaceService = Depends(get_hf_service)
):
    """Get enhanced episode data with complete telemetry, video metadata, and statistics"""
    # Validate inputs
    owner = validators.validate_repo_owner(owner)
    dataset_name = validators.validate_dataset_name(dataset_name)
    episode_id = validators.validate_episode_id(episode_id)
    
    repo_id = f"{owner}/{dataset_name}"
    try:
        enhanced_data = hf_service.get_enhanced_episode_data(repo_id, episode_id)
        if not enhanced_data:
            raise HTTPException(status_code=404, detail=f"Enhanced episode data not found for {repo_id}/episode_{episode_id}")
        return enhanced_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching enhanced episode data for {repo_id}/{episode_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/datasets/{owner}/{dataset_name}/episodes/{episode_id}/telemetry", dependencies=[Depends(check_rate_limit)])
def get_episode_telemetry(
    owner: str,
    dataset_name: str,
    episode_id: int,
    hf_service: HuggingFaceService = Depends(get_hf_service),
    features: Optional[str] = None,  # Comma-separated list of features
    downsample: Optional[int] = None,  # Downsample factor
    max_points: int = 1000,  # Maximum points to return
    format: str = "json"  # Output format: json or csv
):
    """Get enhanced telemetry data for a specific episode"""
    # Validate inputs
    owner = validators.validate_repo_owner(owner)
    dataset_name = validators.validate_dataset_name(dataset_name)
    episode_id = validators.validate_episode_id(episode_id)
    
    repo_id = f"{owner}/{dataset_name}"
    try:
        # Validate format parameter
        format_lower = format.lower()
        if format_lower not in ["json", "csv"]:
            raise HTTPException(status_code=400, detail="Format must be 'json' or 'csv'")
        
        # Parse features if provided
        feature_list = None
        if features:
            feature_list = [f.strip() for f in features.split(',')]
        
        # Get telemetry data in requested format
        telemetry_data = hf_service.get_episode_telemetry_with_format(
            repo_id, episode_id,
            output_format=format_lower,
            features=feature_list, 
            downsample=downsample, 
            max_points=max_points
        )
        
        if format_lower == "csv":
            if not telemetry_data:
                raise HTTPException(status_code=404, detail=f"Telemetry data not found for {repo_id}/episode_{episode_id}")
            
            # Return CSV data with appropriate content type
            from fastapi.responses import Response
            return Response(
                content=telemetry_data,
                media_type="text/csv",
                headers={
                    "Content-Disposition": f"attachment; filename=episode_{episode_id}_telemetry.csv"
                }
            )
        else:
            # JSON format
            if not telemetry_data:
                raise HTTPException(status_code=404, detail=f"Telemetry data not found for {repo_id}/episode_{episode_id}")
            
            return {
                "data": telemetry_data,
                "count": len(telemetry_data),
                "downsample_factor": downsample or 1,
                "max_points": max_points,
                "features_requested": feature_list,
                "format": "json"
            }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching telemetry for {repo_id}/{episode_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Memory estimation endpoint
@app.get("/api/v1/datasets/{owner}/{dataset_name}/episodes/{episode_id}/memory-estimate", dependencies=[Depends(check_rate_limit)])
def estimate_episode_memory(
    owner: str,
    dataset_name: str,
    episode_id: int,
    hf_service: HuggingFaceService = Depends(get_hf_service),
    features: Optional[str] = None  # Comma-separated list of features
):
    """Estimate memory usage for loading episode telemetry data"""
    # Validate inputs
    owner = validators.validate_repo_owner(owner)
    dataset_name = validators.validate_dataset_name(dataset_name)
    episode_id = validators.validate_episode_id(episode_id)
    
    repo_id = f"{owner}/{dataset_name}"
    try:
        # Parse features if provided
        feature_list = None
        if features:
            feature_list = [f.strip() for f in features.split(',')]
        
        memory_estimate = hf_service.estimate_episode_memory_usage(
            repo_id, episode_id, features=feature_list
        )
        
        if "error" in memory_estimate:
            raise HTTPException(status_code=404, detail=memory_estimate["error"])
        
        return memory_estimate
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error estimating memory for {repo_id}/{episode_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Enhanced video URLs endpoint
@app.get("/api/v1/datasets/{owner}/{dataset_name}/episodes/{episode_id}/videos", dependencies=[Depends(check_rate_limit)])
def get_enhanced_video_urls(
    owner: str,
    dataset_name: str,
    episode_id: int,
    hf_service: HuggingFaceService = Depends(get_hf_service)
):
    """Get enhanced video URLs with full metadata and streaming info"""
    # Validate inputs
    owner = validators.validate_repo_owner(owner)
    dataset_name = validators.validate_dataset_name(dataset_name)
    episode_id = validators.validate_episode_id(episode_id)
    
    repo_id = f"{owner}/{dataset_name}"
    try:
        video_urls = hf_service.get_enhanced_video_urls(repo_id, episode_id)
        
        return {
            "episode_id": episode_id,
            "video_count": len(video_urls),
            "videos": video_urls,
            "streaming_optimized": True,
            "direct_access": True
        }
        
    except Exception as e:
        logger.error(f"Error fetching enhanced video URLs for {repo_id}/{episode_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Video accessibility validation endpoint
@app.get("/api/v1/datasets/{owner}/{dataset_name}/episodes/{episode_id}/videos/validate", dependencies=[Depends(check_rate_limit)])
def validate_video_accessibility(
    owner: str,
    dataset_name: str,
    episode_id: int,
    hf_service: HuggingFaceService = Depends(get_hf_service)
):
    """Validate video accessibility and streaming capabilities"""
    # Validate inputs
    owner = validators.validate_repo_owner(owner)
    dataset_name = validators.validate_dataset_name(dataset_name)
    episode_id = validators.validate_episode_id(episode_id)
    
    repo_id = f"{owner}/{dataset_name}"
    try:
        validation_results = hf_service.validate_video_accessibility(repo_id, episode_id)
        
        if "error" in validation_results:
            raise HTTPException(status_code=404, detail=validation_results["error"])
        
        return validation_results
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error validating video accessibility for {repo_id}/{episode_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Configuration endpoint
@app.get("/api/v1/config")
def get_backend_configuration():
    """Get backend configuration and capabilities"""
    return {
        "api_version": config.API_VERSION,
        "features": {
            "telemetry": config.get_telemetry_config(),
            "video": config.get_video_config(),
            "memory_estimation": config.ENABLE_MEMORY_ESTIMATION,
            "parquet_column_selection": config.ENABLE_PARQUET_COLUMN_SELECTION,
            "feature_filtering": config.ENABLE_FEATURE_FILTERING,
            "lerobot_compatibility": config.LEROBOT_COMPAT_CHECKS
        },
        "limits": {
            "max_telemetry_points": config.MAX_TELEMETRY_POINTS,
            "max_file_size_mb": config.MAX_FILE_SIZE_MB,
            "rate_limit_requests": config.RATE_LIMIT_REQUESTS,
            "rate_limit_window_minutes": config.RATE_LIMIT_WINDOW_MINUTES,
            "request_timeout": config.DEFAULT_REQUEST_TIMEOUT,
            "parquet_timeout": config.PARQUET_REQUEST_TIMEOUT
        },
        "memory_thresholds": config.get_memory_recommendation_thresholds(),
        "supported_datatypes": config.SUPPORTED_DATATYPES,
        "performance_optimizations": {
            "direct_video_urls": config.VIDEO_STREAMING_OPTIMIZED,
            "selective_column_loading": config.ENABLE_PARQUET_COLUMN_SELECTION,
            "memory_aware_processing": config.ENABLE_MEMORY_ESTIMATION,
            "csv_streaming": config.TELEMETRY_ENABLE_CSV
        }
    }

# LeRobot compatibility validation endpoint
@app.get("/api/v1/datasets/{owner}/{dataset_name}/compatibility", dependencies=[Depends(check_rate_limit)])
def validate_dataset_compatibility(
    owner: str,
    dataset_name: str,
    hf_service: HuggingFaceService = Depends(get_hf_service)
):
    """Validate dataset compatibility with LeRobot backend"""
    # Validate inputs
    owner = validators.validate_repo_owner(owner)
    dataset_name = validators.validate_dataset_name(dataset_name)
    
    repo_id = f"{owner}/{dataset_name}"
    try:
        compatibility_result = hf_service.validate_lerobot_compatibility(repo_id)
        return compatibility_result
        
    except Exception as e:
        logger.error(f"Error validating compatibility for {repo_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/datasets/{owner}/{dataset_name}/episodes/{episode_id}/video-metadata", dependencies=[Depends(check_rate_limit)])
def get_episode_video_metadata(
    owner: str,
    dataset_name: str,
    episode_id: int,
    hf_service: HuggingFaceService = Depends(get_hf_service)
):
    """Get video metadata for a specific episode"""
    # Validate inputs
    owner = validators.validate_repo_owner(owner)
    dataset_name = validators.validate_dataset_name(dataset_name)
    episode_id = validators.validate_episode_id(episode_id)
    
    repo_id = f"{owner}/{dataset_name}"
    try:
        video_metadata = hf_service._get_video_metadata(repo_id, episode_id)
        if not video_metadata:
            raise HTTPException(status_code=404, detail=f"Video metadata not found for {repo_id}/episode_{episode_id}")
        return video_metadata
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching video metadata for {repo_id}/{episode_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/datasets/{owner}/{dataset_name}/robot-config", dependencies=[Depends(check_rate_limit)])
def get_robot_configuration(
    owner: str,
    dataset_name: str,
    hf_service: HuggingFaceService = Depends(get_hf_service)
):
    """Get robot configuration information for a dataset"""
    # Validate inputs
    owner = validators.validate_repo_owner(owner)
    dataset_name = validators.validate_dataset_name(dataset_name)
    
    repo_id = f"{owner}/{dataset_name}"
    try:
        robot_config = hf_service._detect_robot_configuration(repo_id)
        if not robot_config:
            raise HTTPException(status_code=404, detail=f"Robot configuration not found for {repo_id}")
        return robot_config
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching robot configuration for {repo_id}: {e}")
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