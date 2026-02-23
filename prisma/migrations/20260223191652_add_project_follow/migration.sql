-- CreateTable
CREATE TABLE "ProjectFollow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProjectFollow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProjectFollow_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ProjectFollow_projectId_idx" ON "ProjectFollow"("projectId");

-- CreateIndex
CREATE INDEX "ProjectFollow_userId_idx" ON "ProjectFollow"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectFollow_userId_projectId_key" ON "ProjectFollow"("userId", "projectId");
