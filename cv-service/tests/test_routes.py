"""Tests for CV service routes"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from io import BytesIO
from PIL import Image
import numpy as np


client = TestClient(app)


def create_test_image(width=100, height=100, color=(255, 0, 0)):
    """Create a test image"""
    image = Image.new('RGB', (width, height), color)
    img_bytes = BytesIO()
    image.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    return img_bytes


def test_health_check():
    """Test health check endpoint"""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data


def test_root_endpoint():
    """Test root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "StitchArena CV Service"
    assert data["status"] == "running"


def test_detect_stitches_success():
    """Test successful stitch detection"""
    # Create a test image
    img_bytes = create_test_image()

    # Make request
    response = client.post(
        "/api/detect",
        files={"file": ("test.jpg", img_bytes, "image/jpeg")}
    )

    assert response.status_code == 200
    data = response.json()

    # Verify response structure
    assert data["success"] is True
    assert "total_stitches" in data
    assert "colors" in data
    assert "confidence" in data
    assert "processing_time_ms" in data
    assert "image_dimensions" in data

    # Verify data types
    assert isinstance(data["total_stitches"], int)
    assert isinstance(data["colors"], list)
    assert isinstance(data["confidence"], float)
    assert 0 <= data["confidence"] <= 1


def test_detect_stitches_invalid_file_type():
    """Test detection with invalid file type"""
    # Create a text file
    text_file = BytesIO(b"This is not an image")

    response = client.post(
        "/api/detect",
        files={"file": ("test.txt", text_file, "text/plain")}
    )

    assert response.status_code == 400
    assert "Invalid file type" in response.json()["detail"]


def test_detect_stitches_no_file():
    """Test detection without file"""
    response = client.post("/api/detect")
    assert response.status_code == 422  # Unprocessable Entity


def test_detect_stitches_large_image():
    """Test detection with larger image"""
    # Create a larger test image
    img_bytes = create_test_image(width=500, height=500)

    response = client.post(
        "/api/detect",
        files={"file": ("test_large.jpg", img_bytes, "image/jpeg")}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True


def test_detect_stitches_with_pattern():
    """Test detection with a grid-like pattern"""
    # Create an image with a simple grid pattern
    width, height = 200, 200
    image = Image.new('RGB', (width, height), (255, 255, 255))
    pixels = image.load()

    # Draw a simple grid
    for x in range(0, width, 20):
        for y in range(height):
            pixels[x, y] = (0, 0, 0)

    for y in range(0, height, 20):
        for x in range(width):
            pixels[x, y] = (0, 0, 0)

    img_bytes = BytesIO()
    image.save(img_bytes, format='JPEG')
    img_bytes.seek(0)

    response = client.post(
        "/api/detect",
        files={"file": ("pattern.jpg", img_bytes, "image/jpeg")}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["total_stitches"] > 0


def create_work_image(stitched_area_ratio=0.3):
    """
    Create a work-in-progress image

    Simulates a photo of actual embroidery work:
    - White/beige canvas background
    - Colored stitched regions
    """
    width, height = 300, 300
    image = Image.new('RGB', (width, height), (240, 235, 230))  # Beige canvas
    pixels = image.load()

    # Add some stitched regions (colored areas)
    stitched_width = int(width * stitched_area_ratio)
    for x in range(stitched_width):
        for y in range(height):
            # Random colored stitches
            color = (
                int(150 + 105 * (x / stitched_width)),
                int(50 + 100 * (y / height)),
                100
            )
            pixels[x, y] = color

    img_bytes = BytesIO()
    image.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    return img_bytes


# NEW TESTS FOR PROGRESS DETECTION

def test_detect_progress_without_previous():
    """Test progress detection with only current photo (first log)"""
    current_img = create_work_image(stitched_area_ratio=0.3)

    response = client.post(
        "/api/detect-progress",
        files={"current_photo": ("current.jpg", current_img, "image/jpeg")}
    )

    assert response.status_code == 200
    data = response.json()

    # Verify response structure
    assert data["success"] is True
    assert "total_stitches" in data
    assert "previous_stitches" in data
    assert "daily_stitches" in data
    assert "confidence" in data

    # First log: previous should be None, daily = total
    assert data["previous_stitches"] is None
    assert data["daily_stitches"] == data["total_stitches"]
    assert data["total_stitches"] > 0


def test_detect_progress_with_previous():
    """Test progress detection with comparison to previous photo"""
    # Create two images: previous (30% done) and current (50% done)
    previous_img = create_work_image(stitched_area_ratio=0.3)
    current_img = create_work_image(stitched_area_ratio=0.5)

    response = client.post(
        "/api/detect-progress",
        files={
            "current_photo": ("current.jpg", current_img, "image/jpeg"),
            "previous_photo": ("previous.jpg", previous_img, "image/jpeg")
        }
    )

    assert response.status_code == 200
    data = response.json()

    # Verify comparison worked
    assert data["success"] is True
    assert data["previous_stitches"] is not None
    assert data["total_stitches"] > data["previous_stitches"]
    assert data["daily_stitches"] > 0
    assert data["daily_stitches"] == data["total_stitches"] - data["previous_stitches"]


def test_detect_progress_with_calibration():
    """Test progress detection with calibration data"""
    current_img = create_work_image(stitched_area_ratio=0.4)

    calibration_json = '{"pixel_per_stitch": 15, "canvas_type": "aida14"}'

    response = client.post(
        "/api/detect-progress",
        files={"current_photo": ("current.jpg", current_img, "image/jpeg")},
        data={"calibration_data": calibration_json}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["total_stitches"] > 0


def test_detect_progress_invalid_file_type():
    """Test progress detection with invalid file type"""
    text_file = BytesIO(b"Not an image")

    response = client.post(
        "/api/detect-progress",
        files={"current_photo": ("test.txt", text_file, "text/plain")}
    )

    assert response.status_code == 400
    assert "Invalid file type" in response.json()["detail"]


def test_detect_progress_invalid_calibration_json():
    """Test progress detection with invalid calibration JSON"""
    current_img = create_work_image()

    response = client.post(
        "/api/detect-progress",
        files={"current_photo": ("current.jpg", current_img, "image/jpeg")},
        data={"calibration_data": "invalid json {"}
    )

    assert response.status_code == 400
    assert "Invalid JSON" in response.json()["detail"]


def test_detect_progress_confidence_score():
    """Test that confidence score is within valid range"""
    current_img = create_work_image()

    response = client.post(
        "/api/detect-progress",
        files={"current_photo": ("current.jpg", current_img, "image/jpeg")}
    )

    assert response.status_code == 200
    data = response.json()

    # Confidence should be between 0 and 1
    assert 0 <= data["confidence"] <= 1
