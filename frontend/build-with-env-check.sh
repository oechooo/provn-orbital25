#!/bin/bash
echo "Build Environment Check"
echo "VITE_API_URL: $VITE_API_URL"
echo "NODE_ENV: $NODE_ENV"
echo "PWD: $PWD"
echo "Build starting..."
npm install && npm run build
