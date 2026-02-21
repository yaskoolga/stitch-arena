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
  const [schemaImage, setSchemaImage] = useState(defaultValues?.schemaImage || "");
  const [uploading, setUploading] = useState<"cover" | "schema" | null>(null);
  const [useAutoCalc, setUseAutoCalc] = useState(false);
  const [manufacturer, setManufacturer] = useState(defaultValues?.manufacturer || "");
  const [showCustomManufacturer, setShowCustomManufacturer] = useState(
    defaultValues?.manufacturer && !MANUFACTURERS.includes(defaultValues.manufacturer)
  );
  const [themes, setThemes] = useState<string[]>(
    defaultValues?.themes ? JSON.parse(defaultValues.themes) : []
  );
  const isEdit = !!projectId;

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, type: "cover" | "schema") {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(type);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (res.ok) {
      const { url } = await res.json();
      if (type === "cover") {
        setCoverImage(url);
      } else {
        setSchemaImage(url);
      }
    }
    setUploading(null);
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
      initialStitches: form.get("initialStitches") ? Number(form.get("initialStitches")) : 0,
      width,
      height,
      canvasType: form.get("canvasType"),
      isPublic: form.get("isPublic") === "on",
      status: form.get("status") || undefined,
      coverImage: coverImage || null,
      schemaImage: schemaImage || null,
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
          {t("projects.fields.coverImage")}
        </p>
        <Input
          id="coverImage"
          type="file"
          accept="image/*"
          onChange={(e) => handleImageUpload(e, "cover")}
          className="mt-1"
        />
        {uploading === "cover" && <p className="text-sm text-muted-foreground mt-1">{t("common.loading")}</p>}
        {coverImage && (
          <div className="mt-2 relative aspect-video w-full max-w-xs overflow-hidden rounded-md border">
            <Image src={coverImage} alt="Cover photo" fill className="object-cover" />
          </div>
        )}
      </div>

      {/* Schema Image - Technical reference */}
      <div>
        <Label htmlFor="schemaImage">{t("projects.fields.schemaImage")}</Label>
        <p className="text-xs text-muted-foreground mb-2">
          {t("projects.fields.schemaImage")}
        </p>
        <Input
          id="schemaImage"
          type="file"
          accept="image/*"
          onChange={(e) => handleImageUpload(e, "schema")}
          className="mt-1"
        />
        {uploading === "schema" && <p className="text-sm text-muted-foreground mt-1">{t("common.loading")}</p>}
        {schemaImage && (
          <div className="mt-2 relative aspect-video w-full max-w-xs overflow-hidden rounded-md border">
            <Image src={schemaImage} alt="Pattern reference" fill className="object-cover" />
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
              <option value="">{t("projects.fields.manufacturer")}</option>
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
              placeholder={t("projects.fields.manufacturer")}
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
              {t("common.filter")}
            </Button>
          </div>
        )}
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
            Calculate from dimensions (width × height)
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

      {/* Initial Stitches - Already stitched before tracking */}
      <div>
        <Label htmlFor="initialStitches">{t("projects.fields.initialStitches")}</Label>
        <p className="text-xs text-muted-foreground mb-2">
          {t("projects.fields.initialStitchesHint")}
        </p>
        <Input
          id="initialStitches"
          name="initialStitches"
          type="number"
          min={0}
          defaultValue={defaultValues?.initialStitches || 0}
          placeholder="0"
        />
      </div>

      <div>
        <Label htmlFor="canvasType">{t("projects.fields.canvasType")}</Label>
        <Input id="canvasType" name="canvasType" placeholder={t("projects.fields.canvasType")} defaultValue={defaultValues?.canvasType} />
      </div>

      {/* Theme Tags */}
      <div>
        <Label>{t("projects.fields.themes")}</Label>
        <p className="text-xs text-muted-foreground mb-2">
          {t("projects.fields.themes")}
        </p>
        <ThemeTagsSelector value={themes} onChange={setThemes} />
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
      <Button type="submit" disabled={loading || uploading}>
        {loading ? t("common.loading") : isEdit ? t("projects.editProject") : t("projects.createProject")}
      </Button>
    </form>
  );
}
