# Frontend-Backend Alignment Analysis

## 1. Episode Data

### Frontend Expects:
```typescript
{
  id: number,
  name: string,
  duration: number, // in seconds
  status: "completed" | "processing" | "failed"
}
```

### Backend Provides (EpisodeResponse):
```python
{
  "id": int,
  "name": str,
  "duration": float, // in seconds
  "status": str, // "completed" or "failed"
  "tasks": List[str], // Additional - task descriptions
  "length": Optional[int] // Additional - frame count
}
```

**Status**: ✅ Compatible (Backend provides all required fields + extras)
**Note**: Frontend expects "processing" status which backend doesn't provide yet

---

## 2. Camera Streams

### Frontend Expects:
```typescript
{
  id: string,
  name: string,
  resolution: string, // e.g., "1920x1080"
  fps: number,
  active: boolean
}
```

### Backend Provides (CameraInfo):
```python
{
  "id": str,
  "name": str,
  "resolution": str, // e.g., "480x640"
  "fps": int,
  "active": bool
}
```

**Status**: ✅ Perfect Match

---

## 3. Telemetry Data

### Frontend Expects:
```typescript
{
  time: number,
  [joint_name]_action: number,  // Dynamic joint action values
  [joint_name]_obs: number,      // Dynamic joint observation values
}
```

### Backend Provides (TelemetryData):
```python
{
  "episode_id": int,
  "duration": float,
  "fps": int,
  "timestamps": List[float],
  "states": Dict[str, List[float]], // Time series per state
  "actions": Dict[str, List[float]], // Time series per action
  "feature_names": Dict[str, List[str]],
  "feature_units": Optional[Dict[str, str]]
}
```

**Status**: ⚠️ Structure Mismatch
**Issue**: Backend provides columnar data (arrays per feature), frontend expects row-based (object per timestamp)
**Solution Needed**: Transform backend data to frontend format in API client

---

## 4. Video URLs

### Frontend Currently Uses:
- Mock camera placeholders (no actual video playback)

### Backend Provides (EpisodeVideos):
```python
{
  "episode_id": int,
  "videos": List[VideoUrl],
  "duration": float,
  "frame_count": int
}

VideoUrl:
{
  "camera": str,
  "url": str, // Direct HuggingFace URL
  "resolution": str,
  "fps": int
}
```

**Status**: ✅ Ready for Integration
**Note**: Frontend needs HTML5 video player implementation

---

## 5. Dataset Details

### Frontend Expects:
```typescript
{
  id: string,
  name: string,
  description: string,
  frameCount: number,
  duration: number,
  size: number, // bytes
  tags: string[]
}
```

### Backend Provides (DatasetResponse):
```python
{
  "id": str,
  "name": str,
  "description": str,
  "frameCount": int,
  "duration": float,
  "fileSize": int, // Note: different field name!
  "tags": List[str],
  "status": DatasetStatus,
  "robotType": RobotType,
  // Plus many optional fields
}
```

**Status**: ⚠️ Field Name Mismatch
**Issue**: Backend uses "fileSize", frontend expects "size"
**Solution**: Update frontend to use "fileSize" or add alias in backend

---

## 6. API Endpoints

### Current Backend Endpoints:
1. `GET /api/v1/datasets` - List all datasets ✅
2. `GET /api/v1/datasets/{owner}/{name}` - Get dataset details ✅
3. `GET /api/v1/datasets/{owner}/{name}/episodes` - List episodes ✅
4. `GET /api/v1/datasets/{owner}/{name}/episodes/{id}` - Get episode data ✅
5. `GET /api/v1/datasets/{owner}/{name}/episodes/{id}/videos` - Get video URLs ✅
6. `GET /api/v1/datasets/{owner}/{name}/episodes/{id}/telemetry` - Get telemetry ✅
7. `GET /api/v1/datasets/{owner}/{name}/cameras` - Get camera info ✅

### Frontend API Client Needs:
- All endpoints above need to be added to `datasets.api.ts`
- Zod schemas need updates for new data types

---

## Data Transformation Requirements

### 1. Telemetry Data Transform
Backend columnar → Frontend row-based:
```javascript
function transformTelemetry(backendData) {
  return backendData.timestamps.map((time, index) => {
    const point = { time };
    
    // Add states
    Object.entries(backendData.states).forEach(([key, values]) => {
      if (Array.isArray(values[0])) {
        // Multi-dimensional
        values.forEach((dim, dimIdx) => {
          const featureName = backendData.feature_names[key]?.[dimIdx] || `${key}_${dimIdx}`;
          point[`${featureName}_obs`] = dim[index];
        });
      } else {
        point[`${key}_obs`] = values[index];
      }
    });
    
    // Add actions
    Object.entries(backendData.actions).forEach(([key, values]) => {
      if (Array.isArray(values[0])) {
        values.forEach((dim, dimIdx) => {
          const featureName = backendData.feature_names[key]?.[dimIdx] || `${key}_${dimIdx}`;
          point[`${featureName}_action`] = dim[index];
        });
      } else {
        point[`${key}_action`] = values[index];
      }
    });
    
    return point;
  });
}
```

### 2. Dataset Field Mapping
```javascript
// In Zod schema transformation
const DatasetSchema = z.object({
  // ... other fields
  fileSize: z.number().transform(val => ({ size: val })), // Map to frontend expectation
});
```

---

## Missing Features

### Frontend Has But Backend Doesn't Provide:
1. **Episode "processing" status** - Backend only has "completed" or "failed"
2. **Real-time playback sync** - Need WebSocket or polling for live updates
3. **Frame-level navigation** - Backend provides videos but no frame extraction

### Backend Has But Frontend Doesn't Use:
1. **Episode tasks** - Task descriptions per episode
2. **Feature units** - Units for telemetry data (radians, meters, etc.)
3. **User info** - Authenticated user details
4. **Dataset metadata** - Languages, citations, licenses, etc.

---

## Recommendations

### Immediate Actions:
1. ✅ Update frontend API client with new endpoints
2. ✅ Add telemetry data transformation function
3. ✅ Fix field name mismatches (size vs fileSize)
4. ✅ Implement video player component

### Future Enhancements:
1. Add WebSocket support for real-time updates
2. Implement frame extraction service
3. Add episode status tracking ("processing")
4. Use episode tasks in UI
5. Display feature units in telemetry charts

---

## Type Safety Verification

### Zod Schemas Needed:
```typescript
// New schemas to add
export const CameraInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  resolution: z.string(),
  fps: z.number(),
  active: z.boolean()
});

export const VideoUrlSchema = z.object({
  camera: z.string(),
  url: z.string().url(),
  resolution: z.string(),
  fps: z.number()
});

export const EpisodeVideosSchema = z.object({
  episode_id: z.number(),
  videos: z.array(VideoUrlSchema),
  duration: z.number(),
  frame_count: z.number()
});

export const TelemetryDataSchema = z.object({
  episode_id: z.number(),
  duration: z.number(),
  fps: z.number(),
  timestamps: z.array(z.number()),
  states: z.record(z.array(z.number())),
  actions: z.record(z.array(z.number())),
  feature_names: z.record(z.array(z.string())),
  feature_units: z.record(z.string()).optional()
});

export const VideoStreamInfoSchema = z.object({
  dataset_id: z.string(),
  cameras: z.array(CameraInfoSchema),
  video_format: z.string(),
  encoding: z.string()
});
```