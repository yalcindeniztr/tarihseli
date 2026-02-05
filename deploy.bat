@echo off
echo Building the project...
call npm run build
if %errorlevel% neq 0 exit /b %errorlevel%

echo Deploying to Firebase...
call firebase deploy
if %errorlevel% neq 0 exit /b %errorlevel%

echo Pushing to GitHub...
call git add .
call git commit -m "Auto deploy: %date% %time%"
call git push
if %errorlevel% neq 0 echo Warning: Git push failed, but deployment was successful.

echo Deployment Complete!
pause
