# Integration Test Plan

## Testing the Dataset Listing Page Integration

### Prerequisites
1. Backend server running: `cd backend && python main.py`
2. Frontend dev server: `cd frontend && npm install && npm run dev`

### Manual Test Steps

#### 1. Start Backend Server
```bash
# Terminal 1
cd backend
conda activate lerobot
python main.py
```

Expected: Server starts on http://localhost:8000

#### 2. Verify Backend is Working
```bash
# Terminal 2
curl http://localhost:8000/api/v1/datasets
```

Expected: Returns your HuggingFace datasets in JSON format

#### 3. Start Frontend
```bash
# Terminal 3
cd frontend
npm install  # Install axios and zod
npm run dev
```

Expected: Frontend starts on http://localhost:3000

#### 4. Test Dataset Listing Page
1. Open browser to http://localhost:3000/datasets
2. You should see your real HuggingFace datasets instead of mock data
3. Check browser console for any errors

### What to Verify

✅ **Dataset Cards Display:**
- Dataset names from HuggingFace
- Correct frame counts
- Duration calculated from frames/fps
- Tags displayed
- Status shows as "ready"

✅ **Filtering Works:**
- Search by dataset name
- Filter by status
- Filter by robot type
- Clear filters button

✅ **No Console Errors:**
- Check browser DevTools console
- Check terminal running frontend
- Check terminal running backend

### Troubleshooting

**If datasets don't load:**
1. Check backend is running: `curl http://localhost:8000/health`
2. Check HF_TOKEN in backend/.env
3. Check NEXT_PUBLIC_API_URL in frontend/.env.local
4. Check browser console for CORS errors

**If you see CORS errors:**
- Ensure backend CORS_ORIGINS includes http://localhost:3000

**If you see type errors:**
- The Zod validation might be catching unexpected data formats
- Check browser console for detailed Zod errors

### Next Steps

Once dataset listing works:
1. Click on a dataset card to test navigation
2. Verify dataset detail page (will use mock data for now)
3. Test episode listing (backend endpoint ready)

## API Endpoints Status

| Endpoint | Backend | Frontend | Status |
|----------|---------|----------|--------|
| GET /api/v1/user | ✅ Pydantic | ✅ Zod | Ready |
| GET /api/v1/datasets | ✅ Pydantic | ✅ Zod | Ready |
| GET /api/v1/datasets/{id} | ✅ Pydantic | ✅ Zod | Ready |
| GET /api/v1/datasets/{id}/episodes | ✅ Pydantic | ✅ Zod | Ready |
| GET /api/v1/datasets/{id}/episodes/{ep} | ✅ Pydantic | ✅ Zod | Ready |

## Summary

The integration is complete with:
- ✅ Backend using Pydantic for type validation
- ✅ Frontend using Zod for runtime validation
- ✅ Type-safe API calls with error handling
- ✅ Frontend filtering (no backend changes needed)
- ✅ Maintains existing component interfaces