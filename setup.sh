#!/bin/bash

# Monad Wallet Checker Setup Script
echo "🔧 Setting up Monad Wallet Checker..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2)
REQUIRED_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please upgrade to v18+"
    exit 1
fi

echo "✅ Node.js version: $NODE_VERSION"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Build the project
echo "🔨 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Failed to build project"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your settings before using the tool"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 Quick start commands:"
echo "  npm run check              # Check a wallet for delegations"
echo "  npm run cancel             # Cancel active delegation"
echo "  npm run dev interactive    # Interactive mode"
echo ""
echo "📚 For detailed usage, see README.md"
echo ""
echo "🚨 EMERGENCY: If your wallet is compromised, run:"
echo "  npm run cancel -- --dry-run    # Test cancellation first"
echo "  npm run cancel                 # Actually cancel delegation"