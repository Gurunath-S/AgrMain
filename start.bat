@echo off
:: AGR Jewellery Project Startup Script
:: Relative version for the project root directory.

echo ===================================================
echo             Starting AGR Jewellery Project
echo ===================================================
echo.

:: Get the directory of this batch file
set "PROJECT_ROOT=%~dp0"

:: 1. Start the Backend Server (Express/Prisma)
echo [1/2] Starting Backend Server...
start "AGR Jewellery - Backend Server" cmd /k "cd /d "%PROJECT_ROOT%server" && npm run dev"

:: Wait a brief moment for the database/server to initialize
timeout /t 2 /nobreak >nul

:: 2. Start the Frontend Client (Vite/React)
echo [2/2] Starting Frontend Client...
start "AGR Jewellery - Frontend Client" cmd /k "cd /d "%PROJECT_ROOT%client" && npm run dev"

echo.
echo ===================================================
echo Launch commands sent! You can close this window.
echo ===================================================
timeout /t 5
exit
