#!/bin/bash
set -e

echo "🚀 Starting automated deployment..."

# 1. Check if VERCEL_TOKEN exists
if [ -z "$VERCEL_TOKEN" ]; then
  echo "❌ VERCEL_TOKEN not found!"
  echo "Please set it up following SETUP_AUTOMATION.md"
  exit 1
fi

# 2. Pull production environment variables
echo "📥 Pulling production environment variables..."
vercel env pull .env.production --yes --token=$VERCEL_TOKEN

# 3. Apply database migrations
echo "🗄️  Applying database migrations..."
npx prisma migrate deploy

# 4. Generate Prisma Client
echo "⚙️  Generating Prisma Client..."
npx prisma generate

# 5. Push to GitHub (triggers Vercel auto-deploy)
echo "📤 Pushing to GitHub..."
git push origin main

echo "✅ Deployment complete!"
echo "🔗 Check status at: https://vercel.com/yaskoolga/stitch-arena"
