# Database Schema Changes — 08.02.2026

## 🔄 Schema Updated for Work Tracking

Database schema has been updated to support the new CV concept.

---

## 📊 Updated Schema

### Project Model

```prisma
model Project {
  id              String     @id @default(cuid())
  userId          String
  title           String
  description     String?
  schemaImage     String?    // ✅ Renamed from imageUrl
  totalStitches   Int
  width           Int?       // ✅ New - for auto-calculation
  height          Int?       // ✅ New - for auto-calculation
  canvasType      String?
  calibrationData String?    // ✅ New - JSON calibration settings
  status          String     @default("in_progress")
  isPublic        Boolean    @default(false)
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt
  user            User       @relation(...)
  logs            DailyLog[]
}
```

**Changes:**
- ✅ Added `width` - pattern width (optional)
- ✅ Added `height` - pattern height (optional)
- ✅ Added `calibrationData` - JSON string with calibration
- ✅ Renamed `imageUrl` → `schemaImage`

### DailyLog Model

```prisma
model DailyLog {
  id               String   @id @default(cuid())
  projectId        String
  date             DateTime
  photoUrl         String?  // ✅ Renamed from imageUrl
  previousPhotoUrl String?  // ✅ New - for comparison
  totalStitches    Int      @default(0) // ✅ New - cumulative
  dailyStitches    Int      @default(0) // ✅ New - increment
  aiDetected       Int?     // ✅ New - AI count
  aiConfidence     Float?   // ✅ New - confidence score
  userCorrected    Boolean  @default(false) // ✅ New
  notes            String?
  createdAt        DateTime @default(now())
  project          Project  @relation(...)
}
```

**Changes:**
- ❌ Removed `stitches` → replaced by `totalStitches` + `dailyStitches`
- ✅ Renamed `imageUrl` → `photoUrl`
- ✅ Added `previousPhotoUrl` - for comparison with previous photo
- ✅ Added `totalStitches` - cumulative count at this point
- ✅ Added `dailyStitches` - increment for this specific day
- ✅ Added `aiDetected` - what AI detected before user correction
- ✅ Added `aiConfidence` - AI confidence score (0-1)
- ✅ Added `userCorrected` - flag if user manually corrected

---

## 🎯 How New Schema Supports Work Tracking

### Example: Daily Log Flow

**Day 1:**
```typescript
{
  date: "2026-02-08",
  photoUrl: "s3://work-day1.jpg",
  previousPhotoUrl: null,
  totalStitches: 150,        // AI counted 150
  dailyStitches: 150,        // First day = total
  aiDetected: 150,
  aiConfidence: 0.87,
  userCorrected: false
}
```

**Day 2:**
```typescript
{
  date: "2026-02-09",
  photoUrl: "s3://work-day2.jpg",
  previousPhotoUrl: "s3://work-day1.jpg",
  totalStitches: 384,        // AI counted 384 total
  dailyStitches: 234,        // 384 - 150 = 234 new
  aiDetected: 384,
  aiConfidence: 0.85,
  userCorrected: false
}
```

**Day 3 (with manual correction):**
```typescript
{
  date: "2026-02-10",
  photoUrl: "s3://work-day3.jpg",
  previousPhotoUrl: "s3://work-day2.jpg",
  totalStitches: 650,        // User corrected from 620
  dailyStitches: 266,        // 650 - 384 = 266
  aiDetected: 620,           // AI detected 620
  aiConfidence: 0.82,
  userCorrected: true        // User changed to 650
}
```

---

## 🔧 Migration Applied

**Migration:** `20260208000000_update_for_work_tracking`

### What the migration did:

1. **Project table:**
   - Added `width`, `height`, `calibrationData` columns
   - Renamed `imageUrl` → `schemaImage`

2. **DailyLog table:**
   - Added new columns with defaults
   - Migrated `imageUrl` → `photoUrl`
   - Migrated `stitches` → `dailyStitches` and `totalStitches`
   - Recreated table to drop old columns (SQLite limitation)

3. **Data preserved:**
   - All existing logs maintained
   - Old values copied to new fields

---

## 📋 TypeScript Types (Generated)

After running `prisma generate`, you get:

```typescript
// Project
type Project = {
  id: string
  userId: string
  title: string
  description: string | null
  schemaImage: string | null
  totalStitches: number
  width: number | null
  height: number | null
  canvasType: string | null
  calibrationData: string | null
  status: string
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}

// DailyLog
type DailyLog = {
  id: string
  projectId: string
  date: Date
  photoUrl: string | null
  previousPhotoUrl: string | null
  totalStitches: number
  dailyStitches: number
  aiDetected: number | null
  aiConfidence: number | null
  userCorrected: boolean
  notes: string | null
  createdAt: Date
}
```

---

## ✅ Usage Examples

### Create Project

```typescript
// Option 1: Manual total
const project = await prisma.project.create({
  data: {
    userId: "user_123",
    title: "Pink Roses",
    totalStitches: 3500,
    canvasType: "aida14"
  }
})

// Option 2: Auto-calculate from width × height
const project = await prisma.project.create({
  data: {
    userId: "user_123",
    title: "Pink Roses",
    width: 50,
    height: 70,
    totalStitches: 50 * 70, // = 3500
    canvasType: "aida14"
  }
})
```

### Create Daily Log (Day 1)

```typescript
const log = await prisma.dailyLog.create({
  data: {
    projectId: "proj_123",
    date: new Date("2026-02-08"),
    photoUrl: "s3://work-day1.jpg",
    totalStitches: 150,
    dailyStitches: 150,
    aiDetected: 150,
    aiConfidence: 0.87,
    userCorrected: false
  }
})
```

### Create Daily Log (Day 2 with comparison)

```typescript
const previousLog = await prisma.dailyLog.findFirst({
  where: { projectId: "proj_123" },
  orderBy: { date: "desc" }
})

const log = await prisma.dailyLog.create({
  data: {
    projectId: "proj_123",
    date: new Date("2026-02-09"),
    photoUrl: "s3://work-day2.jpg",
    previousPhotoUrl: previousLog.photoUrl,
    totalStitches: 384,
    dailyStitches: 384 - previousLog.totalStitches, // 234
    aiDetected: 384,
    aiConfidence: 0.85,
    userCorrected: false
  }
})
```

### Query with Progress Tracking

```typescript
// Get all logs with cumulative progress
const logs = await prisma.dailyLog.findMany({
  where: { projectId: "proj_123" },
  orderBy: { date: "asc" },
  select: {
    date: true,
    totalStitches: true,
    dailyStitches: true,
    aiConfidence: true,
    userCorrected: true
  }
})

// Calculate project completion
const project = await prisma.project.findUnique({
  where: { id: "proj_123" },
  include: {
    logs: {
      orderBy: { date: "desc" },
      take: 1
    }
  }
})

const latestLog = project.logs[0]
const progress = (latestLog.totalStitches / project.totalStitches) * 100
// Example: 384 / 3500 = 10.97%
```

---

## 🔄 Next Steps

1. ✅ Update API endpoints to use new schema
2. ✅ Update UI components to display new fields
3. ✅ Integrate with CV service `/detect-progress` endpoint
4. ✅ Add validation for cumulative tracking
5. ✅ Implement calibration endpoints

---

*Updated: 08.02.2026*
