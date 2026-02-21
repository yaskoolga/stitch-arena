# CV Service - Quick Start Guide

## 🚀 Quick Start (Development)

### Option 1: Local Python

1. **Navigate to cv-service directory:**
```bash
cd cv-service
```

2. **Create virtual environment:**
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Set up environment:**
```bash
cp .env.example .env
```

5. **Run the service:**
```bash
python -m app.main
```

6. **Test it:**
- API docs: http://localhost:8001/docs
- Health check: http://localhost:8001/api/health

### Option 2: Docker

1. **Build and run with Docker Compose (from project root):**
```bash
cd ..  # Go to project root (stitch-arena/)
docker-compose up cv-service
```

2. **Or build standalone:**
```bash
cd cv-service
docker build -t stitch-arena-cv .
docker run -p 8001:8001 stitch-arena-cv
```

## 🧪 Testing

### Run tests:
```bash
# Install dev dependencies
pip install -r requirements-dev.txt

# Run tests
pytest

# With coverage
pytest --cov=app tests/
```

## 📝 Usage from Next.js App

The CV service is automatically integrated with the Next.js app through `/api/cv/detect`.

### Example: Analyze pattern in frontend

```typescript
import { useCVDetection } from '@/hooks/useCVDetection';

function MyComponent() {
  const { detectStitches, isLoading, result } = useCVDetection();

  const handleFileUpload = async (file: File) => {
    const detection = await detectStitches(file);
    console.log(`Detected ${detection?.total_stitches} stitches`);
  };

  return (
    <PatternAnalyzer onDetectionComplete={(total, url) => {
      console.log('Analysis complete:', total);
    }} />
  );
}
```

## 🔧 Environment Variables

Create `.env` file:

```env
PORT=8001
HOST=0.0.0.0
BACKEND_URL=http://localhost:3000
MAX_IMAGE_SIZE_MB=10
ALLOWED_EXTENSIONS=jpg,jpeg,png,webp
DEBUG=true
```

## 📊 API Endpoints

### Health Check
```bash
curl http://localhost:8001/api/health
```

### Detect Stitches
```bash
curl -X POST \
  -F "file=@pattern.jpg" \
  http://localhost:8001/api/detect
```

Response:
```json
{
  "success": true,
  "total_stitches": 4500,
  "colors": [
    {
      "color_hex": "#FF5733",
      "stitch_count": 0,
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

## 🐛 Troubleshooting

### Import errors
```bash
# Make sure you're in the cv-service directory
cd cv-service

# And venv is activated
source venv/bin/activate  # or venv\Scripts\activate on Windows
```

### Port already in use
```bash
# Change PORT in .env
PORT=8002
```

### OpenCV errors
```bash
# Reinstall OpenCV
pip uninstall opencv-python opencv-contrib-python
pip install opencv-python==4.10.0.84
```

## 🎯 Next Steps

- [ ] Train YOLOv8 model for better accuracy
- [ ] Add calibration endpoint
- [ ] Implement batch processing
- [ ] Add WebSocket support for real-time updates
- [ ] GPU acceleration

## 📚 More Info

See [README.md](README.md) for full documentation.
