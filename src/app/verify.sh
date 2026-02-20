#!/bin/bash

set -e

echo "🔍 Verifying Gerson Calendar Build Environment..."
echo ""

# Check Go
echo "✅ Checking Go installation..."
if ! command -v go &> /dev/null; then
    echo "❌ Go is not installed. Please install Go 1.23 or later."
    exit 1
fi
echo "   Go version: $(go version)"

# Check Node
echo "✅ Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js and npm."
    exit 1
fi
echo "   Node version: $(node --version)"

# Check npm
echo "✅ Checking npm installation..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi
echo "   npm version: $(npm --version)"

# Check Wails
echo "✅ Checking Wails installation..."
if ! command -v wails &> /dev/null; then
    echo "⚠️  Wails is not installed. Install with:"
    echo "   go install github.com/wailsapp/wails/v2/cmd/wails@latest"
    exit 1
fi
echo "   Wails version: $(wails version)"

# Check GCC (for CGO)
echo "✅ Checking GCC installation..."
if ! command -v gcc &> /dev/null; then
    echo "❌ GCC is not installed. CGO requires a C compiler."
    echo "   On Ubuntu/Debian: sudo apt-get install build-essential"
    echo "   On Arch: sudo pacman -S base-devel"
    exit 1
fi
echo "   GCC version: $(gcc --version | head -n1)"

# Check SQLite3 headers
echo "✅ Checking SQLite3 development libraries..."
if ! ldconfig -p | grep -q libsqlite3; then
    echo "⚠️  SQLite3 development libraries may not be installed."
    echo "   On Ubuntu/Debian: sudo apt-get install libsqlite3-dev"
    echo "   On Arch: sudo pacman -S sqlite"
fi

# Verify project structure
echo "✅ Verifying project structure..."
required_files=(
    "app.go"
    "main.go"
    "database/database.go"
    "filemanager/filemanager.go"
    "frontend/src/App.tsx"
    "frontend/src/components/EventModal.tsx"
    "go.mod"
    "wails.json"
    "frontend/package.json"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Missing required file: $file"
        exit 1
    fi
done
echo "   All required files present"

# Check Go dependencies
echo "✅ Checking Go modules..."
if ! go mod verify; then
    echo "⚠️  Go module verification failed. Run 'go mod tidy'"
fi

echo ""
echo "✅ All checks passed! You can now:"
echo "   1. Install dependencies: cd frontend && npm install && cd .."
echo "   2. Run development: wails dev"
echo "   3. Build production: wails build"
echo ""
