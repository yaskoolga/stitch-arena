# User-Created Challenges

Система пользовательских челленджей позволяет опытным пользователям создавать свои собственные соревнования для сообщества.

## 📋 Обзор

### Требования для создания челленджей (Eligibility)

Чтобы создать челлендж, пользователь должен соответствовать следующим критериям:

- **📅 Возраст аккаунта:** 30+ дней с момента регистрации
- **🔥 Текущая серия:** 7+ дней подряд с логами
- **🎯 Лимит:** максимум 1 активный челлендж на пользователя одновременно

### Типы челленджей

#### ⚡ Speed Challenge (На скорость)
- **Цель:** Вышить как можно больше крестиков за период
- **Целевое значение:** 1,000 - 100,000 крестиков (для мотивации)
- **Победитель:** Кто вышьет БОЛЬШЕ всех (не обязательно достичь цели)
- **Пример:** "Вышей 10,000 крестиков за неделю"

#### 🔥 Streak Challenge (На серию)
- **Цель:** Поддерживать ежедневную серию логов
- **Целевое значение:** 3 - 365 дней
- **Победитель:** Кто достигнет цели или наберет максимальную серию
- **Пример:** "Вышивай 30 дней подряд без пропусков"

#### ✅ Completion Challenge (На завершение)
- **Цель:** Завершить максимальное количество проектов
- **Целевое значение:** 1 - 50 проектов
- **Победитель:** Кто завершит больше проектов
- **Пример:** "Заверши 3 проекта за месяц"

---

## 🎯 Создание челленджа

### Валидация

Все челленджи проходят автоматическую проверку:

#### Длительность
- **Минимум:** 3 дня
- **Максимум:** 90 дней
- **Проверка:** Дата начала < дата окончания

#### Даты
- **Дата начала:** должна быть в будущем (> текущей даты)
- **Дата окончания:** должна быть после даты начала

#### Целевые значения по типам

| Тип | Минимум | Максимум | Единица |
|-----|---------|----------|---------|
| Speed | 1,000 | 100,000 | крестиков |
| Streak | 3 | 365 | дней |
| Completion | 1 | 50 | проектов |

#### Текстовые поля
- **Название:** 5-100 символов
- **Описание:** до 500 символов (опционально)

---

## ✏️ Редактирование челленджа

### Условия для редактирования

Челлендж можно редактировать только если:

1. ✅ Вы являетесь создателем
2. ✅ Челлендж еще не начался (дата начала > текущей даты)
3. ✅ Нет участников
4. ✅ Челлендж не авто-генерированный

### Что можно изменить

- Тип челленджа (Speed/Streak/Completion)
- Название
- Описание
- Дата начала
- Дата окончания
- Целевое значение

### Ограничения

- ❌ Нельзя редактировать после начала
- ❌ Нельзя редактировать если есть участники
- ❌ Нельзя редактировать авто-генерированные челленджи

---

## 🗑️ Удаление челленджа

### Условия для удаления

Челлендж можно удалить если:

1. ✅ Вы являетесь создателем
2. ✅ Челлендж не авто-генерированный
3. ✅ **И одно из:**
   - Челлендж еще не начался (upcoming)
   - **ИЛИ** челлендж активный, но нет участников

### Ограничения

- ❌ Нельзя удалить если есть участники (для активных или завершенных)
- ❌ Нельзя удалить авто-генерированные челленджи
- ❌ Нельзя удалить завершенный челлендж с участниками

---

## 🎨 UI/UX Features

### Eligibility Banner

Если пользователь не соответствует требованиям, показывается баннер с прогрессом:

```
┌─────────────────────────────────────────────┐
│ ℹ️ Keep Stitching to Unlock Challenge      │
│    Creation!                                │
│                                             │
│ To create custom challenges, you need:     │
│                                             │
│ Account Age    [████████░░] 25/30 days     │
│ Current Streak [██████░░░░]  6/7 days      │
│                                             │
│ Keep logging your daily stitches!          │
└─────────────────────────────────────────────┘
```

### Badges (Бейджи)

На карточках и детальных страницах челленджей отображаются бейджи:

- **⚡ Auto-generated** - челлендж создан системой автоматически
- **👤 Created by You** - челлендж создан вами
- **👥 By {Name}** - челлендж создан другим пользователем

### Кнопки действий

На детальной странице челленджа (если вы создатель):

- **✏️ Edit** - редактировать (активна только если можно редактировать)
- **🗑️ Delete** - удалить (активна только если можно удалить)

Если кнопка неактивна, при наведении показывается tooltip с причиной.

---

## 🔌 API Endpoints

### Создание челленджа

```
POST /api/challenges
```

**Body:**
```json
{
  "type": "speed",
  "title": "Winter Speed Challenge",
  "description": "Stitch as much as you can this winter!",
  "startDate": "2026-12-01",
  "endDate": "2026-12-31",
  "targetValue": 50000
}
```

**Response (успех):**
```json
{
  "data": {
    "id": "...",
    "type": "speed",
    "title": "Winter Speed Challenge",
    ...
  }
}
```

**Response (ошибка eligibility):**
```json
{
  "error": "You are not eligible to create challenges",
  "details": {
    "tenure": 15,
    "currentStreak": 3,
    "tenureRequired": 30,
    "streakRequired": 7
  }
}
```

### Проверка eligibility

```
GET /api/challenges/eligibility
```

**Response:**
```json
{
  "data": {
    "eligible": true,
    "tenure": 45,
    "currentStreak": 14,
    "tenureRequired": 30,
    "streakRequired": 7,
    "activeCount": 0,
    "maxActive": 1,
    "canCreate": true
  }
}
```

### Редактирование челленджа

```
PUT /api/challenges/[id]
```

**Body:** (все поля опциональны)
```json
{
  "title": "Updated Title",
  "targetValue": 75000
}
```

### Удаление челленджа

```
DELETE /api/challenges/[id]
```

**Response:**
```json
{
  "success": true
}
```

---

## 🌍 Интернационализация

Система полностью локализована на 6 языках:

- 🇬🇧 English (EN)
- 🇷🇺 Русский (RU)
- 🇩🇪 Deutsch (DE)
- 🇪🇸 Español (ES)
- 🇫🇷 Français (FR)
- 🇨🇳 中文 (ZH)

### Переводятся:

- Названия типов челленджей
- Описания типов
- Сообщения валидации
- Ошибки
- UI элементы (кнопки, формы, баннеры)

---

## 🗄️ Database Schema

### Challenge Model

```prisma
model Challenge {
  id              String   @id @default(cuid())
  type            String   // "speed", "streak", "completion"
  title           String
  description     String?
  startDate       DateTime
  endDate         DateTime
  targetValue     Int
  isActive        Boolean  @default(true)
  isAutoGenerated Boolean  @default(false)
  createdBy       String?  // User ID (null for auto-generated)
  createdAt       DateTime @default(now())

  creator         User?    @relation("CreatedChallenges", fields: [createdBy], references: [id], onDelete: SetNull)
  participants    ChallengeParticipant[]
  leaderboard     ChallengeLeaderboard[]

  @@index([isActive, startDate, endDate])
  @@index([createdBy, isActive])
}
```

### User Model (добавлено)

```prisma
model User {
  ...
  createdChallenges Challenge[] @relation("CreatedChallenges")
  ...
}
```

---

## 🔧 Technical Implementation

### Permission Helpers

```typescript
// Проверка eligibility
checkChallengeCreationEligibility(userId): Promise<EligibilityResult>

// Подсчет активных челленджей
countActiveUserChallenges(userId): Promise<number>

// Проверка прав на редактирование
canEditChallenge(challengeId, userId): Promise<PermissionResult>

// Проверка прав на удаление
canDeleteChallenge(challengeId, userId): Promise<PermissionResult>
```

### Validation Schemas (Zod)

```typescript
// Создание
challengeCreateSchema: z.object({
  type: z.enum(["speed", "streak", "completion"]),
  title: z.string().min(5).max(100),
  description: z.string().max(500).optional(),
  startDate: z.string().refine(...),
  endDate: z.string().refine(...),
  targetValue: z.number().int().positive()
})
.refine(...) // duration 3-90 days
.refine(...) // target value ranges

// Редактирование
challengeUpdateSchema: partial of challengeCreateSchema
```

### Components

- `CreateChallengeDialog` - форма создания
- `EditChallengeDialog` - форма редактирования
- `EligibilityBanner` - баннер с требованиями
- `ChallengeActions` - кнопки Edit/Delete
- `ChallengeCard` - карточка с бейджем создателя

---

## 📊 Edge Cases

### Обработанные сценарии

1. **Concurrent creation** - повторная проверка лимита в транзакции
2. **Streak drops after creation** - челлендж остается активным
3. **Editing with participants** - полностью заблокировано
4. **Deletion with participants** - заблокировано для активных/завершенных
5. **Auto-generated challenges** - нельзя редактировать/удалять
6. **Start date validation** - должна быть в будущем
7. **Duration validation** - 3-90 дней
8. **Target value ranges** - разные для каждого типа

---

## 🚀 Future Enhancements

Возможные улучшения в будущем:

- 📊 **Challenge Templates** - шаблоны популярных челленджей
- 🏆 **Prizes** - виртуальные награды за победу
- 📈 **Challenge Analytics** - детальная статистика челленджа
- 🎖️ **Challenge Badges** - специальные достижения
- 👥 **Team Challenges** - командные соревнования
- 🔔 **Challenge Notifications** - уведомления о начале/конце
- 📅 **Recurring Challenges** - повторяющиеся челленджи

---

**Дата создания:** 21.02.2026
**Версия:** 1.0.0
**Статус:** ✅ Реализовано
