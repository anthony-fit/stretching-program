@echo off
echo === Checking Git Remote ===
git remote -v
echo.

REM Check if origin already exists with correct URL
git remote get-url origin >nul 2>&1
if %errorlevel% equ 0 (
    echo.
    echo === Pushing to origin main ===
    git push -u origin main
) else (
    echo.
    echo === Adding remote origin ===
    git remote add origin https://github.com/anthony-fit/stretching-program.git
    echo.
    echo === Renaming branch to main ===
    git branch -M main
    echo.
    echo === Pushing to origin main ===
    git push -u origin main
)
pause
