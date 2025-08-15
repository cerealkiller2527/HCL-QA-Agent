# HuggingFace API Capabilities Analysis

## Overview
This document details what data and endpoints HuggingFace provides for accessing LeRobot datasets.

## 1. Authentication

### Using HF Token:
```python
from huggingface_hub import HfApi

# Initialize with token
api = HfApi(token="hf_...")  # Can also use HF_TOKEN env variable

# Get authenticated user info
user_info = api.whoami()
# Returns: {
#   "name": "username",
#   "fullname": "Full Name", 
#   "organizations": [...],
#   ...
# }
```

## 2. Listing User's Datasets

### Get All User Datasets:
```python
# List datasets for authenticated user
datasets = api.list_datasets(author=user_info["name"])

# Each dataset contains:
{
  "id": "username/dataset-name",          # Full repo ID
  "author": "username",
  "private": false,
  "tags": ["LeRobot", "robotics", ...],
  "downloads": 142,
  "likes": 5,
  "lastModified": "2024-01-15T10:30:00Z",
  "createdAt": "2024-01-10T08:00:00Z",
  "description": "Dataset description",
  "cardData": {...},                      # README metadata
}
```

## 3. Detailed Dataset Information

### From Dataset Info Endpoint:
```python
dataset_info = api.dataset_info(
    repo_id="username/dataset-name",
    files_metadata=True  # Include file details
)

# Returns:
{
  "id": "username/dataset-name",
  "sha": "commit_hash",
  "lastModified": "2024-01-15T...",
  "tags": [...],
  "siblings": [  # All files in repo
    {
      "rfilename": "data/episode_0.parquet",
      "size": 1234567,
      "blobId": "...",
      "lfs": {...}
    },
    ...
  ],
  "cardData": {
    "license": "mit",
    "task_categories": ["robotics"],
    "tags": ["LeRobot", "tutorial"],
    ...
  }
}
```

## 4. LeRobot-Specific Metadata

### From meta/info.json:
```python
import requests

# Direct API call
response = requests.get(
    f"https://huggingface.co/datasets/{repo_id}/resolve/main/meta/info.json",
    headers={"Authorization": f"Bearer {token}"}
)
info = response.json()

# Contains:
{
  "codebase_version": "v2.0",
  "data_path": "data/chunk-{episode_chunk:03d}/episode_{episode_index:06d}.parquet",
  "video_path": "videos/chunk-{episode_chunk:03d}/{video_key}/episode_{episode_index:06d}.mp4",
  "fps": 30,
  "features": {
    "observation.images.top": {
      "dtype": "video",
      "shape": [480, 640, 3],
      "names": ["height", "width", "channel"]
    },
    "action": {
      "dtype": "float32",
      "shape": [7],
      "names": ["joint1", "joint2", ...]
    },
    ...
  },
  "splits": {
    "train": {"episodes": [0, 50]},
    ...
  },
  "total_episodes": 50,
  "total_frames": 150000,
  "total_videos": 3,
  "total_chunks": 1,
  "chunks_size": 1000,
  "repo_id": "username/dataset-name"
}
```

### From meta/episodes.jsonl:
```python
# Each line is a JSON object
response = requests.get(
    f"https://huggingface.co/datasets/{repo_id}/resolve/main/meta/episodes.jsonl",
    headers={"Authorization": f"Bearer {token}"}
)

# Parse each line
episodes = []
for line in response.text.strip().split('\n'):
    episode = json.loads(line)
    episodes.append(episode)

# Each episode:
{
  "episode_index": 0,
  "tasks": ["Pick up the block"],
  "length": 3000,  # Number of frames
  "success": true,
  "chunk": 0
}
```

## 5. Video File Access

### Direct Video URLs:
```python
# Video URLs follow the pattern from info.json
video_url = f"https://huggingface.co/datasets/{repo_id}/resolve/main/videos/chunk-000/observation.images.top/episode_000000.mp4"

# With authentication
headers = {"Authorization": f"Bearer {token}"}
video_response = requests.get(video_url, headers=headers, stream=True)
```

## 6. Parquet Data Files

### Telemetry/Action Data:
```python
import pandas as pd

# Parquet file URL pattern
parquet_url = f"https://huggingface.co/datasets/{repo_id}/resolve/main/data/chunk-000/episode_000000.parquet"

# Read with pandas
df = pd.read_parquet(parquet_url, storage_options={"headers": {"Authorization": f"Bearer {token}"}})

# Contains columns like:
# - timestamp
# - observation.state (joint positions)
# - action (commanded positions)
# - observation.images.top (video frame references)
```

## 7. Data We Can Extract

### For Dataset Listing:
- **id**: Use `repo_id` directly
- **name**: Extract from repo_id or use dataset name
- **description**: From `cardData` or dataset description
- **tags**: Available in dataset info
- **createdAt**: Use `createdAt` field
- **lastModified**: Available directly

### Calculated/Derived Fields:
- **frameCount**: From `info.json` -> `total_frames`
- **duration**: Calculate as `total_frames / fps`
- **fileSize**: Sum all file sizes from `siblings`
- **episodeCount**: From `info.json` -> `total_episodes`

### For Episodes:
- **id**: Use `episode_index`
- **name**: Format as `Episode {index}`
- **duration**: Calculate as `length / fps`
- **tasks**: Available in episodes.jsonl

### For Videos:
- **URLs**: Construct from video_path pattern
- **Camera names**: From feature keys (e.g., "observation.images.top")
- **Resolution**: From features shape [height, width, channels]
- **FPS**: From info.json

## 8. Python Implementation Example

```python
from huggingface_hub import HfApi
import requests
import json

class HuggingFaceService:
    def __init__(self, token: str):
        self.api = HfApi(token=token)
        self.token = token
        self.headers = {"Authorization": f"Bearer {token}"}
    
    def get_user_datasets(self):
        user = self.api.whoami()
        datasets = self.api.list_datasets(author=user["name"])
        
        # Transform to frontend format
        return [
            {
                "id": d.id,
                "name": d.id.split("/")[-1],
                "description": getattr(d, 'description', ''),
                "tags": d.tags if d.tags else [],
                "createdAt": d.createdAt,
                "private": d.private
            }
            for d in datasets
        ]
    
    def get_dataset_details(self, repo_id: str):
        # Get basic info
        dataset_info = self.api.dataset_info(repo_id, files_metadata=True)
        
        # Get LeRobot metadata
        info_url = f"https://huggingface.co/datasets/{repo_id}/resolve/main/meta/info.json"
        response = requests.get(info_url, headers=self.headers)
        
        if response.status_code == 200:
            meta_info = response.json()
            return {
                "id": repo_id,
                "name": repo_id.split("/")[-1],
                "frameCount": meta_info.get("total_frames", 0),
                "duration": meta_info.get("total_frames", 0) / meta_info.get("fps", 30),
                "episodeCount": meta_info.get("total_episodes", 0),
                "fps": meta_info.get("fps", 30)
            }
        return None
```

## 9. Limitations & Considerations

1. **Private Datasets**: Require valid token in headers
2. **Rate Limiting**: HF API has rate limits (especially for large files)
3. **File Size**: Large video files may need streaming approach
4. **Missing Metadata**: Not all datasets have complete LeRobot metadata
5. **Network Latency**: Direct API calls can be slow for large datasets

## 10. Recommended Implementation Strategy

1. **Start Simple**: Use HfApi for listing, direct HTTP for metadata
2. **Cache Aggressively**: Store dataset info locally after first fetch
3. **Stream Videos**: Return URLs directly, let frontend handle streaming
4. **Paginate**: Implement pagination for large dataset lists
5. **Error Handling**: Check for missing metadata files gracefully