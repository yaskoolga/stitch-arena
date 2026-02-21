/**
 * Stitch Counter Component
 * Upload work-in-progress photo and automatically count stitches with AI
 */

"use client";

import { useState, useRef } from "react";
import { Upload, Loader2, CheckCircle2, XCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCVDetection } from "@/hooks/useCVDetection";
import Image from "next/image";

interface StitchCounterProps {
  onCountComplete?: (
    data: {
      totalStitches: number;
      dailyStitches: number;
      aiDetected: number;
      aiConfidence: number;
      userCorrected: boolean;
    },
    photoFile: File
  ) => void;
  previousPhotoUrl?: string | null;
  calibrationData?: string | null;
}

export function StitchCounter({
  onCountComplete,
  previousPhotoUrl,
  calibrationData
}: StitchCounterProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previousFile, setPreviousFile] = useState<File | null>(null);
  const [manualCorrection, setManualCorrection] = useState<string>("");
  const [showManualInput, setShowManualInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { detectProgress, isLoading, result, error, reset } = useCVDetection();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    // If previousPhotoUrl provided, fetch it as File
    // For MVP, we'll skip this and require manual previous photo upload if needed
    const detectionResult = await detectProgress(
      selectedFile,
      previousFile,
      calibrationData
    );

    if (detectionResult) {
      // Auto-fill with AI result
      setManualCorrection(detectionResult.total_stitches.toString());
    }
  };

  const handleConfirm = () => {
    if (!result || !selectedFile) return;

    const finalCount = manualCorrection
      ? parseInt(manualCorrection, 10)
      : result.total_stitches;

    const userCorrected = manualCorrection !== result.total_stitches.toString();

    if (onCountComplete) {
      onCountComplete(
        {
          totalStitches: finalCount,
          dailyStitches: result.previous_stitches !== null
            ? finalCount - result.previous_stitches
            : finalCount,
          aiDetected: result.total_stitches,
          aiConfidence: result.confidence,
          userCorrected,
        },
        selectedFile
      );
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setPreviousFile(null);
    setManualCorrection("");
    setShowManualInput(false);
    reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Stitch Counter</CardTitle>
        <CardDescription>
          Upload a photo of your work-in-progress to automatically count stitches
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Upload */}
        <div className="space-y-2">
          <Label>Work Photo</Label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
            id="work-photo-upload"
          />
          <label htmlFor="work-photo-upload">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              <Upload className="mr-2 h-4 w-4" />
              {selectedFile ? "Change Photo" : "Upload Work Photo"}
            </Button>
          </label>
        </div>

        {/* Preview */}
        {previewUrl && (
          <div className="space-y-2">
            <div className="relative w-full h-64 bg-muted rounded-md overflow-hidden">
              <Image
                src={previewUrl}
                alt="Work preview"
                fill
                className="object-contain"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {selectedFile?.name} ({(selectedFile!.size / 1024).toFixed(1)} KB)
            </p>
          </div>
        )}

        {/* Analyze Button */}
        {selectedFile && !result && (
          <Button
            onClick={handleAnalyze}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Work...
              </>
            ) : (
              "Count Stitches"
            )}
          </Button>
        )}

        {/* Results */}
        {result && (
          <Card className="bg-muted/50">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div className="space-y-3 flex-1">
                  <p className="font-semibold">AI Detection Complete!</p>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 bg-background rounded-md">
                      <span className="text-muted-foreground block mb-1">Total Stitches</span>
                      <p className="text-2xl font-bold">{result.total_stitches.toLocaleString()}</p>
                    </div>
                    {result.previous_stitches !== null && (
                      <div className="p-3 bg-background rounded-md">
                        <span className="text-muted-foreground block mb-1">New Stitches</span>
                        <p className="text-2xl font-bold text-green-600">
                          +{result.daily_stitches.toLocaleString()}
                        </p>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">Confidence:</span>
                      <p className="font-medium">{(result.confidence * 100).toFixed(0)}%</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Processing Time:</span>
                      <p className="font-medium">{result.processing_time_ms.toFixed(0)}ms</p>
                    </div>
                  </div>

                  {/* Manual Correction */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        AI detected {result.total_stitches} stitches. Confirm or correct below:
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          type="number"
                          value={manualCorrection}
                          onChange={(e) => setManualCorrection(e.target.value)}
                          placeholder={result.total_stitches.toString()}
                          min={0}
                        />
                      </div>
                      <Button onClick={handleConfirm} className="min-w-[120px]">
                        {manualCorrection && manualCorrection !== result.total_stitches.toString()
                          ? "Confirm Correction"
                          : "Confirm AI Count"}
                      </Button>
                    </div>
                    {manualCorrection && manualCorrection !== result.total_stitches.toString() && (
                      <p className="text-xs text-orange-600">
                        You're correcting AI count from {result.total_stitches} to {manualCorrection}
                      </p>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                  >
                    Count Another Photo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {error && (
          <Card className="bg-destructive/10 border-destructive/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-semibold text-destructive">Analysis Failed</p>
                  <p className="text-sm text-muted-foreground mt-1">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    className="mt-2"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>💡 Tips for best results:</p>
          <ul className="list-disc list-inside space-y-0.5 ml-2">
            <li>Take a clear, well-lit photo of your work</li>
            <li>Ensure the canvas is flat and visible</li>
            <li>Try to keep the same angle/distance each day</li>
            <li>Higher resolution images work better</li>
            <li>Accepted formats: JPEG, PNG, WebP (max 10MB)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
