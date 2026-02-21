# Changelog

All notable changes to StitchArena will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

## [0.5.2] - 2026-02-21

### Added - Улучшенная галерея с фильтрами и переводами 🎨

#### Новые фильтры
- 🔍 **Поиск по названию** - динамический поиск проектов
- 🏭 **Фильтр по производителю** - выпадающий список всех производителей
- 🎨 **Переведённые теги** - все 12 тем на 6 языках
- 📊 **Сортировка**: Сначала новые / По прогрессу

#### Улучшения отображения
- Показываются ВСЕ публичные проекты (не только завершённые)
- Правильный статус проекта (в процессе/завершён/на паузе)
- Имя автора с ссылкой на профиль
- Адаптивная раскладка фильтров

#### API изменения
- Добавлен `manufacturer` в ответ
- Поддержка query параметров: `search`, `manufacturer`, `themes`
- Увеличен лимит до 100 проектов
- Case-insensitive поиск

### Translations
- Добавлены переводы для 12 тем × 6 языков = 72 строки
- Добавлены ключи галереи:
  - `gallery.by` - "by" / "от"
  - `gallery.filters.allManufacturers`
  - `gallery.filters.searchPlaceholder`
  - `gallery.filters.newest`
  - `gallery.filters.byProgress`
- Секция `themes.*` для всех тем

---

## [0.5.1] - 2026-02-21

### Added - Быстрая загрузка фото и улучшенная структура страницы проекта 📸

#### Быстрая загрузка фото
- 📸 **Кнопка быстрой загрузки** прямо в блоке Progress Photos Gallery
  - Загрузка фото без перехода на отдельную страницу
  - Создаётся запись с 0 крестиков (только фото)
  - Доступна всегда, даже когда фото ещё нет
- 🖼️ **Пустое состояние** для галереи без фотографий
  - Приглашающее сообщение с иконкой
  - Понятная навигация для первой загрузки

#### Реорганизация страницы проекта
- 📊 **Прогресс-бар встроен в шапку** проекта
  - Удалена отдельная карточка Progress Overview
  - Компактное расположение всей информации
- 🔄 **Новый порядок блоков**:
  1. Project Header (с встроенным прогресс-баром)
  2. Stats Cards
  3. Progress Photos Gallery
  4. Comments (для публичных проектов)
  5. Log History Table
  6. Progress Chart (перенесён в самый низ)

### Changed
- 📋 **История записей** - скрыты записи с 0 крестиков
  - Чистая таблица, только записи с реальным прогрессом
  - Фото-записи остаются видны в галерее
- 📍 **Улучшенная навигация** - логичное расположение контента

### Translations
- Добавлены ключи во все 6 языков (en/ru/de/es/fr/zh):
  - `common.uploading` - "Uploading..." / "Загрузка..."
  - `logs.addPhoto` - "Add Photo" / "Добавить фото"
  - `logs.noPhotos` - "No photos yet. Upload your first progress photo!"

---

## [0.5.0] - 2026-02-21

### Added - Компактный дизайн и улучшенная навигация 🎨

#### Новые компоненты Dashboard
- 👤 **CompactProfile** - объединённый блок профиля и достижений
  - Профиль слева: аватар, имя, email, дата регистрации
  - Достижения справа: все достижения в горизонтальной ленте
  - Выполненные достижения: яркие, с зелёной галочкой в tooltip
  - Невыполненные: серые (grayscale 30%) с прогрессом в tooltip
  - Визуальный разделитель между группами
- 📊 **CompactStats** - компактная статистика (5 карточек)
  - Убраны Top Projects и Activity Heatmap
  - Уменьшены отступы и шрифты
- 📈 **ActivityHeatmapCard** - отдельная карточка с календарём активности
- 🏆 **CompactAchievements** - компонент достижений (встроен в профиль)

#### Глобальная компактность UI
- 📐 **Сетки проектов**: 4 колонки на xl экранах (было 3)
- 🎨 **Компактные карточки проектов** (ProjectCard):
  - Уменьшены заголовки: `text-lg` → `text-base`
  - Меньше отступы: `pb-2 px-4` → `pb-1.5 px-3 pt-3`
  - Компактные badges: `text-xs` → `text-[10px]`
  - Progress bar: `h-2` → `h-1.5`
- 📄 **Компактные страницы**:
  - Gallery: заголовок `text-3xl` → `text-2xl`, 4 колонки на xl
  - Community: компактные feed cards, меньше отступы
  - Favorites: аналогично Gallery
  - Achievement badges: уменьшены размеры для sm/md/lg

#### Улучшенная навигация
- 🗑️ **Удалён пункт "Projects"** из меню (проекты доступны через Dashboard)
- 🗑️ **Удалён пункт "Profile"** из меню (Dashboard теперь и есть профиль)
- 📱 **Упрощённое меню**: 6 пунктов вместо 8

#### Новая структура Dashboard
1. Профиль + Достижения (объединённый блок)
2. Компактная статистика (5 карточек в ряд)
3. Проекты (фильтры + сетка 4 колонки)
4. Activity Heatmap (в конце)

### Changed
- Dashboard теперь полноценный профиль пользователя
- Все достижения показываются в одной строке
- Уменьшены размеры шрифтов и отступов глобально

### Fixed
- pattern-analyzer: исправлен вызов `detectProgress` вместо `detectStitches`
- project-form: исправлен тип для `disabled` prop
- achievement-badges: добавлен `platinum` в `tierOrder`

### Translations
- Добавлен `memberSince` во все 6 языков (en/ru/de/es/fr/zh)

---

## [0.4.0] - 2026-02-08

### Added - Phase 3D: Social Features 🎉

#### Community Feed
- 🌟 **Community Feed page** - лента активности сообщества
  - Фильтрация по типу: все / новые проекты / обновления прогресса
  - Infinite scroll с пагинацией
  - Два типа карточек: ProjectFeedCard и LogFeedCard
  - Отображение новых проектов с изображениями, прогрессом и темами
  - Отображение обновлений прогресса с фото и количеством крестиков
- 📡 **Feed API** (`/api/feed`)
  - Объединенная лента из проектов и логов
  - Фильтрация по типу контента
  - Пагинация с offset/limit

#### Likes & Favorites
- ❤️ **Система лайков**
  - Кнопка лайка на карточках проектов
  - Toggle like/unlike одним кликом
  - Счетчик лайков в реальном времени
  - Оптимистичные обновления UI
- ⭐ **Страница Favorites**
  - Отображение всех лайкнутых проектов
  - Фильтрация и сортировка
  - Быстрый доступ к избранным
- 📊 **API endpoints**
  - `GET/POST /api/projects/[id]/like` - управление лайками
  - `GET /api/favorites` - список избранных

#### Comments
- 💬 **Система комментариев**
  - Форма добавления комментариев (до 1000 символов)
  - Список комментариев с аватарами
  - Временные метки (date-fns)
  - Удаление своих комментариев
  - Только для публичных проектов
- 📡 **API endpoints**
  - `GET/POST /api/projects/[id]/comments` - чтение и создание
  - `DELETE /api/comments/[id]` - удаление

#### UI Updates
- 🧭 **Обновленная навигация**
  - Добавлена ссылка Community в sidebar
  - Добавлена ссылка Favorites в sidebar
- 🎨 **Новые компоненты**
  - `CommentsSection` - секция комментариев
  - `LikeButton` - кнопка лайка с анимацией

### Database
- Новые модели:
  - `Comment` - комментарии к проектам
  - `Like` - лайки проектов
- Индексы для производительности:
  - `@@index([projectId])` в Comment
  - `@@index([userId])` в Comment
  - `@@unique([userId, projectId])` в Like

---

## [0.3.0] - 2026-02-07

### Added - Phase 3A, 3B, 3C: Statistics, Themes & Gamification

#### Overall Statistics (Phase 3A)
- 📊 **Dashboard Statistics** - общая статистика по всем проектам
  - 5 summary cards: Всего проектов, Всего крестиков, Средняя скорость, Самый продуктивный день, Текущий стрик
  - 📅 **Activity Heatmap** - GitHub-style календарь за 12 месяцев
  - 🏆 **Top 5 Projects** - самые большие проекты
- ⏱️ **Completion Forecast** - прогноз даты завершения
  - Расчет на основе средней скорости
  - Отображение в карточках проектов
- 🔥 **Streaks System** - отслеживание стриков
  - Текущий стрик (с grace period)
  - Рекордный стрик
- 📡 **API endpoint**: `GET /api/stats/overall` с кешированием (5 минут)

#### Theme Tags (Phase 3B)
- 🏷️ **12 категорий тематик**: Nature, Animals, Abstract, Seasonal, Fantasy, Portrait, Geometric, Holiday, Quotes, Religious, Pop Culture, Other
- 🔍 **Фильтрация в галерее** по темам
- 🎨 **Multi-select компонент** для выбора тем (до 5 на проект)
- ✅ **Zod валидация** тем в формах
- 📊 **API**: обновлен `/api/projects/public` для фильтрации

#### Gamification (Phase 3C)
- 🏆 **17 Achievements** по 6 категориям:
  - 🌱 **First Steps**: First Project, First 100, First 1000, First Complete
  - ⚡ **Consistency**: Week Warrior, Month Master, Streak Legend
  - 🚀 **Speed Demon**: Speed Demon, Lightning Fast
  - 🎯 **Completionist**: Finisher, Project Juggler, Perfectionist
  - 💬 **Social Butterfly**: First Like, Commenter, Popular Project
  - 🏅 **Milestones**: Big Project, Mega Project
- 🚗 **4 Speed Tiers** на основе средней скорости:
  - 🐢 Turtle (0-50 крестиков/день)
  - 🚴 Bike (51-150 крестиков/день)
  - 🚗 Car (151-300 крестиков/день)
  - 🚀 Rocket (301+ крестиков/день)
- 📈 **Progress Tracking** для каждого достижения
- 🎨 **Компактный UI** с градиентами
  - Achievement badges (gold для unlocked, gray для locked)
  - Speed badges с эмодзи
  - Категории с табами
- 📡 **API endpoints**:
  - `GET /api/achievements` - список с прогрессом
  - `POST /api/achievements` - проверка и разблокировка

### Database
- Новые поля:
  - `themes String[]` в Project (хранится как JSON)
- Новые модели:
  - `UserAchievement` - разблокированные достижения
- Индексы:
  - `@@index([themes])` в Project
  - `@@index([projectId, date])` в DailyLog
  - `@@index([userId])` в UserAchievement

### Components
- `src/components/dashboard/overall-stats.tsx` - общая статистика
- `src/components/dashboard/activity-heatmap.tsx` - календарь активности
- `src/components/achievements/speed-badge.tsx` - значок скорости
- `src/components/achievements/achievement-badge.tsx` - значок достижения
- `src/components/achievements/achievements-section.tsx` - секция всех достижений
- `src/components/projects/theme-tags-selector.tsx` - селектор тем

### Libraries
- `src/lib/constants.ts` - константы тем и достижений
- `src/lib/stats.ts` - утилиты статистики и прогноза
- `src/lib/achievements.ts` - логика проверки достижений

---

## [0.2.0] - 2026-01-XX

### Added - Phase 2: Features & UX

#### Phase 2A: UX Improvements
- 🌙 **Dark Mode** - поддержка темной темы
- 📱 **Responsive Design** - адаптивная верстка
- ⚡ **Loading States** - скелетоны и спиннеры
- 🗑️ **Quick Delete** - удаление проектов из Dashboard

#### Phase 2B: Features
- 🔐 **Google OAuth** - авторизация через Google
- 📸 **Image Upload & Optimization**
  - Sharp для сжатия
  - WebP конвертация
  - Thumbnails
- 📊 **CSV Export** - экспорт данных проекта
- 🧮 **Calculator** - калькулятор материалов

#### Phase 2C: Image Processing
- 🖼️ **Image Viewer** - модальное окно для просмотра
- 🎨 **Optimized Storage** - WebP + thumbnails

#### Phase 2D: Manual Tracking
- ✍️ **Simplified Log Form** - упрощенная форма логирования

---

## [0.1.0] - 2026-01-XX

### Added - Phase 1: MVP

#### Core Features
- 🔐 **Authentication**
  - NextAuth.js с credentials provider
  - Регистрация и логин
  - JWT сессии
- 📊 **Project Management**
  - CRUD операции для проектов
  - Поля: title, description, manufacturer, totalStitches, dimensions
  - Статусы: planning, in_progress, completed, paused
  - Public/private проекты
- 📝 **Daily Logging**
  - Добавление ежедневных логов
  - Поля: date, totalStitches, dailyStitches, photoUrl, notes
  - CRUD операции
- 📈 **Charts & Statistics**
  - Recharts графики прогресса
  - Статистика: дни работы, среднее/день, прогресс
  - Визуализация данных

#### UI Components
- Shadcn/ui компоненты
- Header с навигацией
- Dashboard с карточками проектов
- Forms для создания/редактирования
- Stats cards

#### Database
- Prisma ORM + SQLite
- Модели: User, Project, DailyLog
- Миграции

---

## [0.0.1] - 2025-XX-XX

### Added - Phase 0: Infrastructure

- ⚙️ **Project Setup**
  - Next.js 16 (App Router)
  - TypeScript
  - Tailwind CSS
  - ESLint
- 🗄️ **Database**
  - Prisma ORM
  - SQLite
- 🎨 **UI Framework**
  - Shadcn/ui
  - Radix UI primitives
- 📦 **Dependencies**
  - React Query (TanStack)
  - date-fns
  - Zod

---

[Unreleased]: https://github.com/yourusername/stitch-arena/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/yourusername/stitch-arena/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/yourusername/stitch-arena/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/yourusername/stitch-arena/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/yourusername/stitch-arena/compare/v0.0.1...v0.1.0
[0.0.1]: https://github.com/yourusername/stitch-arena/releases/tag/v0.0.1
