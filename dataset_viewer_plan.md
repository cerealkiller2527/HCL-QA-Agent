LeRobot Dataset Viewer - Backend Architecture & Integration Plan
1. Dataset Information Architecture
Core Data Types & Models
# Backend Data Models (Pydantic)
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
from datetime import datetime

class CameraInfo(BaseModel):
    """Information about a camera in the dataset"""
    name: str  # e.g., "camera_top", "camera_front"
    width: int
    height: int
    fps: float
    has_depth: bool = False

class EpisodeInfo(BaseModel):
    """Information about a single episode"""
    episode_id: int
    duration_seconds: float
    total_frames: int
    tasks: List[str]  # Task descriptions
    success: Optional[bool] = None
    created_at: Optional[datetime] = None
    
class VideoSegment(BaseModel):
    """Represents a video segment with timing info"""
    camera: str
    episode_id: int
    start_timestamp: float
    end_timestamp: float
    url: str
    chunk_id: int
    
class RobotState(BaseModel):
    """Robot state at a specific timestamp"""
    timestamp: float
    joint_positions: List[float]
    joint_velocities: Optional[List[float]] = None
    end_effector_position: Optional[List[float]] = None
    gripper_state: Optional[float] = None

class DatasetMetadata(BaseModel):
    """Complete dataset metadata"""
    repo_id: str
    dataset_name: str
    robot_type: str
    total_episodes: int
    total_frames: int
    total_hours: float
    fps: float
    cameras: List[CameraInfo]
    features: Dict[str, Any]  # All available data features
    tasks: List[str]  # Unique tasks in dataset
    version: str  # Dataset format version
    created_date: Optional[datetime]
    author: Optional[str]
    license: Optional[str]
    
class FrameData(BaseModel):
    """Data for a specific frame"""
    episode_id: int
    frame_index: int
    timestamp: float
    images: Dict[str, str]  # camera_name -> image_url
    robot_state: RobotState
    action: List[float]  # Action taken at this frame
    
class TimelineEvent(BaseModel):
    """Event in episode timeline"""
    timestamp: float
    event_type: str  # "action", "state_change", "task_transition"
    description: str
    data: Optional[Dict[str, Any]] = None
Data We Need to Fetch from HuggingFace
# What we need from HuggingFace API/Files

1. From meta/info.json:
   - fps (frames per second)
   - video_backend (encoding info)
   - camera_keys (list of cameras)
   - robot_type
   - version (dataset format version)
   - chunks_size (episodes per chunk)
   
2. From meta/episodes.jsonl:
   - Episode lengths
   - Task descriptions per episode
   - Success flags
   - Timestamps
   
3. From meta/stats.json:
   - Statistics for normalization
   - Min/max values for actions/states
   - Mean/std for each feature
   
4. From data/chunk-XXX/episode_XXXXXX.parquet:
   - Robot states (joint positions)
   - Actions taken
   - Timestamps for synchronization
   
5. Video files (direct URLs):
   - videos/chunk-XXX/{camera}/episode_XXXXXX.mp4
2. Timestamp & Video Navigation Strategy
Understanding LeRobot Timestamps
"""
LeRobot datasets are recorded at fixed FPS (typically 30 or 50 fps)
Each frame has a timestamp: frame_index / fps

Example at 30 fps:
- Frame 0: timestamp = 0.000s
- Frame 1: timestamp = 0.033s  
- Frame 30: timestamp = 1.000s
- Frame 90: timestamp = 3.000s
"""

class TimestampManager:
    def __init__(self, fps: float):
        self.fps = fps
        self.frame_duration = 1.0 / fps
        
    def frame_to_timestamp(self, frame_index: int) -> float:
        """Convert frame index to timestamp in seconds"""
        return frame_index / self.fps
    
    def timestamp_to_frame(self, timestamp: float) -> int:
        """Convert timestamp to nearest frame index"""
        return round(timestamp * self.fps)
    
    def get_video_time_at_frame(self, frame_index: int) -> float:
        """Get video playback time for a specific frame"""
        return self.frame_to_timestamp(frame_index)
    
    def get_frame_at_video_time(self, video_time: float) -> int:
        """Get frame index at specific video playback time"""
        return self.timestamp_to_frame(video_time)
Video Seeking & Synchronization
class VideoSyncManager:
    """Manages synchronization between multiple camera videos and robot data"""
    
    def __init__(self, dataset_metadata: DatasetMetadata):
        self.fps = dataset_metadata.fps
        self.cameras = dataset_metadata.cameras
        self.timestamp_mgr = TimestampManager(self.fps)
    
    def get_sync_points(self, episode_id: int) -> List[Dict[str, Any]]:
        """Get synchronization points for an episode"""
        return [
            {
                "frame": frame,
                "timestamp": self.timestamp_mgr.frame_to_timestamp(frame),
                "video_time": self.timestamp_mgr.frame_to_timestamp(frame),
                "description": f"Frame {frame}"
            }
            for frame in range(0, total_frames, int(self.fps))  # Every second
        ]
    
    def get_multi_camera_sync(self, episode_id: int, timestamp: float) -> Dict[str, float]:
        """Get synchronized timestamps for all cameras"""
        # All cameras are synchronized in LeRobot datasets
        return {camera.name: timestamp for camera in self.cameras}
3. Backend API Design
FastAPI Implementation
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import httpx
from huggingface_hub import HfApi, hf_hub_download
import pandas as pd
import json

app = FastAPI(title="LeRobot Dataset Viewer API")

# Add CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class DatasetService:
    """Service for fetching dataset information from HuggingFace"""
    
    def __init__(self):
        self.hf_api = HfApi()
        self.cache = {}  # Simple in-memory cache
        
    async def get_dataset_metadata(self, repo_id: str) -> DatasetMetadata:
        """Fetch complete dataset metadata"""
        if repo_id in self.cache:
            return self.cache[repo_id]
            
        # Download metadata files
        info_path = hf_hub_download(
            repo_id=repo_id,
            filename="meta/info.json",
            repo_type="dataset"
        )
        
        episodes_path = hf_hub_download(
            repo_id=repo_id,
            filename="meta/episodes.jsonl",
            repo_type="dataset"
        )
        
        # Parse metadata
        with open(info_path) as f:
            info = json.load(f)
            
        episodes = []
        with open(episodes_path) as f:
            for line in f:
                episodes.append(json.loads(line))
        
        # Build metadata object
        metadata = DatasetMetadata(
            repo_id=repo_id,
            dataset_name=repo_id.split("/")[-1],
            robot_type=info.get("robot_type", "unknown"),
            total_episodes=info["total_episodes"],
            total_frames=info["total_frames"],
            total_hours=info["total_frames"] / info["fps"] / 3600,
            fps=info["fps"],
            cameras=[
                CameraInfo(
                    name=cam,
                    width=info["features"][cam]["shape"][1],
                    height=info["features"][cam]["shape"][0],
                    fps=info["fps"]
                )
                for cam in info.get("camera_keys", [])
            ],
            features=info["features"],
            tasks=list(set(ep.get("tasks", ["unknown"])[0] for ep in episodes)),
            version=info["codebase_version"]
        )
        
        self.cache[repo_id] = metadata
        return metadata
    
    def get_video_url(self, repo_id: str, episode_id: int, camera: str) -> str:
        """Generate direct video URL for HuggingFace Hub"""
        chunk = episode_id // 1000  # Default chunk size
        video_path = f"videos/chunk-{chunk:03d}/{camera}/episode_{episode_id:06d}.mp4"
        return f"https://huggingface.co/datasets/{repo_id}/resolve/main/{video_path}"
    
    async def get_episode_data(self, repo_id: str, episode_id: int) -> pd.DataFrame:
        """Fetch robot data for an episode (parquet file)"""
        chunk = episode_id // 1000
        parquet_path = hf_hub_download(
            repo_id=repo_id,
            filename=f"data/chunk-{chunk:03d}/episode_{episode_id:06d}.parquet",
            repo_type="dataset"
        )
        return pd.read_parquet(parquet_path)

# Initialize service
dataset_service = DatasetService()

# API Endpoints

@app.get("/api/datasets/search")
async def search_datasets(
    query: Optional[str] = None,
    robot_type: Optional[str] = None,
    limit: int = 20
) -> List[Dict[str, Any]]:
    """Search available LeRobot datasets"""
    hf_api = HfApi()
    datasets = hf_api.list_datasets(
        filter="task:robotics",
        search=query,
        limit=limit
    )
    
    results = []
    for ds in datasets:
        if "lerobot" in ds.id.lower():
            results.append({
                "repo_id": ds.id,
                "name": ds.id.split("/")[-1],
                "downloads": ds.downloads,
                "likes": ds.likes,
                "last_modified": ds.lastModified
            })
    
    return results

@app.get("/api/datasets/{repo_id:path}/metadata", response_model=DatasetMetadata)
async def get_dataset_metadata(repo_id: str):
    """Get complete dataset metadata"""
    try:
        return await dataset_service.get_dataset_metadata(repo_id)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.get("/api/datasets/{repo_id:path}/episodes", response_model=List[EpisodeInfo])
async def get_episodes(
    repo_id: str,
    offset: int = 0,
    limit: int = 100
):
    """Get list of episodes with metadata"""
    episodes_path = hf_hub_download(
        repo_id=repo_id,
        filename="meta/episodes.jsonl",
        repo_type="dataset"
    )
    
    episodes = []
    with open(episodes_path) as f:
        for i, line in enumerate(f):
            if i < offset:
                continue
            if i >= offset + limit:
                break
                
            ep_data = json.loads(line)
            metadata = await dataset_service.get_dataset_metadata(repo_id)
            
            episodes.append(EpisodeInfo(
                episode_id=i,
                duration_seconds=ep_data["length"] / metadata.fps,
                total_frames=ep_data["length"],
                tasks=ep_data.get("tasks", ["unknown"]),
                success=ep_data.get("success"),
            ))
    
    return episodes

@app.get("/api/datasets/{repo_id:path}/episodes/{episode_id}/videos")
async def get_episode_videos(repo_id: str, episode_id: int) -> Dict[str, str]:
    """Get all video URLs for an episode"""
    metadata = await dataset_service.get_dataset_metadata(repo_id)
    
    videos = {}
    for camera in metadata.cameras:
        videos[camera.name] = dataset_service.get_video_url(
            repo_id, episode_id, camera.name
        )
    
    return videos

@app.get("/api/datasets/{repo_id:path}/episodes/{episode_id}/timeline")
async def get_episode_timeline(
    repo_id: str,
    episode_id: int,
    include_actions: bool = True,
    include_states: bool = False
) -> List[TimelineEvent]:
    """Get timeline events for an episode"""
    metadata = await dataset_service.get_dataset_metadata(repo_id)
    df = await dataset_service.get_episode_data(repo_id, episode_id)
    
    events = []
    
    # Add key moments (every second)
    for second in range(int(len(df) / metadata.fps)):
        frame = int(second * metadata.fps)
        events.append(TimelineEvent(
            timestamp=second,
            event_type="checkpoint",
            description=f"T+{second}s",
            data={"frame": frame}
        ))
    
    # Add action changes (simplified)
    if include_actions and "action" in df.columns:
        # Detect significant action changes
        action_diff = df["action"].diff().abs()
        significant_changes = action_diff[action_diff > 0.1].index
        
        for idx in significant_changes[:20]:  # Limit to 20 events
            events.append(TimelineEvent(
                timestamp=idx / metadata.fps,
                event_type="action_change",
                description=f"Action change at frame {idx}",
                data={"frame": int(idx)}
            ))
    
    return sorted(events, key=lambda x: x.timestamp)

@app.get("/api/datasets/{repo_id:path}/episodes/{episode_id}/frame/{frame_index}")
async def get_frame_data(
    repo_id: str,
    episode_id: int,
    frame_index: int
) -> FrameData:
    """Get data for a specific frame"""
    metadata = await dataset_service.get_dataset_metadata(repo_id)
    df = await dataset_service.get_episode_data(repo_id, episode_id)
    
    if frame_index >= len(df):
        raise HTTPException(status_code=404, detail="Frame index out of range")
    
    row = df.iloc[frame_index]
    
    # Build frame data
    images = {}
    for camera in metadata.cameras:
        # For specific frame, we'd need to extract from video
        # For now, return video URL with timestamp
        video_url = dataset_service.get_video_url(repo_id, episode_id, camera.name)
        timestamp = frame_index / metadata.fps
        images[camera.name] = f"{video_url}#t={timestamp}"
    
    # Extract robot state
    robot_state = RobotState(
        timestamp=frame_index / metadata.fps,
        joint_positions=row.get("observation.state", []).tolist() if "observation.state" in row else [],
        gripper_state=row.get("observation.gripper", None)
    )
    
    return FrameData(
        episode_id=episode_id,
        frame_index=frame_index,
        timestamp=frame_index / metadata.fps,
        images=images,
        robot_state=robot_state,
        action=row.get("action", []).tolist() if "action" in row else []
    )

@app.get("/api/datasets/{repo_id:path}/stats")
async def get_dataset_stats(repo_id: str) -> Dict[str, Any]:
    """Get dataset statistics for visualization"""
    stats_path = hf_hub_download(
        repo_id=repo_id,
        filename="meta/stats.json",
        repo_type="dataset"
    )
    
    with open(stats_path) as f:
        stats = json.load(f)
    
    return stats
4. Frontend Integration Plan
TypeScript Types (Frontend)
// types/dataset.ts

export interface DatasetMetadata {
  repoId: string;
  datasetName: string;
  robotType: string;
  totalEpisodes: number;
  totalFrames: number;
  totalHours: number;
  fps: number;
  cameras: CameraInfo[];
  features: Record<string, any>;
  tasks: string[];
  version: string;
}

export interface CameraInfo {
  name: string;
  width: number;
  height: number;
  fps: number;
  hasDepth?: boolean;
}

export interface EpisodeInfo {
  episodeId: number;
  durationSeconds: number;
  totalFrames: number;
  tasks: string[];
  success?: boolean;
  createdAt?: Date;
}

export interface VideoUrls {
  [cameraName: string]: string;
}

export interface TimelineEvent {
  timestamp: number;
  eventType: 'checkpoint' | 'action_change' | 'task_transition';
  description: string;
  data?: any;
}

export interface FrameData {
  episodeId: number;
  frameIndex: number;
  timestamp: number;
  images: Record<string, string>;
  robotState: RobotState;
  action: number[];
}

export interface RobotState {
  timestamp: number;
  jointPositions: number[];
  jointVelocities?: number[];
  endEffectorPosition?: number[];
  gripperState?: number;
}
API Client (Frontend)
// api/datasetApi.ts

class DatasetAPI {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  async searchDatasets(query?: string, robotType?: string): Promise<DatasetSearchResult[]> {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (robotType) params.append('robot_type', robotType);
    
    const response = await fetch(`${this.baseUrl}/api/datasets/search?${params}`);
    return response.json();
  }
  
  async getMetadata(repoId: string): Promise<DatasetMetadata> {
    const response = await fetch(`${this.baseUrl}/api/datasets/${repoId}/metadata`);
    if (!response.ok) throw new Error('Dataset not found');
    return response.json();
  }
  
  async getEpisodes(repoId: string, offset = 0, limit = 100): Promise<EpisodeInfo[]> {
    const response = await fetch(
      `${this.baseUrl}/api/datasets/${repoId}/episodes?offset=${offset}&limit=${limit}`
    );
    return response.json();
  }
  
  async getEpisodeVideos(repoId: string, episodeId: number): Promise<VideoUrls> {
    const response = await fetch(
      `${this.baseUrl}/api/datasets/${repoId}/episodes/${episodeId}/videos`
    );
    return response.json();
  }
  
  async getTimeline(repoId: string, episodeId: number): Promise<TimelineEvent[]> {
    const response = await fetch(
      `${this.baseUrl}/api/datasets/${repoId}/episodes/${episodeId}/timeline`
    );
    return response.json();
  }
  
  async getFrameData(
    repoId: string, 
    episodeId: number, 
    frameIndex: number
  ): Promise<FrameData> {
    const response = await fetch(
      `${this.baseUrl}/api/datasets/${repoId}/episodes/${episodeId}/frame/${frameIndex}`
    );
    return response.json();
  }
}

export const datasetApi = new DatasetAPI();
React Hooks
// hooks/useDataset.ts

import { useQuery } from 'react-query';
import { datasetApi } from '../api/datasetApi';

export const useDatasetMetadata = (repoId: string) => {
  return useQuery(
    ['dataset-metadata', repoId],
    () => datasetApi.getMetadata(repoId),
    { 
      staleTime: 1000 * 60 * 5, // Cache for 5 minutes
      enabled: !!repoId 
    }
  );
};

export const useEpisodes = (repoId: string, offset = 0, limit = 100) => {
  return useQuery(
    ['episodes', repoId, offset, limit],
    () => datasetApi.getEpisodes(repoId, offset, limit),
    { enabled: !!repoId }
  );
};

export const useEpisodeVideos = (repoId: string, episodeId: number) => {
  return useQuery(
    ['episode-videos', repoId, episodeId],
    () => datasetApi.getEpisodeVideos(repoId, episodeId),
    { enabled: !!repoId && episodeId >= 0 }
  );
};

export const useTimeline = (repoId: string, episodeId: number) => {
  return useQuery(
    ['timeline', repoId, episodeId],
    () => datasetApi.getTimeline(repoId, episodeId),
    { enabled: !!repoId && episodeId >= 0 }
  );
};
5. Video Playback & Timestamp Control
Video Player Component with Timestamp Control
// components/VideoPlayer.tsx

import React, { useRef, useEffect, useState } from 'react';

interface VideoPlayerProps {
  url: string;
  fps: number;
  onTimeUpdate?: (frame: number, timestamp: number) => void;
  seekToFrame?: number;
  markers?: Array<{ frame: number; label: string }>;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  fps,
  onTimeUpdate,
  seekToFrame,
  markers = []
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  
  // Convert frame to timestamp
  const frameToTime = (frame: number) => frame / fps;
  const timeToFrame = (time: number) => Math.round(time * fps);
  
  // Handle time updates
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleTimeUpdate = () => {
      const frame = timeToFrame(video.currentTime);
      setCurrentFrame(frame);
      onTimeUpdate?.(frame, video.currentTime);
    };
    
    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [fps, onTimeUpdate]);
  
  // Handle seeking
  useEffect(() => {
    if (seekToFrame !== undefined && videoRef.current) {
      videoRef.current.currentTime = frameToTime(seekToFrame);
    }
  }, [seekToFrame, fps]);
  
  return (
    <div className="video-player">
      <video 
        ref={videoRef}
        src={url}
        controls
        className="w-full"
      />
      
      <div className="frame-info">
        <span>Frame: {currentFrame}</span>
        <span>Time: {(currentFrame / fps).toFixed(2)}s</span>
      </div>
      
      {markers.length > 0 && (
        <div className="markers">
          {markers.map((marker, i) => (
            <button
              key={i}
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = frameToTime(marker.frame);
                }
              }}
            >
              {marker.label} (Frame {marker.frame})
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
Multi-Camera Sync Component
// components/MultiCameraViewer.tsx

import React, { useState, useRef } from 'react';
import { VideoPlayer } from './VideoPlayer';

interface MultiCameraViewerProps {
  videos: Record<string, string>;
  fps: number;
  syncPlayback?: boolean;
}

export const MultiCameraViewer: React.FC<MultiCameraViewerProps> = ({
  videos,
  fps,
  syncPlayback = true
}) => {
  const [masterCamera, setMasterCamera] = useState<string>(Object.keys(videos)[0]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [seekFrame, setSeekFrame] = useState<number>();
  
  const handleMasterTimeUpdate = (frame: number, timestamp: number) => {
    setCurrentFrame(frame);
    if (syncPlayback) {
      // Sync all other videos to this frame
      setSeekFrame(frame);
    }
  };
  
  return (
    <div className="grid grid-cols-2 gap-4">
      {Object.entries(videos).map(([camera, url]) => (
        <div key={camera} className="relative">
          <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded">
            {camera}
            {camera === masterCamera && " (Master)"}
          </div>
          
          <VideoPlayer
            url={url}
            fps={fps}
            onTimeUpdate={
              camera === masterCamera ? handleMasterTimeUpdate : undefined
            }
            seekToFrame={camera !== masterCamera ? seekFrame : undefined}
          />
          
          {syncPlayback && camera !== masterCamera && (
            <button
              onClick={() => setMasterCamera(camera)}
              className="mt-2 text-sm"
            >
              Set as Master
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
6. Implementation Timeline
Phase 1: Core Backend (Day 1)
[x] Set up FastAPI with data models
[x] Implement HuggingFace metadata fetching
[x] Create video URL generation
[x] Add dataset search endpoint
[ ] Test with real LeRobot datasets
Phase 2: Frontend Integration (Day 2)
[ ] Create TypeScript types
[ ] Build API client
[ ] Implement React hooks
[ ] Create basic video player component
[ ] Test video playback from HuggingFace
Phase 3: Advanced Features (Day 3)
[ ] Multi-camera synchronization
[ ] Timeline visualization
[ ] Frame-accurate seeking
[ ] Robot state visualization
[ ] Action playback overlay
Phase 4: Performance & Polish (Day 4)
[ ] Add caching layer (Redis)
[ ] Implement video preloading
[ ] Add error handling
[ ] Create loading states
[ ] Optimize for large datasets
7. Key Technical Decisions
Why This Approach?
HuggingFace-First: Leverages existing infrastructure
Stateless Backend: Easy to scale, no local storage needed
Frame-Based Navigation: Matches robot control paradigm
Lazy Loading: Only fetch data when needed
Progressive Enhancement: Start simple, add features incrementally
Performance Considerations
# Backend optimizations
class CacheManager:
    """Redis-based caching for expensive operations"""
    
    def __init__(self):
        self.redis = redis.Redis(host='localhost', port=6379, db=0)
        
    async def get_or_set(self, key: str, func, ttl: int = 3600):
        """Get from cache or compute and cache"""
        cached = self.redis.get(key)
        if cached:
            return json.loads(cached)
            
        result = await func()
        self.redis.setex(key, ttl, json.dumps(result))
        return result

# Use in endpoints
@app.get("/api/datasets/{repo_id:path}/metadata")
async def get_dataset_metadata(repo_id: str):
    return await cache_manager.get_or_set(
        f"metadata:{repo_id}",
        lambda: dataset_service.get_dataset_metadata(repo_id),
        ttl=3600  # Cache for 1 hour
    )
8. Error Handling & Edge Cases
# Backend error handling
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc)}
    )

# Dataset validation
async def validate_dataset(repo_id: str) -> bool:
    """Check if dataset is valid LeRobot format"""
    try:
        files = dataset_service.hf_api.list_repo_files(
            repo_id=repo_id,
            repo_type="dataset"
        )
        required_files = [
            "meta/info.json",
            "meta/episodes.jsonl"
        ]
        return all(f in files for f in required_files)
    except:
        return False
9. Testing Strategy
# Backend tests
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_get_dataset_metadata():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/datasets/lerobot/pusht/metadata")
        assert response.status_code == 200
        data = response.json()
        assert "fps" in data
        assert "cameras" in data

@pytest.mark.asyncio  
async def test_video_url_generation():
    url = dataset_service.get_video_url("lerobot/pusht", 0, "top")
    assert "huggingface.co" in url
    assert ".mp4" in url
This comprehensive plan provides everything needed to build a robust dataset viewer that integrates smoothly with your frontend!