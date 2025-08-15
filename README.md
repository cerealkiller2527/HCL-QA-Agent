# HCL-QA-Agent - Industrial Robot Workflow Automation Platform

## Project Structure

```
HCL-QA-Agent/
├── frontend/          # Next.js frontend application
├── backend/           # FastAPI backend server
├── lerobot/          # LeRobot fork (robotics library)
├── sync-frontend.sh  # Script to sync from frontend branch
└── push-frontend-changes.sh  # Script to push changes to frontend branch
```

## Architecture

This project uses a three-layer architecture:

1. **Frontend (Next.js)**: Visual workflow editor, teleoperation controls, dataset viewer
2. **Backend (FastAPI)**: LeRobot wrapper, WebSocket management, API orchestration  
3. **LeRobot Core**: Unmodified robotics library handling actual robot control

## Development Setup

### Frontend
```bash
cd frontend
pnpm install
pnpm dev
# Runs on http://localhost:3000
```

### Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
# Runs on http://localhost:8000
```

### LeRobot
```bash
cd lerobot
pip install -e .
```

## Branch Management

- `main`: Production branch
- `integration-frontend-backend`: Main development branch
- `feature-frontend-dataset-viewer`: Frontend-only branch
- `frontend-prototype`: Original frontend prototype

### Syncing Frontend

To pull latest changes from frontend branch:
```bash
./sync-frontend.sh
```

To push frontend changes back to frontend branch:
```bash
./push-frontend-changes.sh
```

## Features

- 🤖 Visual workflow editor for robot programming
- 📊 Dataset viewer with HuggingFace integration
- 🎮 Teleoperation interface
- 📹 Multi-camera support
- 🧠 Multiple policy support (ACT, Diffusion, TDMPC, VQ-BeT)
- 📦 Dataset recording and management

## Technology Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Shadcn/ui
- **Backend**: FastAPI, Python 3.10+, HuggingFace Hub
- **Robotics**: LeRobot, PyTorch, OpenCV
- **Visualization**: Rerun SDK

## License

This project is licensed under the Apache 2.0 License.