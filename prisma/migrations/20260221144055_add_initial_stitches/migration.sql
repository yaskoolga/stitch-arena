-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "manufacturer" TEXT,
    "coverImage" TEXT,
    "schemaImage" TEXT,
    "totalStitches" INTEGER NOT NULL,
    "initialStitches" INTEGER NOT NULL DEFAULT 0,
    "width" INTEGER,
    "height" INTEGER,
    "canvasType" TEXT,
    "calibrationData" TEXT,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "themes" TEXT DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Project" ("calibrationData", "canvasType", "coverImage", "createdAt", "description", "height", "id", "isPublic", "manufacturer", "schemaImage", "status", "themes", "title", "totalStitches", "updatedAt", "userId", "width") SELECT "calibrationData", "canvasType", "coverImage", "createdAt", "description", "height", "id", "isPublic", "manufacturer", "schemaImage", "status", "themes", "title", "totalStitches", "updatedAt", "userId", "width" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
