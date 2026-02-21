/*
  Warnings:

  - You are about to alter the column `userCorrected` on the `DailyLog` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Boolean`.

*/
-- AlterTable
ALTER TABLE "Project" ADD COLUMN "manufacturer" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DailyLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "photoUrl" TEXT,
    "previousPhotoUrl" TEXT,
    "totalStitches" INTEGER NOT NULL DEFAULT 0,
    "dailyStitches" INTEGER NOT NULL DEFAULT 0,
    "aiDetected" INTEGER,
    "aiConfidence" REAL,
    "userCorrected" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DailyLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_DailyLog" ("aiConfidence", "aiDetected", "createdAt", "dailyStitches", "date", "id", "notes", "photoUrl", "previousPhotoUrl", "projectId", "totalStitches", "userCorrected") SELECT "aiConfidence", "aiDetected", "createdAt", "dailyStitches", "date", "id", "notes", "photoUrl", "previousPhotoUrl", "projectId", "totalStitches", "userCorrected" FROM "DailyLog";
DROP TABLE "DailyLog";
ALTER TABLE "new_DailyLog" RENAME TO "DailyLog";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
