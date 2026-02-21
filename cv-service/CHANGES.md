# CV Service Changes — 08.02.2026

## 🔄 Изменение концепции

CV-сервис переработан с анализа **схем вышивки** на трекинг **прогресса работы**.

---

## ✅ Что изменилось

### 1. Новая логика подсчета (`inference.py`)

#### ❌ Старое (анализ схемы):
```python
detect_stitches(pattern_image)
→ Считает общее количество крестиков на схеме
→ Используется при создании проекта
```

#### ✅ Новое (трекинг работы):
```python
detect_stitches_on_work(current_photo, previous_photo, calibration)
→ Считает вышитые крестики на фото работы
→ Сравнивает с предыдущим фото
→ Возвращает: total, previous, daily_increment
```

**Новые методы:**
- `detect_stitches_on_work()` - главный метод для трекинга
- `_count_stitches_on_work()` - подсчет крестиков на работе
- `_get_calibration_ratio()` - получение pixel-per-stitch из калибровки
- `_detect_canvas_color()` - определение цвета канвы
- `_segment_stitched_regions()` - сегментация вышитых участков от канвы
- `_count_from_mask()` - подсчет по маске
- `_calculate_confidence()` - расчет confidence score

### 2. Новый endpoint (`routes.py`)

**Добавлен:**
```
POST /api/detect-progress
```

**Параметры:**
- `current_photo` (required) - фото текущей работы
- `previous_photo` (optional) - предыдущее фото для сравнения
- `calibration_data` (optional) - JSON с калибровкой проекта

**Возвращает:**
```json
{
  "total_stitches": 384,
  "previous_stitches": 150,
  "daily_stitches": 234,
  "confidence": 0.85
}
```

### 3. Новая модель (`models.py`)

**Добавлен `ProgressDetectionResponse`:**
```python
class ProgressDetectionResponse(BaseModel):
    total_stitches: int
    previous_stitches: Optional[int]
    daily_stitches: int
    confidence: float
    processing_time_ms: float
    image_dimensions: Dict[str, int]
```

### 4. Новые тесты (`tests/test_routes.py`)

**Добавлено 6 новых тестов:**
- ✅ `test_detect_progress_without_previous()` - первое фото
- ✅ `test_detect_progress_with_previous()` - сравнение с предыдущим
- ✅ `test_detect_progress_with_calibration()` - с калибровкой
- ✅ `test_detect_progress_invalid_file_type()` - валидация типа файла
- ✅ `test_detect_progress_invalid_calibration_json()` - валидация JSON
- ✅ `test_detect_progress_confidence_score()` - проверка confidence

**Вспомогательная функция:**
- `create_work_image()` - создает симуляцию фото работы (канва + вышитые участки)

### 5. Обновлена документация

**README.md:**
- ✅ Описание нового endpoint `/detect-progress`
- ✅ Примеры использования (Day 1, Day 2)
- ✅ Legacy пометка для `/detect`

---

## 🎯 Как это работает

### Алгоритм подсчета на работе:

```
1. Загрузка фото работы
   ↓
2. Определение цвета канвы (обычно white/beige)
   ↓
3. Сегментация: вышитые участки vs пустая канва
   ↓
4. Подсчет пикселей вышитых участков
   ↓
5. Конвертация в количество крестиков (через calibration)
   ↓
6. Если есть предыдущее фото → сравнение
   ↓
7. Результат: total, previous, daily_increment
```

### Пример flow:

**День 1:**
```
current_photo: day1.jpg
→ AI: 150 крестиков
→ Result: { total: 150, previous: null, daily: 150 }
```

**День 2:**
```
current_photo: day2.jpg
previous_photo: day1.jpg
→ AI: current=384, previous=150
→ Result: { total: 384, previous: 150, daily: 234 }
```

---

## 🧪 Тестирование

### Запуск тестов:

```bash
cd cv-service
pytest
```

**Ожидается:**
- 14 тестов pass (8 старых + 6 новых)

### Тестирование через Swagger:

1. Запустить сервис:
```bash
python -m app.main
```

2. Открыть: http://localhost:8001/docs

3. Тестировать endpoint `/api/detect-progress`

---

## 📋 Что еще нужно сделать

### Краткосрочно (для MVP):
- [ ] Собрать датасет фото вышивок (~50-100 изображений)
- [ ] Протестировать на реальных фото
- [ ] Настроить threshold для сегментации
- [ ] Добавить endpoint для калибровки

### Долгосрочно (для v2):
- [ ] Обучить YOLOv8 модель на датасете
- [ ] Добавить per-color counting
- [ ] GPU acceleration
- [ ] Batch processing

---

## 🔗 Связанные изменения

Для полной интеграции также нужно обновить:
- ✅ Task #3: Database schema (DailyLogs структура)
- ✅ Task #4: API endpoints (Next.js backend)
- ✅ Task #5: UI компоненты (StitchCounter, daily log flow)

---

## ✅ Итого

**CV-сервис переработан!**

✅ Новая логика: подсчет на работе, не на схеме
✅ Сравнение с предыдущим фото
✅ Новый endpoint `/detect-progress`
✅ Новые тесты (14 total)
✅ Обновлена документация

**Готово к интеграции с Next.js backend!** 🚀

---

*Обновлено: 08.02.2026*
