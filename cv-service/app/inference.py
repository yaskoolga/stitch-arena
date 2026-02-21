"""Computer Vision inference for cross-stitch detection"""

import cv2
import numpy as np
from PIL import Image
from typing import Tuple, List, Dict
import time
from io import BytesIO


class StitchDetector:
    """Detects cross-stitches in embroidery work-in-progress images"""

    def __init__(self):
        self.min_confidence = 0.5

    async def detect_stitches_on_work(
        self,
        current_image_bytes: bytes,
        previous_image_bytes: bytes = None,
        calibration_data: Dict = None
    ) -> Dict:
        """
        Detect stitches in the uploaded work-in-progress photo

        Args:
            current_image_bytes: Current photo of the work
            previous_image_bytes: Previous photo (optional, for comparison)
            calibration_data: Per-project calibration settings (canvas type, etc.)

        Returns:
            Dictionary with detection results including total stitches and difference
        """
        start_time = time.time()

        # Load current image
        current_image = self._load_image(current_image_bytes)
        height, width = current_image.shape[:2]

        # Count stitches on current photo
        total_stitches, confidence = await self._count_stitches_on_work(
            current_image,
            calibration_data
        )

        # If previous photo provided, calculate difference
        daily_stitches = 0
        previous_total = 0

        if previous_image_bytes:
            previous_image = self._load_image(previous_image_bytes)
            previous_total, _ = await self._count_stitches_on_work(
                previous_image,
                calibration_data
            )
            daily_stitches = total_stitches - previous_total

        processing_time = (time.time() - start_time) * 1000

        return {
            "success": True,
            "total_stitches": total_stitches,
            "previous_stitches": previous_total if previous_image_bytes else None,
            "daily_stitches": daily_stitches if previous_image_bytes else total_stitches,
            "confidence": confidence,
            "processing_time_ms": round(processing_time, 2),
            "image_dimensions": {"width": width, "height": height}
        }

    async def detect_stitches(self, image_bytes: bytes) -> Dict:
        """
        Detect stitches in the uploaded pattern image

        Args:
            image_bytes: Raw image bytes

        Returns:
            Dictionary with detection results
        """
        start_time = time.time()

        # Load image
        image = self._load_image(image_bytes)
        height, width = image.shape[:2]

        # Detect stitches (basic implementation using grid detection)
        total_stitches, colors = await self._detect_grid_stitches(image)

        processing_time = (time.time() - start_time) * 1000

        return {
            "success": True,
            "total_stitches": total_stitches,
            "colors": colors,
            "confidence": 0.85,  # Will be calculated based on detection quality
            "processing_time_ms": round(processing_time, 2),
            "image_dimensions": {"width": width, "height": height}
        }

    def _load_image(self, image_bytes: bytes) -> np.ndarray:
        """Load image from bytes"""
        image = Image.open(BytesIO(image_bytes))
        image_rgb = image.convert('RGB')
        return cv2.cvtColor(np.array(image_rgb), cv2.COLOR_RGB2BGR)

    async def _detect_grid_stitches(self, image: np.ndarray) -> Tuple[int, List[Dict]]:
        """
        Detect stitches using grid-based approach

        This is a basic implementation that:
        1. Detects dominant colors in the image
        2. Estimates grid size
        3. Counts cells in the grid

        For production, this should be replaced with a trained ML model (YOLOv8)
        """
        # Convert to different color spaces for better color detection
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

        # Detect dominant colors
        colors_info = self._detect_colors(image)

        # Estimate grid and count stitches
        # This is a simplified version - in reality, you'd want to:
        # 1. Detect grid lines
        # 2. Count cells
        # 3. Classify each cell by color

        # For now, we'll estimate based on image size and detected colors
        estimated_stitches = self._estimate_stitch_count(image, len(colors_info))

        return estimated_stitches, colors_info

    async def _count_stitches_on_work(
        self,
        image: np.ndarray,
        calibration_data: Dict = None
    ) -> Tuple[int, float]:
        """
        Count stitches on work-in-progress photo

        This method detects filled stitches (not empty grid cells)
        Different from pattern analysis - focuses on actual embroidered work

        Args:
            image: Input image (BGR)
            calibration_data: Calibration info (canvas type, pixel-to-stitch ratio, etc.)

        Returns:
            Tuple of (stitch_count, confidence)
        """
        # Get calibration parameters
        pixel_per_stitch = self._get_calibration_ratio(image, calibration_data)

        # Convert to HSV for better color segmentation
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Detect filled areas (stitched regions) vs empty canvas
        # Strategy:
        # 1. Detect canvas color (usually white/beige/gray)
        # 2. Segment filled stitches vs empty canvas
        # 3. Count stitch regions

        canvas_color = self._detect_canvas_color(image)
        filled_mask = self._segment_stitched_regions(image, canvas_color)

        # Count stitches based on filled regions
        stitch_count = self._count_from_mask(filled_mask, pixel_per_stitch)

        # Calculate confidence based on detection quality
        confidence = self._calculate_confidence(filled_mask, image)

        return stitch_count, confidence

    def _get_calibration_ratio(self, image: np.ndarray, calibration_data: Dict) -> float:
        """
        Get pixel-to-stitch ratio from calibration or estimate

        Args:
            image: Input image
            calibration_data: Calibration settings

        Returns:
            Pixels per stitch (average)
        """
        if calibration_data and "pixel_per_stitch" in calibration_data:
            return calibration_data["pixel_per_stitch"]

        # Default estimation based on image size
        # Typical cross-stitch photos: 10-30 pixels per stitch
        # This is a rough estimate
        height, width = image.shape[:2]

        # Assume typical work is 50-200 stitches wide
        # Estimate based on image width
        estimated_stitches_wide = 100  # Default assumption
        pixel_per_stitch = width / estimated_stitches_wide

        return max(5, min(pixel_per_stitch, 50))  # Clamp to reasonable range

    def _detect_canvas_color(self, image: np.ndarray) -> np.ndarray:
        """
        Detect the dominant canvas color (usually background)

        Canvas is typically white, cream, beige, or light gray
        """
        # Sample corners (canvas is usually visible at edges)
        h, w = image.shape[:2]
        margin = min(h, w) // 10

        corners = [
            image[0:margin, 0:margin],
            image[0:margin, w-margin:w],
            image[h-margin:h, 0:margin],
            image[h-margin:h, w-margin:w]
        ]

        corner_pixels = np.vstack([corner.reshape(-1, 3) for corner in corners])
        canvas_color = np.median(corner_pixels, axis=0).astype(np.uint8)

        return canvas_color

    def _segment_stitched_regions(self, image: np.ndarray, canvas_color: np.ndarray) -> np.ndarray:
        """
        Segment stitched regions from canvas background

        Returns binary mask where 1 = stitched, 0 = canvas
        """
        # Calculate color distance from canvas
        diff = np.linalg.norm(image.astype(float) - canvas_color.astype(float), axis=2)

        # Threshold: areas significantly different from canvas are stitches
        threshold = 30  # Adjustable sensitivity
        stitched_mask = (diff > threshold).astype(np.uint8)

        # Clean up noise with morphological operations
        kernel = np.ones((3, 3), np.uint8)
        stitched_mask = cv2.morphologyEx(stitched_mask, cv2.MORPH_CLOSE, kernel)
        stitched_mask = cv2.morphologyEx(stitched_mask, cv2.MORPH_OPEN, kernel)

        return stitched_mask

    def _count_from_mask(self, mask: np.ndarray, pixel_per_stitch: float) -> int:
        """
        Count stitches from binary mask

        Args:
            mask: Binary mask (1 = stitched, 0 = canvas)
            pixel_per_stitch: Calibration ratio

        Returns:
            Estimated stitch count
        """
        # Count filled pixels
        filled_pixels = np.sum(mask)

        # Each stitch occupies approximately pixel_per_stitch^2 pixels
        pixels_per_stitch = pixel_per_stitch * pixel_per_stitch

        stitch_count = int(filled_pixels / pixels_per_stitch)

        return max(0, stitch_count)

    def _calculate_confidence(self, mask: np.ndarray, image: np.ndarray) -> float:
        """
        Calculate confidence score for detection

        Based on:
        - Image quality (sharpness, lighting)
        - Segmentation quality
        - Grid visibility
        """
        # Simple confidence metric: ratio of segmented area
        h, w = mask.shape
        total_pixels = h * w
        filled_pixels = np.sum(mask)
        fill_ratio = filled_pixels / total_pixels

        # Confidence based on fill ratio
        # Too low (<1%) or too high (>95%) suggests detection issues
        if fill_ratio < 0.01 or fill_ratio > 0.95:
            confidence = 0.5
        else:
            confidence = 0.85  # Default good confidence

        # Could add more sophisticated checks:
        # - Image sharpness (Laplacian variance)
        # - Lighting uniformity
        # - Grid regularity

        return confidence

    def _detect_colors(self, image: np.ndarray, max_colors: int = 10) -> List[Dict]:
        """
        Detect dominant colors in the image using K-means clustering
        """
        # Reshape image to be a list of pixels
        pixels = image.reshape(-1, 3)
        pixels = np.float32(pixels)

        # Determine number of clusters (colors)
        n_colors = min(max_colors, len(np.unique(pixels, axis=0)))
        n_colors = max(2, n_colors)  # At least 2 colors

        # K-means clustering
        criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 100, 0.2)
        _, labels, centers = cv2.kmeans(
            pixels, n_colors, None, criteria, 10, cv2.KMEANS_PP_CENTERS
        )

        # Count pixels per color
        unique, counts = np.unique(labels, return_counts=True)
        total_pixels = len(labels)

        # Convert to color info
        colors = []
        for i, (label, count) in enumerate(zip(unique, counts)):
            color_bgr = centers[label].astype(int)
            color_hex = "#{:02x}{:02x}{:02x}".format(
                int(color_bgr[2]), int(color_bgr[1]), int(color_bgr[0])
            )
            percentage = (count / total_pixels) * 100

            colors.append({
                "color_hex": color_hex,
                "stitch_count": 0,  # Will be calculated
                "percentage": round(percentage, 2)
            })

        # Sort by percentage (descending)
        colors.sort(key=lambda x: x['percentage'], reverse=True)

        return colors[:max_colors]

    def _estimate_stitch_count(self, image: np.ndarray, num_colors: int) -> int:
        """
        Estimate total stitch count based on image analysis

        This is a placeholder implementation. In production:
        - Use actual grid detection
        - Count individual cells
        - Or use a trained model
        """
        height, width = image.shape[:2]

        # Assume a typical cross-stitch pattern has ~10-20 stitches per inch
        # and typical patterns are 100-300 stitches wide
        # This is a VERY rough estimate

        # Detect if image has a visible grid
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 50, 150)

        # Count potential grid lines
        lines = cv2.HoughLinesP(edges, 1, np.pi/180, 50, minLineLength=50, maxLineGap=10)

        if lines is not None and len(lines) > 10:
            # Grid detected - estimate based on grid
            # This is still simplified
            avg_spacing = self._estimate_grid_spacing(lines, width, height)
            if avg_spacing > 0:
                estimated_stitches = int((width / avg_spacing) * (height / avg_spacing))
            else:
                estimated_stitches = int(width * height / 100)  # Fallback
        else:
            # No clear grid - use color-based estimation
            # More colors usually means more complex pattern
            estimated_stitches = int(width * height / (200 / num_colors))

        # Clamp to reasonable values
        return max(100, min(estimated_stitches, 100000))

    def _estimate_grid_spacing(self, lines: np.ndarray, width: int, height: int) -> float:
        """Estimate average grid spacing from detected lines"""
        if lines is None or len(lines) == 0:
            return 0

        # Separate horizontal and vertical lines
        horizontal_lines = []
        vertical_lines = []

        for line in lines:
            x1, y1, x2, y2 = line[0]
            angle = np.abs(np.arctan2(y2 - y1, x2 - x1) * 180 / np.pi)

            if angle < 45 or angle > 135:
                horizontal_lines.append(y1)
            else:
                vertical_lines.append(x1)

        # Calculate average spacing
        spacings = []

        if len(horizontal_lines) > 1:
            horizontal_lines.sort()
            spacings.extend(np.diff(horizontal_lines))

        if len(vertical_lines) > 1:
            vertical_lines.sort()
            spacings.extend(np.diff(vertical_lines))

        if spacings:
            # Remove outliers and calculate median
            spacings = np.array(spacings)
            median_spacing = np.median(spacings)
            filtered = spacings[spacings < median_spacing * 2]
            return float(np.mean(filtered)) if len(filtered) > 0 else 0

        return 0


# Global detector instance
detector = StitchDetector()
