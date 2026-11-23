#!/bin/sh
set -e

echo "🚀 Running database migrations..."
npx prisma migrate deploy

echo "🌱 Seeding data..."
npx tsx prisma/seed.ts || echo "⚠️ Seed skipped or existing data"

echo "⚡ Starting NestJS server..."
exec "$@"