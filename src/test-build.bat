@echo off
REM Test build script for DEWII Magazine (Windows)
REM This simulates the Netlify build process locally

echo 🌿 DEWII Magazine - Build Test
echo ================================
echo.

REM Check Node version
echo 📦 Checking Node.js version...
node -v
if errorlevel 1 (
  echo ❌ Node.js not found. Please install Node.js ^>= 18.0.0
  exit /b 1
)
echo.

REM Check npm version
echo 📦 Checking npm version...
npm -v
if errorlevel 1 (
  echo ❌ npm not found. Please install npm ^>= 9.0.0
  exit /b 1
)
echo.

REM Install dependencies
echo 📦 Installing dependencies...
npm install --legacy-peer-deps
if errorlevel 1 (
  echo ❌ Failed to install dependencies
  exit /b 1
)
echo.

REM Run build
echo 🏗️  Building project...
npm run build
if errorlevel 1 (
  echo ❌ Build failed
  exit /b 1
)

echo.
echo ✅ Build successful!
echo.
echo 📁 Build output directory: ./build
echo.
echo To preview the build locally, run:
echo   npm run preview
echo.
