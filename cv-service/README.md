# StitchArena CV Service

Computer Vision service for automatic cross-stitch detection and progress tracking.

## Features

- 📸 **Work Progress Detection** - Count stitches on work-in-progress photos
- 📊 **Progress Comparison** - Compare current vs previous photos to calculate daily increment
- 🎯 **Calibration** - Per-project calibration for accurate counting
- 🎨 **Color Segmentation** - Detect stitched regions vs canvas background
- ⚡ **Fast Processing** - Optimized for quick image analysis
- 🐳 **Docker Ready** - Easy deployment with Docker

## API Endpoints

### Health Check
```
GET /api/health
```

### Detect Progress (Main Endpoint)
**🎯 Primary endpoint for daily tracking**

```
POST /api/detect-progress
Content-Type: multipart/form-data

current_photo: [work-in-progress photo]
previous_photo: [previous photo, optional]
calibration_data: [JSON calibration settings, optional]
```

**Response:**
```json
{
  "success": true,
  "total_stitches": 384,
  "previous_stitches": 150,
  "daily_stitches": 234,
  "confidence": 0.85,
  "processing_time_ms": 456.78,
  "image_dimensions": {
    "width": 1024,
    "height": 768
  }
}
```

**Example Usage:**

Day 1 (first photo):
```bash
curl -X POST http://localhost:8001/api/detect-progress \
  -F "current_photo=@day1.jpg"

# Response: total_stitches: 150, daily_stitches: 150
```

Day 2 (with comparison):
```bash
curl -X POST http://localhost:8001/api/detect-progress \
  -F "current_photo=@day2.jpg" \
  -F "previous_photo=@day1.jpg"

# Response: total_stitches: 384, previous_stitches: 150, daily_stitches: 234
```

### Detect Stitches (Legacy)
**⚠️ Legacy endpoint - used for pattern analysis, not for tracking**

```
POST /api/detect
Content-Type: multipart/form-data

file: [image file]
```

**Response:**
```json
{
  "success": true,
  "total_stitches": 4500,
  "colors": [
    {
      "color_hex": "#FF5733",
      "stitch_count": 1200,
      "percentage": 26.67
    }
  ],
  "confidence": 0.85,
  "processing_time_ms": 234.56,
  "image_dimensions": {
    "width": 1024,
    "height": 768
  }
}
```

## Installation

### Local Development

1. **Create virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Create .env file:**
```bash
cp .env.example .env
```

4. **Run the service:**
```bash
python -m app.main
# Or with uvicorn:
uvicorn app.main:app --reload --port 8001
```

5. **Access API docs:**
- Swagger UI: http://localhost:8001/docs
- ReDoc: http://localhost:8001/redoc

### Docker

1. **Build image:**
```bash
docker build -t stitch-arena-cv .
```

2. **Run container:**
```bash
docker run -p 8001:8001 stitch-arena-cv
```

### Docker Compose

Add to your main `docker-compose.yml`:
```yaml
services:
  cv-service:
    build: ./cv-service
    ports:
      - "8001:8001"
    environment:
      - DEBUG=false
      - BACKEND_URL=http://backend:3000
```

## Development

### Project Structure
```
cv-service/
├── app/
│   ├── __init__.py       # Package info
│   ├── main.py           # FastAPI application
│   ├── routes.py         # API endpoints
│   ├── inference.py      # CV logic
│   └── models.py         # Pydantic models
├── models/               # ML models (future)
├── tests/                # Unit tests
├── requirements.txt      # Python dependencies
├── Dockerfile           # Docker configuration
└── README.md            # This file
```

### Testing

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest
```

### Current Implementation

**Version 0.1.0** uses basic computer vision techniques:
- K-means clustering for color detection
- Canny edge detection for grid analysis
- Hough transform for line detection
- Geometric estimation for stitch counting

### Future Improvements

- [ ] Train YOLOv8 model for accurate stitch detection
- [ ] Support for different canvas types (Aida, evenweave, linen)
- [ ] Calibration endpoint (known dimensions)
- [ ] Batch processing for multiple images
- [ ] WebSocket support for real-time progress
- [ ] GPU acceleration
- [ ] Model versioning and A/B testing

## Integration with Main App

The Next.js app can call the CV service:

```typescript
// Upload pattern image for analysis
const formData = new FormData();
formData.append('file', imageFile);

const response = await fetch('http://localhost:8001/api/detect', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
console.log(`Detected ${result.total_stitches} stitches`);
```

## Performance

- Average processing time: 200-500ms per image (1024x768)
- Supports images up to 10MB
- Concurrent request handling with async processing

## License

Part of StitchArena project - MIT License
