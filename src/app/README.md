# Gerson Calendar

A **local-first, offline desktop calendar application** built with Wails v2, Go, and React.

## Features

- 📅 **Full Calendar Interface** - Month and week views powered by FullCalendar
- 💾 **Local SQLite Database** - All data stored locally at `~/.local/share/local-calendar/`
- 📎 **File Attachments** - Attach PDFs, documents, and other files to events
- 🔗 **Zoom Integration** - Add Zoom links that open in your default browser
- 🖥️ **Native OS Integration** - File picker dialogs and default app launching
- ⚡ **Offline-First** - Works completely without internet connectivity
- 🎯 **Type-Safe** - TypeScript frontend with auto-generated Go bindings

## Quick Start

### Prerequisites
- Go 1.23+
- Node.js and npm
- Wails v2 CLI: `go install github.com/wailsapp/wails/v2/cmd/wails@latest`
- SQLite3 development libraries
- GCC/build tools (for CGO)

### Installation

```bash
# Install backend dependencies
go mod download

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Development

```bash
# Run in development mode with hot reload
wails dev
```

### Build

```bash
# Build production binary
wails build
```

The built application will be in `build/bin/gerson-calendar`.

## Usage

1. **Add Events**: Click any date or use the "Add Event" button
2. **Attach Files**: Use the native file picker to attach documents
3. **Add Zoom Links**: Paste Zoom meeting URLs for quick access
4. **View Events**: Click on any event to view details, open files, or join Zoom calls
5. **Delete Events**: Select an event and choose the delete option

## Architecture

### Backend (Go)
- **SQLite Database**: Persistent event storage with indexed queries
- **File Manager**: Copies attached files to managed directory for link integrity
- **Native Integration**: OS-specific commands for file and URL opening

### Frontend (React + TypeScript)
- **FullCalendar**: Professional calendar grid with interaction
- **Wails Runtime**: Native dialogs and type-safe backend communication
- **Responsive Design**: Clean, modern UI optimized for desktop

## Data Storage

- **Database**: `~/.local/share/local-calendar/calendar.db`
- **Attached Files**: `~/.local/share/local-calendar/files/`

Files are automatically copied and renamed with timestamps to prevent conflicts and ensure integrity.

## Detailed Documentation

See [BUILD_INSTRUCTIONS.md](./BUILD_INSTRUCTIONS.md) for:
- Detailed build requirements
- Troubleshooting guide
- Project structure
- API reference

## Tech Stack

- **Backend**: Go, SQLite (via go-sqlite3)
- **Frontend**: React 18, TypeScript, FullCalendar
- **Framework**: Wails v2
- **Build**: Vite

## License

Built with Wails v2 - A framework for building desktop applications using Go and web technologies.
