@echo off
title AgriTourism Philippines Desktop Application
cd /d "%~dp0"
if not exist "node_modules" (
  echo Installing dependencies first...
  call npm install
)
echo Launching AgriTourism Philippines Desktop App...
call npm run desktop
