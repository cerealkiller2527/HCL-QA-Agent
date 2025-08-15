# Frontend Requirements Analysis

## Overview
This document analyzes what data the frontend currently expects and uses for the dataset listing and viewer pages.

## 1. Dataset Listing Page Requirements

### Dataset Card Component Needs:
```typescript
interface Dataset {
  id: string                 // Unique identifier
  name: string               // Dataset name
  description: string        // Brief description
  robotType: string          // "arm" | "mobile" | "humanoid" | "custom"
  status: string             // "ready" | "processing" | "error"
  tags: string[]             // Array of tags for filtering
  duration: number           // Total duration in seconds
  fileSize: number           // Total size in bytes
  frameCount: number         // Total number of frames
  createdAt: Date            // Creation date
}
```

### Critical Fields for Display:
- **name**: Displayed as title
- **description**: Shown as subtitle
- **tags**: Used for filtering and badges
- **duration**: Formatted as "Xh Ym" 
- **fileSize**: Formatted as "X.X GB"
- **frameCount**: Shown as "X,XXX frames"
- **status**: Determines card styling

## 2. Dataset Viewer Page Requirements

### Episode Data:
```typescript
interface Episode {
  id: number
  name: string
  duration: number        // Episode duration in seconds
  status: string          // "completed" | "processing" | "failed"
}
```

### Camera/Video Streams:
```typescript
interface CameraStream {
  id: string
  name: string            // Camera name (e.g., "Main Camera")
  resolution: string      // e.g., "1920x1080"
  fps: number            // Frames per second
  active: boolean        // Is stream active
}
```

### Telemetry Data:
```typescript
interface TelemetryData {
  time: number           // Timestamp
  [key: string]: number  // Dynamic joint/sensor values
}
```

## 3. Core API Endpoints Needed

### For Dataset Listing:
```
GET /api/v1/datasets
Response: Array<Dataset>
```

### For Dataset Viewer:
```
GET /api/v1/datasets/{dataset_id}
Response: Dataset with additional metadata

GET /api/v1/datasets/{dataset_id}/episodes
Response: Array<Episode>

GET /api/v1/datasets/{dataset_id}/episodes/{episode_id}
Response: {
  episode: Episode,
  videoUrls: string[],
  telemetryData: TelemetryData[]
}
```

## 4. Data Transformations Required

### From HuggingFace to Frontend Format:

1. **Dataset ID**: 
   - HF: `"username/dataset-name"`
   - Frontend: Needs unique ID (could use full repo_id)

2. **File Size**:
   - HF: May need to calculate from individual files
   - Frontend: Expects total in bytes

3. **Frame Count**:
   - HF: May be in metadata or need calculation
   - Frontend: Expects single number

4. **Duration**:
   - HF: May be in seconds or need calculation from episodes
   - Frontend: Expects seconds

5. **Status**:
   - HF: Doesn't have this concept
   - Frontend: We can default to "ready" or check data completeness

6. **Robot Type**:
   - HF: May be in tags or metadata
   - Frontend: Expects specific enum values

## 5. Minimum Viable Dataset (MVP)

For initial implementation, the frontend absolutely needs:
```javascript
{
  id: "repo_id",
  name: "Dataset Name",
  description: "Some description",
  frameCount: 1000,        // Can be estimated
  duration: 3600,          // Can be calculated
  fileSize: 1073741824,    // Can be approximated
  status: "ready",         // Can be hardcoded initially
  tags: [],                // Can be empty initially
  createdAt: "2024-01-01", // Can use last_modified
  robotType: "custom"      // Can default to "custom"
}
```

## 6. Video Viewer Requirements

The viewer expects:
- Direct video URLs that can be embedded in HTML5 video elements
- Multiple camera angles (stored as array of video URLs)
- Frame-by-frame navigation capability
- Playback speed control (handled client-side)

## 7. Nice-to-Have vs Must-Have

### Must-Have (Phase 1):
- Dataset listing with name, description
- Basic episode selection
- Video URLs for playback

### Nice-to-Have (Later Phases):
- Accurate frame counts
- Real-time telemetry data
- Sensor configurations
- Validation results
- Processing metrics

## 8. Frontend Flexibility Points

Areas where frontend can be modified to match HF data:
1. **Status field**: Can be removed or simplified
2. **Robot type**: Can be derived from tags
3. **Metrics**: Can be hidden if not available
4. **Sensor configs**: Can be optional
5. **File size**: Can be estimated or hidden

## Next Steps
Based on this analysis, the backend should prioritize providing:
1. User's dataset list with basic metadata
2. Episode information for each dataset
3. Video URLs for streaming
4. Any available telemetry/sensor data