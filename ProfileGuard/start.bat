@echo off
title ProfileGuard Security Server
echo [SYSTEM] Launching ProfileGuard AI Engine...
echo [SYSTEM] Opening ProfileGuard Security Dashboard...
cd backend
start http://localhost:5000/home.html
node server.js
pause
