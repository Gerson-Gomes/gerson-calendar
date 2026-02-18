#!/bin/bash
set -e

echo "🔨 Building Gerson Calendar..."

cd "$(dirname "$0")"

# Check dependencies
for cmd in go npm; do
    if ! command -v "$cmd" &> /dev/null; then
        echo "Error: $cmd is required but not found"
        exit 1
    fi
done

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Build
if command -v wails &> /dev/null; then
    echo "🚀 Building with Wails..."
    wails build -clean
else
    echo "🔧 Building manually (Wails not found)..."
    cd frontend && npm run build && cd ..
    mkdir -p build/bin
    CGO_ENABLED=1 go build -tags desktop,production -ldflags "-s -w" -o build/bin/gerson-calendar .
fi

echo ""
echo "✅ Build complete!"
echo "   Binary: build/bin/gerson-calendar"
echo ""
echo "To install system-wide:"
echo "   sudo install -Dm755 build/bin/gerson-calendar /usr/bin/gerson-calendar"
echo "   sudo install -Dm644 gerson-calendar.desktop /usr/share/applications/gerson-calendar.desktop"
