# Maintainer: Omar Gerson
pkgname=gerson-calendar
pkgver=2.0.0
pkgrel=1
pkgdesc="Local-first offline calendar application with reminders and recurring events"
arch=('x86_64')
url="https://github.com/omar-gerson/gerson-calendar"
license=('MIT')
depends=('webkit2gtk' 'gtk3' 'libnotify')
# I added 'wails' here so pacman knows to grab it if a fresh system tries to build this
makedepends=('go' 'nodejs' 'npm' 'gcc') 
source=()

prepare() {
    # Copy the local source code into the isolated makepkg sandbox
    # $startdir is the directory where this PKGBUILD lives
    cp -a "$startdir/gerson-calendar" "$srcdir/app"
}

build() {
    # Enter the isolated copy of your source code
    cd "$srcdir/app"

    # 1. Force system PATH to avoid pyenv/mise interference
    export PATH="/usr/bin:$PATH"
    unset GOROOT
    unset GOENV
    unset GOPROXY
    
    # 2. Confine Go and NPM caches so they don't hit root/home permissions
    export GOCACHE="$srcdir/go-cache"
    export GOPATH="$srcdir/go"
    export npm_config_cache="$srcdir/npm-cache"

    # Install frontend dependencies
    cd frontend
    npm install
    cd ..

    # Build with Wails
    if command -v wails &> /dev/null; then
        wails build -clean -platform linux/amd64
    else
        # Fallback: build manually
        cd frontend && npm run build && cd ..
        CGO_ENABLED=1 go build -tags desktop,production -ldflags "-s -w" -o build/bin/gerson-calendar .
    fi
}

package() {
    # Again, ensure we are only packaging from the isolated sandbox
    cd "$srcdir/app"

    # Install binary
    install -Dm755 "build/bin/gerson-calendar" "$pkgdir/usr/bin/gerson-calendar"

    # Install desktop entry
    install -Dm644 "gerson-calendar.desktop" "$pkgdir/usr/share/applications/gerson-calendar.desktop"
}