#!/bin/bash

# Simple deployment script for Render
echo "🔄 Creating data directory..."
mkdir -p /opt/render/project/src/backend/data

echo "🔄 Generating Prisma client..."
npx prisma generate

echo "Setting up database..."
npx prisma db push --force-reset

echo "⏳ Waiting for Prisma client to be ready..."
sleep 3

echo "Starting application..."
exec node dist/index.js

