import { z } from "zod";
import { PROJECT_THEMES, MAX_THEMES_PER_PROJECT } from "./constants";

export const registerSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().optional(),
});

export const projectCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional().nullable(),
  manufacturer: z.string().max(100).optional().nullable(),
  totalStitches: z.coerce.number().int().positive("Must be a positive number"),
  width: z.coerce.number().int().positive().optional().nullable(),
  height: z.coerce.number().int().positive().optional().nullable(),
  canvasType: z.string().max(100).optional().nullable(),
  calibrationData: z.string().optional().nullable(), // JSON string
  isPublic: z.boolean().optional().default(false),
  coverImage: z.string().optional().nullable(),     // Cover photo from package (for cards)
  schemaImage: z.string().optional().nullable(),    // Technical pattern reference
  themes: z.array(z.enum(PROJECT_THEMES as unknown as [string, ...string[]]))
    .max(MAX_THEMES_PER_PROJECT, `Maximum ${MAX_THEMES_PER_PROJECT} themes allowed`)
    .optional()
    .default([]),
}).refine(
  (data) => {
    // If width and height provided, totalStitches should match or be calculated
    if (data.width && data.height) {
      const calculated = data.width * data.height;
      // Allow totalStitches to be either provided or calculated
      return true;
    }
    return true;
  },
  { message: "Invalid dimensions" }
);

export const projectUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  manufacturer: z.string().max(100).optional().nullable(),
  totalStitches: z.coerce.number().int().positive().optional(),
  width: z.coerce.number().int().positive().optional().nullable(),
  height: z.coerce.number().int().positive().optional().nullable(),
  canvasType: z.string().max(100).optional().nullable(),
  calibrationData: z.string().optional().nullable(),
  status: z.enum(["in_progress", "completed", "paused"]).optional(),
  isPublic: z.boolean().optional(),
  coverImage: z.string().optional().nullable(),
  schemaImage: z.string().optional().nullable(),
  themes: z.array(z.enum(PROJECT_THEMES as unknown as [string, ...string[]]))
    .max(MAX_THEMES_PER_PROJECT, `Maximum ${MAX_THEMES_PER_PROJECT} themes allowed`)
    .optional(),
});

export const logCreateSchema = z.object({
  date: z.string().refine((d) => !isNaN(Date.parse(d)), "Invalid date"),
  photoUrl: z.string().optional().nullable(),
  previousPhotoUrl: z.string().optional().nullable(),
  totalStitches: z.coerce.number().int().min(0, "Must be non-negative"),
  dailyStitches: z.coerce.number().int().min(0, "Must be non-negative"),
  aiDetected: z.coerce.number().int().min(0).optional().nullable(),
  aiConfidence: z.coerce.number().min(0).max(1).optional().nullable(),
  userCorrected: z.boolean().optional().default(false),
  notes: z.string().max(1000).optional().nullable(),
});

export const logUpdateSchema = z.object({
  date: z.string().refine((d) => !isNaN(Date.parse(d)), "Invalid date").optional(),
  photoUrl: z.string().optional().nullable(),
  previousPhotoUrl: z.string().optional().nullable(),
  totalStitches: z.coerce.number().int().min(0).optional(),
  dailyStitches: z.coerce.number().int().min(0).optional(),
  aiDetected: z.coerce.number().int().min(0).optional().nullable(),
  aiConfidence: z.coerce.number().min(0).max(1).optional().nullable(),
  userCorrected: z.boolean().optional(),
  notes: z.string().max(1000).optional().nullable(),
});

// New: CV Detection with comparison
export const cvDetectSchema = z.object({
  currentPhoto: z.instanceof(File),
  previousPhoto: z.instanceof(File).optional().nullable(),
  calibrationData: z.string().optional().nullable(), // JSON string
});

// New: Project calibration
export const calibrationSchema = z.object({
  canvasType: z.string().min(1, "Canvas type required"),
  pixelPerStitch: z.coerce.number().positive().optional(),
  referencePhotoUrl: z.string().optional().nullable(),
});

export const profileUpdateSchema = z.object({
  name: z.string().max(100).optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  avatar: z.string().optional().nullable(),
});
