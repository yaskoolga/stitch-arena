# Challenges System - Quick Start Guide

## 🚀 Getting Started

### 1. Database Setup
```bash
# Already applied! Migration is active
npx prisma studio  # View challenges in database
```

### 2. Start Development Server
```bash
npm run dev
# Navigate to http://localhost:3000/challenges
```

### 3. Create Test Challenge
```bash
node scripts/create-test-challenge.js
# Output: Challenge ID will be displayed
```

---

## 🎯 Test Scenarios

### Scenario 1: Join a Challenge
1. Go to `/challenges`
2. Click on any active challenge
3. Click "Join Challenge" button
4. Check your progress card appears

### Scenario 2: Auto Progress Update
1. Join a challenge
2. Go to any of your projects
3. Add a DailyLog with stitches
4. Return to challenge page
5. ✨ Progress automatically updated!

### Scenario 3: Leaderboard
1. Join a challenge
2. Add multiple logs to accumulate stitches
3. Check your rank in the leaderboard
4. Filter: Top 10 → View More → Top 100

### Scenario 4: Filters
On `/challenges` page:
- Filter by status: Active / Upcoming / Past
- Filter by type: Speed / Streak / Completion
- Try different language: Switch in settings

---

## 📝 API Testing with curl

### List Challenges
```bash
curl http://localhost:3000/api/challenges
curl http://localhost:3000/api/challenges?status=active
curl http://localhost:3000/api/challenges?type=speed
```

### Get Challenge Details
```bash
curl http://localhost:3000/api/challenges/cmlpoye0u00001ph4htjkb6lj
```

### Join Challenge (requires auth)
```bash
curl -X POST http://localhost:3000/api/challenges/[ID]/join \
  -H "Content-Type: application/json" \
  -d '{"action": "join"}' \
  -b "cookies.txt"
```

### Get Full Leaderboard
```bash
curl "http://localhost:3000/api/challenges/[ID]/leaderboard?limit=100&offset=0"
```

---

## 🛠️ Development Commands

### Database
```bash
npx prisma studio              # View/edit data
npx prisma generate            # Regenerate client
npx prisma migrate dev         # Create new migration
npx prisma db push             # Quick schema sync (dev only)
```

### TypeScript
```bash
npm run build                  # Full build (checks types)
npx tsc --noEmit              # Type check only
```

### Testing
```bash
# Create multiple test challenges
for i in {1..5}; do node scripts/create-test-challenge.js; done

# Check challenge count
npx prisma studio
# Then: Challenge table → Count rows
```

---

## 🔍 Quick Debugging

### Check if progress updates
```javascript
// In browser console on challenge page
fetch('/api/challenges/[ID]')
  .then(r => r.json())
  .then(d => console.log('My progress:', d.data.userParticipation?.currentProgress))
```

### View leaderboard in console
```javascript
fetch('/api/challenges/[ID]/leaderboard')
  .then(r => r.json())
  .then(d => console.table(d.data.map(e => ({
    rank: e.rank,
    user: e.user?.name,
    score: e.score
  }))))
```

### Check active challenges for user
```sql
-- In Prisma Studio → ChallengeParticipant table
-- Filter by userId
-- See: challengeId, currentProgress, lastUpdated
```

---

## 📍 Key Files to Edit

### Add new challenge type
1. Update schema: `prisma/schema.prisma` (add to Challenge.type enum if needed)
2. Update calculation: `src/lib/challenges.ts` → `calculateUserProgressForChallenge()`
3. Add translations: `src/messages/*.json` → `challenges.types.{newType}`

### Change leaderboard display
- Edit: `src/components/challenges/leaderboard-table.tsx`
- Modify: `getScoreLabel()` function

### Add filters
- Edit: `src/app/challenges/page.tsx`
- Add state: `useState<NewFilterType>()`
- Update query: `queryKey` array

---

## 🌐 Translations

### Add new translation key
```bash
# 1. Edit all 6 files:
src/messages/en.json  # English
src/messages/ru.json  # Russian
src/messages/de.json  # German
src/messages/fr.json  # French
src/messages/es.json  # Spanish
src/messages/zh.json  # Chinese

# 2. Add same key with translated value in each
# 3. Use in component:
const t = useTranslations('challenges')
t('yourNewKey')
```

---

## ⚡ Performance Tips

### Optimize leaderboard queries
```typescript
// Add index in schema.prisma
@@index([challengeId, rank])  // Already added ✅

// Limit results
GET /api/challenges/[id]/leaderboard?limit=10
```

### Cache challenge list
```typescript
// In page.tsx
queryKey: ["challenges", statusFilter, typeFilter],
staleTime: 60000,  // Cache for 1 minute
```

---

## 🎨 UI Customization

### Change challenge card style
Edit: `src/components/challenges/challenge-card.tsx`
```typescript
<Card className="hover:shadow-lg transition-shadow">
  {/* Add your custom styling */}
</Card>
```

### Customize leaderboard badges
Edit: `src/components/challenges/leaderboard-table.tsx`
```typescript
const getRankBadge = (rank: number) => {
  // Customize colors, icons, etc.
}
```

---

## 📞 Need Help?

**Documentation:**
- Full implementation: `CHALLENGES_IMPLEMENTATION.md`
- Memory/notes: `.claude/memory/MEMORY.md`

**Common Issues:**
- TypeScript errors → Check Next.js 16 params (must be Promise)
- Progress not updating → Check DailyLog creation triggers hook
- Translation missing → Check all 6 language files

---

**Last Updated:** 2026-02-17
