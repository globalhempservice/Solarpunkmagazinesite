#!/bin/bash

# Test build script for DEWII Magazine
# This simulates the Netlify build process locally

echo "🌿 DEWII Magazine - Build Test"
echo "================================"
echo ""

# Check Node version
echo "📦 Checking Node.js version..."
node -v
if [ $? -ne 0 ]; then
  echo "❌ Node.js not found. Please install Node.js >= 18.0.0"
  exit 1
fi

echo ""

# Check npm version
echo "📦 Checking npm version..."
npm -v
if [ $? -ne 0 ]; then
  echo "❌ npm not found. Please install npm >= 9.0.0"
  exit 1
fi

echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps
if [ $? -ne 0 ]; then
  echo "❌ Failed to install dependencies"
  exit 1
fi

echo ""

# Run build
echo "🏗️  Building project..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Build failed"
  exit 1
fi

echo ""
echo "✅ Build successful!"
echo ""
echo "📁 Build output directory: ./build"
echo ""
echo "To preview the build locally, run:"
echo "  npm run preview"
echo ""
