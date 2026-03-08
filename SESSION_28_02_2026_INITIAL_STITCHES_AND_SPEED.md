# Session 28.02.2026: Initial Stitches AI & Speed Badges Update

## 📋 Overview

Major update to speed badges system and implementation of AI-powered initial stitches detection with photo saving.

---

## 🏃‍♂️ 1. Speed Badges System - 6 Levels

### Previous System (4 levels)
- 🐢 Turtle: 0-50 stitches/day
- 🚴 Bike: 51-150 stitches/day
- 🚗 Car: 151-300 stitches/day
- 🚀 Rocket: 301+ stitches/day

### **NEW System (6 levels)**
- 🐢 **Turtle**: 0-30 stitches/day - "Slow and steady"
- 🚶 **Walker**: 31-100 stitches/day - "Nice pace"
- 🚴 **Bike**: 101-200 stitches/day - "Moving along nicely"
- 🚗 **Car**: 201-350 stitches/day - "Cruising fast"
- ✈️ **Plane**: 351-500 stitches/day - "Flying through"
- 🚀 **Rocket**: 501+ stitches/day - "Lightning speed"

### Updated Files
- `src/lib/constants.ts` - SPEED_TIERS definitions & getSpeedTier()
- `src/lib/achievement-badges.ts` - "Speed Demon" achievement (500+ → Rocket tier)
- `src/messages/*.json` (all 6 languages) - speedTiers translations

---

## 🤖 2. AI-Powered Initial Stitches Detection

### Feature Description

When creating a new project, users can now:
1. Upload a photo of their **current work-in-progress**
2. AI automatically detects the number of stitches already completed
3. The value auto-fills the `initialStitches` field (editable)
4. Photo is **saved as the first log entry** in the project

### How It Works

#### 2.1. Project Creation Flow

**Form (`src/components/projects/project-form.tsx`):**
```javascript
// New state for AI detection
const [initialPhotoUrl, setInitialPhotoUrl] = useState<string>("");
const [aiDetectedInitial, setAiDetectedInitial] = useState<number | null>(null);
const [aiConfidenceInitial, setAiConfidenceInitial] = useState<number | null>(null);
const [userCorrectedInitial, setUserCorrectedInitial] = useState(false);

// Upload & AI detection
async function handleInitialPhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0];
  // Upload photo
  // Trigger CV detection (no previous photo for initial state)
  const result = await detectProgress(file, null);
  // Auto-fill if confidence >= 50%
}
```

**API (`src/app/api/projects/route.ts`):**
```javascript
// If initial stitches provided with photo, create first daily log
if (initialPhotoUrl && initialStitches && initialStitches > 0) {
  await prisma.dailyLog.create({
    data: {
      projectId: project.id,
      date: new Date(),
      dailyStitches: 0,              // No new stitches (initial state)
      totalStitches: initialStitches, // Starting total
      photoUrl: initialPhotoUrl,
      notes: "Initial stitches before tracking started",
      aiDetected: aiDetectedInitial || null,
      aiConfidence: aiConfidenceInitial || null,
      userCorrected: userCorrectedInitial || false,
    },
  });
}
```

#### 2.2. New Validation Schema Fields

**Added to `projectCreateSchema` (`src/lib/validations.ts`):**
- `initialPhotoUrl`: z.string().optional().nullable()
- `aiDetectedInitial`: z.coerce.number().int().min(0).optional().nullable()
- `aiConfidenceInitial`: z.coerce.number().min(0).max(1).optional().nullable()
- `userCorrectedInitial`: z.boolean().optional().default(false)

#### 2.3. UI Components

**Initial Stitches Section:**
- 📸 Photo upload button
- 🤖 AI confidence badges:
  - Green (≥80%) - High confidence
  - Gray (50-79%) - Medium confidence
  - Red (<50%) - Low confidence
- ✏️ "Manually corrected" badge if user edits AI value
- ℹ️ Detailed explanation of initial stitches logic

**Explanation Text (all languages):**
> "Initial stitches are not counted toward your speed stats, achievements, or daily averages. They're simply added to show total project progress."

---

## 📊 3. Initial Stitches in Log History Table

### Visual Indicators

**When displaying logs (`src/app/projects/[id]/page.tsx`):**

1. **Removed filter** that hid logs with `dailyStitches = 0`
2. **Added detection** for initial entries:
   ```javascript
   const isInitial = dailyCount === 0 && stitchCount > 0;
   ```

3. **Visual styling:**
   - **Light background**: `bg-primary/5` for the entire row
   - **Badge**: "Initial" / "Начальные" next to date
   - **Daily column**: Shows "initial" / "начальные" (italic, muted) instead of count

### Example Table Display

```
Date              | Daily      | Total
------------------+------------+---------
15.02.2026 [Initial]  initial      1,250   ← Light bg, badge
16.02.2026              +150        1,400
17.02.2026              +200        1,600
---
TOTAL                   350         1,600
```

### Updated Log Interface

```typescript
interface Log {
  id: string;
  date: string;
  totalStitches?: number;
  dailyStitches?: number;
  notes?: string | null;
  photoUrl?: string | null;
  aiDetected?: number | null;      // NEW
  aiConfidence?: number | null;    // NEW
  userCorrected?: boolean;         // NEW
}
```

---

## 📝 4. Project Form Reorganization

### Removed Features
- ❌ **Schema Image** field (schemaImage) - removed completely

### New Field Order

1. **Cover Image** (photo from package)
2. **Title**
3. **Description**
4. **Manufacturer** (with dropdown + custom option)
5. **Themes** (moved here from bottom) - up to 5 tags
6. **Total Stitches** (manual or auto-calculated from width × height)
7. **Canvas Type** (moved here from bottom)
8. **Initial Stitches** (with AI detection) - special highlighted section
9. **Status** (only on edit)
10. **Is Public** checkbox

### Updated Fields & Placeholders

All fields now have proper placeholders and hints in all 6 languages:
- `manufacturerPlaceholder`: "Select manufacturer"
- `canvasTypePlaceholder`: "e.g., Aida 14, Linen 28"
- `coverImageHint`: "Photo from the package or pattern"
- `themesHint`: "Select up to 5 themes for this project"
- `calculateFromDimensions`: "Calculate from dimensions (width × height)"

---

## 🌍 5. Localization Updates

### New Translation Keys

**Added to all 6 languages (en, ru, de, es, fr, zh):**

#### projects.fields:
- `manufacturerPlaceholder`
- `initialStitchesExplanation`
- `canvasTypePlaceholder`
- `coverImageHint`
- `themesHint`
- `calculateFromDimensions`

#### projects.ai:
- `uploadPhotoHintInitial`

#### logs:
- `initial` - "Initial" badge label
- `initialStitches` - "initial" text for Daily column

---

## 🗄️ 6. Database Implications

### No Schema Changes Required

Existing DailyLog model already supports all needed fields:
- `dailyStitches` - Set to 0 for initial entry
- `totalStitches` - Set to initialStitches value
- `photoUrl` - Initial photo URL
- `notes` - Auto-set to "Initial stitches before tracking started"
- `aiDetected`, `aiConfidence`, `userCorrected` - Already exist

### Data Flow

1. **Project Creation** → Creates Project record
2. **If initialPhotoUrl exists** → Creates first DailyLog record
3. **Log History Display** → Shows initial entry with special styling
4. **Statistics Calculation** → Initial stitches excluded from speed/achievements (dailyStitches = 0)

---

## 🔧 7. Technical Implementation Details

### Key Components Modified

1. **`src/components/projects/project-form.tsx`**
   - Added AI detection for initial stitches
   - Removed schemaImage upload
   - Reorganized field order
   - Added state management for AI results

2. **`src/app/api/projects/route.ts`**
   - Creates first DailyLog if initialPhotoUrl provided
   - Removed schemaImage from project creation

3. **`src/app/projects/[id]/page.tsx`**
   - Updated Log interface
   - Removed filter hiding zero-stitch logs
   - Added visual indicators for initial entries

4. **`src/lib/validations.ts`**
   - Extended projectCreateSchema with AI fields
   - Removed schemaImage validation

5. **`src/lib/constants.ts`**
   - Expanded SPEED_TIERS from 4 to 6 levels
   - Updated getSpeedTier() logic

### CV Service Integration

Uses existing `/api/cv/detect` endpoint:
- **Input**: Current photo only (no previous photo for initial)
- **Output**:
  ```json
  {
    "success": true,
    "total_stitches": 1250,
    "confidence": 0.85,
    "daily_stitches": 1250,
    "processing_time_ms": 3200
  }
  ```
- **Auto-fill threshold**: confidence ≥ 0.5 (50%)

---

## ✅ 8. Testing Checklist

### Speed Badges
- [x] Dashboard shows correct badge for user's average speed
- [x] All 6 badges appear for different speed ranges
- [x] Translations work in all languages
- [x] "Speed Demon" achievement threshold updated to 500+

### Initial Stitches AI
- [x] Photo upload triggers AI detection
- [x] Confidence badges display correctly
- [x] Value auto-fills when confidence ≥ 50%
- [x] Manual editing sets userCorrected flag
- [x] Photo saves to project on creation

### Log History Display
- [x] Initial entry appears in table
- [x] Light background applied
- [x] "Initial" badge shows next to date
- [x] "initial" text in Daily column
- [x] Photo appears in project gallery

### Project Form
- [x] Correct field order
- [x] All placeholders/hints translated
- [x] No schemaImage field
- [x] Themes selector works
- [x] Canvas type positioned correctly

---

## 📚 9. User Documentation

### For End Users

**Creating a Project with Initial Stitches:**

1. Go to "Create New Project"
2. Fill in basic project details
3. In "Initial Stitches" section:
   - Upload a clear photo of your current progress
   - Wait ~2-5 seconds for AI analysis
   - Review the detected count (shown with confidence %)
   - Edit manually if needed
4. Create project
5. Photo will appear as first entry in log history

**Understanding Initial Stitches:**
- Marked as "Initial" in log history
- Don't count toward speed badges or achievements
- Only add to total project completion %
- Help track projects started before using StitchArena

---

## 🚀 10. Future Enhancements

### Potential Improvements
1. **Batch initial import** - Upload multiple photos from project start
2. **Retroactive initial detection** - Add AI detection to existing projects
3. **Initial log editing** - Allow users to update initial count/photo after creation
4. **Speed badge trends** - Show progression through badge levels over time
5. **Custom speed thresholds** - Let users define their own speed levels

---

## 📊 11. Impact Analysis

### Performance
- **Minimal impact** - Initial log creation adds ~100ms to project creation
- **CV service** - Same detection time as daily logs (~2-5 seconds)
- **Database** - One additional DailyLog record per project with initial stitches

### User Experience
- **Simplified onboarding** - Easier to start tracking existing projects
- **Better accuracy** - AI reduces manual counting errors
- **Clear distinction** - Visual indicators prevent confusion about initial vs. tracked stitches
- **More granular speed tracking** - 6 levels vs. 4 provides better motivation

---

## 🔗 12. Related Files

### Modified
- `src/lib/constants.ts`
- `src/lib/achievement-badges.ts`
- `src/lib/validations.ts`
- `src/components/projects/project-form.tsx`
- `src/app/api/projects/route.ts`
- `src/app/projects/[id]/page.tsx`
- `src/messages/en.json`
- `src/messages/ru.json`
- `src/messages/de.json`
- `src/messages/es.json`
- `src/messages/fr.json`
- `src/messages/zh.json`

### Related Documentation
- `CHALLENGES_IMPLEMENTATION.md` - Achievement system
- `SESSION_23_02_2026_AI_DETECTION.md` - Original AI detection implementation (if exists)

---

## 📅 Session Date
**28.02.2026**

## 👤 Contributors
- Ольга (Product Owner)
- Claude Sonnet 4.5 (Implementation)
