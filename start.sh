#!/bin/bash

# AGR Jewellery Project Startup Script for Linux
# Resolves the directory where the script is located
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "==================================================="
echo "            Starting AGR Jewellery Project"
echo "==================================================="
echo

# 1. Start the Backend Server (Express/Prisma)
echo "[1/2] Starting Backend Server..."
cd "$PROJECT_ROOT/server" && npm run dev < /dev/null &
BACKEND_PID=$!

# Wait a brief moment for the database/server to initialize
sleep 2

# 2. Start the Frontend Client (Vite/React)
echo "[2/2] Starting Frontend Client..."
cd "$PROJECT_ROOT/client" && npm run dev < /dev/null &
CLIENT_PID=$!

echo
echo "==================================================="
echo "Servers are running!"
echo "- Backend PID: $BACKEND_PID"
echo "- Client PID: $CLIENT_PID"
echo "Press Ctrl+C to stop both servers."
echo "==================================================="

# Gracefully terminate background processes when the script is stopped
trap "echo -e '\nStopping servers...'; kill $BACKEND_PID $CLIENT_PID 2>/dev/null; exit" INT TERM EXIT

# Wait for background jobs to finish
wait
