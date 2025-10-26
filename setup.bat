@echo off
REM Monad Wallet Checker Setup Script for Windows

echo 🔧 Setting up Monad Wallet Checker...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is required but not installed.
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found

REM Install dependencies
echo 📦 Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

REM Build the project
echo 🔨 Building project...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Failed to build project
    pause
    exit /b 1
)

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo 📝 Creating .env file...
    copy ".env.example" ".env"
    echo ⚠️  Please edit .env file with your settings before using the tool
)

echo.
echo ✅ Setup complete!
echo.
echo 🚀 Quick start commands:
echo   npm run check              # Check a wallet for delegations
echo   npm run cancel             # Cancel active delegation
echo   npm run dev interactive    # Interactive mode
echo.
echo 📚 For detailed usage, see README.md
echo.
echo 🚨 EMERGENCY: If your wallet is compromised, run:
echo   npm run cancel -- --dry-run    # Test cancellation first
echo   npm run cancel                 # Actually cancel delegation
echo.
pause