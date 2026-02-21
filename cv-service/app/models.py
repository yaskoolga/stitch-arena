"""Pydantic models for CV service API"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict


class ColorInfo(BaseModel):
    """Information about detected color in the pattern"""
    color_hex: str = Field(..., description="Hex color code")
    stitch_count: int = Field(..., description="Number of stitches of this color")
    percentage: float = Field(..., description="Percentage of total stitches")


class StitchDetectionResponse(BaseModel):
    """Response from stitch detection endpoint (legacy pattern analysis)"""
    success: bool
    total_stitches: int = Field(..., description="Total number of detected stitches")
    colors: List[ColorInfo] = Field(default_factory=list, description="Color breakdown")
    confidence: float = Field(..., ge=0, le=1, description="Detection confidence score")
    processing_time_ms: float = Field(..., description="Processing time in milliseconds")
    image_dimensions: Dict[str, int] = Field(..., description="Original image width and height")
    message: Optional[str] = None


class ProgressDetectionResponse(BaseModel):
    """Response from progress detection endpoint (work-in-progress tracking)"""
    success: bool
    total_stitches: int = Field(..., description="Total stitches detected on current photo")
    previous_stitches: Optional[int] = Field(None, description="Total stitches on previous photo")
    daily_stitches: int = Field(..., description="New stitches since previous photo")
    confidence: float = Field(..., ge=0, le=1, description="Detection confidence score")
    processing_time_ms: float = Field(..., description="Processing time in milliseconds")
    image_dimensions: Dict[str, int] = Field(..., description="Current image width and height")
    message: Optional[str] = None


class ErrorResponse(BaseModel):
    """Error response model"""
    success: bool = False
    error: str
    details: Optional[str] = None


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    version: str
    service: str = "cv-service"
