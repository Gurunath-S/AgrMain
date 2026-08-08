@echo off
:: AGR Jewellery Project Startup Script
:: Starts the development environment and launches the Electron application

echo ===================================================
echo          Starting AGR Jewellery Dev Environment
echo ===================================================
echo.

:: Get the directory of this batch file
set "PROJECT_ROOT=%~dp0"
cd /d "%PROJECT_ROOT%"

:: Run the unified dev script which starts server, client, and Electron
npm run dev

exit
