"""API routes for CV service"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import JSONResponse
from app.models import (
    StitchDetectionResponse,
    ProgressDetectionResponse,
    ErrorResponse,
    HealthResponse
)
from app.inference import detector
from app import __version__
import logging
import json
from typing import Optional

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": __version__,
        "service": "cv-service"
    }


@router.post("/detect", response_model=StitchDetectionResponse)
async def detect_stitches(
    file: UploadFile = File(..., description="Cross-stitch pattern image")
):
    """
    Detect stitches in an uploaded pattern image

    Args:
        file: Image file (JPEG, PNG, WebP)

    Returns:
        Detection results with total stitches and color breakdown
    """
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_types)}"
        )

    # Read file
    try:
        contents = await file.read()

        # Validate file size (max 10MB)
        max_size = 10 * 1024 * 1024
        if len(contents) > max_size:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Maximum size: {max_size / (1024*1024)}MB"
            )

        logger.info(f"Processing image: {file.filename}, size: {len(contents)} bytes")

        # Detect stitches
        result = await detector.detect_stitches(contents)

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error processing image: {str(e)}"
        )


@router.post("/detect-progress", response_model=ProgressDetectionResponse)
async def detect_progress(
    current_photo: UploadFile = File(..., description="Current work-in-progress photo"),
    previous_photo: Optional[UploadFile] = File(None, description="Previous photo for comparison"),
    calibration_data: Optional[str] = Form(None, description="JSON calibration data")
):
    """
    Detect stitches on work-in-progress photo and calculate progress

    This is the main endpoint for daily tracking:
    - Counts stitches on current photo
    - Compares with previous photo (if provided)
    - Returns total stitches + daily increment

    Args:
        current_photo: Photo of current work
        previous_photo: Previous photo (optional)
        calibration_data: Project calibration settings (JSON)

    Returns:
        Detection results with total, previous, and daily stitches
    """
    # Validate file types
    allowed_types = ["image/jpeg", "image/png", "image/webp"]

    if current_photo.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type for current photo. Allowed: {', '.join(allowed_types)}"
        )

    if previous_photo and previous_photo.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type for previous photo. Allowed: {', '.join(allowed_types)}"
        )

    try:
        # Read current photo
        current_bytes = await current_photo.read()

        # Validate size
        max_size = 10 * 1024 * 1024
        if len(current_bytes) > max_size:
            raise HTTPException(
                status_code=400,
                detail=f"Current photo too large. Maximum size: {max_size / (1024*1024)}MB"
            )

        # Read previous photo if provided
        previous_bytes = None
        if previous_photo:
            previous_bytes = await previous_photo.read()
            if len(previous_bytes) > max_size:
                raise HTTPException(
                    status_code=400,
                    detail=f"Previous photo too large. Maximum size: {max_size / (1024*1024)}MB"
                )

        # Parse calibration data
        calibration = None
        if calibration_data:
            try:
                calibration = json.loads(calibration_data)
            except json.JSONDecodeError:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid JSON in calibration_data"
                )

        logger.info(
            f"Processing work photo: {current_photo.filename}, "
            f"has_previous: {previous_photo is not None}, "
            f"has_calibration: {calibration is not None}"
        )

        # Detect stitches with comparison
        result = await detector.detect_stitches_on_work(
            current_bytes,
            previous_bytes,
            calibration
        )

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing work photo: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error processing photo: {str(e)}"
        )


@router.post("/detect/advanced", response_model=StitchDetectionResponse)
async def detect_stitches_advanced(
    file: UploadFile = File(..., description="Cross-stitch pattern image"),
):
    """
    Advanced stitch detection with ML model (YOLOv8)

    Note: This endpoint is for future implementation with trained models
    For now, it falls back to the basic detection
    """
    # TODO: Implement YOLOv8-based detection
    # For now, use the same basic detection
    return await detect_stitches(file)
