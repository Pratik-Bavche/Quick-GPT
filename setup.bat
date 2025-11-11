@echo off
REM Quick setup script for QuickGPT Server
REM Run this in PowerShell: .\setup.bat

echo.
echo ========================================
echo   QuickGPT Server Setup Script
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org/
    exit /b 1
)

echo [✓] Node.js found
echo.

REM Check if .env file exists
if not exist "server\.env" (
    echo [!] .env file not found in server/
    echo [i] Creating .env from .env.example...
    if exist "server\.env.example" (
        copy "server\.env.example" "server\.env"
        echo [✓] Created server/.env
        echo.
        echo [!] IMPORTANT: Edit server/.env with your MongoDB URI and other credentials!
        echo.
    ) else (
        echo [ERROR] .env.example not found
        exit /b 1
    )
) else (
    echo [✓] .env file found
)

REM Install dependencies
echo [i] Installing server dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    cd ..
    exit /b 1
)
cd ..
echo [✓] Dependencies installed
echo.

echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Edit server/.env with your MongoDB URI
echo 2. Run: npm run server (from server directory)
echo 3. Frontend: npm run dev (from client directory)
echo.
echo For help, see: TROUBLESHOOTING.md
echo.
