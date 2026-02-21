/**
 * Daily Log Form Component
 * Simple form for manual daily progress entry
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload } from "lucide-react";

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
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string>("");

  // Get default date (today)
  const today = new Date().toISOString().split('T')[0];

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
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
    } catch (error) {
      toast.error("Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData(e.currentTarget);
      const dailyStitches = Number(formData.get("dailyStitches"));
      const previousTotal = previousLog?.totalStitches || 0;
      const totalStitches = previousTotal + dailyStitches;

      const body = {
        date: formData.get("date"),
        dailyStitches,
        totalStitches,
        photoUrl: photoUrl || null,
        previousPhotoUrl: previousLog?.photoUrl || null,
        notes: formData.get("notes") || null,
        aiDetected: null,
        aiConfidence: null,
        userCorrected: false,
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
      <Card>
        <CardHeader>
          <CardTitle>Daily Progress</CardTitle>
          <CardDescription>
            Enter the number of stitches you completed today
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Date */}
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              defaultValue={today}
              required
            />
          </div>

          {/* Daily Stitches */}
          <div>
            <Label htmlFor="dailyStitches">Stitches completed today</Label>
            <Input
              id="dailyStitches"
              name="dailyStitches"
              type="number"
              min={0}
              required
              placeholder="e.g. 250"
            />
            {previousLog && (
              <p className="text-sm text-muted-foreground mt-1">
                Previous total: {previousLog.totalStitches.toLocaleString()} stitches
              </p>
            )}
          </div>

          {/* Photo Upload */}
          <div>
            <Label htmlFor="photo">Photo (optional)</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Upload a photo of your progress
            </p>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                onClick={() => document.getElementById('photo')?.click()}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                {uploading ? "Uploading..." : photoUrl ? "Change Photo" : "Choose Photo"}
              </Button>
              {photoUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setPhotoUrl("")}
                >
                  Remove
                </Button>
              )}
            </div>
            <input
              id="photo"
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={uploading}
              className="hidden"
            />
            {uploading && (
              <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </p>
            )}
            {photoUrl && (
              <div className="mt-3 relative aspect-video w-full max-w-sm overflow-hidden rounded-md border">
                <Image
                  src={photoUrl}
                  alt="Progress photo"
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Any thoughts about today's session..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={saving || uploading}
          className="flex-1"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            "Save Log"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={saving}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
