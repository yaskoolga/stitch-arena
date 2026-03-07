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
  articleNumber: z.string().max(100).optional().nullable(),
  totalStitches: z.coerce.number().int().positive("Must be a positive number"),
  initialStitches: z.coerce.number().int().min(0, "Must be non-negative").optional().default(0),
  initialPhotoUrl: z.string().optional().nullable(),  // Photo used for AI detection of initial stitches
  aiDetectedInitial: z.coerce.number().int().min(0).optional().nullable(),
  aiConfidenceInitial: z.coerce.number().min(0).max(1).optional().nullable(),
  userCorrectedInitial: z.boolean().optional().default(false),
  width: z.coerce.number().int().positive().optional().nullable(),
  height: z.coerce.number().int().positive().optional().nullable(),
  canvasType: z.string().max(100).optional().nullable(),
  calibrationData: z.string().optional().nullable(), // JSON string
  isPublic: z.boolean().optional().default(false),
  coverImage: z.string().optional().nullable(),     // Cover photo from package (for cards)
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
).refine(
  (data) => {
    // initialStitches must be less than totalStitches
    const initial = data.initialStitches || 0;
    return initial < data.totalStitches;
  },
  { message: "Initial stitches must be less than total stitches", path: ["initialStitches"] }
);

export const projectUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  manufacturer: z.string().max(100).optional().nullable(),
  articleNumber: z.string().max(100).optional().nullable(),
  totalStitches: z.coerce.number().int().positive().optional(),
  initialStitches: z.coerce.number().int().min(0).optional(),
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

// Challenge validation schemas
const challengeTypeEnum = z.enum(["speed", "streak", "completion"]);

export const challengeCreateSchema = z
  .object({
    type: challengeTypeEnum,
    title: z
      .string()
      .min(5, "Title must be at least 5 characters")
      .max(100, "Title must be at most 100 characters"),
    description: z
      .string()
      .max(500, "Description must be at most 500 characters")
      .optional()
      .nullable(),
    startDate: z.string().refine((d) => !isNaN(Date.parse(d)), "Invalid start date"),
    endDate: z.string().refine((d) => !isNaN(Date.parse(d)), "Invalid end date"),
    targetValue: z.coerce.number().int().positive("Target value must be positive"),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const now = new Date();
      return start > now;
    },
    { message: "Start date must be in the future", path: ["startDate"] }
  )
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end > start;
    },
    { message: "End date must be after start date", path: ["endDate"] }
  )
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      const durationDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return durationDays >= 3 && durationDays <= 90;
    },
    { message: "Challenge duration must be between 3 and 90 days", path: ["endDate"] }
  )
  .refine(
    (data) => {
      // Validate target value based on type
      const { type, targetValue } = data;
      if (type === "speed") {
        return targetValue >= 1000 && targetValue <= 100000;
      } else if (type === "streak") {
        return targetValue >= 3 && targetValue <= 365;
      } else if (type === "completion") {
        return targetValue >= 1 && targetValue <= 50;
      }
      return true;
    },
    {
      message: "Invalid target value for challenge type",
      path: ["targetValue"],
    }
  );

export const challengeUpdateSchema = z.object({
  type: challengeTypeEnum.optional(),
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be at most 100 characters")
    .optional(),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .optional()
    .nullable(),
  startDate: z
    .string()
    .refine((d) => !isNaN(Date.parse(d)), "Invalid start date")
    .optional(),
  endDate: z
    .string()
    .refine((d) => !isNaN(Date.parse(d)), "Invalid end date")
    .optional(),
  targetValue: z.coerce.number().int().positive("Target value must be positive").optional(),
});
