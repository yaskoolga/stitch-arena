# 🚀 ПОШАГОВАЯ ИНСТРУКЦИЯ ПО DEPLOYMENT

## 📋 ПОДГОТОВКА

### Что вам понадобится:
- GitHub аккаунт
- Email для регистрации
- Карта для Railway ($5/мес) или бесплатный Render

---

## ЭТАП 1: РЕГИСТРАЦИЯ СЕРВИСОВ (20 минут)

### 1️⃣ Vercel (хостинг Next.js)

**Шаг 1:** Перейдите на [vercel.com](https://vercel.com)

**Шаг 2:** Нажмите "Sign Up" → "Continue with GitHub"

**Шаг 3:** Авторизуйте Vercel доступ к GitHub

✅ **Готово!** Пока больше ничего не делайте в Vercel.

---

### 2️⃣ Neon Database (PostgreSQL)

**Шаг 1:** Перейдите на [neon.tech](https://neon.tech)

**Шаг 2:** Нажмите "Sign Up" → "Continue with GitHub"

**Шаг 3:** Создайте проект:
- Нажмите "Create Project"
- Region: **Europe (Frankfurt)** или ближайший к вам
- Project Name: `stitch-arena`
- Database Name: оставьте по умолчанию

**Шаг 4:** Скопируйте Connection String:
- На странице проекта найдите "Connection String"
- Нажмите на строку, чтобы скопировать
- Формат: `postgresql://user:password@ep-xxxxx.eu-central-1.aws.neon.tech/neondb?sslmode=require`

📝 **СОХРАНИТЕ ЭТУ СТРОКУ!** Она понадобится позже.

✅ **Готово!**

---

### 3️⃣ Cloudinary (хранилище изображений)

**Шаг 1:** Перейдите на [cloudinary.com](https://cloudinary.com)

**Шаг 2:** Нажмите "Sign Up Free"
- Введите email и пароль
- Подтвердите email

**Шаг 3:** В Dashboard найдите:
- **Cloud Name** (например: `dxxxxx`)
- **API Key** (например: `123456789012345`)
- **API Secret** (нажмите "Show" чтобы увидеть)

📝 **СКОПИРУЙТЕ ВСЕ ТРИ ЗНАЧЕНИЯ!**

✅ **Готово!**

---

### 4️⃣ Railway (CV Service хостинг)

**Вариант А: Railway ($5/мес, рекомендую)**

**Шаг 1:** Перейдите на [railway.app](https://railway.app)

**Шаг 2:** Нажмите "Login" → "Login with GitHub"

**Шаг 3:** Добавьте карту:
- Dashboard → Settings → Billing
- Add Payment Method
- Введите данные карты
- Первый месяц: $5 кредит бесплатно!

✅ **Готово!**

**Вариант Б: Render (бесплатно, но медленнее)**

**Шаг 1:** Перейдите на [render.com](https://render.com)

**Шаг 2:** Нажмите "Get Started" → "GitHub"

✅ **Готово!**

---

### 5️⃣ Google OAuth (для входа через Google)

**Шаг 1:** Перейдите в [Google Cloud Console](https://console.cloud.google.com)

**Шаг 2:** Создайте проект:
- "New Project" → название: `StitchArena`

**Шаг 3:** Настройте OAuth:
- Слева: "APIs & Services" → "Credentials"
- "Create Credentials" → "OAuth 2.0 Client ID"
- Application type: "Web application"
- Name: `StitchArena Web`

**Шаг 4:** Authorized redirect URIs (добавьте оба):
```
https://stitch-arena.vercel.app/api/auth/callback/google
https://stitch-arena-git-main.vercel.app/api/auth/callback/google
```

**Шаг 5:** Скопируйте:
- **Client ID**
- **Client Secret**

📝 **СОХРАНИТЕ ОБА ЗНАЧЕНИЯ!**

✅ **Готово!**

---

## ЭТАП 2: PUSH КОДА В GITHUB (5 минут)

**Шаг 1:** Откройте терминал в папке проекта:
```bash
cd C:\Users\Ольга\Desktop\stich\stitch-arena
```

**Шаг 2:** Проверьте что все изменения закоммичены:
```bash
git status
git add .
git commit -m "Prepare for production deployment"
```

**Шаг 3:** Push в GitHub:
```bash
git push origin main
```

✅ **Код в GitHub!**

---

## ЭТАП 3: DEPLOY CV SERVICE (15 минут)

### Railway (рекомендую)

**Шаг 1:** В Railway Dashboard нажмите "New Project"

**Шаг 2:** Выберите "Deploy from GitHub repo"

**Шаг 3:** Выберите репозиторий `stitch-arena`

**Шаг 4:** Configure Build:
- Root Directory: `cv-service`
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

**Шаг 5:** Подождите deployment (~3 минуты)

**Шаг 6:** Скопируйте URL:
- Settings → Networking → Public URL
- Формат: `https://cv-service-production-xxxx.up.railway.app`

📝 **СОХРАНИТЕ ЭТОТ URL!**

✅ **CV Service готов!**

---

### Render (альтернатива)

**Шаг 1:** Render Dashboard → "New" → "Web Service"

**Шаг 2:** Connect GitHub repo: `stitch-arena`

**Шаг 3:** Configure:
- Name: `stitch-arena-cv`
- Root Directory: `cv-service`
- Runtime: `Python 3`
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Plan: **Free**

**Шаг 4:** Deploy (займет ~5 минут)

**Шаг 5:** Скопируйте URL с dashboard

📝 **СОХРАНИТЕ ЭТОТ URL!**

⚠️ **Важно:** На бесплатном плане Render засыпает после 15 минут. Первый запрос будет медленным (~30 сек).

✅ **CV Service готов!**

---

## ЭТАП 4: DEPLOY NEXT.JS (10 минут)

**Шаг 1:** Vercel Dashboard → "Add New" → "Project"

**Шаг 2:** Import Git Repository:
- Выберите `stitch-arena`
- Root Directory: оставьте пустым (корень)
- Framework: Next.js (автоопределится)

**Шаг 3:** Configure Environment Variables:

Нажмите "Environment Variables" и добавьте:

```bash
# Database
DATABASE_URL=postgresql://user:pass@host.neon.tech/db?sslmode=require

# NextAuth Secret (сгенерируйте новый!)
NEXTAUTH_SECRET=ваш-сгенерированный-секрет
NEXTAUTH_URL=https://stitch-arena.vercel.app

# Google OAuth
GOOGLE_CLIENT_ID=ваш-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=ваш-client-secret

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=ваш-cloud-name
CLOUDINARY_API_KEY=ваш-api-key
CLOUDINARY_API_SECRET=ваш-api-secret

# CV Service (URL из Railway/Render)
CV_SERVICE_URL=https://cv-service-production-xxxx.up.railway.app

# Admin
ADMIN_EMAIL=yasko.olga@gmail.com

# Cron
CRON_SECRET=любая-случайная-строка
```

**Как сгенерировать NEXTAUTH_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Шаг 4:** Deploy!
- Нажмите "Deploy"
- Подождите ~3 минуты

**Шаг 5:** Первый deploy упадёт с ошибкой! Это нормально - нужно применить миграции.

✅ **Почти готово!**

---

## ЭТАП 5: ПРИМЕНИТЬ МИГРАЦИИ БД (5 минут)

**Вариант 1: Локально**

```bash
# 1. Создайте .env с production DATABASE_URL
echo "DATABASE_URL=postgresql://..." > .env.production.local

# 2. Примените миграции
npx prisma migrate deploy --schema=./prisma/schema.prisma

# 3. Проверьте
npx prisma studio
```

**Вариант 2: Через Vercel**

**Шаг 1:** Settings → General → Build & Development Settings

**Шаг 2:** Build Command:
```bash
npx prisma migrate deploy && next build
```

**Шаг 3:** Redeploy:
- Deployments → три точки → "Redeploy"

✅ **База данных готова!**

---

## ЭТАП 6: ПРОВЕРКА (5 минут)

**Шаг 1:** Откройте ваш сайт:
```
https://stitch-arena.vercel.app
```

**Шаг 2:** Проверьте:
- ✅ Регистрация работает
- ✅ Вход через Google работает
- ✅ Создание проекта работает
- ✅ Загрузка фото работает
- ✅ CV анализ работает (может быть медленным первый раз на Render)

**Шаг 3:** Проверьте CV Service напрямую:
```
https://ваш-cv-service-url/
```

Должны увидеть JSON:
```json
{
  "service": "StitchArena CV Service",
  "version": "0.2.0",
  "status": "running"
}
```

✅ **ВСЁ РАБОТАЕТ!** 🎉

---

## 🔧 TROUBLESHOOTING

### Проблема: Vercel build failed

**Решение:**
1. Проверьте логи в Vercel
2. Убедитесь что все environment variables добавлены
3. Проверьте DATABASE_URL формат

### Проблема: CV Service не отвечает

**Railway:**
- Проверьте Logs в Railway Dashboard
- Убедитесь что service запущен

**Render:**
- Первый запрос медленный (~30 сек) - это нормально
- Подождите и попробуйте снова

### Проблема: Images не загружаются

**Решение:**
1. Проверьте Cloudinary credentials
2. Проверьте Cloudinary Dashboard → Usage
3. Проверьте browser console для ошибок

### Проблема: Database connection error

**Решение:**
1. Проверьте Neon Dashboard - database активна?
2. Проверьте DATABASE_URL - правильный формат?
3. Убедитесь что миграции применены

---

## 📊 МОНИТОРИНГ

### Vercel
- Dashboard → Analytics - посещаемость
- Dashboard → Logs - ошибки

### Railway/Render
- Metrics → CPU/Memory usage
- Logs → ошибки CV Service

### Neon
- Dashboard → Operations - queries
- Dashboard → Storage - размер базы

---

## 💰 СТОИМОСТЬ

- Vercel: **$0/мес**
- Neon: **$0/мес** (до 0.5GB)
- Cloudinary: **$0/мес** (до 25GB)
- Railway: **$5/мес** ($5 кредит первый месяц)
- **ИЛИ** Render: **$0/мес** (медленнее)

**ИТОГО: ~$5/мес (~500₽)**

---

## 🎉 ГОТОВО!

Ваш проект доступен по адресу:
```
https://stitch-arena.vercel.app
```

Можете делиться с пользователями! 🚀
