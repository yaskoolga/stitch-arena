# Настройка автоматизации деплоя

## Шаг 1: Создать Vercel Token (делается один раз)

1. Зайдите на https://vercel.com/account/tokens
2. Нажмите **Create Token**
3. Название: `Claude Code Automation`
4. Scope: `Full Access`
5. Нажмите **Create**
6. **СКОПИРУЙТЕ токен** (показывается только один раз!)

## Шаг 2: Сохранить токен локально

В файл `~/.bashrc` или `~/.zshrc` добавьте:

```bash
export VERCEL_TOKEN="ваш_токен_здесь"
```

Или создайте файл `.env.local` в корне проекта:

```bash
VERCEL_TOKEN=ваш_токен_здесь
```

## Шаг 3: Готово!

Теперь Claude сможет:
- ✅ Автоматически применять миграции БД
- ✅ Деплоить на Vercel
- ✅ Проверять статус деплоя
- ✅ Откатывать если что-то пошло не так

Команды будут работать автоматически:
```bash
vercel --token=$VERCEL_TOKEN deploy --prod
vercel env pull --token=$VERCEL_TOKEN
npx prisma migrate deploy
```
