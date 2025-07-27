#!/bin/bash

# Production deployment script for Render
echo "Setting up production environment..."

# Create data directory for SQLite database
echo "Creating data directory..."
mkdir -p /opt/render/project/src/backend/data

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Initialize/migrate database
echo "Setting up database..."
npx prisma db push --force-reset

# Wait for Prisma client to be ready
echo "Waiting for Prisma client to be ready..."
sleep 3

# Verify environment
echo "Environment check:"
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"
echo "Database path: $DATABASE_URL"

# Start the application
echo "Starting application..."
exec node dist/index.js

