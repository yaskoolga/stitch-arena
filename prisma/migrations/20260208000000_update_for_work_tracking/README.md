# Migration: Update for Work Tracking

**Date:** 2026-02-08
**Type:** Schema Update (Breaking Changes)

## Overview

This migration updates the database schema to support the new CV concept:
- Tracking work-in-progress photos (not pattern analysis)
- Comparing current vs previous photos
- Storing daily increments and cumulative totals

## Changes

### Project Table

**Added:**
- `width` (Int, optional) - Pattern width for auto-calculation
- `height` (Int, optional) - Pattern height for auto-calculation
- `calibrationData` (String, optional) - JSON calibration settings

**Renamed:**
- `imageUrl` → `schemaImage` - Optional reference photo of pattern

### DailyLog Table

**Added:**
- `photoUrl` (String, optional) - Photo of work-in-progress
- `previousPhotoUrl` (String, optional) - Previous photo for comparison
- `totalStitches` (Int, default 0) - Cumulative total at this point
- `dailyStitches` (Int, default 0) - Increment for this day
- `aiDetected` (Int, optional) - AI detected count before correction
- `aiConfidence` (Float, optional) - AI confidence score (0-1)
- `userCorrected` (Boolean, default false) - Manual correction flag

**Removed:**
- `stitches` - Replaced by `totalStitches` and `dailyStitches`
- `imageUrl` - Replaced by `photoUrl`

## Data Migration

Existing data was migrated as follows:

1. **Project:**
   - `imageUrl` → `schemaImage` (renamed)
   - New fields added with NULL values

2. **DailyLog:**
   - `imageUrl` → `photoUrl` (copied)
   - `stitches` → `dailyStitches` (copied)
   - `stitches` → `totalStitches` (copied, needs manual correction)
   - New fields initialized with defaults

⚠️ **Note:** Existing `totalStitches` values are set equal to `dailyStitches` and may need manual correction for proper cumulative tracking.

## Breaking Changes

### Before (Old Schema):
```typescript
// DailyLog
{
  id: string
  projectId: string
  date: Date
  stitches: number        // ❌ Removed
  imageUrl?: string       // ❌ Removed
  notes?: string
}
```

### After (New Schema):
```typescript
// DailyLog
{
  id: string
  projectId: string
  date: Date
  photoUrl?: string             // ✅ New
  previousPhotoUrl?: string     // ✅ New
  totalStitches: number         // ✅ New (cumulative)
  dailyStitches: number         // ✅ New (increment)
  aiDetected?: number           // ✅ New
  aiConfidence?: number         // ✅ New
  userCorrected: boolean        // ✅ New
  notes?: string
}
```

## How to Rollback

If you need to rollback this migration:

```bash
# Prisma doesn't support automatic rollback for SQLite
# You'll need to restore from backup or manually reverse changes

# Manual reversal (not recommended):
# 1. Recreate old DailyLog structure
# 2. Migrate data back from new fields to old fields
# 3. Drop new columns
```

## Testing

After migration, verify:

1. ✅ All existing logs preserved
2. ✅ `photoUrl` contains old `imageUrl` values
3. ✅ `dailyStitches` contains old `stitches` values
4. ✅ New projects can use `width` × `height` calculation
5. ✅ Prisma Client generates correct types

## Next Steps

1. Update API endpoints to use new fields
2. Update UI components to display new data structure
3. Implement CV integration with new fields
4. Add validation for cumulative tracking

---

*Applied: 2026-02-08*
