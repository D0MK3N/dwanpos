@echo off
REM Individual service startup scripts for Windows

REM Start only Golang Backend
setlocal
cd backend
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║  🚀 Starting Golang Backend (PayPal)                  ║
echo ║  📍 http://localhost:8080                             ║
echo ╚════════════════════════════════════════════════════════╝
echo.
go run main.go
