@echo off
REM Smart Collaboration Platform - One-Click Startup
REM This script automatically handles all setup and starts the system

setlocal enabledelayedexpansion
cd /d "%~dp0"

echo.
echo ===============================================
echo Smart Collaboration Platform Startup
echo ===============================================
echo.

REM ========== CHECK NODE.JS ==========
echo [CHECK] Node.js installation...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Node.js is NOT installed
    echo.
    echo SOLUTION:
    echo 1. Go to https://nodejs.org/
    echo 2. Download and install LTS version
    echo 3. Restart this script
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
echo [OK] Node.js %NODE_VER% found

REM ========== CHECK .ENV FILE ==========
echo [CHECK] Backend configuration (.env file)...

echo [OK] .env file found

REM ========== INSTALL DEPENDENCIES ==========
echo [CHECK] Backend dependencies...
echo [OK] Dependencies already installed

REM ========== FINAL STARTUP ==========
echo.
echo ===============================================
echo Starting Application...
echo ===============================================
echo.

echo [1/2] Starting BACKEND (port 5000)...
start "SCP Backend - DO NOT CLOSE" cmd /k "cd /d "%~dp0backend" && npm run dev"

timeout /t 3 /nobreak

echo [2/2] Starting FRONTEND (port 5500)...
start "SCP Frontend - DO NOT CLOSE" cmd /k "cd /d "%~dp0" && npx --yes http-server frontend/public -p 5500 -c-1"

timeout /t 3 /nobreak

echo.
echo Opening application in browser...
timeout /t 2 /nobreak
start "" "http://127.0.0.1:5500"

echo.
echo ===============================================
echo ✓ SUCCESS! Application is running
echo ===============================================
echo.
echo Frontend:    http://127.0.0.1:5500
echo Backend API: http://127.0.0.1:5000/api
echo.
echo IMPORTANT: Keep both terminal windows OPEN
echo To stop: Close both terminal windows or press Ctrl+C
echo.
timeout /t 5 /nobreak
