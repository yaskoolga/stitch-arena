-- AlterTable
ALTER TABLE "Project" ADD COLUMN "themes" TEXT DEFAULT '[]';

-- CreateIndex
CREATE INDEX "DailyLog_projectId_date_idx" ON "DailyLog"("projectId", "date");
