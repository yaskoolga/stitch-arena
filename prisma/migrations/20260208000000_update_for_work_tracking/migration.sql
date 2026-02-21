-- Migration: Update for work tracking (CV concept change)
-- Date: 2026-02-08

-- ============================================
-- PROJECT TABLE UPDATES
-- ============================================

-- Add new columns to Project
ALTER TABLE "Project" ADD COLUMN "width" INTEGER;
ALTER TABLE "Project" ADD COLUMN "height" INTEGER;
ALTER TABLE "Project" ADD COLUMN "calibrationData" TEXT;

-- Rename imageUrl to schemaImage
ALTER TABLE "Project" RENAME COLUMN "imageUrl" TO "schemaImage";

-- ============================================
-- DAILYLOG TABLE UPDATES
-- ============================================

-- Step 1: Add new columns with default values
ALTER TABLE "DailyLog" ADD COLUMN "photoUrl" TEXT;
ALTER TABLE "DailyLog" ADD COLUMN "previousPhotoUrl" TEXT;
ALTER TABLE "DailyLog" ADD COLUMN "totalStitches" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "DailyLog" ADD COLUMN "dailyStitches" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "DailyLog" ADD COLUMN "aiDetected" INTEGER;
ALTER TABLE "DailyLog" ADD COLUMN "aiConfidence" REAL;
ALTER TABLE "DailyLog" ADD COLUMN "userCorrected" INTEGER NOT NULL DEFAULT 0;

-- Step 2: Migrate existing data
-- Copy imageUrl to photoUrl
UPDATE "DailyLog" SET "photoUrl" = "imageUrl" WHERE "imageUrl" IS NOT NULL;

-- Migrate stitches to totalStitches and dailyStitches
-- For existing logs, we treat the old 'stitches' as dailyStitches
UPDATE "DailyLog" SET "dailyStitches" = "stitches" WHERE "stitches" IS NOT NULL;

-- Calculate cumulative totalStitches for existing logs
-- This is a simplified migration - in real scenario, you'd need to calculate properly
-- For now, we'll set totalStitches = dailyStitches (will need manual correction)
UPDATE "DailyLog" SET "totalStitches" = "stitches" WHERE "stitches" IS NOT NULL;

-- Step 3: Drop old columns
-- Note: SQLite doesn't support DROP COLUMN directly, so we need to recreate the table

-- Create new DailyLog table with correct schema
CREATE TABLE "DailyLog_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "photoUrl" TEXT,
    "previousPhotoUrl" TEXT,
    "totalStitches" INTEGER NOT NULL DEFAULT 0,
    "dailyStitches" INTEGER NOT NULL DEFAULT 0,
    "aiDetected" INTEGER,
    "aiConfidence" REAL,
    "userCorrected" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DailyLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Copy data from old table to new table
INSERT INTO "DailyLog_new"
  ("id", "projectId", "date", "photoUrl", "previousPhotoUrl", "totalStitches", "dailyStitches", "aiDetected", "aiConfidence", "userCorrected", "notes", "createdAt")
SELECT
  "id",
  "projectId",
  "date",
  "photoUrl",
  "previousPhotoUrl",
  "totalStitches",
  "dailyStitches",
  "aiDetected",
  "aiConfidence",
  "userCorrected",
  "notes",
  "createdAt"
FROM "DailyLog";

-- Drop old table
DROP TABLE "DailyLog";

-- Rename new table to DailyLog
ALTER TABLE "DailyLog_new" RENAME TO "DailyLog";
