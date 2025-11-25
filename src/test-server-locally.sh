#!/bin/bash

# Test Server Locally - Run this before deploying to catch errors early
# Usage: bash test-server-locally.sh

echo "🧪 DEWII Server Local Test Script"
echo "=================================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed"
    echo "📦 Install it: npm install -g supabase"
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Check if we're in a Supabase project
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Not in a Supabase project directory"
    echo "📁 Run this from your project root"
    exit 1
fi

echo "✅ Supabase project detected"
echo ""

# Check if server files exist
if [ ! -f "supabase/functions/server/index.tsx" ]; then
    echo "❌ Server file not found at supabase/functions/server/index.tsx"
    exit 1
fi

echo "✅ Server files found"
echo ""

# Start Supabase locally
echo "🚀 Starting Supabase local environment..."
echo "   (This will take a minute...)"
echo ""

supabase start

if [ $? -ne 0 ]; then
    echo "❌ Failed to start Supabase"
    exit 1
fi

echo ""
echo "✅ Supabase started successfully"
echo ""

# Serve the function locally
echo "🌐 Starting Edge Function locally..."
echo "   URL: http://localhost:54321/functions/v1/make-server-053bcd80"
echo ""
echo "   Press Ctrl+C to stop"
echo ""

supabase functions serve make-server-053bcd80 --env-file supabase/.env.local

# Cleanup on exit
trap "supabase stop" EXIT
