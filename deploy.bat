@echo off
echo Building the project...
call npm run build
if %errorlevel% neq 0 exit /b %errorlevel%

echo Deploying to Firebase...
call firebase deploy
if %errorlevel% neq 0 exit /b %errorlevel%

echo Deployment Complete!
pause
