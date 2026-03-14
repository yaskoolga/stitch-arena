-- AlterTable
ALTER TABLE "Project" ADD COLUMN "startedAt" TIMESTAMP(3);

-- Update default status comment (no actual schema change needed, just documentation)
COMMENT ON COLUMN "Project"."status" IS 'stash, in_progress, completed, abandoned';

-- Update existing projects with default status if needed
-- Projects that are currently 'in_progress' and have logs should get startedAt from first log with dailyStitches > 0
UPDATE "Project" p
SET "startedAt" = (
  SELECT MIN(dl."date")
  FROM "DailyLog" dl
  WHERE dl."projectId" = p.id
    AND dl."dailyStitches" > 0
)
WHERE p."status" = 'in_progress'
  AND p."startedAt" IS NULL
  AND EXISTS (
    SELECT 1
    FROM "DailyLog" dl2
    WHERE dl2."projectId" = p.id
      AND dl2."dailyStitches" > 0
  );
