@echo off
echo ===================================================
echo     Starting DigitSense AI (Digit Recognition)
echo ===================================================
echo.
echo Starting the Python Backend (FastAPI)...
start "DigitSense Backend" cmd /k "cd backend && python -m uvicorn main:app --reload --port 8000"

echo Starting the React Frontend (Vite)...
start "DigitSense Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Waiting 5 seconds for servers to wake up...
timeout /t 5 /nobreak >nul

echo Opening the application in your default browser...
start http://localhost:5173

echo.
echo Both servers are now running in separate black windows.
echo DO NOT close the black windows while using the app!
echo You can safely close this window.
pause
