# Cron Jobs Documentation

## Overview

StitchArena uses automated cron jobs to maintain leaderboards, update statistics, and manage challenges.

## Configured Cron Jobs

### 1. Daily Stats & Leaderboards Update
- **Path**: `/api/cron/daily-update`
- **Schedule**: `0 3 * * *` (3 AM daily)
- **Purpose**:
  - Update cached user statistics (totalStitches, projectsCount, streaks)
  - Check and award new achievements
  - Refresh all leaderboards (all-time, monthly, weekly, projects, streaks)

### 2. Challenge Generation
- **Path**: `/api/cron/challenges/generate`
- **Schedule**: `0 0 * * 1` (Mondays at midnight)
- **Purpose**: Generate new weekly challenges

### 3. Challenge Close
- **Path**: `/api/cron/challenges/close`
- **Schedule**: `0 1 * * *` (1 AM daily)
- **Purpose**: Close expired challenges and award winners

### 4. Challenge Leaderboards
- **Path**: `/api/cron/challenges/update-leaderboards`
- **Schedule**: `*/5 * * * *` (Every 5 minutes)
- **Purpose**: Update active challenge leaderboards

## Deployment

### Vercel (Production)
The cron jobs are configured in `vercel.json` and will run automatically when deployed to Vercel.

**No additional setup required** - Vercel handles the scheduling automatically.

### Local Development
For local testing, you can manually trigger cron jobs:

```bash
# Update stats and leaderboards
curl -X POST http://localhost:3000/api/cron/daily-update \
  -H "Authorization: Bearer your-secret-token-here"

# Or use the convenience script
npx tsx scripts/update-leaderboards.ts
```

### Other Platforms
If deploying to platforms other than Vercel, set up external cron services:

#### Using cron-job.org
1. Create account at https://cron-job.org
2. Add new cron job with URL: `https://your-domain.com/api/cron/daily-update`
3. Set schedule: `0 3 * * *`
4. Add header: `Authorization: Bearer your-secret-token`

#### Using GitHub Actions
Create `.github/workflows/cron.yml`:

```yaml
name: Daily Update
on:
  schedule:
    - cron: '0 3 * * *'
  workflow_dispatch:

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger cron
        run: |
          curl -X POST https://your-domain.com/api/cron/daily-update \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

## Security

### CRON_SECRET
All cron endpoints are protected by a secret token to prevent unauthorized access.

**Setup:**
1. Generate a secure random token:
   ```bash
   openssl rand -base64 32
   ```

2. Add to environment variables:
   ```env
   CRON_SECRET=your-generated-token
   ```

3. On Vercel, add to Environment Variables in project settings

4. Use in Authorization header:
   ```
   Authorization: Bearer your-generated-token
   ```

## Manual Execution

### Update All Stats and Leaderboards
```bash
npx tsx scripts/update-leaderboards.ts
```

### Initialize Badges
```bash
npx tsx scripts/init-badges.ts
```

## Monitoring

### Check Last Run
Cron endpoints return JSON with execution details:

```json
{
  "success": true,
  "results": {
    "usersUpdated": 150,
    "achievementsAwarded": 23,
    "leaderboardsUpdated": true,
    "errors": []
  },
  "duration": "2341ms",
  "timestamp": "2026-03-01T03:00:00.000Z"
}
```

### Vercel Logs
View cron execution logs in Vercel dashboard:
1. Go to your project
2. Click "Logs" tab
3. Filter by `/api/cron`

## Troubleshooting

### Cron not running on Vercel
- Check Vercel project settings → Cron Jobs
- Ensure `vercel.json` is committed to repository
- Check deployment logs for errors

### Unauthorized errors
- Verify `CRON_SECRET` is set in environment variables
- Check Authorization header format: `Bearer <token>`

### Performance issues
If daily update takes too long:
1. Increase Vercel function timeout (pro plan)
2. Batch user updates (process in chunks)
3. Run leaderboard updates separately

## Cron Schedule Reference

```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6) (0 = Sunday)
│ │ │ │ │
│ │ │ │ │
* * * * *
```

Examples:
- `0 3 * * *` - Every day at 3 AM
- `0 0 * * 1` - Every Monday at midnight
- `*/5 * * * *` - Every 5 minutes
- `0 */6 * * *` - Every 6 hours
