#!/bin/bash

# Simple deployment test script for Render
echo "🔄 Generating Prisma client..."
npx prisma generate

echo "🗄️ Setting up database..."
npx prisma db push --force-reset

echo "✅ Starting application..."
exec npm start
