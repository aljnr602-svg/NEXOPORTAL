@echo off

cd /d "%~dp0"

where node >nul 2>nul

if errorlevel 1 (
    echo Instala Node.js 24 o superior desde https://nodejs.org/
    pause
    exit /b 1
)

set "HOST=0.0.0.0"

echo NEXO - ACCESO DESDE IPHONE EN LA MISMA WI-FI
echo Abre en Safari la direccion de Wi-Fi que aparecera abajo.
echo Deja esta ventana abierta. Para dejar de compartir, usa Ctrl+C.

node server.js

pause
