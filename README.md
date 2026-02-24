# Gerson Calendar

A **local-first, offline desktop calendar application** built with Wails, Go, React, and SQLite.

![Status](https://img.shields.io/badge/status-production%20ready-brightgreen)
![Platform](https://img.shields.io/badge/platform-Linux-blue)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 🎯 What is This?

A privacy-focused calendar application that runs completely offline on your Linux desktop. All data stays on your machine - no cloud, no sync, no tracking.

### Key Features

✅ **100% Local** - No internet required, zero data transmission
✅ **Event Management** - Create, view, and delete calendar events
✅ **File Attachments** - Attach PDFs and documents to events
✅ **Zoom Integration** - Quick-join Zoom meetings from events
✅ **Native OS Integration** - Uses your default applications to open files
✅ **Month/Week Views** - Flexible calendar display
✅ **Fast & Lightweight** - 11MB binary, <1s startup, ~50MB memory

---

## 🚀 Quick Start

### Run the Application

```bash
cd gerson-calendar
./build/bin/gerson-calendar
```

That's it! The calendar opens in a native window.

### Development Mode

```bash
cd gerson-calendar
wails dev
```

---

## 📦 Installation

### Prerequisites

Already installed:
- ✅ Wails v2.11.0
- ✅ Go v1.25.5
- ✅ npm v11.8.0
- ✅ gcc, gtk3, webkit2gtk

Everything is ready - no setup required!

### Build from Source

```bash
cd gerson-calendar
wails build
```

Output: `build/bin/gerson-calendar`

---

## 📖 Documentation

- **[LAUNCH_GUIDE.md](LAUNCH_GUIDE.md)** - Complete usage guide
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Command cheat sheet
- **[PROJECT_COMPLETE.md](PROJECT_COMPLETE.md)** - Project overview
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Technical details

---

## 🎯 How It Works

```
┌─────────────────────────────┐
│   React Frontend            │  - FullCalendar UI
│   TypeScript                │  - Event forms & modals
└─────────────┬───────────────┘
              │
      Wails Runtime (Type-Safe RPC)
              │
┌─────────────┴───────────────┐
│   Go Backend                │  - SQLite database
│   File Management           │  - File ingestion
└─────────────┬───────────────┘
              │
   ┌──────────┴─────────┐
   │                    │
SQLite DB          File Storage
~/.local/share/local-calendar/
```

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Wails v2 |
| **Backend** | Go 1.25.5, SQLite, go-sqlite3 |
| **Frontend** | React 18, TypeScript, Vite |
| **UI** | FullCalendar v6 |
| **Rendering** | WebKit2GTK (native) |

---

## 🔒 Privacy & Security

✅ **Zero Telemetry** - No tracking, no analytics
✅ **Offline-First** - Works without internet
✅ **Local Storage** - All data in `~/.local/share/local-calendar/`
✅ **No Cloud Sync** - Your data never leaves your machine
✅ **Open Source** - Inspect the code yourself

---

## 📁 Project Structure

```
gerson-calendar/
├── build/bin/gerson-calendar    # Executable (11MB)
├── app.go                       # Wails app logic
├── main.go                      # Entry point
├── database/                    # SQLite operations
├── filemanager/                 # File copy/open
└── frontend/
    ├── src/
    │   ├── App.tsx             # Calendar component
    │   └── components/
    │       └── EventModal.tsx  # Event form
    └── wailsjs/                # Auto-generated bindings
```

---

## 🎯 Usage

### Create an Event
1. Click any date or "Add Event" button
2. Fill in title, dates, description (optional)
3. Add Zoom link (optional)
4. Attach files (optional)
5. Save

### View/Manage Events
- Click event → See details
- Options: Open file, Join Zoom, Delete

### Calendar Views
- **Month View** - Full month grid
- **Week View** - Single week focus

---

## 🛠️ Common Commands

```bash
# Run application
./build/bin/gerson-calendar

# Development mode (hot reload)
wails dev

# Build production binary
wails build

# Check environment
wails doctor

# Install frontend deps
cd frontend && npm install

# Update Go deps
go mod tidy
```

---

## 📊 Performance

- **Binary Size**: 11 MB
- **Startup Time**: <1 second
- **Memory Usage**: ~50-70 MB idle
- **Database**: SQLite (fast, embedded)
- **Supported Events**: Thousands

---

## 🐛 Troubleshooting

### Reset Database
```bash
rm -rf ~/.local/share/local-calendar/
# App recreates on next launch
```

### Clean Build
```bash
rm -rf build/
cd frontend && npm install
cd .. && wails build
```

### Check Environment
```bash
wails doctor
```

---

## 🚢 Distribution

### System Install
```bash
sudo cp build/bin/gerson-calendar /usr/local/bin/
gerson-calendar  # Run from anywhere
```

### Desktop Entry
```bash
cat > ~/.local/share/applications/gerson-calendar.desktop <<EOF
[Desktop Entry]
Name=Gerson Calendar
Exec=/usr/local/bin/gerson-calendar
Icon=calendar
Type=Application
Categories=Office;Calendar;
EOF
```

Search "Gerson Calendar" in your app launcher.

---

## 🎯 Feature Status

| Feature | Status |
|---------|--------|
| Create Events | ✅ |
| Delete Events | ✅ |
| File Attachments | ✅ |
| Zoom Links | ✅ |
| Month/Week Views | ✅ |
| Edit Events | ❌ (planned) |
| Recurring Events | ❌ (planned) |
| Search | ❌ (planned) |
| Export/Import | ❌ (planned) |

---

## 📞 Support

- **Issues**: Open an issue in this repository
- **Documentation**: See `LAUNCH_GUIDE.md`
- **Wails Docs**: https://wails.io/docs
- **FullCalendar Docs**: https://fullcalendar.io/docs

---

## 📝 License

MIT License - see LICENSE file for details

---

## 👤 Author

**Gerson Gomes**
- Email: gersoncastrogomes95@gmail.com

---

## 🙏 Acknowledgments

Built with:
- [Wails](https://wails.io) - Amazing Go + Web framework
- [FullCalendar](https://fullcalendar.io) - Beautiful calendar UI
- [React](https://react.dev) - UI framework
- [SQLite](https://sqlite.org) - Reliable database

---

## ⭐ Show Your Support

If you find this useful, give it a star! ⭐

---

**Ready to start?**

```bash
cd gerson-calendar
./build/bin/gerson-calendar
```

Enjoy your privacy-focused, local-first calendar! 📅
