# StitchArena

Трекер прогресса для вышивки крестиком. Создавайте проекты, логируйте ежедневный прогресс, отслеживайте статистику и визуализируйте свой прогресс с красивыми графиками.

## ✨ Основные возможности

### 📊 Tracking & Analytics
- 📊 **Daily Tracking** — Ручной ввод ежедневного прогресса
- 📈 **Advanced Charts** — Красивые графики и статистика (дни, среднее/день, прогноз)
- 📊 **Overall Statistics** — Общая статистика по всем проектам на Dashboard
- 🔥 **Streaks System** — Отслеживание ежедневных и рекордных стриков
- 📅 **Activity Heatmap** — Календарь активности за последние 12 месяцев
- ⏱️ **Completion Forecast** — Прогноз даты завершения проекта

### 🎮 Gamification
- 🏆 **17 Achievements** — Достижения по 6 категориям (First Steps, Consistency, Speed Demon, Completionist, Social Butterfly, Milestones)
- 🚀 **Speed Tiers** — 4 уровня скорости (🐢 Turtle, 🚴 Bike, 🚗 Car, 🚀 Rocket)
- 📊 **Progress Tracking** — Отслеживание прогресса по каждому достижению
- 🏆 **Challenges** — Челленджи на скорость/серию/завершение с лидербордами
- 👥 **User-Created Challenges** — Создание своих челленджей (требования: 30+ дней аккаунт, 7+ дней серия)

### 🌈 Project Management
- 🏭 **Manufacturer** — Справочник производителей схем (DMC, Dimensions, RIOLIS и др.)
- 🏷️ **Theme Tags** — 12 категорий тематик (Nature, Animals, Abstract, Seasonal, Fantasy и др.)
- 📸 **Image Upload** — Загрузка и оптимизация фото (WebP, thumbnails)
- 🔍 **Image Viewer** — Модальное окно для просмотра фото
- 🗑️ **Quick Delete** — Удаление проектов прямо из Dashboard

### 👥 Social Features
- ❤️ **Likes** — Лайкайте понравившиеся проекты
- 💬 **Comments** — Комментируйте публичные проекты
- 🌟 **Community Feed** — Лента активности сообщества (новые проекты и обновления)
- 🖼️ **Public Gallery** — Галерея публичных проектов с фильтрацией по темам
- ⭐ **Favorites** — Страница избранных проектов

### 🎨 UI/UX
- 🌙 **Dark Mode** — Темная тема
- 📱 **Responsive** — Адаптивный дизайн
- ⚡ **Optimistic Updates** — Мгновенная реакция на действия пользователя
- 🔐 **Auth** — Google OAuth + credentials

## Стек технологий

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Database**: SQLite + Prisma ORM
- **Auth**: NextAuth.js (credentials + Google OAuth, JWT)
- **UI**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts
- **Data fetching**: TanStack Query

### Image Processing
- **Sharp**: Автоматическое сжатие и ресайз изображений
- **WebP**: Конвертация в эффективный формат
- **Thumbnails**: Создание превью для быстрой загрузки

### CV Service (опционально, не используется в текущей версии)
- **Framework**: Python + FastAPI
- **CV**: OpenCV + NumPy + scikit-image
- **Detection**: K-means clustering, Canny edge detection, Hough transform
- **Future**: YOLOv8 для точного распознавания

## Быстрый старт

### 1. Основное приложение (Next.js)

```bash
# Установить зависимости
npm install

# Применить миграции БД
npx prisma migrate dev

# Запустить dev-сервер
npm run dev
```

Открыть http://localhost:3000

### 2. CV Service (опционально, для AI-анализа)

**Вариант A: Docker** (рекомендуется)
```bash
docker-compose up cv-service
```

**Вариант B: Локально**
```bash
cd cv-service
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
python -m app.main
```

Открыть http://localhost:8001/docs (Swagger UI)

📚 **Подробнее:** см. [CV_SERVICE_SETUP.md](CV_SERVICE_SETUP.md)

## Переменные окружения (.env)

```env
# Database
DATABASE_URL="file:./dev.db"

# Auth
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (optional)
# GOOGLE_CLIENT_ID=""
# GOOGLE_CLIENT_SECRET=""

# CV Service (optional)
CV_SERVICE_URL="http://localhost:8001"
```

## Структура проекта

```
src/
  app/
    (auth)/login, register   — страницы авторизации
    dashboard/               — главная страница со статистикой и проектами
    projects/new             — создание проекта
    projects/[id]            — детали проекта + график + логи + комментарии
    projects/[id]/edit       — редактирование проекта
    profile/                 — профиль пользователя
    gallery/                 — галерея публичных проектов
    community/               — лента активности сообщества
    favorites/               — избранные проекты
    calculator/              — калькулятор материалов
    api/                     — API routes
      auth/                  — аутентификация
      projects/              — CRUD проектов + likes, comments
      logs/                  — CRUD логов
      stats/                 — статистика
      achievements/          — достижения
      feed/                  — лента активности
      favorites/             — избранные проекты
  components/
    ui/                      — shadcn/ui компоненты
    layout/                  — header, sidebar
    projects/                — project-card, project-form, progress-chart, like-button, theme-tags-selector
    dashboard/               — overall-stats, activity-heatmap, stats-cards
    achievements/            — speed-badge, achievement-badge, achievements-section
    comments/                — comments-section
  lib/
    prisma.ts                — Prisma client singleton
    auth.ts                  — NextAuth config
    constants.ts             — константы (темы, скорости, достижения)
    stats.ts                 — утилиты для статистики
    achievements.ts          — логика достижений
    validations.ts           — Zod схемы
    utils.ts                 — утилиты (cn)
prisma/
  schema.prisma              — модели User, Project, DailyLog, UserAchievement, Comment, Like
```

## API Endpoints

### Next.js API

#### 🔐 Auth
| Method | Path | Описание |
|--------|------|----------|
| POST | `/api/auth/register` | Регистрация |
| GET/POST | `/api/auth/[...nextauth]` | NextAuth (login/session) |

#### 📊 Projects
| Method | Path | Описание |
|--------|------|----------|
| GET | `/api/projects` | Список проектов пользователя |
| POST | `/api/projects` | Создать проект (с темами) |
| GET | `/api/projects/[id]` | Детали проекта + логи |
| PUT | `/api/projects/[id]` | Обновить проект (с темами) |
| DELETE | `/api/projects/[id]` | Удалить проект |
| GET | `/api/projects/public` | Публичные проекты (с фильтрацией по темам) |
| GET | `/api/projects/[id]/export` | Экспорт в CSV |

#### 📝 Logs
| Method | Path | Описание |
|--------|------|----------|
| GET | `/api/projects/[id]/logs` | Список логов проекта |
| POST | `/api/projects/[id]/logs` | Добавить лог |
| PUT | `/api/logs/[id]` | Обновить лог |
| DELETE | `/api/logs/[id]` | Удалить лог |

#### 📊 Statistics & Achievements
| Method | Path | Описание |
|--------|------|----------|
| GET | `/api/stats/overall` | Общая статистика (проекты, крестики, стрики, heatmap) |
| GET | `/api/achievements` | Список всех достижений с прогрессом |
| POST | `/api/achievements` | Проверить и разблокировать новые достижения |

#### 💬 Social
| Method | Path | Описание |
|--------|------|----------|
| GET | `/api/projects/[id]/comments` | Список комментариев проекта |
| POST | `/api/projects/[id]/comments` | Добавить комментарий |
| DELETE | `/api/comments/[id]` | Удалить комментарий |
| GET | `/api/projects/[id]/like` | Проверить лайк + количество лайков |
| POST | `/api/projects/[id]/like` | Toggle лайк |
| GET | `/api/favorites` | Список избранных проектов |
| GET | `/api/feed` | Лента активности (type: all/projects/logs) |

#### 👤 Profile & Other
| Method | Path | Описание |
|--------|------|----------|
| GET | `/api/profile` | Профиль пользователя |
| PUT | `/api/profile` | Обновить профиль |
| POST | `/api/upload` | Загрузка изображений |
| POST | `/api/cv/detect` | AI-анализ схемы (опционально) |

### CV Service API

| Method | Path | Описание |
|--------|------|----------|
| GET | `/api/health` | Health check |
| POST | `/api/detect` | Определить крестики на схеме |

## Модели данных

- **User**: email, name, password (bcrypt), avatar, bio, relations: projects, logs, achievements, comments, likes
- **Project**: title, description, manufacturer, totalStitches, width, height, schemaImage, canvasType, status, isPublic, themes (JSON array), relations: logs, comments, likes
- **DailyLog**: date, totalStitches, dailyStitches, photoUrl, notes, aiDetected, aiConfidence, userCorrected, привязан к Project
- **UserAchievement**: userId, achievementId, unlockedAt, progress, привязан к User
- **Comment**: userId, projectId, text, createdAt, updatedAt, привязан к User и Project
- **Like**: userId, projectId, createdAt, привязан к User и Project

## Скрипты

### Next.js
```bash
npm run dev       # dev-сервер
npm run build     # production build
npm run start     # production server
npm run test      # unit тесты (vitest)
npx prisma studio # GUI для БД
```

### CV Service
```bash
cd cv-service
python -m app.main        # запуск сервиса
pytest                    # unit тесты
pytest --cov=app tests/   # с покрытием
```

## 📚 Документация

- **[FEATURES.md](FEATURES.md)** — Полный список функций
- **[CHANGELOG.md](CHANGELOG.md)** — История изменений
- **[FUTURE_FEATURES.md](FUTURE_FEATURES.md)** — Roadmap и будущие функции
- **[PROGRESS.md](PROGRESS.md)** — История разработки и прогресс
- **[CV_SERVICE_SETUP.md](CV_SERVICE_SETUP.md)** — Настройка CV-сервиса
- **[cv-service/README.md](cv-service/README.md)** — CV Service документация
- **[cv-service/QUICKSTART.md](cv-service/QUICKSTART.md)** — Quick start CV

## 🚀 Deployment

### Frontend (Vercel)
```bash
vercel deploy
```

### CV Service (Docker)
```bash
docker build -t stitch-arena-cv ./cv-service
docker run -p 8001:8001 stitch-arena-cv
```

## 🧪 Testing

- **Frontend**: 25 unit тестов (Vitest) — валидация, rate limiting, компоненты
- **CV Service**: 8 unit тестов (pytest) — endpoints, detection, validations

## 📊 Status

### Completed Phases
- ✅ **Phase 0**: Infrastructure
- ✅ **Phase 1**: MVP (auth, projects, tracking, charts)
- ✅ **Phase 2A**: UX improvements (dark mode, responsive, loading states, quick delete)
- ✅ **Phase 2B**: Features (OAuth, images with optimization, export, calculator)
- ✅ **Phase 2C**: Image processing (sharp, WebP, modal viewer)
- ✅ **Phase 2D**: Manual tracking (simplified daily log form)
- ✅ **Phase 3A**: Advanced Statistics (overall stats, heatmap, streaks, completion forecast)
- ✅ **Phase 3B**: Themes & Tags (12 theme categories, filtering)
- ✅ **Phase 3C**: Gamification (17 achievements, 4 speed tiers, progress tracking)
- ✅ **Phase 3D**: Social Features (comments, likes, favorites, community feed) 🎉

### In Progress
- ⏳ **Phase 4**: Testing & CI/CD (e2e tests, automated deployment)

### Future Plans
- 🔮 **Phase 5**: Follow System (follow projects, notifications)
- 🔮 **Phase 6**: AI CV Service (YOLOv8 для автоматического подсчета)
- 🔮 **Phase 7**: Advanced Social (follow users, challenges, leaderboards)

📚 **Roadmap**: см. [FUTURE_FEATURES.md](FUTURE_FEATURES.md)

## 📝 License

MIT
