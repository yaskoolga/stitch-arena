# StitchArena - Production Environment

**Status**: Live in Production

## Production URLs

- **Live Application**: https://stitch-arena.vercel.app
- **GitHub Repository**: https://github.com/yaskoolga/stitch-arena
- **CV Service (API)**: https://stitch-arena-production.up.railway.app

## Infrastructure

### Frontend (Vercel)
- **Platform**: Vercel
- **Project ID**: `prj_PY4ZqyM4AmKiGL9Qvp79Lg2WKjIA`
- **Auto-deploy**: Enabled (push to `main` branch)
- **Framework**: Next.js 16 (App Router)

### CV Service (Railway)
- **Platform**: Railway
- **Endpoint**: https://stitch-arena-production.up.railway.app
- **Framework**: Python FastAPI
- **Auto-deploy**: Enabled (changes in `cv-service/` folder)

### Database
- **Provider**: Neon PostgreSQL
- **Type**: Serverless PostgreSQL
- **Connection**: Pooled connection (production)

### Image Storage
- **Provider**: Cloudinary
- **Features**: Upload, optimization, WebP conversion, thumbnails

## Deployment Process

### Automatic Deployment
1. Push changes to `main` branch
2. Vercel automatically deploys frontend
3. Railway automatically deploys CV service (if changed)

### Manual Deployment
```bash
# Deploy to production
vercel deploy --prod

# Pull production environment variables
vercel env pull .env.production

# Apply database migrations
npx prisma migrate deploy
```

## Environment Variables

Production environment variables are stored in:
- Vercel Dashboard (for frontend)
- Railway Dashboard (for CV service)
- Local `.env.production` file (for migrations)

**Never commit `.env.production` to git!**

## Monitoring

- **Vercel Dashboard**: https://vercel.com/yaskoolga/stitch-arena
- **Railway Dashboard**: CV service logs and metrics
- **Cloudinary Dashboard**: Image storage usage

## Admin Access

- **Email**: yasko.olga@gmail.com
- **Permissions**:
  - Delete any comment
  - View all user statistics
  - Manage users (future)

## Database Migrations

When deploying schema changes:

```bash
# 1. Create migration locally
npx prisma migrate dev --name your_migration_name

# 2. Test locally
npm run dev

# 3. Push to GitHub
git add .
git commit -m "Add database migration: your_migration_name"
git push origin main

# 4. Apply to production
vercel env pull .env.production
npx prisma migrate deploy
```

## Quick Links

- **Production App**: https://stitch-arena.vercel.app
- **Vercel Dashboard**: https://vercel.com/yaskoolga/stitch-arena
- **GitHub Repo**: https://github.com/yaskoolga/stitch-arena

## Version

- **Current**: v0.7.0 (Challenge System Enhancements)
- **Last Updated**: March 15, 2026
- **Last Deploy**: Auto-deploy on push to main

## Support

For issues or questions:
- Create an issue on GitHub
- Contact admin: yasko.olga@gmail.com
