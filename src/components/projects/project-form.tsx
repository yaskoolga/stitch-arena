"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ThemeTagsSelector } from "./theme-tags-selector";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload } from "lucide-react";
import { useCVDetection } from "@/hooks/useCVDetection";

interface ProjectFormProps {
  defaultValues?: {
    title?: string;
    description?: string;
    manufacturer?: string;
    totalStitches?: number;
    initialStitches?: number;
    width?: number;
    height?: number;
    canvasType?: string;
    isPublic?: boolean;
    status?: string;
    coverImage?: string | null;    // Cover photo from package
    schemaImage?: string | null;   // Technical pattern reference
    themes?: string;
  };
  projectId?: string;
}

// Popular manufacturers list
const MANUFACTURERS = [
  "Dimensions",
  "DMC",
  "Anchor",
  "Bucilla",
  "Janlynn",
  "Mill Hill",
  "RIOLIS",
  "Heritage Crafts",
  "Vervaco",
  "Lanarte",
  "Panna",
  "Русская сказка",
  "Алиса",
  "Чудесная игла",
  "Other"
];

export function ProjectForm({ defaultValues, projectId }: ProjectFormProps) {
  const t = useTranslations();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [coverImage, setCoverImage] = useState(defaultValues?.coverImage || "");
  const [uploading, setUploading] = useState(false);
  const [useAutoCalc, setUseAutoCalc] = useState(false);
  const [manufacturer, setManufacturer] = useState(defaultValues?.manufacturer || "");
  const [showCustomManufacturer, setShowCustomManufacturer] = useState(
    defaultValues?.manufacturer && !MANUFACTURERS.includes(defaultValues.manufacturer)
  );
  const [themes, setThemes] = useState<string[]>(
    defaultValues?.themes ? JSON.parse(defaultValues.themes) : []
  );
  const isEdit = !!projectId;

  // AI Detection for initial stitches
  const { detectProgress, isLoading: isDetecting } = useCVDetection();
  const [initialPhotoUrl, setInitialPhotoUrl] = useState<string>("");
  const [uploadingInitialPhoto, setUploadingInitialPhoto] = useState(false);
  const [initialStitches, setInitialStitches] = useState<string>(
    defaultValues?.initialStitches?.toString() || "0"
  );
  const [aiDetectedInitial, setAiDetectedInitial] = useState<number | null>(null);
  const [aiConfidenceInitial, setAiConfidenceInitial] = useState<number | null>(null);
  const [userCorrectedInitial, setUserCorrectedInitial] = useState(false);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (res.ok) {
      const { url } = await res.json();
      setCoverImage(url);
    }
    setUploading(false);
  }

  async function handleInitialPhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingInitialPhoto(true);

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
      setInitialPhotoUrl(url);
      toast.success(t("common.uploading"));

      // Trigger CV detection (no previous photo for initial state)
      const result = await detectProgress(file, null);

      if (result && result.success && result.confidence >= 0.5) {
        // Auto-apply AI result if confidence is high enough
        setInitialStitches(result.total_stitches.toString());
        setAiDetectedInitial(result.total_stitches);
        setAiConfidenceInitial(result.confidence);
        toast.success(
          `${t("projects.ai.detecting")} ${t("projects.ai.confidence", { percent: Math.round(result.confidence * 100) })}`
        );
      } else if (result && result.success) {
        // Low confidence - show warning but still set values
        setInitialStitches(result.total_stitches.toString());
        setAiDetectedInitial(result.total_stitches);
        setAiConfidenceInitial(result.confidence);
        toast.warning(t("projects.ai.lowConfidence"));
      } else {
        // Detection failed - allow manual entry
        toast.error(t("projects.ai.serviceError") + " - " + t("projects.ai.fallbackManual"));
      }
    } catch (error) {
      toast.error("Failed to upload photo");
    } finally {
      setUploadingInitialPhoto(false);
    }
  }

  function handleInitialStitchesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setInitialStitches(value);

    // If user modifies AI-detected value, set userCorrected flag
    if (aiDetectedInitial !== null && Number(value) !== aiDetectedInitial) {
      setUserCorrectedInitial(true);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const width = form.get("width") ? Number(form.get("width")) : null;
    const height = form.get("height") ? Number(form.get("height")) : null;
    const manualTotal = form.get("totalStitches") ? Number(form.get("totalStitches")) : null;

    // Calculate totalStitches
    let totalStitches = manualTotal;
    if (useAutoCalc && width && height) {
      totalStitches = width * height;
    }

    const body = {
      title: form.get("title"),
      description: form.get("description"),
      manufacturer: manufacturer || null,
      totalStitches,
      initialStitches: initialStitches ? Number(initialStitches) : 0,
      initialPhotoUrl: initialPhotoUrl || null,
      aiDetectedInitial: aiDetectedInitial,
      aiConfidenceInitial: aiConfidenceInitial,
      userCorrectedInitial: userCorrectedInitial,
      width,
      height,
      canvasType: form.get("canvasType"),
      isPublic: form.get("isPublic") === "on",
      status: form.get("status") || undefined,
      coverImage: coverImage || null,
      themes,
    };

    const res = await fetch(
      isEdit ? `/api/projects/${projectId}` : "/api/projects",
      {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    if (res.ok) {
      const project = await res.json();
      toast.success(isEdit ? t("toast.success.projectUpdated") : t("toast.success.projectCreated"));
      router.push(`/projects/${project.id || projectId}`);
      router.refresh();
    } else {
      toast.error(t("toast.error.generic"));
    }
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-lg">
      {/* Cover Image - Photo from package */}
      <div>
        <Label htmlFor="coverImage">{t("projects.fields.coverImage")} 📸</Label>
        <p className="text-xs text-muted-foreground mb-2">
          {t("projects.fields.coverImageHint")}
        </p>
        <Input
          id="coverImage"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="mt-1"
        />
        {uploading && <p className="text-sm text-muted-foreground mt-1">{t("common.loading")}</p>}
        {coverImage && (
          <div className="mt-2 relative aspect-video w-full max-w-xs overflow-hidden rounded-md border">
            <Image src={coverImage} alt="Cover photo" fill className="object-cover" />
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="title">{t("projects.fields.title")}</Label>
        <Input id="title" name="title" required defaultValue={defaultValues?.title} />
      </div>

      <div>
        <Label htmlFor="description">{t("projects.fields.description")}</Label>
        <Textarea id="description" name="description" defaultValue={defaultValues?.description} />
      </div>

      {/* Manufacturer */}
      <div>
        <Label htmlFor="manufacturer">{t("projects.fields.manufacturer")}</Label>
        {!showCustomManufacturer ? (
          <div className="space-y-2">
            <select
              id="manufacturer"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={manufacturer}
              onChange={(e) => {
                if (e.target.value === "Other") {
                  setShowCustomManufacturer(true);
                  setManufacturer("");
                } else {
                  setManufacturer(e.target.value);
                }
              }}
            >
              <option value="">{t("projects.fields.manufacturerPlaceholder")}</option>
              {MANUFACTURERS.map((m) => (
                <option key={m} value={m === "Other" ? "" : m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="space-y-2">
            <Input
              id="customManufacturer"
              placeholder={t("projects.fields.manufacturerPlaceholder")}
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowCustomManufacturer(false);
                setManufacturer("");
              }}
            >
              {t("common.back")}
            </Button>
          </div>
        )}
      </div>

      {/* Theme Tags */}
      <div>
        <Label>{t("projects.fields.themes")}</Label>
        <p className="text-xs text-muted-foreground mb-2">
          {t("projects.fields.themesHint")}
        </p>
        <ThemeTagsSelector value={themes} onChange={setThemes} />
      </div>

      {/* Total Stitches Section */}
      <div className="space-y-3 p-4 border rounded-md bg-muted/20">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="useAutoCalc"
            checked={useAutoCalc}
            onChange={(e) => setUseAutoCalc(e.target.checked)}
          />
          <Label htmlFor="useAutoCalc" className="cursor-pointer">
            {t("projects.fields.calculateFromDimensions")}
          </Label>
        </div>

        {useAutoCalc ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="width">{t("projects.fields.width")}</Label>
              <Input id="width" name="width" type="number" min={1} defaultValue={defaultValues?.width} />
            </div>
            <div>
              <Label htmlFor="height">{t("projects.fields.height")}</Label>
              <Input id="height" name="height" type="number" min={1} defaultValue={defaultValues?.height} />
            </div>
          </div>
        ) : (
          <div>
            <Label htmlFor="totalStitches">{t("projects.fields.totalStitches")}</Label>
            <Input id="totalStitches" name="totalStitches" type="number" min={1} required={!useAutoCalc} defaultValue={defaultValues?.totalStitches} />
          </div>
        )}
      </div>

      {/* Canvas Type */}
      <div>
        <Label htmlFor="canvasType">{t("projects.fields.canvasType")}</Label>
        <Input id="canvasType" name="canvasType" placeholder={t("projects.fields.canvasTypePlaceholder")} defaultValue={defaultValues?.canvasType} />
      </div>

      {/* Initial Stitches - Already stitched before tracking with AI detection */}
      <div className="space-y-3 p-4 border rounded-md bg-primary/5">
        <div>
          <Label htmlFor="initialStitches">{t("projects.fields.initialStitches")} 🤖</Label>
          <div className="text-xs text-muted-foreground mb-2 space-y-1">
            <p>{t("projects.fields.initialStitchesHint")}</p>
            <p className="font-medium text-primary">ℹ️ {t("projects.fields.initialStitchesExplanation")}</p>
          </div>
        </div>

        {/* AI Photo Upload */}
        <div>
          <Label htmlFor="initialPhoto">{t("projects.ai.uploadPhoto")} ({t("common.optional")})</Label>
          <p className="text-xs text-muted-foreground mb-2">
            {t("projects.ai.uploadPhotoHintInitial")}
          </p>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={uploadingInitialPhoto || isDetecting}
              onClick={() => document.getElementById('initialPhoto')?.click()}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              {uploadingInitialPhoto || isDetecting
                ? t("projects.ai.processing")
                : initialPhotoUrl
                ? t("projects.ai.changePhoto")
                : t("projects.ai.choosePhoto")}
            </Button>
            {initialPhotoUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setInitialPhotoUrl("");
                  setAiDetectedInitial(null);
                  setAiConfidenceInitial(null);
                  setUserCorrectedInitial(false);
                }}
              >
                {t("common.remove")}
              </Button>
            )}
          </div>
          <input
            id="initialPhoto"
            type="file"
            accept="image/*"
            onChange={handleInitialPhotoUpload}
            disabled={uploadingInitialPhoto || isDetecting}
            className="hidden"
          />
          {(uploadingInitialPhoto || isDetecting) && (
            <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {uploadingInitialPhoto ? t("common.uploading") : t("projects.ai.detecting")}
            </p>
          )}
          {initialPhotoUrl && (
            <div className="mt-3 relative aspect-video w-full max-w-sm overflow-hidden rounded-md border">
              <Image
                src={initialPhotoUrl}
                alt="Initial progress photo"
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>

        {/* Initial Stitches Input with AI badges */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Label htmlFor="initialStitches">{t("projects.fields.initialStitches")}</Label>
            {isDetecting && (
              <Badge variant="secondary" className="gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                {t("projects.ai.detecting")}
              </Badge>
            )}
            {aiConfidenceInitial !== null && !isDetecting && (
              <Badge
                variant={
                  aiConfidenceInitial >= 0.8
                    ? "default"
                    : aiConfidenceInitial >= 0.5
                    ? "secondary"
                    : "destructive"
                }
                className="gap-1"
              >
                🤖 {t("projects.ai.confidence", { percent: Math.round(aiConfidenceInitial * 100) })}
              </Badge>
            )}
            {userCorrectedInitial && (
              <Badge variant="outline" className="gap-1">
                ✏️ {t("projects.ai.corrected")}
              </Badge>
            )}
          </div>
          <Input
            id="initialStitches"
            name="initialStitches"
            type="number"
            min={0}
            placeholder="0"
            value={initialStitches}
            onChange={handleInitialStitchesChange}
          />
        </div>
      </div>
      {isEdit && (
        <div>
          <Label htmlFor="status">{t("projects.fields.status")}</Label>
          <select id="status" name="status" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" defaultValue={defaultValues?.status}>
            <option value="in_progress">{t("projects.status.inProgress")}</option>
            <option value="completed">{t("projects.status.completed")}</option>
            <option value="paused">{t("projects.status.paused")}</option>
          </select>
        </div>
      )}
      <div className="flex items-center gap-2">
        <input type="checkbox" id="isPublic" name="isPublic" defaultChecked={defaultValues?.isPublic} />
        <Label htmlFor="isPublic">{t("projects.fields.isPublic")}</Label>
      </div>
      <Button type="submit" disabled={loading || !!uploading}>
        {loading ? t("common.loading") : isEdit ? t("projects.editProject") : t("projects.createProject")}
      </Button>
    </form>
  );
}
