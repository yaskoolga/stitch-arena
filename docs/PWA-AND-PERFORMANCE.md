# PWA и оптимизация производительности

## PWA (Progressive Web App)

### Что реализовано

StitchArena теперь работает как полноценное PWA-приложение:

- ✅ **Установка как приложение** - можно установить на телефон/десктоп
- ✅ **Офлайн работа** - базовые функции доступны без интернета
- ✅ **Service Worker** - автоматическое кэширование статики
- ✅ **Web App Manifest** - описание приложения для установки

### Файлы

- `public/manifest.json` - манифест приложения
- `next.config.ts` - конфигурация PWA через next-pwa
- `src/app/layout.tsx` - PWA meta-теги

### Иконки

Приложение требует иконки в следующих размерах (все в `public/icons/`):
- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

**Генерация иконок:**
- [realfavicongenerator.net](https://realfavicongenerator.net/)
- [favicon.io](https://favicon.io/)

### Как установить приложение

**Десктоп (Chrome/Edge):**
1. Откройте приложение в браузере
2. Кликните на иконку установки в адресной строке
3. Подтвердите установку

**Мобильные устройства:**
1. Откройте в мобильном браузере
2. Появится предложение "Добавить на главный экран"
3. Подтвердите

### Проверка PWA

Chrome DevTools → Application:
- **Manifest** - проверить корректность манифеста
- **Service Workers** - проверить регистрацию SW
- **Storage** - проверить кэш

---

## Оптимизация производительности

### 1. Code Splitting (динамические импорты)

Тяжелые компоненты загружаются только когда нужны:

**Celebration компоненты:**
```typescript
// src/components/projects/daily-log-form.tsx
const AchievementCelebration = dynamic(
  () => import("@/components/achievements/achievement-celebration"),
  { ssr: false }
);
```

**Графики (Recharts):**
```typescript
// src/components/dashboard/stats-charts.tsx
const ProgressChart = dynamic(
  () => import("./progress-chart"),
  { ssr: false }
);
```

**Экономия:** ~50-100KB на начальной загрузке

### 2. Image Optimization

**Lazy Loading:**
```typescript
<Image
  src={src}
  alt={alt}
  loading="lazy"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

Изображения загружаются только при попадании в viewport.

**Где применено:**
- Project cards (`src/components/projects/project-card.tsx`)
- Landing page showcase (`src/app/page.tsx`)

### 3. Bundle Analyzer

**Запуск анализа:**
```bash
npm run analyze
```

Открывает интерактивную карту размера бандла в браузере.

**Что смотреть:**
- Размер отдельных пакетов
- Дубликаты зависимостей
- Неиспользуемый код

### 4. Service Worker кэширование

Автоматически кэшируется:
- Статические файлы (JS, CSS, шрифты)
- Изображения
- API запросы (опционально)

**Исключено из Git:**
```
public/sw.js
public/workbox-*.js
public/worker-*.js
```

---

## Метрики производительности

### Lighthouse цели

- **Performance:** 90+
- **First Contentful Paint (FCP):** < 1.8s
- **Largest Contentful Paint (LCP):** < 2.5s
- **Cumulative Layout Shift (CLS):** < 0.1
- **Time to Interactive (TTI):** < 3.8s

### Проверка производительности

Chrome DevTools → Lighthouse:
1. Выберите режим "Desktop" или "Mobile"
2. Запустите аудит
3. Проверьте метрики

---

## Дизайн-система

### КРИТИЧНО: БЕЗ ГРАДИЕНТОВ

Приложение использует soft & rounded дизайн без градиентов:

**Правила:**
- ❌ НЕТ градиентов (`bg-gradient-*`)
- ✅ Пастельные фоны: `bg-{color}/5 border-{color}/10`
- ✅ Карточки: `rounded-2xl`
- ✅ Кнопки: `rounded-full`
- ✅ Бейджи: `rounded-full`
- ✅ Прогресс-бары: `rounded-full`

**Цвета:** primary, success, info, warning, destructive

---

## Production deployment

### Перед деплоем

1. **Создать иконки** (`public/icons/`)
2. **Проверить манифест** (название, цвета)
3. **Запустить bundle analyzer** (`npm run analyze`)
4. **Проверить Lighthouse** (все метрики 90+)
5. **Протестировать офлайн** (DevTools → Network → Offline)

### Environment переменные

PWA отключен в development режиме:
```typescript
disable: process.env.NODE_ENV === 'development'
```

На production Service Worker активируется автоматически.
