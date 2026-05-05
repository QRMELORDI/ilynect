@echo off
echo ========================================
echo   ILYNECT - Push to GitHub
echo ========================================
echo.

cd /d "C:\Users\akshi\Desktop\ILYNECT"

echo [1/4] Adding changes...
git add .

echo [2/4] Committing...
git commit -m "v3.0.2 - Family Friendly UI"

echo [3/4] Pushing to GitHub...
git push origin master

echo.
echo ========================================
echo   DONE! App will auto-update
echo ========================================
echo.
pause