# План: Gamification & User Analytics

## Контекст

Расширить StitchArena с углубленной геймификацией и персональной аналитикой для пользователей.

**Что уже есть:**
- Базовая система достижений (speed badges, milestones)
- Челленджи с leaderboard
- Activity heatmap (календарь активности)
- Базовая статистика на dashboard (total stitches, projects count)

**Что добавляем:**
- Расширенная система наград и бейджей
- Глобальные таблицы лидеров
- Детальная персональная аналитика с графиками
- Прогнозы и сравнения
- Сезонные ивенты

---

## Часть 1: Gamification

### 1.1 Расширенная система достижений

**Новые категории достижений:**

**1. Collection Achievements (Коллекционер)**
- "First Timer" - завершить первый проект
- "Serial Creator" - 5 завершенных проектов
- "Master Crafter" - 25 завершенных проектов
- "Legend" - 100 завершенных проектов

**2. Social Achievements (Социальные)**
- "Socialite" - получить 10 комментариев
- "Popular" - получить 50 лайков
- "Influencer" - 100 подписчиков
- "Helpful" - оставить 50 комментариев

**3. Streak Achievements (Серия)**
- "On Fire" - 7 дней подряд активности
- "Dedicated" - 30 дней подряд
- "Unstoppable" - 100 дней подряд

**4. Challenge Achievements (Челленджи)**
- "Challenger" - участие в 1 челлендже
- "Competitor" - топ-10 в челлендже
- "Champion" - победа в челлендже
- "Veteran" - участие в 10 челленджах

**5. Milestone Achievements (Вехи по стежкам)**
- Уже есть, но можно добавить больше уровней
- 1K, 5K, 10K, 25K, 50K, 100K, 250K, 500K, 1M stitches

**Database changes:**
```prisma
model Achievement {
  id          String   @id @default(cuid())
  userId      String
  type        String   // "speed" | "milestone" | "collection" | "social" | "streak" | "challenge"
  category    String   // Subcategory within type
  level       Int      @default(1) // For progressive achievements
  earnedAt    DateTime @default(now())
  displayedAt DateTime? // When user saw the achievement popup

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, type, category, level])
  @@index([userId, earnedAt])
}
```

**Achievement metadata (config file):**
```typescript
// src/lib/achievements/config.ts
export const ACHIEVEMENT_CONFIG = {
  collection: [
    { level: 1, threshold: 1, title: "First Timer", icon: "🎯" },
    { level: 2, threshold: 5, title: "Serial Creator", icon: "🎨" },
    { level: 3, threshold: 25, title: "Master Crafter", icon: "👑" },
    { level: 4, threshold: 100, title: "Legend", icon: "⭐" },
  ],
  social: [
    { level: 1, threshold: 10, title: "Socialite", icon: "💬" },
    // ...
  ],
  // ...
}
```

### 1.2 Badges & Rewards (Визуальные награды)

**Бейджи для профиля:**
- Отображаются на профиле пользователя
- Можно выбрать "featured badges" (3-5 штук)
- Редкость: Common, Rare, Epic, Legendary

**Database:**
```prisma
model Badge {
  id          String   @id @default(cuid())
  key         String   @unique // "top_contributor", "speed_demon", etc.
  name        String
  description String
  icon        String   // Emoji or icon identifier
  rarity      String   @default("common") // "common" | "rare" | "epic" | "legendary"
  criteria    String   // JSON describing how to earn
}

model UserBadge {
  id        String   @id @default(cuid())
  userId    String
  badgeKey  String
  earnedAt  DateTime @default(now())
  isFeatured Boolean @default(false)

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, badgeKey])
  @@index([userId])
}
```

**Типы бейджей:**
1. **Achievement Badges** - за достижения
2. **Event Badges** - за участие в ивентах
3. **Special Badges** - за особые заслуги (early adopter, contributor, etc.)
4. **Challenge Winner Badges** - за победы в челленджах

### 1.3 Global Leaderboards (Глобальные таблицы)

**Таблицы лидеров:**
1. **All-Time Stitches** - топ по общему количеству стежков
2. **Monthly Stitches** - топ за текущий месяц
3. **Weekly Stitches** - топ за текущую неделю
4. **Project Completions** - топ по завершенным проектам
5. **Streak Leaders** - топ по текущей серии
6. **Challenge Winners** - победители челленджей

**Database:**
```prisma
model Leaderboard {
  id         String   @id @default(cuid())
  type       String   // "alltime" | "monthly" | "weekly" | "projects" | "streak"
  period     String?  // "2026-03" for monthly, "2026-W09" for weekly
  rank       Int
  userId     String
  score      Int      // stitches or count
  updatedAt  DateTime @updatedAt

  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([type, period, userId])
  @@index([type, period, rank])
}
```

**Обновление:**
- Cron job каждые 10 минут для топ-100
- Пересчет weekly каждый понедельник
- Пересчет monthly 1-го числа

**UI:**
- Страница `/leaderboards` с табами
- Топ-10 видно всем
- Своя позиция всегда показывается
- Аватары + имена + баллы

### 1.4 Seasonal Events (Сезонные ивенты)

**Концепция:**
- Ограниченные по времени события (1-2 недели)
- Специальные челленджи с уникальными наградами
- Тематические (праздники, времена года)

**Database:**
```prisma
model Event {
  id          String   @id @default(cuid())
  title       String
  description String?
  theme       String   // "halloween", "christmas", "spring", etc.
  startDate   DateTime
  endDate     DateTime
  isActive    Boolean  @default(true)
  rewardBadge String?  // Badge key for participants
  createdAt   DateTime @default(now())

  challenges  Challenge[] @relation("EventChallenges")
  participants EventParticipant[]
}

model EventParticipant {
  id       String   @id @default(cuid())
  eventId  String
  userId   String
  joinedAt DateTime @default(now())
  score    Int      @default(0)

  event    Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([eventId, userId])
}
```

**Примеры ивентов:**
- "Spring Stitching Marathon" - максимум стежков за неделю
- "Halloween Horror Patterns" - завершить 3 проекта с темными цветами
- "New Year Resolution" - 7-дневная серия в январе

---

## Часть 2: User Analytics

### 2.1 Progress Charts (Графики прогресса)

**Графики для отображения:**

1. **Stitches Over Time**
   - Line chart с накопительным итогом
   - Переключатель: Last 7 days / Last 30 days / Last 90 days / All time
   - Показывает daily stitches as bars + cumulative as line

2. **Daily Activity Pattern**
   - Bar chart: average stitches per day of week (Mon-Sun)
   - Помогает понять когда пользователь наиболее продуктивен

3. **Project Velocity**
   - Chart для каждого проекта: stitches per day
   - Прогресс-бары с процентом выполнения
   - ETA (estimated time to completion)

4. **Speed Distribution**
   - Histogram: сколько логов в каждой speed категории
   - Turtle/Walker/Bike/Car/Plane/Rocket

**API Endpoint:**
```typescript
GET /api/analytics/progress?period=30&type=stitches
GET /api/analytics/progress?period=90&type=projects
GET /api/analytics/daily-pattern
```

**Components:**
- `ProgressChart` - universal chart component (using recharts)
- `ActivityPattern` - day of week chart
- `ProjectVelocity` - project-specific chart
- `SpeedDistribution` - speed badge histogram

### 2.2 Statistics Dashboard

**Новая страница: `/analytics`**

**Метрики для отображения:**

**Overview Cards:**
- Total Stitches (all time)
- Average Daily Stitches (last 30 days)
- Current Streak
- Longest Streak
- Projects Completed
- Active Projects

**Detailed Stats:**
- Average Time per Project (from start to completion)
- Most Productive Day of Week
- Most Productive Hour of Day
- Favorite Patterns (based on stitch counts)
- Average Speed (stitches per day)
- Total Time Logged (sum of all daily log hours)

**Time-based breakdowns:**
- This Week vs Last Week (comparison)
- This Month vs Last Month
- Year-to-date stats

**API:**
```typescript
GET /api/analytics/overview
GET /api/analytics/detailed
GET /api/analytics/comparison?period=week
```

### 2.3 Comparisons & Rankings

**Compare with community:**

1. **Percentile Ranking**
   - "You're in the top 15% of users by total stitches"
   - "You're faster than 78% of users"
   - Calculated from global distribution

2. **Peer Comparison**
   - Compare with users who started at similar time
   - Compare with users with similar project types
   - Show anonymous aggregated data

3. **Personal Bests**
   - Highest daily stitches
   - Fastest project completion
   - Longest streak record
   - Most productive week/month

**UI Components:**
- `PercentileCard` - shows user's percentile
- `PeerComparison` - chart comparing with peers
- `PersonalBests` - trophy showcase

### 2.4 Predictions & Insights

**AI-powered insights:**

1. **Project Completion Prediction**
   ```typescript
   // Based on current velocity and remaining stitches
   const remainingStitches = project.totalStitches - project.currentStitches;
   const avgDailyStitches = calculateAverage(logs, 14); // Last 14 days
   const daysToComplete = Math.ceil(remainingStitches / avgDailyStitches);
   const estimatedDate = addDays(new Date(), daysToComplete);
   ```

2. **Streak Risk Alert**
   - "You haven't logged today - keep your streak!"
   - "Your average daily stitches is dropping - stay motivated!"

3. **Productivity Insights**
   - "You're most productive on Wednesdays"
   - "Your speed has increased 15% this month"
   - "You tend to work on 2-3 projects simultaneously"

4. **Goal Suggestions**
   - "At your current pace, you could reach 100K stitches by June"
   - "Try logging for 30 days straight to earn the Dedicated badge"

**Components:**
- `ProjectETA` - shows estimated completion
- `InsightCard` - displays AI insights
- `GoalSuggestions` - motivational goals

### 2.5 Detailed Activity History

**Enhanced activity view:**

**Timeline view (`/activity`):**
- Infinite scroll of all activity
- Group by date
- Filter by type: DailyLog, Comment, Like, Achievement, Challenge
- Search by project or date range

**Activity types to show:**
```typescript
type ActivityItem =
  | { type: 'daily_log', project, stitches, date }
  | { type: 'project_completed', project, date }
  | { type: 'achievement', achievement, date }
  | { type: 'comment_received', comment, project, date }
  | { type: 'like_received', project, date }
  | { type: 'challenge_joined', challenge, date }
  | { type: 'follower_gained', user, date };
```

**Database view:**
```sql
-- Unified activity feed query
SELECT * FROM (
  SELECT id, 'daily_log' as type, date, projectId FROM DailyLog WHERE userId = ?
  UNION ALL
  SELECT id, 'achievement' as type, earnedAt as date, NULL FROM Achievement WHERE userId = ?
  UNION ALL
  SELECT id, 'comment' as type, createdAt as date, projectId FROM Comment WHERE projectId IN (SELECT id FROM Project WHERE userId = ?)
  -- etc
) ORDER BY date DESC
```

---

## Порядок реализации

### Этап 1: Database & Core Logic
1. Обновить Prisma schema (Achievement, Badge, UserBadge, Leaderboard, Event)
2. Миграция БД
3. Создать achievement engine (src/lib/achievements/)
4. Создать badge system (src/lib/badges/)
5. Создать leaderboard calculator (src/lib/leaderboards/)

### Этап 2: Gamification UI
6. Страница `/badges` - витрина бейджей
7. Компонент выбора featured badges
8. Страница `/leaderboards` - глобальные таблицы
9. Achievement notification popup
10. Badge showcase на профиле

### Этап 3: Analytics Backend
11. API endpoints для аналитики
12. Функции расчета статистики
13. Функции прогнозирования
14. Кеширование для производительности

### Этап 4: Analytics UI
15. Страница `/analytics` - главная аналитика
16. Компоненты графиков (recharts)
17. Insight cards
18. Comparison components
19. Activity timeline `/activity`

### Этап 5: Integration & Polish
20. Интегрировать в существующий UI
21. Добавить в navigation
22. Переводы на 6 языков
23. Тестирование
24. Оптимизация производительности

---

## Технологии

**Графики:**
- `recharts` - React charting library

**Calculations:**
- Server-side для производительности
- React Query для кеширования

**Notifications:**
- Toast для achievement unlocks
- In-app notifications

**Cron jobs (для leaderboards):**
- Vercel Cron или node-cron

---

## Критические файлы

### Новые:
- `src/lib/achievements/engine.ts` - achievement detection
- `src/lib/achievements/config.ts` - achievement definitions
- `src/lib/badges/manager.ts` - badge awarding
- `src/lib/leaderboards/calculator.ts` - leaderboard updates
- `src/lib/analytics/stats.ts` - statistics calculations
- `src/lib/analytics/predictions.ts` - ML predictions
- `src/app/badges/page.tsx` - badges showcase
- `src/app/leaderboards/page.tsx` - leaderboards
- `src/app/analytics/page.tsx` - analytics dashboard
- `src/app/activity/page.tsx` - activity timeline
- `src/components/achievements/achievement-popup.tsx`
- `src/components/charts/` - chart components

### Обновить:
- `prisma/schema.prisma` - новые модели
- `src/app/dashboard/[[...userId]]/page.tsx` - добавить links
- Navigation components - новые пункты меню

---

## Тестирование

1. Seed тестовые данные (пользователи с разными активностями)
2. Проверить срабатывание достижений
3. Проверить расчет leaderboards
4. Проверить графики с разными датасетами
5. Проверить production на разных часовых поясах

