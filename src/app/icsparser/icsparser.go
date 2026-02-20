package icsparser

import (
	"bufio"
	"fmt"
	"os"
	"strings"
	"time"

	"gerson-calendar/database"
)

// ParseICSFile reads an ICS file and returns a slice of Events.
func ParseICSFile(filePath string) ([]database.Event, error) {
	f, err := os.Open(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to open ICS file: %w", err)
	}
	defer f.Close()

	var events []database.Event
	var current *database.Event
	var inEvent bool

	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())

		switch {
		case line == "BEGIN:VEVENT":
			inEvent = true
			current = &database.Event{}

		case line == "END:VEVENT":
			if inEvent && current != nil {
				events = append(events, *current)
			}
			inEvent = false
			current = nil

		case inEvent && current != nil:
			key, value := parseICSLine(line)
			switch key {
			case "SUMMARY":
				current.Title = value
			case "DTSTART", "DTSTART;VALUE=DATE":
				if t, err := parseICSDate(value); err == nil {
					current.StartDate = t
				}
			case "DTEND", "DTEND;VALUE=DATE":
				if t, err := parseICSDate(value); err == nil {
					current.EndDate = t
				}
			case "DESCRIPTION":
				current.Description = strings.ReplaceAll(value, "\\n", "\n")
			case "URL":
				if strings.Contains(value, "zoom") {
					current.ZoomLink = value
				}
			case "RRULE":
				parseRRule(value, current)
			}
		}
	}

	if err := scanner.Err(); err != nil {
		return nil, fmt.Errorf("error reading ICS file: %w", err)
	}

	return events, nil
}

func parseICSLine(line string) (string, string) {
	idx := strings.Index(line, ":")
	if idx < 0 {
		return line, ""
	}
	key := line[:idx]
	value := line[idx+1:]

	// Handle properties with parameters like DTSTART;TZID=America/New_York:20250101T120000
	if semicolonIdx := strings.Index(key, ";"); semicolonIdx >= 0 {
		// Keep the full key for specific checks (e.g., DTSTART;VALUE=DATE)
		baseKey := key[:semicolonIdx]
		if baseKey == "DTSTART" || baseKey == "DTEND" {
			return baseKey, value
		}
	}

	return key, value
}

func parseICSDate(value string) (time.Time, error) {
	// Try common ICS date-time formats
	formats := []string{
		"20060102T150405Z", // UTC
		"20060102T150405",  // Local
		"20060102",         // Date only
	}

	for _, format := range formats {
		if t, err := time.Parse(format, value); err == nil {
			return t, nil
		}
	}

	return time.Time{}, fmt.Errorf("unable to parse ICS date: %s", value)
}

func parseRRule(rrule string, event *database.Event) {
	parts := strings.Split(rrule, ";")
	for _, part := range parts {
		kv := strings.SplitN(part, "=", 2)
		if len(kv) != 2 {
			continue
		}
		switch kv[0] {
		case "FREQ":
			switch kv[1] {
			case "DAILY":
				event.RecurrenceType = "daily"
			case "WEEKLY":
				event.RecurrenceType = "weekly"
			case "MONTHLY":
				event.RecurrenceType = "monthly"
			case "YEARLY":
				event.RecurrenceType = "yearly"
			}
		case "INTERVAL":
			if n := parseInt(kv[1]); n > 0 {
				event.RecurrenceInterval = n
			}
		case "UNTIL":
			if t, err := parseICSDate(kv[1]); err == nil {
				event.RecurrenceEnd = t.Format("2006-01-02")
			}
		}
	}
}

func parseInt(s string) int {
	var n int
	for _, c := range s {
		if c >= '0' && c <= '9' {
			n = n*10 + int(c-'0')
		}
	}
	return n
}
