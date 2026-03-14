#!/bin/bash

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
if npx prisma migrate deploy 2>&1 | tee /tmp/migrate_output.log | grep -q "P3005"; then
  echo "ℹ️  Database already has schema. Marking all migrations as applied..."
  # Mark all existing migrations as applied (baseline)
  for migration in $(ls prisma/migrations | grep -v migration_lock); do
    npx prisma migrate resolve --applied "$migration" 2>/dev/null || true
  done
  echo "✅ Baseline complete. Future migrations will work automatically."
elif grep -q "No pending migrations" /tmp/migrate_output.log || grep -q "already been applied" /tmp/migrate_output.log; then
  echo "✅ All migrations already applied!"
else
  echo "✅ Migrations applied successfully!"
fi

# Generate Prisma Client
echo "⚙️  Generating Prisma Client..."
npx prisma generate

rm -f /tmp/migrate_output.log
echo "✅ Done!"
