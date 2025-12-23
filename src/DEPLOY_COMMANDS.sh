#!/bin/bash

# 🚀 DEWII Deploy Script
# Run this to deploy all changes to Netlify

echo "🌿 Deploying DEWII to Netlify..."
echo ""

# Add all files
echo "📦 Adding files..."
git add .

# Show what will be committed
echo ""
echo "📋 Files to commit:"
git status --short

# Commit
echo ""
read -p "📝 Enter commit message (or press Enter for default): " commit_msg
if [ -z "$commit_msg" ]; then
  commit_msg="Update DEWII - BUD presentation and meta tags"
fi

git commit -m "$commit_msg"

# Push
echo ""
echo "🚀 Pushing to GitHub..."
git push origin main

# Success
echo ""
echo "✅ Deploy triggered!"
echo ""
echo "📊 Monitor deploy:"
echo "   https://app.netlify.com"
echo ""
echo "🌐 Live site (after ~3 min):"
echo "   https://mag.hempin.org"
echo ""
echo "🌿 BUD presentation:"
echo "   https://mag.hempin.org/bud-presentation"
echo ""
echo "💡 Remember to clear browser cache after deploy!"
echo "   Windows/Linux: Ctrl+Shift+R"
echo "   Mac: Cmd+Shift+R"
echo ""
