/**
 * Daily Log Form Component
 * Simple form for manual daily progress entry
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload } from "lucide-react";
import { useCVDetection } from "@/hooks/useCVDetection";

interface DailyLogFormProps {
  projectId: string;
  previousLog?: {
    photoUrl: string | null;
    totalStitches: number;
  } | null;
  calibrationData?: string | null;
}

export function DailyLogForm({
  projectId,
  previousLog,
}: DailyLogFormProps) {
  const router = useRouter();
  const t = useTranslations();
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [dailyStitches, setDailyStitches] = useState<string>("");
  const [aiDetectedValue, setAiDetectedValue] = useState<number | null>(null);
  const [aiConfidenceValue, setAiConfidenceValue] = useState<number | null>(null);
  const [userCorrectedFlag, setUserCorrectedFlag] = useState(false);

  // CV Detection hook
  const { detectProgress, isLoading: isDetecting } = useCVDetection();

  // Get default date (today)
  const today = new Date().toISOString().split('T')[0];

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setPhotoFile(file);

    try {
      // Upload photo
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload photo");
      }

      const { url } = await res.json();
      setPhotoUrl(url);
      toast.success("Photo uploaded");

      // Trigger CV detection
      const previousPhotoFile = previousLog?.photoUrl
        ? await fetch(previousLog.photoUrl).then(r => r.blob()).then(blob => new File([blob], "previous.jpg", { type: blob.type }))
        : null;

      const result = await detectProgress(file, previousPhotoFile);

      if (result && result.success && result.confidence >= 0.5) {
        // Auto-apply AI result if confidence is high enough
        setDailyStitches(result.daily_stitches.toString());
        setAiDetectedValue(result.daily_stitches);
        setAiConfidenceValue(result.confidence);
        toast.success(
          `${t("projects.ai.detecting")} ${t("projects.ai.confidence", { percent: Math.round(result.confidence * 100) })}`
        );
      } else if (result && result.success) {
        // Low confidence - show warning
        toast.warning(t("projects.ai.lowConfidence"));
      } else {
        // Detection failed - fallback to manual
        toast.error(t("projects.ai.serviceError") + " - " + t("projects.ai.fallbackManual"));
      }
    } catch (error) {
      toast.error("Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const handleStitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDailyStitches(value);

    // If user modifies the AI-detected value, set userCorrected flag
    if (aiDetectedValue !== null && Number(value) !== aiDetectedValue) {
      setUserCorrectedFlag(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData(e.currentTarget);
      const stitchCount = Number(formData.get("dailyStitches"));
      const previousTotal = previousLog?.totalStitches || 0;
      const totalStitches = previousTotal + stitchCount;

      const body = {
        date: formData.get("date"),
        dailyStitches: stitchCount,
        totalStitches,
        photoUrl: photoUrl || null,
        previousPhotoUrl: previousLog?.photoUrl || null,
        notes: formData.get("notes") || null,
        aiDetected: aiDetectedValue,
        aiConfidence: aiConfidenceValue,
        userCorrected: userCorrectedFlag,
      };

      const res = await fetch(`/api/projects/${projectId}/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save log");
      }

      toast.success("Daily log saved!");
      router.push(`/projects/${projectId}`);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to save log");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* AI Detection Info Banner */}
      <Card className="border-primary/50 bg-primary/5">
        <CardContent className="pt-4 pb-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg">🤖</span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <p className="font-medium text-sm">{t("projects.ai.howItWorks.title")}</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• {t("projects.ai.howItWorks.step1")}</li>
                <li>• {t("projects.ai.howItWorks.step2")}</li>
                <li>• {t("projects.ai.howItWorks.step3")}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("logs.addDailyLog")}</CardTitle>
          <CardDescription>
            {t("projects.ai.formDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Date */}
          <div>
            <Label htmlFor="date">{t("logs.fields.date")}</Label>
            <Input
              id="date"
              name="date"
              type="date"
              defaultValue={today}
              required
            />
          </div>

          {/* Photo Upload */}
          <div>
            <Label htmlFor="photo">{t("projects.ai.uploadPhoto")}</Label>
            <p className="text-xs text-muted-foreground mb-2">
              {t("projects.ai.uploadPhotoHint")}
            </p>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={uploading || isDetecting}
                onClick={() => document.getElementById('photo')?.click()}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                {uploading || isDetecting
                  ? t("projects.ai.processing")
                  : photoUrl
                  ? t("projects.ai.changePhoto")
                  : t("projects.ai.choosePhoto")}
              </Button>
              {photoUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setPhotoUrl("")}
                >
                  {t("common.remove")}
                </Button>
              )}
            </div>
            <input
              id="photo"
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={uploading || isDetecting}
              className="hidden"
            />
            {(uploading || isDetecting) && (
              <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {uploading ? t("common.uploading") : t("projects.ai.detecting")}
              </p>
            )}
            {photoUrl && (
              <div className="mt-3 relative aspect-video w-full max-w-sm overflow-hidden rounded-md border">
                <Image
                  src={photoUrl}
                  alt={t("logs.fields.progressPhotoAlt")}
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>

          {/* Daily Stitches */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Label htmlFor="dailyStitches">{t("logs.fields.stitchesCompleted")}</Label>
              {isDetecting && (
                <Badge variant="secondary" className="gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {t("projects.ai.detecting")}
                </Badge>
              )}
              {aiConfidenceValue !== null && !isDetecting && (
                <Badge
                  variant={
                    aiConfidenceValue >= 0.8
                      ? "default"
                      : aiConfidenceValue >= 0.5
                      ? "secondary"
                      : "destructive"
                  }
                  className="gap-1"
                >
                  🤖 {t("projects.ai.confidence", { percent: Math.round(aiConfidenceValue * 100) })}
                </Badge>
              )}
              {userCorrectedFlag && (
                <Badge variant="outline" className="gap-1">
                  ✏️ {t("projects.ai.corrected")}
                </Badge>
              )}
            </div>
            <Input
              id="dailyStitches"
              name="dailyStitches"
              type="number"
              min={0}
              required
              placeholder={t("logs.fields.stitchesPlaceholder")}
              value={dailyStitches}
              onChange={handleStitchChange}
            />
            {previousLog && (
              <p className="text-sm text-muted-foreground mt-1">
                {t("logs.fields.previousTotal", {
                  count: previousLog.totalStitches.toLocaleString()
                })}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">{t("logs.fields.notes")} ({t("common.optional")})</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder={t("logs.fields.notesPlaceholder")}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={saving || uploading || isDetecting}
          className="flex-1"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              {t("common.saving")}
            </>
          ) : (
            t("logs.saveLog")
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={saving || isDetecting}
        >
          {t("common.cancel")}
        </Button>
      </div>
    </form>
  );
}
