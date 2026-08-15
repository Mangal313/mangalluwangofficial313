#!/usr/bin/env bash
set -e
echo "Checking Node version..."
node -v

echo "Installing dependencies..."
npm install

echo "Checking environment variables..."
if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL not set. Please copy .env.example to .env and set variables."
  exit 1
fi

echo "Starting Docker (Postgres) if using docker-compose..."
if [ -f docker-compose.yml ]; then
  docker-compose up -d db
  echo "Waiting for Postgres to be ready..."
  sleep 5
fi

echo "Generating Prisma client..."
npx prisma generate

echo "Running migrations..."
npx prisma migrate deploy || npx prisma migrate dev --name init

echo "Seeding database..."
npm run db:seed

echo "Setup complete. Visit http://localhost:3000"
