@echo off

cd /d "%~dp0"

where node >nul 2>nul

if errorlevel 1 (
    echo Instala Node.js 24 o superior desde https://nodejs.org/
    pause
    exit /b 1
)

echo Abre http://localhost:3000 en tu navegador.
echo Deja esta ventana abierta. Usa Ctrl+C para detener el servidor.

node server.js

pause