@echo off
REM ============================================
REM SaaS Platform - Complete Setup Script (Windows)
REM ============================================

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║  🚀 SaaS Platform - Setup ^& Execution                 ║
echo ╚════════════════════════════════════════════════════════╝

REM Check prerequisites
echo.
echo 📋 Checking prerequisites...

where go >nul 2>nul
if errorlevel 1 (
    echo ✗ Go is not installed
    exit /b 1
)
echo ✓ Go is installed

where node >nul 2>nul
if errorlevel 1 (
    echo ✗ Node.js is not installed
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✓ Node.js !NODE_VERSION!

where npm >nul 2>nul
if errorlevel 1 (
    echo ✗ npm is not installed
    exit /b 1
)
for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo ✓ npm !NPM_VERSION!

where mysql >nul 2>nul
if errorlevel 1 (
    echo ✓ MySQL client not found (can skip if using external database)
) else (
    echo ✓ MySQL is installed
)

REM Setup Golang Backend
echo.
echo 🔧 Setting up Golang Backend (PayPal)...
cd backend

if not exist .env (
    if exist .env.example (
        copy .env.example .env
        echo ✓ Created .env from template
        echo ⚠️  Please edit backend\.env with your credentials
    )
) else (
    echo ✓ .env already exists
)

cd ..

REM Setup Express.js Backend
echo.
echo 🔧 Setting up Express.js Backend (Stripe)...
cd stripe-backend

if not exist .env (
    if exist .env.example (
        copy .env.example .env
        echo ✓ Created .env from template
        echo ⚠️  Please edit stripe-backend\.env with your Stripe keys
    )
) else (
    echo ✓ .env already exists
)

if not exist node_modules (
    echo 📦 Installing npm dependencies...
    call npm install
    echo ✓ npm dependencies installed
) else (
    echo ✓ npm dependencies already installed
)

cd ..

REM Setup Next.js Frontend
echo.
echo 🔧 Setting up Next.js Frontend...

if not exist .env.local (
    echo ✓ No .env.local found
) else (
    echo ✓ .env.local exists
)

if not exist node_modules (
    echo 📦 Installing npm dependencies...
    call npm install
    echo ✓ npm dependencies installed
) else (
    echo ✓ npm dependencies already installed
)

REM Display next steps
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║  ✅ Setup Complete!                                   ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo 📝 Next Steps:
echo.
echo 1️⃣  Configure credentials:
echo    Edit backend\.env
echo    - Add PayPal CLIENT_ID and SECRET
echo    - Add database credentials
echo.
echo 2️⃣  Configure Stripe:
echo    Edit stripe-backend\.env
echo    - Add STRIPE_SECRET_KEY
echo    - Add STRIPE_WEBHOOK_SECRET
echo.
echo 3️⃣  Run all services:
echo    .\start-all.bat  (Windows)
echo.
echo 4️⃣  Access the platform:
echo    Frontend:        http://localhost:3000
echo    Go Backend:      http://localhost:8080
echo    Stripe Backend:  http://localhost:4242
echo.
pause
