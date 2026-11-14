@echo off
title AgriTourism Philippines - Java Backend & Desktop App
cd /d "%~dp0"
if not exist "node_modules" (
  echo Installing Node packages...
  call npm install
)
echo Building HTML + CSS + TypeScript frontend bundle into dist/...
call npm run build
echo Starting Java Backend + JavaFX Desktop Application...
cd java
call mvn javafx:run
