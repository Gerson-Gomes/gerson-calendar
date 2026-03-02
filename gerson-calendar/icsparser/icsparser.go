package icsparser

import (
	"fmt"
	"os"
	"strings"
	"time"

	"gerson-calendar/database"
	"github.com/arran4/golang-ical"
)

// ParseICSFile reads an ICS file and returns a slice of Events.
func ParseICSFile(filePath string) ([]database.Event, error) {
	f, err := os.Open(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to open ICS file: %w", err)
	}
	defer f.Close()

	cal, err := ics.ParseCalendar(f)
	if err != nil {
		return nil, fmt.Errorf("failed to parse ICS calendar: %w", err)
	}

	var events []database.Event

	for _, vEvent := range cal.Events() {
		event := database.Event{}

		if prop := vEvent.GetProperty(ics.ComponentPropertySummary); prop != nil {
			event.Title = prop.Value
		}

		if prop := vEvent.GetProperty(ics.ComponentPropertyDescription); prop != nil {
			event.Description = strings.ReplaceAll(prop.Value, "\\n", "\n")
		}

		if prop := vEvent.GetProperty(ics.ComponentPropertyDtStart); prop != nil {
			if t, err := parseICSDate(prop.Value); err == nil {
				event.StartDate = t
			}
		}

		if prop := vEvent.GetProperty(ics.ComponentPropertyDtEnd); prop != nil {
			if t, err := parseICSDate(prop.Value); err == nil {
				event.EndDate = t
			}
		}

		if prop := vEvent.GetProperty(ics.ComponentPropertyUrl); prop != nil {
			if strings.Contains(prop.Value, "zoom") {
				event.ZoomLink = prop.Value
			}
		}

		if prop := vEvent.GetProperty(ics.ComponentPropertyRrule); prop != nil {
			parseRRule(prop.Value, &event)
		}

		events = append(events, event)
	}

	return events, nil
}

func parseICSDate(value string) (time.Time, error) {
	// Try common ICS date-time formats
	formats := []string{
		"20060102T150405Z", // UTC
		"20060102T150405",  // Local
		"20060102",         // Date only
	}

	// Clean up value (e.g., remove parameters if they leaked in)
	if idx := strings.Index(value, ":"); idx >= 0 {
		value = value[idx+1:]
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
			var n int
			fmt.Sscanf(kv[1], "%d", &n)
			if n > 0 {
				event.RecurrenceInterval = n
			}
		case "UNTIL":
			if t, err := parseICSDate(kv[1]); err == nil {
				event.RecurrenceEnd = t.Format("2006-01-02")
			}
		}
	}
}
