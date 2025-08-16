# HCL-QA-Agent LeRobot Dataset Viewer - Setup Guide

## 🎯 Project Overview

A professional dataset viewer inspired by LeRobot, featuring frame-accurate video playback, multi-camera synchronization, and real-time telemetry visualization.

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18+) and **npm** (v10+)
- **Python 3** (v3.8+)
- **HuggingFace Token** (get from https://huggingface.co/settings/tokens)

### 1. Backend Setup

```bash
cd backend/

# Install dependencies
python3 -m pip install --break-system-packages fastapi uvicorn pydantic requests python-dotenv httpx huggingface_hub pandas

# Configure environment
cp .env .env.local
# Edit .env.local and add your HuggingFace token:
# HF_TOKEN=your_actual_token_here

# Start the backend server
export PATH=$PATH:/home/ubuntu/.local/bin
python3 main.py
```

The backend will start on `http://localhost:8000`

### 2. Frontend Setup

```bash
cd frontend/

# Install dependencies
npm install

# Configure environment
# Edit .env.local and verify settings:
# NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
# NEXT_PUBLIC_HF_TOKEN=your_actual_token_here

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:3000`

## 🔧 API Testing

Test the backend endpoints:

```bash
# Health check
curl http://localhost:8000/health

# Get datasets (requires HF_TOKEN)
curl -H "Authorization: Bearer your_token_here" http://localhost:8000/api/v1/datasets

# API documentation
open http://localhost:8000/docs
```

## 🎮 Using the Dataset Viewer

1. **Navigate to Datasets**: Visit `http://localhost:3000/datasets`

2. **Browse Datasets**: View available LeRobot datasets from HuggingFace

3. **Open Dataset Viewer**: Click on any dataset to open the viewer at `/datasets/[id]`

4. **Features Available**:
   - 🎥 **Multi-camera video synchronization**
   - ⏱️ **Frame-accurate timeline navigation**
   - 🤖 **Real-time robot telemetry display**
   - 📊 **Episode navigation and metadata**
   - 🎛️ **Playback speed controls**
   - 📍 **Breadcrumb navigation**

## 🛠️ LeRobot-Inspired Features

### Timestamp Management
- Frame-accurate seeking at any FPS
- Synchronized multi-camera playback
- Timeline scrubbing with sync points

### Robot State Visualization
- Joint positions display
- End effector tracking  
- Gripper state monitoring
- Episode success/failure status

### Professional UX
- Loading states with skeleton UI
- Comprehensive error handling
- Responsive design
- Accessibility support

## 📁 Project Structure

```
├── backend/
│   ├── main.py              # FastAPI application
│   ├── services/            # Business logic
│   ├── schemas/             # Pydantic models
│   └── .env                 # Environment config
│
├── frontend/
│   ├── app/(dashboard)/datasets/
│   │   ├── [id]/           # Dataset viewer routes
│   │   │   ├── page.tsx    # Main viewer page
│   │   │   ├── loading.tsx # Loading states
│   │   │   ├── error.tsx   # Error handling
│   │   │   └── not-found.tsx # 404 page
│   │   └── page.tsx        # Datasets list
│   ├── components/
│   │   ├── ui/             # Reusable UI components
│   │   └── datasets/       # Dataset-specific components
│   └── lib/
│       ├── api/            # API client & validation
│       ├── hooks/          # React hooks
│       └── utils/          # Utility functions
```

## 🔍 Troubleshooting

### Backend Issues

**Import Errors**: Ensure all dependencies are installed:
```bash
python3 -m pip install --break-system-packages fastapi uvicorn pydantic requests python-dotenv httpx huggingface_hub pandas
```

**HF_TOKEN Errors**: Make sure your HuggingFace token is valid and has appropriate permissions.

**Port 8000 in use**: Change the port in `backend/.env`:
```
PORT=8001
```

### Frontend Issues

**Build Errors**: Ensure all dependencies are installed:
```bash
npm install
```

**API Connection**: Verify `NEXT_PUBLIC_API_BASE_URL` in `frontend/.env.local` matches your backend URL.

**TypeScript Errors**: Run the type checker:
```bash
npm run type-check
```

## 🧪 Testing

### Backend API Tests
```bash
cd backend/
python3 test_api.py
```

### Frontend Build Test
```bash
cd frontend/
npm run build
```

### Integration Test
1. Start backend on port 8000
2. Start frontend on port 3000  
3. Visit `http://localhost:3000/datasets`
4. Click on a dataset to test the viewer

## 🚀 Production Deployment

### Backend
```bash
cd backend/
export PATH=$PATH:/home/ubuntu/.local/bin
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Frontend
```bash
cd frontend/
npm run build
npm start
```

## 📊 Features Implemented

- ✅ **LeRobot-inspired dataset viewer**
- ✅ **Frame-accurate timestamp management**
- ✅ **Multi-camera video synchronization**
- ✅ **Real-time telemetry visualization**
- ✅ **Professional routing with error handling**
- ✅ **Runtime data validation with Zod**
- ✅ **Responsive UI with loading states**
- ✅ **Clean, maintainable codebase**
- ✅ **Comprehensive error boundaries**
- ✅ **Breadcrumb navigation**

## 🎯 Next Steps

1. **Add HuggingFace Token**: Replace placeholder tokens with actual values
2. **Test with Real Datasets**: Use actual LeRobot datasets from HuggingFace
3. **Customize Styling**: Adapt the UI to your brand preferences
4. **Add Analytics**: Implement usage tracking if needed
5. **Deploy**: Set up production deployment

## 📞 Support

For issues or questions:
1. Check the console for error messages
2. Verify environment variables are set correctly
3. Ensure both backend and frontend are running
4. Test API endpoints directly with curl

---

**Happy dataset viewing! 🤖📊**