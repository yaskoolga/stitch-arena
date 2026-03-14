#!/bin/bash
set -e

echo "🗄️  Applying migrations to production..."

# Check if VERCEL_TOKEN exists
if [ -z "$VERCEL_TOKEN" ]; then
  echo "❌ VERCEL_TOKEN not found!"
  echo "Please set it up following SETUP_AUTOMATION.md"
  exit 1
fi

# Pull production DATABASE_URL
echo "📥 Getting production DATABASE_URL..."
vercel env pull .env.production --yes --token=$VERCEL_TOKEN

# Apply migrations
echo "⚡ Running migrations..."
npx prisma migrate deploy

# Generate Prisma Client
echo "⚙️  Generating Prisma Client..."
npx prisma generate

echo "✅ Migrations applied successfully!"
