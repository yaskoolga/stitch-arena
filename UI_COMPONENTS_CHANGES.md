# UI Components Changes — 08.02.2026

## 🎨 UI обновлены для work tracking

Все UI компоненты переработаны под новую концепцию трекинга прогресса.

---

## ✅ Обновленные Компоненты

### 1. **ProjectForm** — Форма создания проекта

**Путь:** `src/components/projects/project-form.tsx`

**Изменения:**
- ✅ `imageUrl` → `schemaImage` (переименовано)
- ✅ Добавлен режим auto-calculation (width × height)
- ✅ Поддержка `width`, `height` полей
- ✅ Обновлен UI с toggle для выбора метода ввода totalStitches

**До:**
```tsx
<Input name="totalStitches" required />
<Input name="imageUrl" />
```

**После:**
```tsx
{/* Toggle между manual и auto-calc */}
{useAutoCalc ? (
  <>
    <Input name="width" />
    <Input name="height" />
  </>
) : (
  <Input name="totalStitches" />
)}
<Input name="schemaImage" /> {/* Renamed */}
```

**Screenshot концепт:**
```
┌─────────────────────────────────────┐
│ Pattern Schema (optional reference) │
│ [Upload Image]                      │
│                                     │
│ Title: ________________             │
│ Description: _________              │
│                                     │
│ ☑ Calculate from dimensions         │
│ Width: _____ × Height: _____        │
│ = 3500 stitches                     │
│                                     │
│ Canvas Type: Aida 14                │
│ [Create Project]                    │
└─────────────────────────────────────┘
```

---

### 2. **useCVDetection** — Hook для CV анализа

**Путь:** `src/hooks/useCVDetection.ts`

**Изменения:**
- ❌ Удалено `detectStitches()` (старый метод)
- ✅ Добавлено `detectProgress()` (новый метод)
- ✅ Поддержка `previousPhoto` для сравнения
- ✅ Поддержка `calibrationData`
- ✅ Обновлены типы результатов
- ✅ Добавлен `reset()` метод

**API:**
```typescript
const {
  detectProgress,  // New: supports comparison
  isLoading,
  error,
  result,         // ProgressDetectionResult type
  reset
} = useCVDetection();

// Usage
await detectProgress(
  currentPhoto,      // File (required)
  previousPhoto,     // File | null (optional)
  calibrationData    // string | null (optional)
);

// Result
{
  total_stitches: 384,
  previous_stitches: 150,
  daily_stitches: 234,
  confidence: 0.85
}
```

---

### 3. **StitchCounter** — Новый компонент (заменил PatternAnalyzer)

**Путь:** `src/components/projects/stitch-counter.tsx`

**Назначение:** Подсчет крестиков на фото работы (не схемы) с подтверждением/исправлением

**Фичи:**
- ✅ Upload фото работы
- ✅ AI анализ через CV service
- ✅ Показ результата с confidence
- ✅ Ручная коррекция результата
- ✅ Подтверждение перед сохранением
- ✅ Сравнение с предыдущим фото (опционально)

**Props:**
```typescript
interface StitchCounterProps {
  onCountComplete?: (data: {
    totalStitches: number;
    dailyStitches: number;
    aiDetected: number;
    aiConfidence: number;
    userCorrected: boolean;
  }) => void;
  previousPhotoUrl?: string | null;
  calibrationData?: string | null;
}
```

**UI Flow:**
```
1. [Upload Work Photo]
   ↓
2. Preview photo
   ↓
3. [Count Stitches] → AI analyzing...
   ↓
4. Results:
   ┌────────────────────────────────┐
   │ ✓ AI Detection Complete!       │
   │                                │
   │ Total: 384 stitches            │
   │ New: +234 stitches             │
   │ Confidence: 85%                │
   │                                │
   │ Confirm or correct:            │
   │ [__384__] [Confirm AI Count]   │
   │                                │
   │ (user can change to e.g. 390)  │
   └────────────────────────────────┘
   ↓
5. onCountComplete() callback with data
```

---

## 🆕 Новые Компоненты

### 4. **DailyLogForm** — Форма для создания лога (TODO)

**Путь:** `src/components/projects/daily-log-form.tsx` (нужно создать)

**Назначение:** Интеграция StitchCounter с формой создания лога

**Концепт:**
```tsx
export function DailyLogForm({ projectId }: { projectId: string }) {
  const [cvData, setCvData] = useState(null);

  return (
    <form>
      {/* Date picker */}
      <Input type="date" name="date" />

      {/* Stitch Counter */}
      <StitchCounter
        onCountComplete={(data) => {
          setCvData(data);
          // Auto-fill form fields
        }}
      />

      {/* If CV data available, show summary */}
      {cvData && (
        <div>
          <p>Total: {cvData.totalStitches}</p>
          <p>Daily: +{cvData.dailyStitches}</p>
        </div>
      )}

      {/* Notes */}
      <Textarea name="notes" />

      {/* Submit */}
      <Button type="submit">Save Log</Button>
    </form>
  );
}
```

---

## 📋 Старые vs Новые Компоненты

| Компонент | Старое | Новое | Статус |
|-----------|--------|-------|--------|
| **ProjectForm** | Только totalStitches | totalStitches ИЛИ width×height | ✅ Updated |
| **PatternAnalyzer** | Анализ схемы | Удален | ❌ Deprecated |
| **StitchCounter** | - | Подсчет на работе + коррекция | ✅ New |
| **useCVDetection** | detectStitches() | detectProgress() | ✅ Updated |
| **DailyLogForm** | - | - | ⏳ TODO |

---

## 🎯 Типичные User Flows

### Flow 1: Создание проекта

**Option A: Manual input**
```
1. Fill title: "Pink Roses"
2. Uncheck "Calculate from dimensions"
3. Enter totalStitches: 3500
4. Enter canvasType: "Aida 14"
5. Submit → Project created
```

**Option B: Auto-calculate**
```
1. Fill title: "Pink Roses"
2. Check "Calculate from dimensions"
3. Enter width: 50, height: 70 → Auto shows: 3500 stitches
4. Enter canvasType: "Aida 14"
5. Submit → Project created (totalStitches = 3500)
```

---

### Flow 2: Day 1 — Первый лог

```
1. Open project
2. Click "Add Daily Log"
3. Select date: 2026-02-08
4. Upload work photo
   ↓
5. StitchCounter:
   - AI analyzing...
   - Result: 150 stitches (confidence 87%)
   ↓
6. User reviews:
   - Option A: Confirms → totalStitches = 150
   - Option B: Corrects to 160 → totalStitches = 160, userCorrected = true
   ↓
7. Add notes: "First day, good progress!"
8. Submit → Log created:
   {
     totalStitches: 150,
     dailyStitches: 150,
     aiDetected: 150,
     aiConfidence: 0.87,
     userCorrected: false
   }
```

---

### Flow 3: Day 2 — С сравнением

```
1. Open project
2. Click "Add Daily Log"
3. Select date: 2026-02-09
4. Upload work photo
   ↓
5. StitchCounter (with previousPhotoUrl from Day 1):
   - AI analyzing + comparing...
   - Result:
     * Total: 384 stitches
     * Previous: 150 stitches
     * New: +234 stitches
     * Confidence: 85%
   ↓
6. User confirms
7. Submit → Log created:
   {
     totalStitches: 384,
     dailyStitches: 234,
     previousPhotoUrl: "s3://day1.jpg",
     aiDetected: 384,
     aiConfidence: 0.85,
     userCorrected: false
   }
```

---

## 🛠️ Integration Example

### Complete Daily Log Page (concept)

```tsx
// src/app/projects/[id]/log/page.tsx
"use client";

import { useState } from "react";
import { StitchCounter } from "@/components/projects/stitch-counter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function AddLogPage({ params }: { params: { id: string } }) {
  const [cvData, setCvData] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const form = new FormData(e.target);

    const body = {
      date: form.get("date"),
      photoUrl: await uploadPhoto(cvData.photo), // Upload to S3
      totalStitches: cvData.totalStitches,
      dailyStitches: cvData.dailyStitches,
      aiDetected: cvData.aiDetected,
      aiConfidence: cvData.aiConfidence,
      userCorrected: cvData.userCorrected,
      notes: form.get("notes"),
    };

    await fetch(`/api/projects/${params.id}/logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    // Redirect to project page
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Add Daily Log</h1>

      <Input type="date" name="date" defaultValue={new Date().toISOString().split("T")[0]} />

      <StitchCounter onCountComplete={setCvData} />

      {cvData && (
        <div className="bg-muted p-4 rounded">
          <p>✓ Count confirmed: {cvData.totalStitches} stitches</p>
          <p>Daily progress: +{cvData.dailyStitches}</p>
        </div>
      )}

      <Textarea name="notes" placeholder="Notes (optional)" />

      <Button type="submit" disabled={!cvData}>
        Save Log
      </Button>
    </form>
  );
}
```

---

## ✅ Summary

**Обновлено:**
- ✅ ProjectForm — поддержка width×height
- ✅ useCVDetection — новый API с previousPhoto
- ✅ Все формы используют новые поля (schemaImage вместо imageUrl)

**Создано:**
- ✅ StitchCounter — главный компонент для daily tracking
- ✅ Новый hook API с detectProgress()

**TODO (для полной интеграции):**
- ⏳ DailyLogForm — форма создания лога с StitchCounter
- ⏳ ProjectCalibration — UI для калибровки проекта
- ⏳ Обновить ProjectDetail page для использования новых полей
- ⏳ Обновить charts/stats для totalStitches вместо суммы

**Готово к использованию!** 🚀

---

*Обновлено: 08.02.2026*
