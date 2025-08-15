# Frontend Dataset Analysis Report

## Executive Summary

This report provides a comprehensive analysis of the frontend codebase's dataset listing and viewer functionality, focusing on schemas, API contracts, type requirements, and identifying inconsistencies for standardization with the backend.

## Schema Documentation

### Primary Schema Files

#### 1. `frontend/lib/api/schemas/dataset.schema.ts`
**Purpose**: Core dataset types and validation schemas

**Exported Types**:
- `RobotTypeSchema`: Enum for robot types (`arm`, `mobile`, `humanoid`, `so101`, `custom`)
- `DatasetStatusSchema`: Enum for dataset status (`ready`, `processing`, `recording`, `error`)
- `DatasetSchema`: Main dataset object with 24 fields
- `DatasetDetailSchema`: Extended dataset with additional metadata
- `EpisodeSchema`: Episode structure with id, duration, status
- `VideoUrlSchema`: Video URL structure for episodes
- `EpisodeDataSchema`: Complete episode data including videos and telemetry
- `UserInfoSchema`: User authentication data

**Key Fields in DatasetSchema**:
```typescript
{
  id: string,
  name: string,
  description: string,
  tags: string[],
  createdAt: string,
  frameCount: number,
  duration: number,
  fileSize: number,  // ⚠️ Critical field
  status: DatasetStatus,
  robotType: RobotType,
  // HuggingFace metadata (nullable)
  languages?: string[] | null,
  taskCategories?: string[] | null,
  // ... more HF fields
}
```

#### 2. `frontend/lib/api/schemas/viewer.schema.ts`
**Purpose**: Dataset viewer-specific types for video and telemetry

**Exported Types**:
- `CameraInfoSchema`: Camera configuration (id, name, resolution, fps, active)
- `VideoUrlSchema`: Video stream URLs
- `EpisodeVideosSchema`: Episode video collection with metadata
- `TelemetryDataSchema`: Raw telemetry from backend (columnar format)
- `VideoStreamInfoSchema`: Camera stream information
- `TelemetryPointSchema`: Transformed telemetry for charts (row-based)

**Critical Functions**:
- `transformTelemetryData()`: Converts columnar backend data to row-based frontend format
- `extractTelemetryKeys()`: Gets available telemetry features for charts
- `detectMultipleArms()`: Complex logic for multi-arm robot detection

**⚠️ Type Inconsistency**: Uses snake_case in some schemas (`episode_id`, `frame_count`) vs camelCase elsewhere

## API Endpoints Documentation

### Core API Service: `frontend/lib/api/datasets.api.ts`

**Methods Provided**:
1. `getUserInfo()`: GET `/api/v1/user` → UserInfo
2. `getAll()`: GET `/api/v1/datasets` → Dataset[]
3. `getById(id)`: GET `/api/v1/datasets/{owner}/{name}` → DatasetDetail | null
4. `getEpisodes(id)`: GET `/api/v1/datasets/{owner}/{name}/episodes` → Episode[]
5. `getEpisodeData(id, episodeId)`: GET `/api/v1/datasets/{owner}/{name}/episodes/{id}` → EpisodeData | null
6. `deleteDataset(id)`: DELETE `/api/v1/datasets/{owner}/{name}` → boolean
7. `checkHealth()`: GET `/health` → boolean
8. `getEpisodeVideos(id, episodeId)`: GET `/api/v1/datasets/{owner}/{name}/episodes/{id}/videos` → EpisodeVideos | null
9. `getEpisodeTelemetry(id, episodeId)`: GET `/api/v1/datasets/{owner}/{name}/episodes/{id}/telemetry` → TelemetryPoint[]
10. `getRawTelemetry(id, episodeId)`: GET `/api/v1/datasets/{owner}/{name}/episodes/{id}/telemetry` → TelemetryData | null
11. `getCameraInfo(id)`: GET `/api/v1/datasets/{owner}/{name}/cameras` → VideoStreamInfo | null

**ID Format Handling**:
- Frontend expects: `"owner/name"` format
- API routes use: `/datasets/{owner}/{name}` pattern
- Parsing logic: `const [owner, ...nameParts] = datasetId.split('/')`

**Error Handling Pattern**:
- Success: Return parsed data
- Failure: Return `null` or throw Error with user-friendly message
- API client handles HTTP errors and validation

## Type Requirements by Component

### 1. Dataset Listing Page (`app/(dashboard)/datasets/page.tsx`)
**Component**: DatasetsPage
**Data Used**:
- Full `Dataset[]` array from `useDatasets()`
- Filters by: search, status, robotType
- Collection management (local state)
- Drag & drop functionality

**Fields Actually Displayed**:
```typescript
// Via DatasetCard component
{
  id,           // for routing
  name,         // title
  description,  // card description
  status,       // status badge
  robotType,    // type badge
  tags,         // tag badges (first 2)
  fileSize,     // storage info
  duration,     // playback duration
  frameCount,   // frame statistics
  createdAt,    // creation date
  
  // HuggingFace metadata (optional)
  languages,    // language badges
  taskCategories, // task badges
  license,      // license info
  author,       // author name
  downloads,    // download count
  likes,        // like count
  episodeCount  // episode info
}
```

### 2. Dataset Viewer (`components/datasets/dataset-viewer.tsx`)
**Component**: DatasetViewer
**Data Sources**: Multiple API calls

**Initial Data Requirements**:
```typescript
// From useDataset(datasetId)
dataset: {
  name,         // header title
  description,  // header subtitle
  duration,     // fallback duration
  frameCount,   // fallback frame count
  fileSize,     // stats display
  tags          // stats display
}

// From getEpisodes(datasetId)
episodes: {
  id,           // episode selection
  name,         // episode display
  duration,     // episode duration
  status,       // episode status
  tasks,        // episode tasks
  length        // frame count
}[]

// From getCameraInfo(datasetId)
cameraInfo: {
  id,           // camera identifier
  name,         // camera display name
  resolution,   // camera specs
  fps,          // camera specs
  active        // camera status
}[]
```

**Episode-Specific Data**:
```typescript
// From getEpisodeVideos(datasetId, episodeId)
videoUrls: {
  camera,       // camera ID
  url,          // video stream URL
  resolution,   // video resolution
  fps           // video framerate
}[]

// From getEpisodeTelemetry(datasetId, episodeId)
telemetryData: TelemetryPoint[] // Transformed row-based data

// From getRawTelemetry(datasetId, episodeId)
rawTelemetryData: {
  episode_id,   // ⚠️ snake_case
  duration,
  fps,
  timestamps,   // time array
  states,       // state data (columnar)
  actions,      // action data (columnar)
  feature_names, // feature mapping
  feature_units  // unit information
}
```

### 3. Viewer Subcomponents

#### TelemetryDisplay (`components/datasets/viewer/telemetry-display.tsx`)
**Data Used**:
```typescript
{
  data: TelemetryPoint[],     // transformed telemetry
  currentTime: number,        // playback position
  duration: number,           // total duration
  rawTelemetryData: TelemetryData | null // for feature names/units
}
```

**Dynamic Field Usage**:
- Extracts state/action keys from telemetry data
- Uses feature names from rawTelemetryData for display
- Applies units from rawTelemetryData for tooltips

#### DatasetStats (`components/datasets/viewer/dataset-stats.tsx`)
**Data Used**:
```typescript
{
  duration: number,           // from episode or dataset
  activeCameras: number,      // filtered camera count
  frameCount: number,         // from episode or dataset
  size: number,               // dataset.fileSize
  tags: string[]              // dataset tags
}
```

## Type Inconsistencies Found

### 1. **Field Naming Convention Mismatch**
**Issue**: Mixed snake_case and camelCase
```typescript
// Backend returns snake_case
{
  episode_id: number,
  frame_count: number,
  feature_names: Record<string, string[]>
}

// Frontend expects camelCase
{
  episodeId: number,
  frameCount: number,
  featureNames: Record<string, string[]>
}
```

### 2. **FileSize Field Confusion**
**Issue**: Both `size` and `fileSize` exist
```typescript
// dataset-viewer.tsx line 425
size={dataset.fileSize || dataset.size}

// DatasetSchema only defines fileSize
fileSize: z.number().int().min(0).default(0)
```

### 3. **Episode ID Type Mismatch**
**Issue**: Number vs String inconsistency
```typescript
// Frontend schemas expect number
EpisodeSchema: { id: z.number().int() }

// API calls pass as number
episodeId: number

// But some backend responses may return strings
```

### 4. **Optional vs Required Field Misalignment**
**Issue**: Frontend handles nulls differently than backend expects
```typescript
// HuggingFace fields marked as nullable in frontend
languages: z.array(z.string()).nullable().optional()

// But components assume array or undefined
dataset.languages?.length > 0
```

## Non-UI Code Documentation

### 1. Hooks (`lib/hooks/`)

#### `useDatasets(filters?)`
**Purpose**: Fetch and filter dataset list
**Dependencies**: `useData<Dataset[]>`, `datasetsApi.getAll()`
**Filtering**: Client-side search, status, robotType
**Return**: `{ data, loading, error, refetch }`

#### `useDataset(id)`
**Purpose**: Fetch single dataset details
**Dependencies**: `useData<Dataset | null>`, `datasetsApi.getById()`
**Return**: `{ data, loading, error, refetch }`

#### Base Hook: `useData<T>`
**Purpose**: Generic data fetching with caching
**Features**: Loading states, error handling, dependency tracking

### 2. API Client (`lib/api/client.ts`)
**Purpose**: Axios-based HTTP client with interceptors
**Features**: Error handling, request/response transformation

### 3. Utility Functions

#### Format Helpers
```typescript
// In dataset-viewer.tsx
formatFileSize(bytes: number): string
formatDuration(seconds: number): string

// In dataset-card.tsx  
formatFileSize(bytes: number): string
formatDuration(seconds: number): string
parseDate(dateInput: string | Date): Date
```

**⚠️ Code Duplication**: formatFileSize and formatDuration defined in multiple files

### 4. Constants

#### Robot Type Configuration
```typescript
// In dataset-card.tsx
const robotTypeConfig = {
  arm: { label: "Robotic Arm", color: "bg-blue-500/10 text-blue-500" },
  mobile: { label: "Mobile Robot", color: "bg-green-500/10 text-green-500" },
  // ... etc
}
```

#### Status Configuration  
```typescript
const statusConfig = {
  ready: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
  // ... etc
}
```

## Redundant/Unused Code

### 1. **Duplicate Helper Functions**
- `formatFileSize()` defined in 3+ files
- `formatDuration()` defined in 2+ files
- Should be centralized in `lib/utils/`

### 2. **Mock Data Fallbacks** 
**⚠️ Critical Issue**: Mock data hides real API problems
```typescript
// dataset-viewer.tsx lines 106-110, 117-119, 155-163
// These fallbacks mask actual API failures
setEpisodes([
  { id: 0, name: "Episode 0", duration: 45, status: "completed", tasks: [], length: 1350 }
])
```

### 3. **Unused Schema Fields**
- Many HuggingFace metadata fields in DatasetSchema are rarely used
- `EpisodeDataSchema.cameras` field not used by viewer
- `prettyName`, `paperswithcodeId` fields never displayed

### 4. **Redundant API Methods**
- `getEpisodeData()` returns similar data to `getEpisodeVideos()` + `getEpisodeTelemetry()`
- Separate raw vs transformed telemetry methods could be consolidated

## Critical Issues for Standardization

### 1. **Immediate Fixes Needed**
1. Remove all mock data fallbacks
2. Standardize fileSize field naming  
3. Fix snake_case vs camelCase in API responses
4. Centralize utility functions

### 2. **Type Safety Improvements**
1. Ensure Episode IDs are consistently typed as numbers
2. Align optional field handling between frontend/backend
3. Add proper error boundaries for API failures

### 3. **Code Cleanup**
1. Remove duplicate utility functions
2. Consolidate telemetry transformation logic
3. Clean up unused schema fields

## Recommendations

1. **Create shared utility module** for formatFileSize, formatDuration
2. **Implement proper error states** instead of mock fallbacks
3. **Standardize API response format** to use camelCase consistently
4. **Simplify telemetry handling** with unified transformation
5. **Add TypeScript strict mode** to catch type mismatches
6. **Create type generation** from backend schemas to frontend

This analysis provides the foundation for standardizing the dataset functionality between frontend and backend systems.