# HCL-QA-Agent - LeRobot Dataset Viewer Platform

A professional dataset viewer inspired by LeRobot, featuring frame-accurate video playback, multi-camera synchronization, and real-time telemetry visualization.

## 🎯 Project Overview

This platform provides a comprehensive interface for viewing and analyzing robotics datasets from HuggingFace Hub, with a focus on LeRobot-compatible datasets.

## 📁 Project Structure

```
HCL-QA-Agent/
├── frontend/              # Next.js 14 frontend application
│   ├── app/(dashboard)/   # App router pages
│   ├── components/        # Reusable UI components
│   └── lib/              # Utilities, hooks, and API client
├── backend/              # FastAPI backend server  
│   ├── services/         # Business logic services
│   ├── schemas/          # Pydantic data models
│   └── utils/           # Helper utilities
└── docs/                # Documentation and guides
```

## 🚀 Features

- 🎥 **Frame-accurate video playback** with LeRobot-inspired controls
- 🎮 **Multi-camera synchronization** for robotics datasets  
- 📊 **Real-time telemetry visualization** (joints, end-effector, gripper)
- 🤖 **Episode navigation** with task metadata
- 🔍 **Dataset browser** with HuggingFace Hub integration
- 📱 **Responsive design** with professional UX
- 🛡️ **Type-safe** with comprehensive validation

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Radix UI
- **Backend**: FastAPI, Python 3.8+, Pydantic, HuggingFace Hub
- **Validation**: Zod (frontend), Pydantic (backend)
- **Robotics**: LeRobot dataset format compatibility

## 🏁 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- HuggingFace token ([get here](https://huggingface.co/settings/tokens))

### 1. Backend Setup
```bash
cd backend/

# Install dependencies
make install

# Configure environment
cp .env .env.local
# Edit .env.local and add: HF_TOKEN=your_actual_token

# Run server
make run
# Server starts at http://localhost:8000
```

### 2. Frontend Setup
```bash
cd frontend/

# Install dependencies
npm install

# Configure environment
# Edit .env.local and add your API URL and HF token

# Run development server
npm run dev
# Frontend starts at http://localhost:3000
```

### 3. Access the Application
- **Dataset Browser**: http://localhost:3000/datasets
- **Dataset Viewer**: http://localhost:3000/datasets/[dataset-id]
- **API Documentation**: http://localhost:8000/docs

## 🧪 Development

### Frontend Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production  
npm run lint         # Run ESLint
npm run format       # Format with Prettier
npm run type-check   # TypeScript type checking
```

### Backend Commands
```bash
make help           # Show all available commands
make install-dev    # Install with development dependencies
make lint          # Run all linting tools
make format        # Format code with black/isort
make type-check    # Run mypy type checking
make test          # Run tests
make dev           # Run server in development mode
```

## 📋 Architecture

### Frontend Architecture
- **App Router**: Next.js 14 with proper routing
- **Component Design**: Reusable UI components with TypeScript
- **State Management**: React hooks with custom data fetching
- **API Integration**: Type-safe client with runtime validation

### Backend Architecture
- **Service Layer**: Clean separation of business logic
- **Data Validation**: Pydantic models for request/response
- **Error Handling**: Comprehensive error responses
- **API Documentation**: Auto-generated OpenAPI docs

## 🎯 Key Features

### LeRobot Dataset Viewer
- **Timestamp Management**: Frame-accurate seeking at any FPS
- **Video Synchronization**: Multi-camera synchronized playback
- **Telemetry Display**: Real-time robot state visualization
- **Episode Navigation**: Browse episodes with metadata
- **Professional Controls**: Speed adjustment, timeline scrubbing

### User Experience
- **Loading States**: Skeleton UI for smooth experience
- **Error Handling**: User-friendly error messages
- **Responsive Design**: Works on all screen sizes
- **Breadcrumb Navigation**: Clear navigation hierarchy

## 📚 Documentation

- **[Setup Guide](SETUP_GUIDE.md)**: Comprehensive setup instructions
- **[Code Review Report](FINAL_CODE_REVIEW_REPORT.md)**: Latest code quality assessment
- **API Docs**: Available at `/docs` when backend is running

## 🧹 Code Quality

This project maintains high code quality through:
- **ESLint + Prettier** for frontend code formatting
- **Black + Flake8 + MyPy** for Python code quality
- **TypeScript** for type safety
- **Comprehensive testing** setup

## 🤝 Contributing

1. Follow the established code formatting (run linters)
2. Add tests for new features
3. Update documentation as needed
4. Ensure type safety throughout

## 📄 License

This project is licensed under the Apache 2.0 License.