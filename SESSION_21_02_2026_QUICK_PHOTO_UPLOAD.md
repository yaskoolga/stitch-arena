# Session 21.02.2026 - Быстрая загрузка фото и реорганизация страницы проекта

## 📋 Обзор

Добавлена возможность быстрой загрузки фотографий прямо из карточки проекта без перехода на отдельную страницу. Полностью переработана структура страницы детального просмотра проекта для более логичного расположения контента.

---

## 🎯 Цели

1. ✅ Добавить кнопку быстрой загрузки фото в карточке проекта
2. ✅ Встроить прогресс-бар в шапку проекта
3. ✅ Реорганизовать порядок блоков на странице
4. ✅ Скрыть пустые записи (только фото) из истории
5. ✅ Улучшить UX работы с фотографиями

---

## 🏗️ Архитектура

### Функционал быстрой загрузки фото

**Файл:** `src/app/projects/[id]/page.tsx`

#### Состояние
```typescript
const [uploadingPhoto, setUploadingPhoto] = useState(false);
```

#### Функция загрузки
```typescript
const handleQuickPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setUploadingPhoto(true);
  try {
    // 1. Загрузка файла
    const formData = new FormData();
    formData.append("file", file);
    const uploadRes = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const { url } = await uploadRes.json();

    // 2. Создание лога с фото (0 stitches)
    const previousTotal = sortedLogs[0]?.totalStitches || 0;
    const logData = {
      date: new Date().toISOString().split('T')[0],
      dailyStitches: 0,
      totalStitches: previousTotal,
      photoUrl: url,
      previousPhotoUrl: sortedLogs[0]?.photoUrl || null,
      notes: null,
      aiDetected: null,
      aiConfidence: null,
      userCorrected: false,
    };

    await fetch(`/api/projects/${id}/logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(logData),
    });

    toast.success(t("toast.success.photoAdded"));
    queryClient.invalidateQueries({ queryKey: ["project", id] });

    e.target.value = ''; // Reset input
  } catch (error) {
    toast.error(t("toast.error.generic"));
  } finally {
    setUploadingPhoto(false);
  }
};
```

#### UI элементы
```tsx
{/* В CardHeader блока Progress Photos Gallery */}
<Button
  variant="outline"
  size="sm"
  onClick={() => document.getElementById('quick-photo-upload')?.click()}
  disabled={uploadingPhoto}
  className="gap-2"
>
  <Upload className="h-4 w-4" />
  {uploadingPhoto ? t("common.uploading") : t("logs.addPhoto")}
</Button>

<input
  id="quick-photo-upload"
  type="file"
  accept="image/*"
  onChange={handleQuickPhotoUpload}
  disabled={uploadingPhoto}
  className="hidden"
/>
```

#### Пустое состояние
```tsx
{sortedLogs.some(log => log.photoUrl || log.imageUrl) ? (
  // Grid с фотографиями
) : (
  <div className="text-center py-6">
    <Upload className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
    <p className="text-sm text-muted-foreground">{t("logs.noPhotos")}</p>
  </div>
)}
```

---

## 📐 Реорганизация страницы проекта

### Было (до изменений):
1. Enhanced Project Header
2. Progress Overview (отдельная Card)
3. Stats Cards
4. Progress Chart
5. Log History Table
6. Progress Photos Gallery
7. Comments

### Стало (после изменений):
1. **Enhanced Project Header** (с встроенным прогресс-баром)
2. **Stats Cards**
3. **Progress Photos Gallery**
4. **Comments** (для публичных проектов)
5. **Log History Table**
6. **Progress Chart** (в самом низу)

### Ключевые изменения

#### 1. Прогресс-бар встроен в шапку

**Было:**
```tsx
</div> {/* End of Project Header */}

<Card className="gap-3 py-4">
  <CardHeader>
    <CardTitle>{t("projects.progress.title")}</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Progress bar */}
  </CardContent>
</Card>
```

**Стало:**
```tsx
{/* Action Buttons */}
<div className="flex gap-2 flex-wrap mb-5">
  {/* Buttons */}
</div>

{/* Progress Bar - встроен в шапку */}
<div className="space-y-1.5">
  <div className="flex justify-between text-sm">
    <span className="font-medium">
      {completedStitches.toLocaleString()} / {totalStitches.toLocaleString()}
    </span>
    <span className="font-bold text-primary">{pct}%</span>
  </div>
  <Progress value={pct} className="h-2" />
  {project.initialStitches > 0 && (
    <p className="text-xs text-muted-foreground mt-2">
      {t("projects.progress.initialNote", {...})}
    </p>
  )}
</div>
</div> {/* End of Project Header */}
```

#### 2. Фильтрация пустых записей

```tsx
{sortedLogs
  .filter(log => (log.dailyStitches ?? 0) > 0)  // Скрываем записи с 0 stitches
  .map((log) => {
    // Render table row
  })}
```

**Результат:**
- История записей показывает только записи с прогрессом
- Фото-записи (0 stitches) остаются видны в галерее

---

## 🌍 Интернационализация

### Новые ключи (6 языков)

| Ключ | EN | RU | DE | ES | FR | ZH |
|------|----|----|----|----|----|----|
| `common.uploading` | Uploading... | Загрузка... | Hochladen... | Subiendo... | Téléchargement... | 上传中... |
| `logs.addPhoto` | Add Photo | Добавить фото | Foto hinzufügen | Añadir foto | Ajouter une photo | 添加照片 |
| `logs.noPhotos` | No photos yet. Upload your first progress photo! | Пока нет фотографий. Загрузите первое фото прогресса! | Noch keine Fotos. Laden Sie Ihr erstes Fortschrittsfoto hoch! | Aún no hay fotos. ¡Sube tu primera foto de progreso! | Pas encore de photos. Téléchargez votre première photo de progression! | 还没有照片。上传您的第一张进度照片吧！ |

---

## 🎨 UX улучшения

### До
- ❌ Нужно переходить на отдельную страницу для загрузки фото
- ❌ Прогресс-бар занимает отдельную карточку
- ❌ Фотогалерея в самом низу страницы
- ❌ Пустые записи (0 stitches) захламляют таблицу истории

### После
- ✅ Кнопка загрузки прямо в галерее фото
- ✅ Прогресс-бар компактно встроен в шапку
- ✅ Фотогалерея и комментарии выше истории записей
- ✅ Чистая таблица истории, только реальный прогресс
- ✅ Логичный порядок: фото → комментарии → история → график

---

## 📊 Статистика изменений

```
8 files changed, 198 insertions(+), 77 deletions(-)

Изменённые файлы:
- src/app/projects/[id]/page.tsx
- src/components/projects/daily-log-form.tsx
- src/messages/en.json
- src/messages/ru.json
- src/messages/de.json
- src/messages/es.json
- src/messages/fr.json
- src/messages/zh.json
```

**Основные изменения:**
- Новая функция: `handleQuickPhotoUpload`
- Новое состояние: `uploadingPhoto`
- Импорт иконки: `Upload` from lucide-react
- Фильтрация логов: `.filter(log => (log.dailyStitches ?? 0) > 0)`
- Реорганизация 6 основных блоков страницы
- 3 новых ключа переводов × 6 языков = 18 строк

---

## 🐛 Исправленные проблемы

### 1. Пустые записи в истории
**Проблема:** При загрузке фото через быструю кнопку создаётся запись с 0 крестиков, которая появляется в таблице истории как пустая строка.

**Решение:** Добавлен фильтр `.filter(log => (log.dailyStitches ?? 0) > 0)` перед отображением записей.

### 2. Отсутствие быстрого доступа к загрузке фото
**Проблема:** Пользователю нужно переходить через "Add Log" → заполнять форму → загружать фото.

**Решение:** Кнопка "Add Photo" прямо в блоке Progress Photos Gallery.

### 3. Синтаксическая ошибка после изменений
**Проблема:** `Unexpected token. Did you mean {'}'}` на строке 488.

**Причина:** Удалили условный рендеринг `{sortedLogs.some(...) && (`, но не удалили закрывающую скобку `)}`.

**Решение:** Убрана лишняя `)}` после закрытия Card.

---

## 💡 Технические детали

### Workflow загрузки фото

1. **Клик на "Add Photo"** → триггер скрытого input
2. **Выбор файла** → `handleQuickPhotoUpload`
3. **Upload** → `/api/upload` (FormData)
4. **Получение URL** → из response
5. **Создание лога** → `/api/projects/${id}/logs`
   - `dailyStitches: 0`
   - `totalStitches: previousTotal`
   - `photoUrl: url`
6. **Invalidate cache** → React Query
7. **Reset input** → `e.target.value = ''`

### Условия отображения

**Progress Photos Gallery Card:**
- Показывается всегда (не условно)
- Если фото есть → grid с превью
- Если фото нет → пустое состояние с приглашением

**Log History Table:**
- Фильтрует записи с `dailyStitches > 0`
- Total Row считает сумму всех записей (включая скрытые)

**Comments Section:**
- Только для публичных проектов: `{project.isPublic && (...)}`
- Расположена сразу после фотогалереи

---

## 🔄 Совместимость

**Обратная совместимость:** ✅ Полная

**Breaking changes:** ❌ Нет

**Миграция:** Не требуется

**Заметки:**
- Все старые API endpoints работают
- Данные в БД не затронуты
- Старые записи корректно фильтруются
- Backward compatible с полями `imageUrl` / `stitches`

---

## 📝 TODO / Будущие улучшения

- [ ] Добавить drag & drop для загрузки фото
- [ ] Batch upload (загрузка нескольких фото)
- [ ] Crop/resize перед загрузкой
- [ ] Показывать preview во время загрузки
- [ ] Сжатие изображений на клиенте
- [ ] Возможность добавить описание к фото

---

## 🎓 Выводы

Успешно реализована быстрая загрузка фотографий и оптимизирована структура страницы проекта. Улучшен UX работы с фотографиями - теперь пользователь может загружать фото в один клик, не покидая карточку проекта.

Реорганизация страницы делает контент более логично структурированным: визуальный контент (фото, комментарии) находится выше, аналитический (история, график) - ниже. Прогресс-бар встроен в шапку, экономя вертикальное пространство.

Фильтрация пустых записей из таблицы истории делает данные более читаемыми, при этом все фотографии остаются доступными в галерее.
