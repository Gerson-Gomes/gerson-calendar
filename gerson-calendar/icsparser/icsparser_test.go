package icsparser

import (
	"os"
	"testing"
)

func TestParseICSFile_FoldedLines(t *testing.T) {
	content := `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:This is a very long summary that should be fold
 ed across multiple lines.
DTSTART:20250101T120000Z
DTEND:20250101T130000Z
END:VEVENT
END:VCALENDAR`

	tmpfile, err := os.CreateTemp("", "test_folded.ics")
	if err != nil {
		t.Fatal(err)
	}
	defer os.Remove(tmpfile.Name())

	if _, err := tmpfile.Write([]byte(content)); err != nil {
		t.Fatal(err)
	}
	if err := tmpfile.Close(); err != nil {
		t.Fatal(err)
	}

	events, err := ParseICSFile(tmpfile.Name())
	if err != nil {
		t.Fatalf("ParseICSFile failed: %v", err)
	}

	if len(events) != 1 {
		t.Fatalf("expected 1 event, got %d", len(events))
	}

	expectedSummary := "This is a very long summary that should be folded across multiple lines."
	if events[0].Title != expectedSummary {
		t.Errorf("expected summary %q, got %q", expectedSummary, events[0].Title)
	}
}

func TestParseICSFile_Complex(t *testing.T) {
	content := `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:Test Event
DESCRIPTION:Line 1\nLine 2
DTSTART:20250101T120000Z
DTEND:20250101T130000Z
URL:https://zoom.us/j/123456789
RRULE:FREQ=WEEKLY;INTERVAL=2;UNTIL=20251231
END:VEVENT
END:VCALENDAR`

	tmpfile, err := os.CreateTemp("", "test_complex.ics")
	if err != nil {
		t.Fatal(err)
	}
	defer os.Remove(tmpfile.Name())

	if _, err := tmpfile.Write([]byte(content)); err != nil {
		t.Fatal(err)
	}
	if err := tmpfile.Close(); err != nil {
		t.Fatal(err)
	}

	events, err := ParseICSFile(tmpfile.Name())
	if err != nil {
		t.Fatalf("ParseICSFile failed: %v", err)
	}

	if len(events) != 1 {
		t.Fatalf("expected 1 event, got %d", len(events))
	}

	event := events[0]
	if event.Title != "Test Event" {
		t.Errorf("expected title %q, got %q", "Test Event", event.Title)
	}
	if event.Description != "Line 1\nLine 2" {
		t.Errorf("expected description %q, got %q", "Line 1\nLine 2", event.Description)
	}
	if event.ZoomLink != "https://zoom.us/j/123456789" {
		t.Errorf("expected zoom link %q, got %q", "https://zoom.us/j/123456789", event.ZoomLink)
	}
	if event.RecurrenceType != "weekly" {
		t.Errorf("expected recurrence type %q, got %q", "weekly", event.RecurrenceType)
	}
	if event.RecurrenceInterval != 2 {
		t.Errorf("expected recurrence interval %d, got %d", 2, event.RecurrenceInterval)
	}
	if event.RecurrenceEnd != "2025-12-31" {
		t.Errorf("expected recurrence end %q, got %q", "2025-12-31", event.RecurrenceEnd)
	}
}

func TestParseICSFile_DateOnly(t *testing.T) {
	content := `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:All Day Event
DTSTART;VALUE=DATE:20250101
DTEND;VALUE=DATE:20250102
END:VEVENT
END:VCALENDAR`

	tmpfile, err := os.CreateTemp("", "test_dateonly.ics")
	if err != nil {
		t.Fatal(err)
	}
	defer os.Remove(tmpfile.Name())

	if _, err := tmpfile.Write([]byte(content)); err != nil {
		t.Fatal(err)
	}
	if err := tmpfile.Close(); err != nil {
		t.Fatal(err)
	}

	events, err := ParseICSFile(tmpfile.Name())
	if err != nil {
		t.Fatalf("ParseICSFile failed: %v", err)
	}

	if len(events) != 1 {
		t.Fatalf("expected 1 event, got %d", len(events))
	}

	event := events[0]
	if event.StartDate.Format("2006-01-02") != "2025-01-01" {
		t.Errorf("expected start date %q, got %q", "2025-01-01", event.StartDate.Format("2006-01-02"))
	}
}

func TestParseICSFile_InvalidFile(t *testing.T) {
	_, err := ParseICSFile("non_existent_file.ics")
	if err == nil {
		t.Error("expected error for non-existent file, got nil")
	}
}

func TestParseICSFile_MalformedICS(t *testing.T) {
	content := `NOT AN ICS FILE`
	tmpfile, err := os.CreateTemp("", "test_malformed.ics")
	if err != nil {
		t.Fatal(err)
	}
	defer os.Remove(tmpfile.Name())
	tmpfile.Write([]byte(content))
	tmpfile.Close()

	_, err = ParseICSFile(tmpfile.Name())
	if err == nil {
		t.Error("expected error for malformed ICS, got nil")
	}
}
