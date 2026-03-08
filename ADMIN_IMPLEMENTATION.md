# Admin Panel Implementation - StitchArena

## ✅ Фаза 1: MVP (Completed)

Базовая административная панель с управлением пользователями реализована.

### Что реализовано:

#### 1. База данных (Prisma Schema)
- ✅ Добавлены поля в модель `User`:
  - `role` (String, default: "user") - роль пользователя
  - `isBanned` (Boolean, default: false) - статус бана
  - `bannedAt` (DateTime?) - дата бана
  - `bannedReason` (String?) - причина бана
  - `updatedAt` (DateTime) - дата обновления (для аудита)

- ✅ Новая модель `Report` (система жалоб):
  - Типы: comment, project, user, dailyLog
  - Причины: spam, inappropriate, harassment, other
  - Статусы: pending, reviewed, resolved, dismissed
  - Связи с reporter и reportedUser

- ✅ Новая модель `AdminLog` (аудит действий):
  - Логирование всех действий администратора
  - Хранение метаданных в JSON формате
  - Индексы по adminId, action, createdAt

#### 2. Авторизация и безопасность
- ✅ `src/lib/admin.ts` - утилиты для проверки прав:
  - `requireAdmin()` - middleware для API routes
  - `logAdminAction()` - логирование действий
  - `isAdmin()` - проверка для server components

- ✅ Обновлен `src/lib/auth.ts`:
  - JWT содержит role и isBanned
  - Session передает role и isBanned
  - Проверка бана при входе (signIn callback)
  - Блокировка забаненных пользователей

- ✅ Обновлен `src/types/index.ts`:
  - Session interface с role и isBanned
  - JWT interface с role и isBanned

- ✅ Обновлен `src/middleware.ts`:
  - Добавлен /admin в protected routes
  - Базовая проверка авторизации

- ✅ `.env`:
  - `ADMIN_EMAIL` - email администратора

#### 3. UI и Layout
- ✅ `src/app/admin/layout.tsx`:
  - Server Component с проверкой прав
  - Redirect неавторизованных на /login
  - Redirect не-админов на /dashboard
  - Фиксированный sidebar

- ✅ `src/components/admin/admin-sidebar.tsx`:
  - Навигация по разделам админки
  - Индикация активной страницы
  - Кнопка возврата на сайт
  - Soft & Rounded дизайн

- ✅ `src/components/admin/admin-stats-card.tsx`:
  - Карточка метрики с иконкой
  - Поддержка трендов (% изменения)
  - Rounded дизайн

#### 4. API Endpoints
- ✅ `GET /api/admin/stats` - статистика платформы:
  - Общие метрики (пользователи, проекты, комментарии, челленджи)
  - Pending reports
  - Забаненные пользователи
  - Тренды (месяц к месяцу)

- ✅ `GET /api/admin/users` - список пользователей:
  - Пагинация (page, limit)
  - Поиск (по email и имени)
  - Фильтрация (all, banned, active)
  - Счетчики (проекты, комментарии, репорты)

- ✅ `POST /api/admin/users/[id]/ban` - бан/разбан:
  - Валидация (нельзя забанить себя)
  - Логирование действия
  - Сохранение причины бана

- ✅ `GET /api/admin/reports` - список репортов:
  - Пагинация
  - Фильтрация по статусу
  - Связанные данные (reporter, reportedUser)

#### 5. Страницы админки
- ✅ `/admin` - redirect на /admin/dashboard
- ✅ `/admin/dashboard` - главная с метриками
- ✅ `/admin/users` - управление пользователями:
  - Таблица с поиском и фильтрами
  - Кнопки бана/разбана
  - Диалог подтверждения бана
  - Отображение статистики по пользователю
- ✅ `/admin/projects` - placeholder
- ✅ `/admin/comments` - placeholder
- ✅ `/admin/challenges` - placeholder
- ✅ `/admin/reports` - placeholder
- ✅ `/admin/logs` - placeholder

#### 6. Компоненты
- ✅ `admin-table.tsx` - универсальная таблица:
  - Generic типизация
  - Пагинация
  - Кастомный рендеринг колонок
  - Состояния загрузки/пустоты

- ✅ `user-ban-dialog.tsx` - диалог бана:
  - Поле для причины бана
  - Разные варианты для бана/разбана
  - Состояние загрузки

#### 7. Утилиты
- ✅ `scripts/make-admin.ts` - скрипт назначения админа:
  - Создание или обновление пользователя
  - Установка role = "admin"

### Как использовать:

#### 1. Назначить администратора:
```bash
cd /c/Users/Ольга/Desktop/stich/stitch-arena
npx tsx scripts/make-admin.ts
```

Скрипт создаст/обновит пользователя с email из `ADMIN_EMAIL` (.env).

#### 2. Войти как админ:
- Открыть http://localhost:3000/login
- Войти с email `admin@stitcharena.com` (или ваш ADMIN_EMAIL)
- Для Google OAuth - создать аккаунт с этим email

#### 3. Доступ к админке:
- Перейти на http://localhost:3000/admin
- Откроется dashboard с метриками
- В sidebar навигация по разделам

#### 4. Управление пользователями:
- `/admin/users` - список всех пользователей
- Поиск по имени или email
- Фильтр: все / активные / забаненные
- Кнопка "Ban" - открывает диалог с полем причины
- После бана пользователь не сможет войти

### Дизайн система

Админка следует **Soft & Rounded Design System**:
- Карточки: `rounded-2xl`
- Кнопки: `rounded-full` (кроме ghost/link)
- Бейджи: `rounded-full`
- Таблицы: `rounded-2xl` на контейнере
- Инпуты: `rounded-full` для search, `rounded-xl` для textarea
- Пастельные фоны для карточек

## 📋 Фаза 2: Модерация (TODO)

### 6. API модерация контента
- ⬜ `GET /api/admin/projects` + `DELETE /api/admin/projects/[id]`
- ⬜ `GET /api/admin/comments` + `DELETE /api/admin/comments/[id]`
- ⬜ `PATCH /api/admin/reports/[id]` - обработка репортов
- ⬜ `POST /api/reports` - публичный endpoint создания репорта

### 7. Страницы модерации
- ⬜ Реализовать `/admin/projects` - таблица проектов с удалением
- ⬜ Реализовать `/admin/comments` - таблица комментариев
- ⬜ Реализовать `/admin/reports` - обработка жалоб
- ⬜ Компонент `report-review-dialog.tsx`

### 8. Кнопка Report на UI
- ⬜ Создать `src/components/report-button.tsx`
- ⬜ Добавить к Comment компоненту
- ⬜ Добавить к ProjectCard

## 🚀 Фаза 3: Расширенные функции (TODO)

### 9. Массовые операции
- ⬜ `POST /api/admin/bulk` - массовые действия
- ⬜ `src/components/admin/bulk-action-bar.tsx`
- ⬜ Checkbox selection в таблице

### 10. Экспорт данных
- ⬜ `GET /api/admin/export` - экспорт CSV/JSON
- ⬜ `src/components/admin/export-button.tsx`

### 11. Челленджи и логи
- ⬜ `GET /api/admin/challenges` + `PATCH/DELETE /api/admin/challenges/[id]`
- ⬜ Реализовать `/admin/challenges` - управление челленджами
- ⬜ Реализовать `/admin/logs` - аудит-лог с фильтрами

## 🔐 Безопасность

- ✅ Проверка прав на уровне API (requireAdmin)
- ✅ Проверка прав на уровне Layout (Server Component)
- ✅ Middleware защита роутов
- ✅ Логирование всех действий админа
- ✅ Нельзя забанить самого себя
- ⬜ Rate limiting для API endpoints
- ⬜ CSRF protection
- ⬜ IP logging для критичных действий

## 📝 Будущие улучшения

1. **Ролевая модель**:
   - Роли: admin, moderator, user
   - Permissions для разных ролей
   - Moderator может удалять комментарии, но не банить

2. **Уведомления**:
   - Email админу о новых репортах
   - Telegram bot для критичных событий

3. **Аналитика**:
   - Графики на dashboard (recharts)
   - Экспорт отчетов
   - Метрики активности

4. **Автоматизация**:
   - Auto-ban при N репортах
   - Spam detection
   - Suspicious activity alerts

## 🐛 Тестирование

### Чек-лист MVP:
- ✅ Миграция базы данных применена
- ✅ Admin пользователь создан
- ✅ Доступ к /admin работает
- ✅ Dashboard отображает метрики
- ✅ Список пользователей загружается
- ⬜ Поиск пользователей работает
- ⬜ Фильтрация работает
- ⬜ Бан пользователя работает
- ⬜ Забаненный пользователь не может войти
- ⬜ AdminLog создается при бане
- ⬜ Не-админ не может зайти в /admin

## 📚 Файлы для проверки

### Критичные:
- `prisma/schema.prisma` - модели базы данных
- `src/lib/admin.ts` - утилиты авторизации
- `src/lib/auth.ts` - NextAuth callbacks
- `src/types/index.ts` - TypeScript типы
- `src/middleware.ts` - защита роутов

### API:
- `src/app/api/admin/stats/route.ts`
- `src/app/api/admin/users/route.ts`
- `src/app/api/admin/users/[id]/ban/route.ts`
- `src/app/api/admin/reports/route.ts`

### UI:
- `src/app/admin/layout.tsx`
- `src/app/admin/dashboard/page.tsx`
- `src/app/admin/users/page.tsx`
- `src/components/admin/admin-sidebar.tsx`
- `src/components/admin/admin-table.tsx`
- `src/components/admin/admin-stats-card.tsx`
- `src/components/admin/user-ban-dialog.tsx`
