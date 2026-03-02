package icsparser

import (
	"os"
	"testing"
	"time"

	"gerson-calendar/database"
)

func TestImportICS(t *testing.T) {
	// Setup a temporary database
	dbPath := "test_import.db"
	defer os.Remove(dbPath)

	db, err := database.InitializeTestDB(dbPath)
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()

	content := `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:Import Test Event
DTSTART:20250101T120000Z
DTEND:20250101T130000Z
END:VEVENT
END:VCALENDAR`

	tmpfile, err := os.CreateTemp("", "test_import.ics")
	if err != nil {
		t.Fatal(err)
	}
	defer os.Remove(tmpfile.Name())
	tmpfile.Write([]byte(content))
	tmpfile.Close()

	count, err := ImportICS(db, tmpfile.Name())
	if err != nil {
		t.Fatalf("ImportICS failed: %v", err)
	}

	if count != 1 {
		t.Errorf("expected 1 imported event, got %d", count)
	}

	events, err := db.GetEvents(time.Date(2025, 1, 1, 0, 0, 0, 0, time.UTC), time.Date(2025, 1, 2, 0, 0, 0, 0, time.UTC))
	if err != nil {
		t.Fatal(err)
	}

	if len(events) != 1 {
		t.Fatalf("expected 1 event in DB, got %d", len(events))
	}

	if events[0].Title != "Import Test Event" {
		t.Errorf("expected title %q, got %q", "Import Test Event", events[0].Title)
	}
}
