# LeRobot Dataset API Backend

FastAPI backend for accessing LeRobot datasets from HuggingFace Hub.

## Setup

### 1. Activate LeRobot Environment
```bash
conda activate lerobot
```

### 2. Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 3. Configure Environment Variables
```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your HuggingFace token
# Get your token from: https://huggingface.co/settings/tokens
```

### 4. Run the Server
```bash
python main.py
```

The server will start at `http://localhost:8000`

## Testing

### Quick Test
```bash
# Run the test script
python test_api.py
```

### Manual Testing with curl
```bash
# Check health
curl http://localhost:8000/health

# Get user info
curl http://localhost:8000/api/v1/user

# List datasets
curl http://localhost:8000/api/v1/datasets
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /` | Root endpoint - API info |
| `GET /health` | Health check |
| `GET /api/v1/user` | Get authenticated user info |
| `GET /api/v1/datasets` | List user's datasets |
| `GET /api/v1/datasets/{repo_id}` | Get dataset details |
| `GET /api/v1/datasets/{repo_id}/episodes` | List episodes |
| `GET /api/v1/datasets/{repo_id}/episodes/{id}` | Get episode data |

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Frontend Integration

The API is configured to accept requests from `http://localhost:3000` (Next.js default).

To integrate with the frontend:

1. Replace mock data imports with API calls:
```javascript
// Instead of:
import { mockDatasets } from "@/lib/data/mock-datasets"

// Use:
const response = await fetch('http://localhost:8000/api/v1/datasets')
const datasets = await response.json()
```

2. The API returns data in the same format expected by the frontend components.

## Troubleshooting

### Connection Refused
- Make sure the server is running: `python main.py`
- Check that port 8000 is not in use

### 401 Unauthorized
- Check that your HF_TOKEN is set correctly in `.env`
- Verify the token has read permissions

### No Datasets Found
- Make sure you have datasets in your HuggingFace account
- Check if the datasets are LeRobot-compatible (have meta/info.json)

### CORS Issues
- The backend is configured for `http://localhost:3000`
- If using a different port, update CORS_ORIGINS in `.env`

## Next Steps

1. **Test the API**: Run `python test_api.py` to verify everything works
2. **Check your datasets**: The API will list all datasets from your HF account
3. **Integrate with frontend**: Start replacing mock data with API calls
4. **Add caching**: Consider adding Redis for better performance
5. **Add error handling**: Implement proper error responses for edge cases