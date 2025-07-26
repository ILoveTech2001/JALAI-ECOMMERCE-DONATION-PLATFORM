#!/bin/bash

# Render Build Script for JALAI Frontend
echo "🚀 Starting JALAI Frontend Build..."

# Set Node version
echo "📦 Setting Node.js version..."
export NODE_VERSION=18.20.0

# Install dependencies with force and legacy peer deps
echo "📦 Installing dependencies..."
npm install --force --legacy-peer-deps

# Build the application
echo "🔨 Building application..."
CI=false npm run build

# Verify build
echo "✅ Build completed!"
ls -la dist/

echo "🎉 JALAI Frontend ready for deployment!"
