/**
 * Hook for CV work progress detection
 */

import { useState } from 'react';
import { toast } from 'sonner';

interface ProgressDetectionResult {
  success: boolean;
  total_stitches: number;
  previous_stitches: number | null;
  daily_stitches: number;
  confidence: number;
  processing_time_ms: number;
  image_dimensions: {
    width: number;
    height: number;
  };
  message?: string;
}

interface UseCVDetectionReturn {
  detectProgress: (
    currentPhoto: File,
    previousPhoto?: File | null,
    calibrationData?: string | null
  ) => Promise<ProgressDetectionResult | null>;
  isLoading: boolean;
  error: string | null;
  result: ProgressDetectionResult | null;
  reset: () => void;
}

export function useCVDetection(): UseCVDetectionReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProgressDetectionResult | null>(null);

  const detectProgress = async (
    currentPhoto: File,
    previousPhoto?: File | null,
    calibrationData?: string | null
  ): Promise<ProgressDetectionResult | null> => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Validate current photo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(currentPhoto.type)) {
        throw new Error('Invalid file type. Please upload JPEG, PNG, or WebP');
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (currentPhoto.size > maxSize) {
        throw new Error('File too large. Maximum size is 10MB');
      }

      // Validate previous photo if provided
      if (previousPhoto) {
        if (!allowedTypes.includes(previousPhoto.type)) {
          throw new Error('Invalid previous photo type');
        }
        if (previousPhoto.size > maxSize) {
          throw new Error('Previous photo too large');
        }
      }

      // Create form data
      const formData = new FormData();
      formData.append('currentPhoto', currentPhoto);
      if (previousPhoto) {
        formData.append('previousPhoto', previousPhoto);
      }
      if (calibrationData) {
        formData.append('calibrationData', calibrationData);
      }

      // Call API
      const response = await fetch('/api/cv/detect', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Detection failed');
      }

      const data: ProgressDetectionResult = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Detection failed');
      }

      setResult(data);

      // Show toast with appropriate message
      if (data.previous_stitches !== null) {
        toast.success(
          `Detected ${data.total_stitches.toLocaleString()} stitches (+${data.daily_stitches.toLocaleString()} new)`
        );
      } else {
        toast.success(`Detected ${data.total_stitches.toLocaleString()} stitches`);
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast.error(`Detection failed: ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setResult(null);
  };

  return {
    detectProgress,
    isLoading,
    error,
    result,
    reset,
  };
}
