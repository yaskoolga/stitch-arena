/**
 * Pattern Analyzer Component
 * Upload pattern image and automatically detect stitch count using CV service
 */

"use client";

import { useState, useRef } from "react";
import { Upload, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCVDetection } from "@/hooks/useCVDetection";
import Image from "next/image";

interface PatternAnalyzerProps {
  onDetectionComplete?: (totalStitches: number, imageUrl: string) => void;
}

export function PatternAnalyzer({ onDetectionComplete }: PatternAnalyzerProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { detectProgress, isLoading, result, error } = useCVDetection();

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

    const detectionResult = await detectProgress(selectedFile);

    if (detectionResult && onDetectionComplete && previewUrl) {
      onDetectionComplete(detectionResult.total_stitches, previewUrl);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pattern Analysis</CardTitle>
        <CardDescription>
          Upload your cross-stitch pattern to automatically detect total stitches using AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Upload */}
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
            id="pattern-upload"
          />
          <label htmlFor="pattern-upload">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              <Upload className="mr-2 h-4 w-4" />
              {selectedFile ? "Change Pattern" : "Upload Pattern Image"}
            </Button>
          </label>
        </div>

        {/* Preview */}
        {previewUrl && (
          <div className="space-y-2">
            <div className="relative w-full h-64 bg-muted rounded-md overflow-hidden">
              <Image
                src={previewUrl}
                alt="Pattern preview"
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
                Analyzing Pattern...
              </>
            ) : (
              "Analyze Pattern"
            )}
          </Button>
        )}

        {/* Results */}
        {result && (
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <div className="space-y-2 flex-1">
                  <p className="font-semibold">Detection Complete!</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Stitches:</span>
                      <p className="font-medium">{result.total_stitches.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Confidence:</span>
                      <p className="font-medium">{(result.confidence * 100).toFixed(0)}%</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Processing Time:</span>
                      <p className="font-medium">{result.processing_time_ms.toFixed(0)}ms</p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    className="mt-2"
                  >
                    Analyze Another Pattern
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
            <li>Use a clear, well-lit photo of your pattern</li>
            <li>Ensure the pattern is flat and fully visible</li>
            <li>Higher resolution images work better</li>
            <li>Accepted formats: JPEG, PNG, WebP (max 10MB)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
