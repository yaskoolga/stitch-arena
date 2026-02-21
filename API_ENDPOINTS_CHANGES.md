# API Endpoints Changes — 08.02.2026

## 🔄 API обновлены для work tracking

Все API endpoints обновлены под новую концепцию трекинга прогресса.

---

## ✅ Обновленные Endpoints

### 1. **POST /api/projects** — Создание проекта

**Изменения:**
- ✅ Добавлено `width` (Int, optional)
- ✅ Добавлено `height` (Int, optional)
- ✅ Добавлено `calibrationData` (String, optional, JSON)
- ✅ `imageUrl` → `schemaImage` (переименовано)
- ✅ Авто-расчет `totalStitches = width × height` если не указано вручную

**Request:**
```json
{
  "title": "Pink Roses",
  "description": "Beautiful pattern",
  "totalStitches": 3500,  // Manual input
  "width": 50,            // Optional: for auto-calc
  "height": 70,           // Optional: for auto-calc
  "canvasType": "aida14",
  "calibrationData": null,
  "isPublic": false,
  "schemaImage": "https://..."
}
```

**Response:**
```json
{
  "id": "proj_123",
  "userId": "user_456",
  "title": "Pink Roses",
  "totalStitches": 3500,
  "width": 50,
  "height": 70,
  "canvasType": "aida14",
  "calibrationData": null,
  "schemaImage": "https://...",
  ...
}
```

---

### 2. **GET /api/projects** — Список проектов

**Изменения:**
- ✅ `completedStitches` теперь берется из последнего лога (cumulative)
- ❌ Не суммирует все логи (старое поведение)

**Response:**
```json
[
  {
    "id": "proj_123",
    "title": "Pink Roses",
    "totalStitches": 3500,
    "completedStitches": 384,  // Latest log totalStitches
    "progress": 10.97,
    ...
  }
]
```

---

### 3. **POST /api/projects/:id/logs** — Создание лога

**Изменения:**
- ❌ Удалено `stitches`, `imageUrl`
- ✅ Добавлено `photoUrl`, `previousPhotoUrl`
- ✅ Добавлено `totalStitches` (cumulative)
- ✅ Добавлено `dailyStitches` (increment)
- ✅ Добавлено `aiDetected`, `aiConfidence`, `userCorrected`

**Request:**
```json
{
  "date": "2026-02-08",
  "photoUrl": "s3://work-day2.jpg",
  "previousPhotoUrl": "s3://work-day1.jpg",
  "totalStitches": 384,      // Cumulative
  "dailyStitches": 234,       // 384 - 150
  "aiDetected": 384,
  "aiConfidence": 0.85,
  "userCorrected": false,
  "notes": "Good progress today!"
}
```

**Response:**
```json
{
  "id": "log_789",
  "projectId": "proj_123",
  "date": "2026-02-08T00:00:00.000Z",
  "photoUrl": "s3://work-day2.jpg",
  "totalStitches": 384,
  "dailyStitches": 234,
  "aiConfidence": 0.85,
  ...
}
```

---

### 4. **POST /api/cv/detect** — CV Progress Detection

**Изменения:**
- ✅ Переработан под `/detect-progress` CV сервиса
- ✅ Поддержка сравнения с предыдущим фото
- ✅ Поддержка calibration data

**Request (multipart/form-data):**
```
currentPhoto: File
previousPhoto: File (optional)
calibrationData: JSON string (optional)
```

**Response:**
```json
{
  "success": true,
  "total_stitches": 384,
  "previous_stitches": 150,
  "daily_stitches": 234,
  "confidence": 0.85,
  "processing_time_ms": 456.78,
  "image_dimensions": {
    "width": 1024,
    "height": 768
  }
}
```

---

## 🆕 Новые Endpoints

### 5. **POST /api/projects/:id/calibrate** — Калибровка проекта

**Назначение:** Настроить калибровку для точного подсчета крестиков

**Request:**
```json
{
  "canvasType": "aida14",
  "pixelPerStitch": 15.5,
  "referencePhotoUrl": "s3://reference.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "projectId": "proj_123",
  "calibration": {
    "canvasType": "aida14",
    "pixelPerStitch": 15.5,
    "referencePhotoUrl": "s3://reference.jpg",
    "calibratedAt": "2026-02-08T12:00:00.000Z"
  }
}
```

---

### 6. **GET /api/projects/:id/calibration** — Получить калибровку

**Response:**
```json
{
  "projectId": "proj_123",
  "canvasType": "aida14",
  "calibration": {
    "canvasType": "aida14",
    "pixelPerStitch": 15.5,
    "referencePhotoUrl": "s3://reference.jpg",
    "calibratedAt": "2026-02-08T12:00:00.000Z"
  }
}
```

---

### 7. **POST /api/projects/:id/cv-detect** — CV с контекстом проекта

**Назначение:** Упрощенный endpoint для CV - автоматически использует калибровку проекта

**Request (multipart/form-data):**
```
photo: File
```

**Response:**
```json
{
  "success": true,
  "total_stitches": 384,
  "previous_stitches": null,
  "daily_stitches": 384,
  "confidence": 0.85,
  "processing_time_ms": 456.78,
  // Дополнительные поля с контекстом проекта:
  "projectId": "proj_123",
  "projectTitle": "Pink Roses",
  "totalStitchesInProject": 3500,
  "previousTotal": 150,
  "progress": "10.97"
}
```

---

## 📋 Обновленные Validation Schemas

### projectCreateSchema

```typescript
{
  title: string (required, 1-200 chars)
  description?: string (max 2000 chars)
  totalStitches: number (required, positive int)
  width?: number (positive int)
  height?: number (positive int)
  canvasType?: string (max 100 chars)
  calibrationData?: string (JSON)
  isPublic?: boolean (default: false)
  schemaImage?: string
}
```

### logCreateSchema

```typescript
{
  date: string (ISO date)
  photoUrl?: string
  previousPhotoUrl?: string
  totalStitches: number (required, >= 0)
  dailyStitches: number (required, >= 0)
  aiDetected?: number (>= 0)
  aiConfidence?: number (0-1)
  userCorrected?: boolean (default: false)
  notes?: string (max 1000 chars)
}
```

### calibrationSchema (new)

```typescript
{
  canvasType: string (required)
  pixelPerStitch?: number (positive)
  referencePhotoUrl?: string
}
```

---

## 🎯 Типичные Flow

### Flow 1: Создание проекта

```typescript
// Option A: Manual input
POST /api/projects
{
  "title": "Pink Roses",
  "totalStitches": 3500,
  "canvasType": "aida14"
}

// Option B: Auto-calculate
POST /api/projects
{
  "title": "Pink Roses",
  "width": 50,
  "height": 70,  // totalStitches = 3500
  "canvasType": "aida14"
}
```

### Flow 2: Калибровка (optional)

```typescript
POST /api/projects/proj_123/calibrate
{
  "canvasType": "aida14",
  "pixelPerStitch": 15.5
}
```

### Flow 3: День 1 — Первое фото

```typescript
// 1. Upload photo to storage (S3, Cloudinary, etc.)
const photoUrl = await uploadToS3(file);

// 2. Analyze with CV
POST /api/cv/detect
FormData: { currentPhoto: file }

Response: {
  total_stitches: 150,
  daily_stitches: 150,
  confidence: 0.87
}

// 3. User confirms or corrects
const confirmed = 150; // or user types 160

// 4. Create log
POST /api/projects/proj_123/logs
{
  "date": "2026-02-08",
  "photoUrl": photoUrl,
  "totalStitches": confirmed,
  "dailyStitches": confirmed,
  "aiDetected": 150,
  "aiConfidence": 0.87,
  "userCorrected": false
}
```

### Flow 4: День 2 — С сравнением

```typescript
// 1. Upload current photo
const currentPhotoUrl = await uploadToS3(currentFile);

// 2. Get previous log
GET /api/projects/proj_123/logs
→ previousLog = { photoUrl: "s3://day1.jpg", totalStitches: 150 }

// 3. Download previous photo for comparison
const previousFile = await fetchFromS3(previousLog.photoUrl);

// 4. Analyze with CV (with comparison)
POST /api/cv/detect
FormData: {
  currentPhoto: currentFile,
  previousPhoto: previousFile
}

Response: {
  total_stitches: 384,
  previous_stitches: 150,
  daily_stitches: 234,
  confidence: 0.85
}

// 5. Create log
POST /api/projects/proj_123/logs
{
  "date": "2026-02-09",
  "photoUrl": currentPhotoUrl,
  "previousPhotoUrl": previousLog.photoUrl,
  "totalStitches": 384,
  "dailyStitches": 234,
  "aiDetected": 384,
  "aiConfidence": 0.85,
  "userCorrected": false
}
```

### Flow 5: Simplified with project context

```typescript
// Easier: Use project-specific endpoint
POST /api/projects/proj_123/cv-detect
FormData: { photo: file }

// Automatically uses:
// - Project calibration
// - Project context (total stitches, progress)
// Note: Previous photo comparison still manual for now

Response: {
  total_stitches: 384,
  confidence: 0.85,
  projectId: "proj_123",
  totalStitchesInProject: 3500,
  progress: "10.97"
}
```

---

## ✅ Summary

**Обновлено:**
- ✅ 3 существующих endpoint (projects, logs, cv/detect)
- ✅ 5 validation schemas
- ✅ GET /api/projects логика

**Создано:**
- ✅ 3 новых endpoint (calibrate, calibration, cv-detect)
- ✅ 2 новых validation schemas

**Готово к интеграции с UI!** 🚀

---

*Обновлено: 08.02.2026*
