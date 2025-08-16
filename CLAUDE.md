# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HCL-QA-Agent is an industrial robot workflow automation platform that combines a Next.js frontend with a FastAPI backend to provide dataset visualization, robot control, and teleoperation capabilities. The project integrates with the LeRobot robotics library for actual robot control operations.

## Architecture

### Three-Layer Architecture
1. **Frontend (Next.js)** - Visual workflow editor, dataset viewer, teleoperation controls
2. **Backend (FastAPI)** - LeRobot wrapper, API orchestration, HuggingFace integration
3. **LeRobot Core** - Unmodified robotics library for robot control and dataset handling

### Key Integration Points
- Backend serves as a bridge between the web interface and LeRobot
- HuggingFace Hub integration for dataset management
- Real-time telemetry data streaming
- Multi-camera video feed support

## Development Commands

### Frontend Development
```bash
cd frontend
pnpm install
pnpm dev          # Start dev server on localhost:3000
pnpm build        # Build for production
pnpm lint         # Run ESLint
pnpm start        # Start production server
```

### Backend Development
```bash
cd backend
pip install -r requirements.txt
python main.py    # Start FastAPI server on localhost:8000
```

### LeRobot Setup
```bash
cd lerobot
pip install -e .  # Install in editable mode
```

## Branch Strategy

- `main` - Production branch
- `integration-frontend-backend` - Main development branch (current)
- `feature-frontend-dataset-viewer` - Frontend-only development
- Use sync scripts for cross-branch coordination:
  - `./sync-frontend.sh` - Pull from frontend branch
  - `./push-frontend-changes.sh` - Push to frontend branch

## Key Architecture Patterns

### Frontend Architecture
- **Components**: Organized by feature (`datasets/`, `recording/`, `ui/`)
- **API Layer**: Centralized in `lib/api/` with Zod schema validation
- **Hooks**: Custom hooks in `lib/hooks/` for data fetching and state management
- **Type Safety**: TypeScript throughout with strict type checking
- **Styling**: Tailwind CSS with shadcn/ui components

### Backend Architecture
- **Service Layer**: `services/huggingface_service.py` handles HuggingFace API integration
- **Schema Validation**: Pydantic models in `schemas/` directory
- **Configuration**: Centralized config in `config.py` with environment variables
- **Error Handling**: Structured error responses with rate limiting

### Data Flow Patterns
- Frontend makes API calls through `lib/api/client.ts`
- Backend validates requests using Pydantic schemas
- HuggingFace service handles external API interactions
- Real-time data flows through telemetry endpoints

## Environment Configuration

### Required Environment Variables
**Backend:**
- `HF_TOKEN` or `HUGGINGFACE_TOKEN` - HuggingFace API token
- `CORS_ORIGINS` - Allowed origins (default: http://localhost:3000)
- `PORT` - Server port (default: 8000)

**Frontend:**
- `NEXT_PUBLIC_API_URL` - Backend API URL (required)
- `NEXT_PUBLIC_DEBUG` - Enable debug logging

## Testing and Quality

### Frontend Testing
- Run tests with standard Next.js testing commands
- Component testing focuses on dataset viewer and teleoperation interfaces

### Backend Testing
- Use `python -m pytest` for backend tests
- API endpoint testing in `test_api.py`

## Dataset Integration

### HuggingFace Integration
- Datasets are fetched from HuggingFace Hub using the datasets-server API
- Authentication handled via HF_TOKEN
- Dataset metadata includes robot type, episode count, and telemetry data

### Data Formats
- Episodes contain frame-by-frame robot telemetry
- Multi-camera video streams with synchronized timestamps
- Parquet format for efficient data storage and streaming

## Robot Types Supported
- SO101 (default)
- ARM manipulators
- MOBILE robots
- HUMANOID robots
- CUSTOM configurations

## Common Development Workflows

### Adding New Dataset Features
1. Define Pydantic schema in `backend/schemas/dataset.py`
2. Add API endpoint in `backend/main.py`
3. Update service layer in `backend/services/huggingface_service.py`
4. Create frontend API wrapper in `frontend/lib/api/datasets.api.ts`
5. Add TypeScript types in `frontend/lib/api/schemas/`

### Adding New UI Components
- Follow shadcn/ui patterns in `components/ui/`
- Use Tailwind for styling with consistent design tokens
- Implement proper TypeScript interfaces
- Add Framer Motion animations for enhanced UX

### Working with LeRobot
- LeRobot directory is a fork - avoid modifying core files
- Add customizations through the backend service layer
- Use LeRobot's existing dataset formats and robot configurations

## Performance Considerations

### Frontend Optimizations
- Next.js App Router with server components where possible
- Image optimization for camera feeds
- Efficient re-rendering with proper React patterns

### Backend Optimizations
- Rate limiting implemented (30 requests/minute default)
- Request timeouts configured (10s default, 30s for large data)
- Memory-efficient data streaming for large datasets

## Security Guidelines

### API Security
- HuggingFace tokens handled server-side only
- CORS properly configured for frontend origins
- Input validation using Pydantic schemas
- Rate limiting to prevent abuse

### Data Handling
- No sensitive data in frontend code
- Environment variables for all configuration
- Proper error handling without exposing internal details

## LeRobot Integration Notes

The `lerobot/` directory contains a complete robotics framework with:
- Multiple robot support (SO100, SO101, ViperX, etc.)
- Policy training (ACT, Diffusion, TDMPC, VQ-BeT)
- Dataset recording and replay
- Camera calibration and motor control

When working with LeRobot:
- Use the backend as an interface layer
- Leverage existing robot configurations
- Follow LeRobot's dataset structure for compatibility