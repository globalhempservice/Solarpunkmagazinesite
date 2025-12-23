@echo off
REM 🚀 DEWII Deploy Script for Windows
REM Run this to deploy all changes to Netlify

echo 🌿 Deploying DEWII to Netlify...
echo.

REM Add all files
echo 📦 Adding files...
git add .

REM Show what will be committed
echo.
echo 📋 Files to commit:
git status --short

REM Commit
echo.
set /p commit_msg="📝 Enter commit message (or press Enter for default): "
if "%commit_msg%"=="" set commit_msg=Update DEWII - BUD presentation and meta tags

git commit -m "%commit_msg%"

REM Push
echo.
echo 🚀 Pushing to GitHub...
git push origin main

REM Success
echo.
echo ✅ Deploy triggered!
echo.
echo 📊 Monitor deploy:
echo    https://app.netlify.com
echo.
echo 🌐 Live site (after ~3 min):
echo    https://mag.hempin.org
echo.
echo 🌿 BUD presentation:
echo    https://mag.hempin.org/bud-presentation
echo.
echo 💡 Remember to clear browser cache after deploy!
echo    Windows: Ctrl+Shift+R
echo.
pause
