package icsexport

import (
	"os"
	"strings"
	"testing"
	"time"

	"gerson-calendar/database"
)

func TestExportToFile_Comprehensive(t *testing.T) {
	events := []database.Event{
		{
			ID:          1,
			Title:       "Standard Event",
			StartDate:   time.Date(2025, 1, 1, 12, 0, 0, 0, time.UTC),
			EndDate:     time.Date(2025, 1, 1, 13, 0, 0, 0, time.UTC),
			Description: "Desc",
			ZoomLink:    "https://zoom.us/j/1",
		},
		{
			ID:        2,
			Title:     "All Day Event",
			StartDate: time.Date(2025, 1, 2, 0, 0, 0, 0, time.UTC),
			EndDate:   time.Date(2025, 1, 2, 0, 0, 0, 0, time.UTC),
			AllDay:    true,
		},
		{
			ID:                 3,
			Title:              "Recurring Event",
			StartDate:          time.Date(2025, 1, 3, 10, 0, 0, 0, time.UTC),
			EndDate:            time.Date(2025, 1, 3, 11, 0, 0, 0, time.UTC),
			RecurrenceType:     "weekly",
			RecurrenceInterval: 2,
			RecurrenceEnd:      "2025-12-31",
		},
		{
			ID:              4,
			Title:           "Event with Alarm",
			StartDate:       time.Date(2025, 1, 4, 10, 0, 0, 0, time.UTC),
			EndDate:         time.Date(2025, 1, 4, 11, 0, 0, 0, time.UTC),
			ReminderMinutes: 15,
		},
		{
			ID:    1, // Duplicate ID
			Title: "Duplicate",
		},
	}

	filePath, err := ExportToFile(events)
	if err != nil {
		t.Fatalf("ExportToFile failed: %v", err)
	}
	defer os.Remove(filePath)

	content, err := os.ReadFile(filePath)
	if err != nil {
		t.Fatalf("Failed to read exported file: %v", err)
	}

	sContent := string(content)

	checks := []string{
		"SUMMARY:Standard Event",
		"URL:https://zoom.us/j/1",
		"SUMMARY:All Day Event",
		"DTSTART;VALUE=DATE:20250102",
		"SUMMARY:Recurring Event",
		"RRULE:FREQ=WEEKLY;INTERVAL=2;UNTIL=20251231T000000Z",
		"SUMMARY:Event with Alarm",
		"BEGIN:VALARM",
		"TRIGGER:-PT15M",
	}

	for _, check := range checks {
		if !strings.Contains(sContent, check) {
			t.Errorf("Exported content missing %q", check)
		}
	}

	// Count occurrences of VEVENT to check de-duplication
	if strings.Count(sContent, "BEGIN:VEVENT") != 4 {
		t.Errorf("expected 4 VEVENTs, got %d", strings.Count(sContent, "BEGIN:VEVENT"))
	}
}
