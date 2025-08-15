# Backend Dataset Analysis Report

## Executive Summary

This report provides a comprehensive analysis of the backend API for dataset listing and viewer functionality, focusing on Pydantic schemas, FastAPI endpoints, service layer implementations, and data transformations to standardize the API contract with the frontend.

## Schema Documentation

### Primary Schema Files

#### 1. `backend/schemas/dataset.py`
**Purpose**: Core dataset response models and validation

**Pydantic Models**:

##### `DatasetResponse` (Main Dataset Model)
```python
{
    # Core fields
    id: str,                    # Dataset repository ID
    name: str,                  # Dataset name
    description: str,           # Dataset description
    tags: List[str],           # Dataset tags
    createdAt: str,            # Creation timestamp
    frameCount: int,           # Total number of frames
    duration: float,           # Duration in seconds
    fileSize: int,             # Total file size in bytes
    status: DatasetStatus,     # Dataset status enum
    robotType: RobotType,      # Robot type enum
    
    # ⚠️ COMPUTED FIELD - Creates type inconsistency
    @computed_field
    size: int -> fileSize,     # Alias for frontend compatibility
    
    # Optional fields
    episodeCount: Optional[int],
    fps: Optional[int],
    author: Optional[str],
    likes: Optional[int],
    downloads: Optional[int],
    private: Optional[bool],
    
    # HuggingFace metadata
    languages: Optional[List[str]],
    taskCategories: Optional[List[str]],
    taskIds: Optional[List[str]],
    sizeCategories: Optional[str],
    multilinguality: Optional[Multilinguality],
    languageCreators: Optional[List[str]],
    paperswithcodeId: Optional[str],
    prettyName: Optional[str],
    license: Optional[str],
    citation: Optional[str]
}
```

##### `DatasetDetailResponse` (Extended Dataset)
Inherits from `DatasetResponse` with additional fields:
```python
{
    features: Optional[List[str]],     # Available data features
    videoKeys: Optional[List[str]],    # Available video streams
    sensors: Optional[List[Dict]],     # Sensor configurations
    metadata: Optional[Dict[str, Any]] # Additional metadata
}
```

##### `EpisodeResponse`
```python
{
    id: int,                    # Episode index
    name: str,                  # Episode name
    duration: float,            # Episode duration in seconds
    status: str,                # Episode status
    tasks: List[str],          # Tasks performed
    length: Optional[int]       # Number of frames
}
```

##### Enums Defined
- `RobotType`: `arm`, `mobile`, `humanoid`, `so101`, `custom`
- `DatasetStatus`: `ready`, `processing`, `recording`, `error`
- `Multilinguality`: `monolingual`, `multilingual`, `translation`

#### 2. `backend/schemas/viewer.py`
**Purpose**: Viewer-specific models for video and telemetry

**Pydantic Models**:

##### `TelemetryData` (Raw Backend Format)
```python
{
    episode_id: int,           # ⚠️ snake_case field
    duration: float,
    fps: int,
    timestamps: List[float],   # Time points in seconds
    
    # Columnar data structure
    states: Dict[str, Union[List[float], List[List[float]]]],
    actions: Dict[str, Union[List[float], List[List[float]]]],
    
    # Metadata
    feature_names: Dict[str, List[str]],  # ⚠️ snake_case field
    feature_units: Optional[Dict[str, str]]  # ⚠️ snake_case field
}
```

##### `EpisodeVideos`
```python
{
    episode_id: int,           # ⚠️ snake_case field
    videos: List[VideoUrl],
    duration: float,
    frame_count: int           # ⚠️ snake_case field
}
```

##### `VideoStreamInfo`
```python
{
    dataset_id: str,           # ⚠️ snake_case field
    cameras: List[CameraInfo],
    video_format: str,         # ⚠️ snake_case field
    encoding: str
}
```

##### `CameraInfo`
```python
{
    id: str,
    name: str,
    resolution: str,
    fps: int,
    active: bool
}
```

## API Endpoints Documentation

### Core API Routes: `backend/main.py`

**All Endpoints Provided**:

1. **`GET /`** → `ApiInfo`
   - Root endpoint with API information

2. **`GET /health`** → `HealthResponse`
   - Health check endpoint

3. **`GET /api/v1/user`** → `UserInfoResponse`
   - Get authenticated user info
   - Dependencies: rate limiting, HF service

4. **`GET /api/v1/datasets`** → `List[DatasetResponse]`
   - List user's datasets
   - Query params: `limit` (optional)
   - Dependencies: rate limiting, HF service

5. **`GET /api/v1/datasets/{owner}/{dataset_name}`** → `DatasetDetailResponse`
   - Get specific dataset details
   - Path params: `owner`, `dataset_name`
   - Dependencies: HF service

6. **`GET /api/v1/datasets/{owner}/{dataset_name}/episodes`** → `List[EpisodeResponse]`
   - Get dataset episodes
   - Path params: `owner`, `dataset_name`
   - Dependencies: HF service

7. **`GET /api/v1/datasets/{owner}/{dataset_name}/episodes/{episode_id}`** → `EpisodeDataResponse`
   - Get specific episode data
   - Path params: `owner`, `dataset_name`, `episode_id`
   - Dependencies: HF service

8. **`GET /api/v1/datasets/{owner}/{dataset_name}/size`** → `Dict`
   - Get dataset size information
   - Returns: `{"size": int, "formatted": str}`

9. **`DELETE /api/v1/datasets/{owner}/{dataset_name}`** → `Dict`
   - Delete dataset from HuggingFace
   - ⚠️ WARNING: Irreversible action

10. **`GET /api/v1/datasets/{owner}/{dataset_name}/episodes/{episode_id}/videos`** → `EpisodeVideos`
    - Get video URLs for episode
    - Dependencies: rate limiting, HF service

11. **`GET /api/v1/datasets/{owner}/{dataset_name}/episodes/{episode_id}/telemetry`** → `TelemetryData`
    - Get telemetry data for episode
    - Dependencies: rate limiting, telemetry service, HF service

12. **`GET /api/v1/datasets/{owner}/{dataset_name}/cameras`** → `VideoStreamInfo`
    - Get camera configuration
    - Dependencies: rate limiting, HF service

### Route Pattern Analysis
- **Consistent pattern**: `/api/v1/datasets/{owner}/{dataset_name}/...`
- **ID format**: Always splits owner/name from frontend `owner/name` string
- **Validation**: All inputs validated through `utils.validators`
- **Error handling**: Consistent HTTP status codes and error messages

## Service Layer Analysis

### 1. HuggingFaceService (`services/huggingface_service.py`)
**Purpose**: Main service for HuggingFace API interactions

**Key Responsibilities**:
- User authentication and info
- Dataset listing and details
- Episode management
- Delegates to specialized services

**Key Methods**:
```python
get_user_info() -> Dict[str, Any]
get_user_datasets(limit=None) -> List[DatasetResponse]
get_dataset_details(repo_id) -> DatasetDetailResponse
get_dataset_episodes(repo_id) -> List[EpisodeResponse]
get_episode_data(repo_id, episode_id) -> EpisodeDataResponse
delete_dataset(repo_id) -> bool
get_video_urls(repo_id, episode_id) -> EpisodeVideos  # Delegates to VideoService
get_camera_info(repo_id) -> VideoStreamInfo  # Delegates to VideoService
```

**Data Transformations**:
- HuggingFace API responses → Pydantic models
- Extracts metadata from dataset tags
- Caches responses with TTL
- Handles rate limiting

### 2. TelemetryService (`services/telemetry_service.py`)
**Purpose**: Process robot state and action data from parquet files

**Key Responsibilities**:
- Fetch parquet data from HuggingFace
- Transform columnar data to structured format
- Handle multi-dimensional telemetry
- Process feature names and units

**Key Method**:
```python
get_episode_telemetry(repo_id, episode_id, features_metadata) -> TelemetryData
```

**Data Flow**:
1. **URL Construction**: `https://huggingface.co/datasets/{repo_id}/resolve/main/data/chunk-{chunk}/episode_{id:06d}.parquet`
2. **Parquet Loading**: Uses pandas to read parquet files
3. **Data Processing**: Converts columnar format to structured TelemetryData
4. **Feature Extraction**: Maps technical keys to human-readable names

**Critical Transformations**:
```python
# Input: Parquet columns like ['timestamp', 'observation.state', 'action']
# Output: TelemetryData with structured states/actions

states = {
    'observation.state': [[0.1, -0.5, 0.3], [0.11, -0.49, 0.31], ...],
}
actions = {
    'action': [[0.15, -0.45, 0.35], [0.16, -0.44, 0.36], ...],
}
feature_names = {
    'observation.state': ['shoulder_pan', 'shoulder_lift', 'elbow_flex'],
    'action': ['shoulder_pan_cmd', 'shoulder_lift_cmd', 'elbow_flex_cmd']
}
```

### 3. VideoService (`services/video_service.py`)
**Purpose**: Handle video URL generation and camera configurations

**Key Responsibilities**:
- Generate video streaming URLs
- Camera information extraction
- Video metadata processing

### 4. MetadataService (`services/metadata_service.py`)
**Purpose**: Extract and process dataset metadata

**Key Responsibilities**:
- Parse HuggingFace metadata
- Extract LeRobot-specific configurations
- Handle dataset feature definitions

## Data Transformations

### 1. HuggingFace → DatasetResponse
**Source**: HuggingFace Datasets API
**Transformation**:
```python
# HF API Response
{
    "id": "username/dataset-name",
    "created_at": "2024-01-15T10:30:00Z",
    "tags": ["LeRobot", "manipulation"],
    "downloads": 150,
    "likes": 25
}

# Backend DatasetResponse
{
    "id": "username/dataset-name",
    "name": "dataset-name",           # Extracted from id
    "createdAt": "2024-01-15T10:30:00Z",  # ✅ camelCase
    "tags": ["LeRobot", "manipulation"],
    "downloads": 150,
    "likes": 25,
    "fileSize": 1073741824,          # ✅ camelCase
    "size": 1073741824               # ⚠️ Computed field alias
}
```

### 2. Parquet → TelemetryData
**Source**: HuggingFace parquet files
**Transformation**:
```python
# Parquet columns
timestamp | observation.state[0] | observation.state[1] | action[0] | action[1]
0.000     | 0.1                  | -0.5                 | 0.15     | -0.45
0.033     | 0.11                 | -0.49                | 0.16     | -0.44

# TelemetryData output
{
    "episode_id": 0,              # ⚠️ snake_case
    "timestamps": [0.000, 0.033],
    "states": {
        "observation.state": [[0.1, -0.5], [0.11, -0.49]]
    },
    "actions": {
        "action": [[0.15, -0.45], [0.16, -0.44]]
    },
    "feature_names": {            # ⚠️ snake_case
        "observation.state": ["shoulder_pan", "shoulder_lift"],
        "action": ["shoulder_pan_cmd", "shoulder_lift_cmd"]
    }
}
```

### 3. Video URL Generation
**Pattern**: `https://huggingface.co/datasets/{repo_id}/resolve/main/videos/{camera}_episode_{id}.mp4`
**Example**: `https://huggingface.co/datasets/lerobot/pusht/resolve/main/videos/observation.image_episode_0.mp4`

## Type Inconsistencies Found

### 1. **Snake_case vs CamelCase Mismatch**
**Critical Issue**: Backend schemas mix naming conventions

```python
# ❌ Inconsistent: Some fields use snake_case
class TelemetryData(BaseModel):
    episode_id: int           # snake_case
    feature_names: Dict       # snake_case
    feature_units: Optional   # snake_case

# ✅ Consistent: Most fields use camelCase
class DatasetResponse(BaseModel):
    createdAt: str           # camelCase
    frameCount: int          # camelCase
    fileSize: int            # camelCase
```

### 2. **Computed Field Creating Confusion**
**Issue**: `size` field is computed alias of `fileSize`

```python
# DatasetResponse
fileSize: int = Field(0, ge=0, description="Total file size in bytes")

@computed_field
@property
def size(self) -> int:
    """Alias for fileSize to match frontend expectations"""
    return self.fileSize
```

**Problem**: Frontend expects either `size` OR `fileSize`, not both

### 3. **Optional Field Handling Inconsistency**
**Issue**: Some fields default to empty lists vs None

```python
# Inconsistent defaults
tags: List[str] = Field(default_factory=list)    # Empty list
languages: Optional[List[str]] = Field(None)     # None
```

### 4. **Episode ID Type Consistency**
**Status**: ✅ Consistent - Backend uses `int` throughout
```python
# All episode ID fields use int
episode_id: int = Field(..., description="Episode identifier")
id: int = Field(..., description="Episode index")
```

## Redundant/Unused Code

### 1. **Computed Size Field**
**Issue**: Creates unnecessary complexity
```python
@computed_field
def size(self) -> int:
    return self.fileSize
```
**Recommendation**: Remove and standardize on `fileSize`

### 2. **Fallback Data in Endpoints**
**Issue**: Endpoints return empty structures instead of proper errors
```python
# In get_episode_telemetry() - lines 387-395
return TelemetryData(
    episode_id=episode_id,
    duration=0,
    fps=30,
    timestamps=[],
    states={},
    actions={},
    feature_names={}
)
```
**Problem**: Hides real data availability issues

### 3. **Default Camera Configuration**
**Issue**: Returns hardcoded fallback data
```python
# In get_dataset_cameras() - lines 429-442
return VideoStreamInfo(
    dataset_id=repo_id,
    cameras=[
        CameraInfo(
            id="observation.image",
            name="Main Camera",
            resolution="480x640",
            fps=30,
            active=True
        )
    ]
)
```

### 4. **Unused Schema Fields**
- `TelemetryPoint.states` and `TelemetryPoint.actions` - Not used in actual API
- `EpisodeDataResponse` - Similar data structure to individual endpoints
- Many HuggingFace metadata fields rarely populated

## Critical Issues for Standardization

### 1. **Immediate Fixes Needed**
1. **Remove computed `size` field** - standardize on `fileSize`
2. **Fix snake_case fields** in viewer schemas (episode_id → episodeId)
3. **Align optional field defaults** - use None consistently
4. **Remove fallback data** - return proper 404/empty responses

### 2. **API Response Format**
Currently backend returns mixed naming:
```python
# ❌ Current mixed format
{
    "fileSize": 1073741824,    # camelCase
    "size": 1073741824,        # computed alias
    "episode_id": 0,           # snake_case
    "feature_names": {...}     # snake_case
}

# ✅ Target consistent format
{
    "fileSize": 1073741824,    # camelCase only
    "episodeId": 0,            # camelCase
    "featureNames": {...}      # camelCase
}
```

### 3. **Error Handling Improvements**
- Return proper HTTP 404 when data not available
- Remove fallback empty data structures
- Consistent error message format

## Service Layer Architecture

### Current Architecture
```
FastAPI Endpoints
    ↓
HuggingFaceService (main coordinator)
    ├── VideoService (video URLs, cameras)
    ├── TelemetryService (parquet data)
    └── MetadataService (HF metadata)
```

### Data Flow
```
1. Frontend Request → FastAPI endpoint
2. Validate inputs → utils.validators
3. HuggingFaceService coordinates
4. Specialized services fetch/transform data
5. Pydantic models validate response
6. JSON response to frontend
```

### Service Dependencies
- **HuggingFaceService**: Uses HfApi, requests, coordinates other services
- **TelemetryService**: pandas, numpy for parquet processing
- **VideoService**: URL pattern generation, camera config
- **MetadataService**: HF metadata parsing

## Recommendations

### 1. **Schema Standardization**
1. Convert all snake_case fields to camelCase
2. Remove computed `size` field
3. Use consistent Optional field defaults

### 2. **Error Handling**
1. Replace fallback data with proper 404 responses
2. Implement consistent error response format
3. Add proper validation error messages

### 3. **Performance Optimization**
1. Implement proper caching strategy
2. Reduce API calls through batching
3. Optimize parquet data loading

### 4. **Type Safety**
1. Add response model validation
2. Ensure all fields have proper types
3. Add comprehensive input validation

### 5. **Code Cleanup**
1. Remove unused response models
2. Consolidate similar endpoints
3. Centralize common transformations

This analysis provides the foundation for aligning the backend with frontend requirements and establishing a consistent API contract for dataset functionality.