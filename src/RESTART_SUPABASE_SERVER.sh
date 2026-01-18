#!/bin/bash

# 🔧 Quick Supabase Edge Function Restart Script
# This will redeploy your Edge Function to fix the 500 error

echo "🚀 DEWII Supabase Server Restart Script"
echo "========================================"
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found!"
    echo "   Install it with: npm install -g supabase"
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Navigate to project root (assuming script is in root)
cd "$(dirname "$0")"

echo "📂 Current directory: $(pwd)"
echo ""

# Check if supabase/functions/server exists
if [ ! -d "supabase/functions/server" ]; then
    echo "❌ Error: supabase/functions/server directory not found!"
    echo "   Make sure you're running this from the project root"
    exit 1
fi

echo "✅ Found Edge Function directory"
echo ""

echo "🔄 Redeploying Edge Function..."
echo ""

# Redeploy the Edge Function
npx supabase functions deploy server --no-verify-jwt

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Edge Function deployed successfully!"
    echo ""
    echo "🧪 Testing health endpoint..."
    echo ""
    
    # Test the health endpoint
    HEALTH_URL="https://dhsqlszauibxintwziib.supabase.co/functions/v1/make-server-053bcd80/health"
    RESPONSE=$(curl -s -w "\n%{http_code}" "$HEALTH_URL")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)
    
    echo "Response code: $HTTP_CODE"
    echo "Response body: $BODY"
    echo ""
    
    if [ "$HTTP_CODE" -eq 200 ]; then
        echo "✅ Server is healthy and responding!"
        echo ""
        echo "🎉 SUCCESS! Your server is back online."
        echo ""
        echo "Next steps:"
        echo "  1. Refresh your browser"
        echo "  2. Clear cache if needed (Ctrl+Shift+R)"
        echo "  3. Check if articles are loading"
        exit 0
    else
        echo "⚠️  Server deployed but health check failed"
        echo "   This might be temporary - wait 30 seconds and try again"
        echo ""
        echo "Manual test:"
        echo "  curl $HEALTH_URL"
        exit 1
    fi
else
    echo ""
    echo "❌ Deployment failed!"
    echo ""
    echo "Troubleshooting steps:"
    echo "  1. Check if you're logged in: npx supabase login"
    echo "  2. Check if project is linked: npx supabase link --project-ref dhsqlszauibxintwziib"
    echo "  3. Check Supabase status: https://status.supabase.com/"
    echo "  4. View logs in Supabase Dashboard → Edge Functions → server → Logs"
    exit 1
fi
