@echo off
REM 🔧 Quick Supabase Edge Function Restart Script (Windows)
REM This will redeploy your Edge Function to fix the 500 error

echo 🚀 DEWII Supabase Server Restart Script
echo ========================================
echo.

REM Check if supabase CLI is installed
where supabase >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Supabase CLI not found!
    echo    Install it with: npm install -g supabase
    pause
    exit /b 1
)

echo ✅ Supabase CLI found
echo.

REM Navigate to project root (assuming script is in root)
cd /d "%~dp0"

echo 📂 Current directory: %CD%
echo.

REM Check if supabase\functions\server exists
if not exist "supabase\functions\server" (
    echo ❌ Error: supabase\functions\server directory not found!
    echo    Make sure you're running this from the project root
    pause
    exit /b 1
)

echo ✅ Found Edge Function directory
echo.

echo 🔄 Redeploying Edge Function...
echo.

REM Redeploy the Edge Function
call npx supabase functions deploy server --no-verify-jwt

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Edge Function deployed successfully!
    echo.
    echo 🧪 Testing health endpoint...
    echo.
    
    REM Test the health endpoint using PowerShell
    powershell -Command "try { $response = Invoke-WebRequest -Uri 'https://dhsqlszauibxintwziib.supabase.co/functions/v1/make-server-053bcd80/health' -UseBasicParsing; Write-Host 'Response code:' $response.StatusCode; Write-Host 'Response body:' $response.Content; if ($response.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { Write-Host 'Error:' $_.Exception.Message; exit 1 }"
    
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ✅ Server is healthy and responding!
        echo.
        echo 🎉 SUCCESS! Your server is back online.
        echo.
        echo Next steps:
        echo   1. Refresh your browser
        echo   2. Clear cache if needed (Ctrl+Shift+R^)
        echo   3. Check if articles are loading
        pause
        exit /b 0
    ) else (
        echo.
        echo ⚠️  Server deployed but health check failed
        echo    This might be temporary - wait 30 seconds and try again
        echo.
        echo Manual test:
        echo   curl https://dhsqlszauibxintwziib.supabase.co/functions/v1/make-server-053bcd80/health
        pause
        exit /b 1
    )
) else (
    echo.
    echo ❌ Deployment failed!
    echo.
    echo Troubleshooting steps:
    echo   1. Check if you're logged in: npx supabase login
    echo   2. Check if project is linked: npx supabase link --project-ref dhsqlszauibxintwziib
    echo   3. Check Supabase status: https://status.supabase.com/
    echo   4. View logs in Supabase Dashboard → Edge Functions → server → Logs
    pause
    exit /b 1
)
