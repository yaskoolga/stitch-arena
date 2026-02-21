# StitchArena — Progress

## Phase 0 + Phase 1 (MVP)

### Step 1: Инициализация проекта
- [x] Next.js 16 (TypeScript, Tailwind, App Router)
- [x] Prisma 5 + SQLite
- [x] NextAuth.js 4
- [x] Recharts, TanStack Query, date-fns, bcryptjs
- [x] shadcn/ui (button, card, input, label, textarea, select, dialog, badge, separator, avatar, dropdown-menu, progress, tabs, sonner, form)
- [x] .env настроен

### Step 2: База данных
- [x] Prisma schema: User, Project, DailyLog
- [x] Миграция `init` применена
- [x] Prisma client singleton (`src/lib/prisma.ts`)

### Step 3: Аутентификация
- [x] NextAuth config (CredentialsProvider, JWT sessions)
- [x] API: `/api/auth/register` (bcrypt hash)
- [x] API: `/api/auth/[...nextauth]`
- [x] Страница `/login`
- [x] Страница `/register`
- [x] Middleware для защиты routes (dashboard, projects, profile)
- [x] Типы NextAuth расширены (session.user.id)

### Step 4: Projects CRUD
- [x] API: GET `/api/projects` (список с completedStitches)
- [x] API: POST `/api/projects` (создание)
- [x] API: GET `/api/projects/[id]` (детали + логи)
- [x] API: PUT `/api/projects/[id]` (редактирование)
- [x] API: DELETE `/api/projects/[id]` (удаление)
- [x] UI: Dashboard со списком проектов (project-card с progress bar)
- [x] UI: Форма создания проекта (`/projects/new`)
- [x] UI: Страница проекта (`/projects/[id]`)
- [x] UI: Редактирование проекта (`/projects/[id]/edit`)

### Step 5: Daily Tracking
- [x] API: GET `/api/projects/[id]/logs`
- [x] API: POST `/api/projects/[id]/logs`
- [x] API: PUT `/api/logs/[id]`
- [x] API: DELETE `/api/logs/[id]`
- [x] UI: Форма логирования (дата + стежки + заметка)
- [x] UI: История логов с удалением

### Step 6: Прогресс и графики
- [x] Progress bar на project-card и project detail
- [x] Line chart (Recharts): cumulative + daily stitches
- [x] Stats cards: прогресс %, дни с момента старта, среднее/день, прогноз дней

### Step 7: Профиль
- [x] API: GET/PUT `/api/profile`
- [x] UI: Просмотр профиля (email, name, bio)
- [x] UI: Редактирование профиля

### Верификация (31.01.2026)
- [x] Регистрация нового пользователя
- [x] Логин
- [x] Создание проекта
- [x] Добавление daily logs
- [x] Просмотр данных прогресса (completedStitches)
- [x] Редактирование/удаление проекта и логов
- [x] Профиль пользователя
- [x] Все страницы возвращают HTTP 200
- [x] Production build проходит без ошибок

---

## Phase 2 (запланировано)

### Phase 2A: UX улучшения
- [x] Dark mode — ThemeProvider (next-themes) + toggle в header (31.01.2026)
- [x] Responsive sidebar — боковая навигация, скрывается на мобильных, кнопка Menu (31.01.2026)
- [x] Skeleton loading states — dashboard (SkeletonCard) + project detail (SkeletonProjectDetail) (31.01.2026)
- [x] Подтверждение удаления через Dialog — ConfirmDialog для проектов и логов (31.01.2026)
- [x] Toast уведомления — sonner при create/update/delete проектов и логов (31.01.2026)
- [x] Сортировка/фильтрация проектов — по статусу (all/in_progress/completed/paused) + сортировка (newest/oldest/progress/name) (31.01.2026)
- [x] Пагинация логов — 10 записей на страницу, Previous/Next (31.01.2026)

### Phase 2B: Функциональность
- [x] Google OAuth provider — GoogleProvider в auth.ts, авто-создание User, кнопка на login (31.01.2026)
  - Для активации: добавить GOOGLE_CLIENT_ID и GOOGLE_CLIENT_SECRET в .env
  - Миграция `oauth_optional_password` — password стал nullable
- [x] Загрузка изображений — фото проекта (цель/схема) (31.01.2026)
- [x] Загрузка изображений — фото прогресса в логах (31.01.2026)
- [x] API `/api/upload` — загрузка файлов (JPEG, PNG, WebP, GIF, до 5MB) (31.01.2026)
- [x] Миграция `add_images` — поля `imageUrl` в Project и DailyLog (31.01.2026)
- [x] Загрузка аватара пользователя — upload в профиле + отображение (31.01.2026)
- [x] Экспорт данных (CSV) — API `/api/projects/[id]/export`, кнопка "Export CSV" на странице проекта (31.01.2026)
- [x] Публичные проекты — API `/api/projects/public`, страница `/gallery` (31.01.2026)
- [x] Калькулятор ткани/ниток — страница `/calculator` (размер ткани, кол-во мотков) (31.01.2026)
- [x] Таймер сессии вышивки — компонент SessionTimer на странице проекта (start/pause/reset) (31.01.2026)

### Phase 2C: CV-сервис
- [x] Python/FastAPI сервис — структура проекта (07.02.2026)
- [x] CV endpoints — /api/health, /api/detect (07.02.2026)
- [x] Stitch detection — K-means color clustering, grid detection (07.02.2026)
- [x] Next.js integration — /api/cv/detect proxy endpoint (07.02.2026)
- [x] React hook — useCVDetection для frontend (07.02.2026)
- [x] Pattern Analyzer компонент — UI для загрузки и анализа (07.02.2026)
- [x] Docker setup — Dockerfile, docker-compose (07.02.2026)
- [x] Tests — pytest с 8 unit тестами (07.02.2026)
- [x] Documentation — README.md, QUICKSTART.md (07.02.2026)
- [ ] YOLOv8 model — trained model для точного подсчета (будущее)
- [ ] Calibration endpoint — калибровка по известным размерам (будущее)

### Phase 2D: Инфраструктура
- [x] Input validation (zod v4) — все 6 API роутов валидируют вход через zod-схемы (31.01.2026)
- [x] Rate limiting — in-memory rate limiter на register (5/мин) и upload (20/мин) (31.01.2026)
- [x] Docker-compose — PostgreSQL 16 контейнер (31.01.2026)
- [x] Подготовка PostgreSQL — `prisma/schema.postgresql.prisma` с индексами (31.01.2026)
- [x] Тесты (Vitest) — 25 тестов: валидация zod-схем (20), rate limiter (3), компонент StatsCards (2) (01.02.2026)
- [x] Переименование проекта: Skolko Krestikov → StitchArena (01.02.2026)
- [ ] Тесты (Playwright e2e)
- [ ] CI/CD

---

## Обновления (08.02.2026)

### UX и функциональность
- [x] **Поле "Производитель"** - добавлено в модель Project (08.02.2026)
  - Справочник производителей (Dimensions, DMC, Anchor, Bucilla, Janlynn, Mill Hill, RIOLIS, Heritage Crafts, Vervaco, Lanarte, Panna, Русская сказка, Алиса, Чудесная игла)
  - Возможность ввести свой вариант
  - Отображение на странице проекта
- [x] **Статистика "Days"** вместо "Sessions" (08.02.2026)
  - Подсчет дней с момента первого лога
  - Внизу указано количество логов
- [x] **Удален SessionTimer** - больше не нужен для текущей логики (08.02.2026)
- [x] **Упрощена форма добавления лога** (08.02.2026)
  - Простой ручной ввод количества крестиков за день
  - Автоматический расчет totalStitches (previous + daily)
  - Опциональная загрузка фото прогресса
  - Поле для заметок

### Обработка изображений
- [x] **Автоматическая оптимизация** при загрузке (08.02.2026)
  - Resize до макс. 1920px (качество 85%)
  - Создание thumbnail 800px (качество 80%)
  - Конвертация в WebP формат
  - Лимит увеличен до 10MB
  - Уменьшение размера файлов в 10-20 раз
- [x] **Модальное окно для просмотра фото** (08.02.2026)
  - Маленькие превью в логах (80x80px) и на странице проекта (128x128px)
  - Клик для увеличения - полноразмерное изображение в модальном окне
  - Hover эффект "Click to enlarge"
  - Работает для фото схемы и фото прогресса

### UI улучшения
- [x] **Кнопка удаления на карточках** в Dashboard (08.02.2026)
  - Иконка корзины в правом верхнем углу
  - Диалог подтверждения перед удалением
  - Быстрое удаление без захода в проект
- [x] **Исправлено отображение фото** - schemaImage и photoUrl (08.02.2026)
- [x] **Обратная совместимость** - поддержка старых и новых форматов данных (08.02.2026)
- [x] **Защита от ошибок** - проверки на null для всех полей (08.02.2026)
- [x] **Исправлен график** - правильная обработка старых и новых логов (08.02.2026)

### База данных
- [x] Миграция `add_manufacturer` - добавлено поле manufacturer в Project (08.02.2026)

---

## Что осталось

### Phase 2C: CV-сервис
- Загрузка схемы, подсчёт крестиков по цветам, автоопределение totalStitches

### Phase 2D: Инфраструктура (незавершённое)
- Playwright e2e тесты
- CI/CD (GitHub Actions)

### Другое
- Доработка UI/дизайна (отмечено как задача на будущее)
- [x] Переименовать папку проекта: `skolko-krestikov` → `stitch-arena` (07.02.2026)
