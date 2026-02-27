@echo off
REM ============================================
REM SaaS Platform - Start All Services (Windows)
REM ============================================

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║  🚀 SaaS Platform - Starting All Services             ║
echo ╚════════════════════════════════════════════════════════╝

REM Check if all .env files exist
echo.
echo 📋 Checking configuration files...

if not exist backend\.env (
    echo ✗ backend\.env not found!
    echo   Please run: setup.bat
    exit /b 1
)
echo ✓ backend\.env exists

if not exist stripe-backend\.env (
    echo ✗ stripe-backend\.env not found!
    echo   Please run: setup.bat
    exit /b 1
)
echo ✓ stripe-backend\.env exists

echo.
echo 🚀 Starting services in separate windows...
echo.

REM Start Golang Backend (PayPal)
echo Starting Golang Backend (PayPal) on port 8080...
start "SaaS - Go Backend (PayPal)" cmd /k "cd backend && go run main.go"

REM Wait for Go backend to start
timeout /t 3 /nobreak

REM Start Express.js Backend (Stripe)
echo Starting Express.js Backend (Stripe) on port 4242...
start "SaaS - Stripe Backend" cmd /k "cd stripe-backend && npm start"

REM Wait for Express backend to start
timeout /t 3 /nobreak

REM Start Next.js Frontend
echo Starting Next.js Frontend on port 3000...
start "SaaS - Frontend" cmd /k "npm run dev"

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║  ✅ All Services Started!                             ║"
echo ╚════════════════════════════════════════════════════════╝
echo.
echo 📍 Access the platform:
echo    Frontend:        http://localhost:3000
echo    Go Backend:      http://localhost:8080
echo    Stripe Backend:  http://localhost:4242
echo.
echo 💡 Tips:
echo    - Each service runs in its own window
echo    - Close windows to stop services
echo    - Check windows for logs and errors
echo.
pause
