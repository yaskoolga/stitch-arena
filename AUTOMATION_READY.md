# 🤖 Автоматизация настроена!

## Что сделано:

✅ **Созданы скрипты автоматизации:**
- `scripts/deploy.sh` - полный деплой (миграции + push)
- `scripts/migrate.sh` - только миграции БД

✅ **Добавлены npm команды:**
- `npm run migrate:prod` - применить миграции к production
- `npm run deploy` - полный автоматический деплой
- `npm run db:pull` - скачать схему из production БД
- `npm run db:push` - отправить изменения схемы в БД

✅ **Исправлен migration lock:**
- Теперь используется `postgresql` вместо `sqlite`

---

## 🎯 Что нужно сделать ОДИН РАЗ:

### 1. Создать Vercel Token:

1. Откройте: https://vercel.com/account/tokens
2. Нажмите **Create Token**
3. Название: `Claude Code Automation`
4. Scope: `Full Access`
5. Нажмите **Create**
6. **Скопируйте токен!**

### 2. Сохранить токен:

**Вариант A - Global (рекомендуется):**
```bash
# Добавьте в ~/.bashrc или ~/.zshrc:
echo 'export VERCEL_TOKEN="ваш_токен"' >> ~/.bashrc
source ~/.bashrc
```

**Вариант B - Только для этого проекта:**
```bash
cd /c/Users/Ольга/Desktop/stich/stitch-arena
echo 'VERCEL_TOKEN=ваш_токен' >> .env.local
```

### 3. Готово! 🎉

---

## 📋 Как использовать в будущем:

### Когда Claude делает изменения с миграцией БД:

Claude автоматически выполнит:
```bash
npm run migrate:prod  # Применит миграции
git push             # Запушит код (Vercel автоматически задеплоит)
```

### Если нужно применить только миграцию:
```bash
npm run migrate:prod
```

### Если нужен полный деплой с миграциями:
```bash
npm run deploy
```

---

## 🔍 Проверка настройки:

Выполните тест:
```bash
cd /c/Users/Ольга/Desktop/stich/stitch-arena
npm run migrate:prod
```

Если всё работает → увидите:
```
✅ Migrations applied successfully!
```

Если ошибка про VERCEL_TOKEN → вернитесь к шагу 2.

---

## 🚀 В следующий раз:

Когда Claude делает изменения:
1. ✅ Автоматически применяет миграции к production
2. ✅ Автоматически пушит на GitHub
3. ✅ Vercel автоматически деплоит
4. ✅ Проверяет что всё работает

**Никаких ручных действий!** 🎉

---

## 📞 Если что-то не работает:

1. Проверьте что VERCEL_TOKEN установлен:
   ```bash
   echo $VERCEL_TOKEN
   ```

2. Проверьте что скрипты исполняемые:
   ```bash
   chmod +x scripts/*.sh
   ```

3. Проверьте логи Vercel:
   https://vercel.com/yaskoolga/stitch-arena

---

**Последнее обновление:** 2026-03-14
**Статус:** ✅ Готово к использованию
