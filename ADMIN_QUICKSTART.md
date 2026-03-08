# Admin Panel - Quick Start Guide

## 🚀 Что реализовано (Фаза 1 - MVP)

✅ **База данных**: модели User (role, ban fields), Report, AdminLog
✅ **Авторизация**: NextAuth интеграция, проверка прав, middleware
✅ **Dashboard**: метрики платформы, статистика, тренды
✅ **Управление пользователями**: поиск, фильтры, бан/разбан
✅ **API**: 4 endpoint'а (stats, users, ban, reports)
✅ **UI**: sidebar, таблицы, диалоги (Soft & Rounded дизайн)

## 📝 Как начать работу

### 1. Проверить миграцию
```bash
cd /c/Users/Ольга/Desktop/stich/stitch-arena
npx prisma migrate status
```

Если не применена - запустить:
```bash
npx prisma migrate dev
```

### 2. Создать админа
```bash
npx tsx scripts/make-admin.ts
```

Это создаст/обновит пользователя с email из `.env` (`ADMIN_EMAIL=admin@stitcharena.com`)

### 3. Войти в систему

**Вариант А: Credentials (если есть пароль у admin@stitcharena.com)**
- Открыть http://localhost:3000/login
- Войти с email `admin@stitcharena.com`

**Вариант Б: Google OAuth**
- Войти через Google с аккаунтом admin@stitcharena.com
- Или создать новый аккаунт с этим email

**Вариант В: Изменить ADMIN_EMAIL**
- В `.env` изменить `ADMIN_EMAIL` на существующий email в БД
- Запустить `npx tsx scripts/make-admin.ts`
- Войти с этим email

### 4. Открыть админку
```
http://localhost:3000/admin
```

Должен открыться Dashboard с метриками.

## 🎯 Основные функции

### Dashboard (`/admin/dashboard`)
- Общая статистика платформы
- Тренды (месяц к месяцу)
- Pending reports
- Quick links

### Users (`/admin/users`)
- **Поиск**: по имени или email
- **Фильтр**: All / Active / Banned
- **Информация**: проекты, комментарии, репорты (полученные/отправленные)
- **Действия**: Ban / Unban с причиной

### Как забанить пользователя:
1. Перейти на `/admin/users`
2. Найти пользователя (поиск или скролл)
3. Нажать кнопку "Ban"
4. Ввести причину (опционально)
5. Подтвердить

**Результат**: пользователь не сможет войти в систему (проверка в signIn callback)

### Проверка бана:
1. Logout из админ-аккаунта
2. Попробовать войти забаненным email
3. Должна быть ошибка входа

### Audit Log:
Все действия логируются в таблицу `AdminLog`:
- Action: ban_user, unban_user
- Target: ID пользователя
- Metadata: причина бана (JSON)
- Created at: дата/время

## 📂 Ключевые файлы

### Конфигурация
- `.env` - ADMIN_EMAIL
- `prisma/schema.prisma` - модели
- `src/middleware.ts` - защита роутов

### Авторизация
- `src/lib/admin.ts` - requireAdmin(), logAdminAction()
- `src/lib/auth.ts` - NextAuth callbacks (ban check)
- `src/types/index.ts` - Session/JWT типы

### API
- `src/app/api/admin/stats/route.ts`
- `src/app/api/admin/users/route.ts`
- `src/app/api/admin/users/[id]/ban/route.ts`
- `src/app/api/admin/reports/route.ts`

### UI
- `src/app/admin/layout.tsx` - защищенный layout
- `src/app/admin/dashboard/page.tsx`
- `src/app/admin/users/page.tsx`
- `src/components/admin/*` - компоненты админки

### Утилиты
- `scripts/make-admin.ts` - создание админа

## 🔒 Безопасность

### Что защищено:
✅ API endpoints (requireAdmin middleware)
✅ Layout (Server Component проверка)
✅ Middleware (базовая авторизация)
✅ Нельзя забанить себя
✅ Логирование действий

### Что нужно добавить:
⬜ Rate limiting
⬜ CSRF protection
⬜ IP logging
⬜ 2FA для админов

## 🐛 Траблшутинг

### "Forbidden" при заходе в /admin
- Проверить ADMIN_EMAIL в .env
- Проверить что вошли с правильным email
- Запустить `npx tsx scripts/make-admin.ts`
- Проверить role в БД: `npx prisma studio` → User → role должен быть "admin"

### Не загружается Dashboard
- Открыть DevTools → Network
- Проверить `/api/admin/stats` (должен 200)
- Если 401/403 - проблема с авторизацией
- Если 500 - проверить логи сервера

### Бан не работает
- Проверить AdminLog в БД (создается ли запись)
- Проверить User.isBanned в БД (меняется ли)
- Проверить src/lib/auth.ts:signIn callback (проверяется ли isBanned)

### Next.js lock error
```bash
# Остановить все процессы Next.js
taskkill /F /IM node.exe
# Или закрыть терминалы с npm run dev
```

## 📋 Что дальше (Фаза 2-3)

### Фаза 2: Модерация
- [ ] Модерация проектов (удаление)
- [ ] Модерация комментариев (удаление)
- [ ] Система репортов (обработка жалоб)
- [ ] Кнопка "Report" в UI (Comment, Project)

### Фаза 3: Расширенное
- [ ] Массовые операции (bulk ban, bulk delete)
- [ ] Экспорт данных (CSV/JSON)
- [ ] Управление челленджами (edit, deactivate)
- [ ] Audit logs с фильтрами
- [ ] Графики и аналитика

### Будущее
- [ ] Ролевая модель (admin, moderator, user)
- [ ] Permissions (moderator может удалять, но не банить)
- [ ] Email уведомления админу
- [ ] Auto-moderation (spam detection)

## 📚 Документация

**Полная документация**: `ADMIN_IMPLEMENTATION.md`
**Память проекта**: `memory/stitcharena.md` (раздел Admin Panel)

## 🎨 Дизайн

Админка следует **Soft & Rounded Design System**:
- Карточки: `rounded-2xl`
- Кнопки: `rounded-full`
- Бейджи: `rounded-full`
- Таблицы: `rounded-2xl` на контейнере
- Инпуты: `rounded-full` (search), `rounded-xl` (textarea)

---

**Статус**: Фаза 1 (MVP) завершена ✅
**Дата**: 01.03.2026
**Next steps**: Тестирование → Фаза 2 (модерация)
