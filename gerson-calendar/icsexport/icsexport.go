package icsexport

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"gerson-calendar/database"
	"github.com/arran4/golang-ical"
)

// BuildICSContent generates the ICS content as a string.
func BuildICSContent(events []database.Event) (string, error) {
	cal := ics.NewCalendar()
	cal.SetMethod(ics.MethodRequest)
	cal.SetProductId("-//Gerson Calendar//EN")

	seen := map[int]bool{}
	for _, event := range events {
		if seen[event.ID] {
			continue
		}
		seen[event.ID] = true

		vEvent := cal.AddEvent(fmt.Sprintf("%d@gerson-calendar", event.ID))
		vEvent.SetSummary(event.Title)
		vEvent.SetDescription(event.Description)

		if event.AllDay {
			vEvent.SetProperty(ics.ComponentPropertyDtStart, event.StartDate.Format("20060102"), ics.WithValue(string(ics.ValueDataTypeDate)))
			vEvent.SetProperty(ics.ComponentPropertyDtEnd, event.EndDate.AddDate(0, 0, 1).Format("20060102"), ics.WithValue(string(ics.ValueDataTypeDate)))
		} else {
			vEvent.SetStartAt(event.StartDate)
			vEvent.SetEndAt(event.EndDate)
		}

		if event.ZoomLink != "" {
			vEvent.SetURL(event.ZoomLink)
		}

		if event.Category != "" && event.Category != "default" {
			vEvent.SetProperty(ics.ComponentPropertyCategories, event.Category)
		}

		if event.RecurrenceType != "" && event.RecurrenceType != "none" {
			rrule := buildRRule(event)
			if rrule != "" {
				vEvent.SetProperty(ics.ComponentPropertyRrule, rrule)
			}
		}

		if event.ReminderMinutes > 0 {
			alarm := vEvent.AddAlarm()
			alarm.SetAction(ics.ActionDisplay)
			alarm.SetTrigger(fmt.Sprintf("-PT%dM", event.ReminderMinutes))
			alarm.SetDescription("Reminder")
		}

		dtstamp := event.CreatedAt
		if dtstamp.IsZero() {
			dtstamp = time.Now()
		}
		vEvent.SetDtStampTime(dtstamp)
	}

	return cal.Serialize(), nil
}

// ExportToFile writes a .ics file to the OS temp directory and returns its path.
func ExportToFile(events []database.Event) (string, error) {
	content, err := BuildICSContent(events)
	if err != nil {
		return "", err
	}

	tmpDir := os.TempDir()
	filename := fmt.Sprintf("gerson-calendar-export-%s.ics", time.Now().Format("2006-01-02"))
	filePath := filepath.Join(tmpDir, filename)

	if err := os.WriteFile(filePath, []byte(content), 0644); err != nil {
		return "", fmt.Errorf("failed to write ICS export: %w", err)
	}

	return filePath, nil
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
