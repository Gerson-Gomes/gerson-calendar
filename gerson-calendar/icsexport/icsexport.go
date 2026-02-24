package icsexport

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"gerson-calendar/database"
)

func escapeICS(s string) string {
	s = strings.ReplaceAll(s, "\\", "\\\\")
	s = strings.ReplaceAll(s, ";", "\\;")
	s = strings.ReplaceAll(s, ",", "\\,")
	s = strings.ReplaceAll(s, "\n", "\\n")
	s = strings.ReplaceAll(s, "\r", "")
	return s
}

func buildRRule(event database.Event) string {
	recType := strings.ToUpper(event.RecurrenceType)
	if recType == "" || recType == "NONE" {
		return ""
	}
	rrule := fmt.Sprintf("FREQ=%s", recType)
	if event.RecurrenceInterval > 1 {
		rrule += fmt.Sprintf(";INTERVAL=%d", event.RecurrenceInterval)
	}
	if event.RecurrenceEnd != "" {
		if t, err := time.Parse("2006-01-02", event.RecurrenceEnd); err == nil {
			rrule += fmt.Sprintf(";UNTIL=%s", t.UTC().Format("20060102T000000Z"))
		}
	}
	return rrule
}

func buildContent(events []database.Event) string {
	var sb strings.Builder
	sb.WriteString("BEGIN:VCALENDAR\r\n")
	sb.WriteString("VERSION:2.0\r\n")
	sb.WriteString("PRODID:-//Gerson Calendar//EN\r\n")
	sb.WriteString("CALSCALE:GREGORIAN\r\n")

	// De-duplicate: only export base events (not virtual recurring instances)
	seen := map[int]bool{}
	for _, event := range events {
		if seen[event.ID] {
			continue
		}
		seen[event.ID] = true

		sb.WriteString("BEGIN:VEVENT\r\n")
		sb.WriteString(fmt.Sprintf("UID:%d@gerson-calendar\r\n", event.ID))

		if event.AllDay {
			sb.WriteString(fmt.Sprintf("DTSTART;VALUE=DATE:%s\r\n", event.StartDate.Format("20060102")))
			sb.WriteString(fmt.Sprintf("DTEND;VALUE=DATE:%s\r\n", event.EndDate.AddDate(0, 0, 1).Format("20060102")))
		} else {
			sb.WriteString(fmt.Sprintf("DTSTART:%s\r\n", event.StartDate.UTC().Format("20060102T150405Z")))
			sb.WriteString(fmt.Sprintf("DTEND:%s\r\n", event.EndDate.UTC().Format("20060102T150405Z")))
		}

		sb.WriteString(fmt.Sprintf("SUMMARY:%s\r\n", escapeICS(event.Title)))

		if event.Description != "" {
			sb.WriteString(fmt.Sprintf("DESCRIPTION:%s\r\n", escapeICS(event.Description)))
		}
		if event.ZoomLink != "" {
			sb.WriteString(fmt.Sprintf("URL:%s\r\n", event.ZoomLink))
		}
		if event.Category != "" && event.Category != "default" {
			sb.WriteString(fmt.Sprintf("CATEGORIES:%s\r\n", escapeICS(event.Category)))
		}

		if event.ReminderMinutes > 0 {
			sb.WriteString("BEGIN:VALARM\r\n")
			sb.WriteString(fmt.Sprintf("TRIGGER:-PT%dM\r\n", event.ReminderMinutes))
			sb.WriteString("ACTION:DISPLAY\r\n")
			sb.WriteString("DESCRIPTION:Reminder\r\n")
			sb.WriteString("END:VALARM\r\n")
		}

		if rrule := buildRRule(event); rrule != "" {
			sb.WriteString(fmt.Sprintf("RRULE:%s\r\n", rrule))
		}

		dtstamp := event.CreatedAt
		if dtstamp.IsZero() {
			dtstamp = time.Now()
		}
		sb.WriteString(fmt.Sprintf("DTSTAMP:%s\r\n", dtstamp.UTC().Format("20060102T150405Z")))
		sb.WriteString("END:VEVENT\r\n")
	}

	sb.WriteString("END:VCALENDAR\r\n")
	return sb.String()
}

// ExportToFile writes a .ics file to the OS temp directory and returns its path.
func ExportToFile(events []database.Event) (string, error) {
	content := buildContent(events)

	tmpDir := os.TempDir()
	filename := fmt.Sprintf("gerson-calendar-export-%s.ics", time.Now().Format("2006-01-02"))
	filePath := filepath.Join(tmpDir, filename)

	if err := os.WriteFile(filePath, []byte(content), 0644); err != nil {
		return "", fmt.Errorf("failed to write ICS export: %w", err)
	}

	return filePath, nil
}
