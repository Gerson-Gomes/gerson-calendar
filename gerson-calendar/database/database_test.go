package database

import (
	"os"
	"path/filepath"
	"testing"
	"time"
)

func TestGetWeekEvents(t *testing.T) {
	dbPath := filepath.Join(t.TempDir(), "test.db")
	db, err := InitializeTestDB(dbPath)
	if err != nil {
		t.Fatalf("Failed to initialize test DB: %v", err)
	}
	defer db.Close()
	defer os.Remove(dbPath)

	now := time.Now()
	// Create an event for today
	event1 := Event{
		Title:     "Today Event",
		StartDate: now,
		EndDate:   now.Add(time.Hour),
	}
	if _, err := db.SaveEvent(event1); err != nil {
		t.Fatalf("Failed to save event1: %v", err)
	}

	// Create an event for 8 days from now (outside the week)
	event2 := Event{
		Title:     "Future Event",
		StartDate: now.AddDate(0, 0, 8),
		EndDate:   now.AddDate(0, 0, 8).Add(time.Hour),
	}
	if _, err := db.SaveEvent(event2); err != nil {
		t.Fatalf("Failed to save event2: %v", err)
	}

	// Create a weekly recurring event starting yesterday
	event3 := Event{
		Title:              "Recurring Weekly",
		StartDate:          now.AddDate(0, 0, -1),
		EndDate:            now.AddDate(0, 0, -1).Add(time.Hour),
		RecurrenceType:     "weekly",
		RecurrenceInterval: 1,
	}
	if _, err := db.SaveEvent(event3); err != nil {
		t.Fatalf("Failed to save event3: %v", err)
	}

	events, err := db.GetWeekEvents()
	if err != nil {
		t.Fatalf("GetWeekEvents failed: %v", err)
	}

	// Should have: Today Event, Recurring Weekly (original), and possibly another instance if it falls in the week
	// Actually, recurring expansion in GetAllEvents handles 1 year ahead.
	// Let's check for at least 2 events (event1 and event3)
	if len(events) < 2 {
		t.Errorf("Expected at least 2 events, got %d", len(events))
	}

	foundToday := false
	foundRecurring := false
	for _, e := range events {
		if e.Title == "Today Event" {
			foundToday = true
		}
		if e.Title == "Recurring Weekly" {
			foundRecurring = true
		}
		if e.Title == "Future Event" {
			t.Errorf("Future Event should not be in weekly view")
		}
	}

	if !foundToday {
		t.Error("Today Event not found in week events")
	}
	if !foundRecurring {
		t.Error("Recurring Weekly not found in week events")
	}
}

func TestExpandRecurring(t *testing.T) {
	// Mock data
	start := time.Date(2024, 3, 1, 10, 0, 0, 0, time.UTC) // Friday
	duration := time.Hour

	tests := []struct {
		name          string
		event         Event
		expectedCount int
		expectedDates []time.Time
	}{
		{
			name: "Daily Recurrence 3 times",
			event: Event{
				Title:              "Daily",
				StartDate:          start,
				EndDate:            start.Add(duration),
				RecurrenceType:     "daily",
				RecurrenceInterval: 1,
				RecurrenceEnd:      "2024-03-03",
			},
			expectedCount: 3, // Mar 1, 2, 3
			expectedDates: []time.Time{
				start,
				start.AddDate(0, 0, 1),
				start.AddDate(0, 0, 2),
			},
		},
		{
			name: "Weekly Recurrence Specific Days (Tue, Thu)",
			event: Event{
				Title:              "Weekly Tue-Thu",
				StartDate:          start, // Mar 1 (Fri) - base should be included but not match days
				EndDate:            start.Add(duration),
				RecurrenceType:     "weekly",
				RecurrenceInterval: 1,
				RecurrenceDays:     "2,4",        // Tue, Thu
				RecurrenceEnd:      "2024-03-10", // Should get Mar 1 (base), Mar 5 (Tue), Mar 7 (Thu)
			},
			expectedCount: 3,
			expectedDates: []time.Time{
				start,
				time.Date(2024, 3, 5, 10, 0, 0, 0, time.UTC),
				time.Date(2024, 3, 7, 10, 0, 0, 0, time.UTC),
			},
		},
		{
			name: "Weekly Recurrence Stops exactly on End Date",
			event: Event{
				Title:              "End Date Check",
				StartDate:          start, // Mar 1 (Fri)
				EndDate:            start.Add(duration),
				RecurrenceType:     "weekly",
				RecurrenceInterval: 1,
				RecurrenceEnd:      "2024-03-08", // Next Friday
			},
			expectedCount: 2, // Mar 1, Mar 8
			expectedDates: []time.Time{
				start,
				start.AddDate(0, 0, 7),
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			events := []Event{tt.event}
			expanded := expandRecurring(events)

			if len(expanded) != tt.expectedCount {
				t.Errorf("Expected %d instances, got %d", tt.expectedCount, len(expanded))
			}

			for i, expectedDate := range tt.expectedDates {
				if i < len(expanded) && !expanded[i].StartDate.Equal(expectedDate) {
					t.Errorf("Instance %d: expected date %v, got %v", i, expectedDate, expanded[i].StartDate)
				}
			}
		})
	}
}
