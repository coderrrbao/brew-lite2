#!/bin/sh
set -e


MIGRATE_URL="${DIRECT_URL:-$DATABASE_URL}"

if [ -z "$MIGRATE_URL" ]; then
  echo "⚠️ Không tìm thấy DIRECT_URL hoặc DATABASE_URL. Bỏ qua Migrate/Seed."
else
  echo "🚀 Running database migrations using Direct Connection..."
  DATABASE_URL="$MIGRATE_URL" timeout 120 npx prisma migrate deploy

  echo "🌱 Seeding data..."
  DATABASE_URL="$MIGRATE_URL" timeout 60 npx tsx prisma/seed.ts || echo "⚠️ Seed skipped or existing data"
fi

echo "⚡ Starting NestJS server..."
exec "$@"