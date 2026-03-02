# Technology Stack

This document outlines the core technologies used in Gerson Calendar.

## Language
- **Go**: Used for the backend logic, file system operations, and SQLite database interaction.
- **TypeScript**: Used for all frontend development to ensure type safety and developer productivity.

## Frontend
- **React**: The primary framework for building the user interface.
- **Vanilla CSS**: Used for styling to ensure maximum flexibility and performance.

## Desktop Framework
- **Wails**: A modern framework for building native desktop applications using Go and web technologies.

## Database
- **SQLite**: A lightweight, file-based database used for persistent local storage of calendar events and data.

## External Libraries
- **github.com/arran4/golang-ical**: A robust iCalendar library for Go, used for parsing and generating ICS data.

## Build & Distribution
- **Wails CLI**: Used for development, testing, and building the final application binary.
- **Custom Scripts**: `build.sh` and `verify.sh` for project-specific automation.
