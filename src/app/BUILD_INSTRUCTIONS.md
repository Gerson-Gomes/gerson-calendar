# Gerson Calendar - Build Instructions

## Prerequisites

1. **Go** (1.23 or later)
   ```bash
   go version
   ```

2. **Node.js** and **npm** (for frontend dependencies)
   ```bash
   node --version
   npm --version
   ```

3. **Wails v2**
   ```bash
   go install github.com/wailsapp/wails/v2/cmd/wails@latest
   ```

4. **SQLite3 development libraries** (required for go-sqlite3)
   - On Linux: `sudo apt-get install libsqlite3-dev` (Debian/Ubuntu) or `sudo pacman -S sqlite` (Arch)
   - On macOS: Usually pre-installed, or `brew install sqlite3`

5. **Build tools**
   - On Linux: `sudo apt-get install build-essential` or equivalent
   - GCC compiler is required for CGO (used by go-sqlite3)

## Installation Steps

### 1. Install Go Dependencies

```bash
cd gerson-calendar
go mod download
go mod tidy
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### 3. Build the Application

#### Development Mode (with hot reload)
```bash
wails dev
```

#### Production Build
```bash
wails build
```

The built application will be in the `build/bin/` directory.

## Running the Application

### Development Mode
```bash
wails dev
```

### Production Binary
```bash
./build/bin/gerson-calendar
```

## Application Features

### Core Functionality
- ✅ Local-first calendar with SQLite database
- ✅ Persistent storage at `~/.local/share/local-calendar/`
- ✅ Add events with title, date range, description
- ✅ File attachment system (PDFs, documents)
- ✅ Zoom link integration
- ✅ Native file picker dialog
- ✅ Open files with OS default viewer
- ✅ Open Zoom links in default browser
- ✅ Month and week calendar views
- ✅ Delete events

### Data Storage
- **Database**: `~/.local/share/local-calendar/calendar.db`
- **Attached Files**: `~/.local/share/local-calendar/files/`

Files are automatically copied to the managed directory to ensure link integrity.

## Troubleshooting

### Build Errors

1. **CGO_ENABLED error**
   - Ensure GCC is installed
   - On Linux: `sudo apt-get install build-essential`

2. **SQLite3 library not found**
   - Install SQLite development headers
   - On Ubuntu/Debian: `sudo apt-get install libsqlite3-dev`
   - On Arch: `sudo pacman -S sqlite`

3. **Frontend build errors**
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   cd ..
   wails build
   ```

4. **Wails bindings out of sync**
   ```bash
   wails generate module
   wails dev
   ```

### Runtime Errors

1. **Database initialization failed**
   - Check write permissions for `~/.local/share/local-calendar/`
   - The app will auto-create the directory if it doesn't exist

2. **File picker not working**
   - Ensure xdg-utils is installed on Linux
   - `sudo apt-get install xdg-utils`

3. **Files won't open**
   - Ensure xdg-open is available
   - Check file associations for the file type

## Development Notes

### Project Structure
```
gerson-calendar/
├── app.go                 # Main application logic
├── main.go               # Application entry point
├── database/
│   └── database.go       # SQLite database layer
├── filemanager/
│   └── filemanager.go    # File ingestion and operations
└── frontend/
    ├── src/
    │   ├── App.tsx       # Main calendar UI
    │   ├── App.css       # Styling
    │   └── components/
    │       ├── EventModal.tsx  # Event creation modal
    │       └── EventModal.css
    └── wailsjs/          # Auto-generated bindings
```

### Wails Bindings

When you modify Go methods exposed to the frontend, regenerate bindings:
```bash
wails generate module
```

### Backend API Methods

The following methods are exposed to the frontend:

- `SaveEvent(EventInput) (int64, error)` - Save a new event
- `GetAllEvents() ([]Event, error)` - Retrieve all events
- `DeleteEvent(int) error` - Delete an event by ID
- `OpenFile(string) error` - Open file with OS default app
- `OpenURL(string) error` - Open URL in default browser
- `SelectFile() (string, error)` - Show native file picker

### Frontend Stack

- **React 18** with TypeScript
- **FullCalendar** for calendar grid
- **Wails Runtime** for native dialogs and backend communication

## License

This is a local-first, offline desktop application built with Wails v2.
