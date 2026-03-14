# Инструкция по деплою Stash Feature

## ✅ Что уже сделано автоматически:

1. **Изменения закоммичены в Git:**
   - Commit: `b0d40e7` - "Add Stash feature for project management"

2. **Изменения запушены на GitHub:**
   - Repository: `yaskoolga/stitch-arena`
   - Branch: `main`

3. **Prisma Client сгенерирован локально:**
   - Обновлён с новыми полями `startedAt` и статусом `stash`

4. **Vercel автодеплой:**
   - Если настроена интеграция с GitHub, новый деплой уже запущен автоматически
   - Проверить можно на: https://vercel.com/yaskoolga/stitch-arena

## ⚠️ Что нужно сделать ВРУЧНУЮ:

### 1. Применить миграцию БД на Production

Есть 2 способа:

#### Способ A: Через Vercel CLI (рекомендуется)

```bash
cd /c/Users/Ольга/Desktop/stich/stitch-arena

# Залогиниться в Vercel
vercel login

# Подтянуть environment variables
vercel env pull .env.production

# Применить миграцию к production БД
npx prisma migrate deploy
```

#### Способ B: Через Vercel Dashboard

1. Зайти на https://vercel.com/yaskoolga/stitch-arena/settings/environment-variables
2. Скопировать значение `DATABASE_URL` (production)
3. Временно добавить в локальный `.env` файл
4. Выполнить:
   ```bash
   cd /c/Users/Ольга/Desktop/stich/stitch-arena
   npx prisma migrate deploy
   ```
5. Удалить production DATABASE_URL из локального `.env`

### 2. Проверить деплой

1. **Vercel Dashboard:**
   - Открыть: https://vercel.com/yaskoolga/stitch-arena
   - Убедиться что деплой успешен (зелёная галочка)
   - Проверить логи на наличие ошибок

2. **Тестирование на production:**
   - Открыть приложение (URL вашего deployment)
   - Создать новый проект → проверить что статус по умолчанию "Stash"
   - В дашборде нажать фильтр "Запасы" → должен показать проекты
   - Добавить daily log с крестиками → проект должен перейти в "In Progress"

### 3. Откатить изменения (если что-то пошло не так)

```bash
cd /c/Users/Ольга/Desktop/stich/stitch-arena

# Откатить к предыдущему коммиту
git revert HEAD

# Запушить откат
git push origin main

# Vercel автоматически задеплоит предыдущую версию
```

## 📋 Миграция БД - что произойдёт:

При выполнении `npx prisma migrate deploy`:

1. **Добавится колонка `startedAt`** в таблицу `Project`
2. **Для существующих проектов со статусом `in_progress`:**
   - Автоматически установится `startedAt` = дата первого лога с `dailyStitches > 0`
   - Если у проекта нет логов с крестиками, `startedAt` останется `null`
3. **Новые проекты** будут создаваться со статусом `stash` по умолчанию

## 🔍 Проверка после деплоя:

```bash
# Подключиться к production БД и проверить
npx prisma studio

# Или выполнить SQL запрос:
SELECT status, "startedAt", title FROM "Project" LIMIT 10;
```

## 📞 Если нужна помощь:

- **Ошибка миграции:** Проверить логи в Vercel Dashboard → Deployment → Logs
- **БД не обновляется:** Убедиться что `DATABASE_URL` указывает на production БД
- **Автодеплой не работает:** Проверить GitHub integration в Vercel settings

---

**Статус:** ✅ Готово к деплою на production
