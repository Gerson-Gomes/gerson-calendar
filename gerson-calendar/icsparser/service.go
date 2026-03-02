package icsparser

import (
	"fmt"
	"gerson-calendar/database"
)

// ImportICS parses an ICS file and saves the events to the database.
func ImportICS(db *database.DB, filePath string) (int, error) {
	events, err := ParseICSFile(filePath)
	if err != nil {
		return 0, fmt.Errorf("failed to parse ICS file for import: %w", err)
	}

	count := 0
	for _, event := range events {
		_, err := db.SaveEvent(event)
		if err != nil {
			// We could continue or return error. For now, let's return error.
			return count, fmt.Errorf("failed to save imported event: %w", err)
		}
		count++
	}

	return count, nil
}
