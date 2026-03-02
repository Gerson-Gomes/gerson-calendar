package database

import (
	"database/sql"
	"fmt"
	_ "github.com/mattn/go-sqlite3"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

type Event struct {
	ID                 int       `json:"id"`
	Title              string    `json:"title"`
	StartDate          time.Time `json:"startDate"`
	EndDate            time.Time `json:"endDate"`
	Description        string    `json:"description"`
	FilePath           string    `json:"filePath"`
	FileName           string    `json:"fileName"`
	ZoomLink           string    `json:"zoomLink"`
	ReminderMinutes    int       `json:"reminderMinutes"`
	RecurrenceType     string    `json:"recurrenceType"`
	RecurrenceInterval int       `json:"recurrenceInterval"`
	RecurrenceEnd      string    `json:"recurrenceEnd"`
	RecurrenceDays     string    `json:"recurrenceDays"`
	Category           string    `json:"category"`

	Color     string    `json:"color"`
	AllDay    bool      `json:"allDay"`
	CreatedAt time.Time `json:"createdAt"`
}

type DB struct {
	conn *sql.DB
}

func getDataDir() (string, error) {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}
	dataDir := filepath.Join(homeDir, ".local", "share", "local-calendar")
	return dataDir, nil
}

func Initialize() (*DB, error) {
	dataDir, err := getDataDir()
	if err != nil {
		return nil, fmt.Errorf("failed to get data directory: %w", err)
	}

	if err := os.MkdirAll(dataDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create data directory: %w", err)
	}

	dbPath := filepath.Join(dataDir, "calendar.db")
	return InitializeDB(dbPath)
}

func InitializeTestDB(dbPath string) (*DB, error) {
	return InitializeDB(dbPath)
}

func InitializeDB(dbPath string) (*DB, error) {
	conn, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	db := &DB{conn: conn}
	if err := db.createTables(); err != nil {
		conn.Close()
		return nil, err
	}

	return db, nil
}

func (db *DB) createTables() error {
	schema := `
	CREATE TABLE IF NOT EXISTS events (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		title TEXT NOT NULL,
		start_date DATETIME NOT NULL,
		end_date DATETIME NOT NULL,
		description TEXT,
		file_path TEXT,
		file_name TEXT,
		zoom_link TEXT,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);
	CREATE INDEX IF NOT EXISTS idx_start_date ON events(start_date);
	`

	_, err := db.conn.Exec(schema)
	if err != nil {
		return fmt.Errorf("failed to create tables: %w", err)
	}

	// Auto-migrate: add new columns if missing (errors ignored for existing columns)
	db.conn.Exec(`ALTER TABLE events ADD COLUMN reminder_minutes INTEGER DEFAULT 0`)
	db.conn.Exec(`ALTER TABLE events ADD COLUMN recurrence_type TEXT DEFAULT 'none'`)
	db.conn.Exec(`ALTER TABLE events ADD COLUMN recurrence_interval INTEGER DEFAULT 1`)
	db.conn.Exec(`ALTER TABLE events ADD COLUMN recurrence_end TEXT DEFAULT ''`)
	db.conn.Exec(`ALTER TABLE events ADD COLUMN recurrence_days TEXT DEFAULT ''`)
	db.conn.Exec(`ALTER TABLE events ADD COLUMN category TEXT DEFAULT 'default'`)

	db.conn.Exec(`ALTER TABLE events ADD COLUMN color TEXT DEFAULT '#3b82f6'`)
	db.conn.Exec(`ALTER TABLE events ADD COLUMN all_day INTEGER DEFAULT 0`)

	return nil
}

func (db *DB) SaveEvent(event Event) (int64, error) {
	allDayInt := 0
	if event.AllDay {
		allDayInt = 1
	}

	query := `
	        INSERT INTO events (title, start_date, end_date, description, file_path, file_name, zoom_link, reminder_minutes, recurrence_type, recurrence_interval, recurrence_end, recurrence_days, category, color, all_day)
	        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`

	result, err := db.conn.Exec(
		query,
		event.Title,
		event.StartDate,
		event.EndDate,
		event.Description,
		event.FilePath,
		event.FileName,
		event.ZoomLink,
		event.ReminderMinutes,
		event.RecurrenceType,
		event.RecurrenceInterval,
		event.RecurrenceEnd,
		event.RecurrenceDays,
		event.Category,
		event.Color,
		allDayInt,
	)
	if err != nil {
		return 0, fmt.Errorf("failed to insert event: %w", err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		return 0, fmt.Errorf("failed to get last insert id: %w", err)
	}

	return id, nil
}

func scanEvent(rows *sql.Rows) (Event, error) {
	var event Event
	var allDayInt int
	err := rows.Scan(
		&event.ID,
		&event.Title,
		&event.StartDate,
		&event.EndDate,
		&event.Description,
		&event.FilePath,
		&event.FileName,
		&event.ZoomLink,
		&event.ReminderMinutes,
		&event.RecurrenceType,
		&event.RecurrenceInterval,
		&event.RecurrenceEnd,
		&event.RecurrenceDays,
		&event.Category,
		&event.Color,
		&allDayInt,
		&event.CreatedAt,
	)
	event.AllDay = allDayInt != 0
	return event, err
}

const eventColumns = `id, title, start_date, end_date, description, file_path, file_name, zoom_link, reminder_minutes, recurrence_type, recurrence_interval, recurrence_end, recurrence_days, category, color, all_day, created_at`

func (db *DB) GetEvents(startDate, endDate time.Time) ([]Event, error) {
	query := `SELECT ` + eventColumns + ` FROM events WHERE start_date >= ? AND end_date <= ? ORDER BY start_date ASC`

	rows, err := db.conn.Query(query, startDate, endDate)
	if err != nil {
		return nil, fmt.Errorf("failed to query events: %w", err)
	}
	defer rows.Close()

	var events []Event
	for rows.Next() {
		event, err := scanEvent(rows)
		if err != nil {
			return nil, fmt.Errorf("failed to scan event: %w", err)
		}
		events = append(events, event)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating events: %w", err)
	}

	return events, nil
}

func (db *DB) GetAllEvents() ([]Event, error) {
	query := `SELECT ` + eventColumns + ` FROM events ORDER BY start_date ASC`

	rows, err := db.conn.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to query events: %w", err)
	}
	defer rows.Close()

	var dbEvents []Event
	for rows.Next() {
		event, err := scanEvent(rows)
		if err != nil {
			return nil, fmt.Errorf("failed to scan event: %w", err)
		}
		dbEvents = append(dbEvents, event)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating events: %w", err)
	}

	// Expand recurring events into virtual instances
	return expandRecurring(dbEvents), nil
}

func (db *DB) SearchEvents(query string) ([]Event, error) {
	pattern := "%" + query + "%"
	q := `SELECT ` + eventColumns + ` FROM events WHERE title LIKE ? OR description LIKE ? ORDER BY start_date ASC`

	rows, err := db.conn.Query(q, pattern, pattern)
	if err != nil {
		return nil, fmt.Errorf("failed to search events: %w", err)
	}
	defer rows.Close()

	var events []Event
	for rows.Next() {
		event, err := scanEvent(rows)
		if err != nil {
			return nil, fmt.Errorf("failed to scan event: %w", err)
		}
		events = append(events, event)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating events: %w", err)
	}

	return events, nil
}

// expandRecurring generates virtual instances for recurring events up to 1 year ahead.
func expandRecurring(events []Event) []Event {
	horizon := time.Now().AddDate(1, 0, 0)
	var result []Event

	for _, event := range events {
		// Always include the original
		result = append(result, event)

		if event.RecurrenceType == "" || event.RecurrenceType == "none" {
			continue
		}

		interval := event.RecurrenceInterval
		if interval < 1 {
			interval = 1
		}

		// Parse optional recurrence end date
		var recEnd time.Time
		if event.RecurrenceEnd != "" {
			if parsed, err := time.Parse("2006-01-02", event.RecurrenceEnd); err == nil {
				// Make it inclusive of the whole day (end of day)
				recEnd = time.Date(parsed.Year(), parsed.Month(), parsed.Day(), 23, 59, 59, 0, event.StartDate.Location())
			}
		}

		duration := event.EndDate.Sub(event.StartDate)

		// For weekly specific days
		weeklyDays := make(map[int]bool)
		if event.RecurrenceType == "weekly" && event.RecurrenceDays != "" {
			parts := strings.Split(event.RecurrenceDays, ",")
			for _, p := range parts {
				if d, err := strconv.Atoi(strings.TrimSpace(p)); err == nil {
					weeklyDays[d] = true
				}
			}
		}

		// Expansion limit: 1 year or 365 instances
		switch event.RecurrenceType {
		case "daily":
			for i := 1; i < 366; i++ {
				newStart := event.StartDate.AddDate(0, 0, i*interval)
				if shouldStop(newStart, horizon, recEnd) {
					break
				}
				result = append(result, createVirtualInstance(event, newStart, duration))
			}
		case "weekly":
			if len(weeklyDays) > 0 {
				// For specific days, we iterate day-by-day up to the horizon
				current := event.StartDate
				count := 0
				for current.Before(horizon) && count < 366 {
					current = current.AddDate(0, 0, 1)
					if !recEnd.IsZero() && current.After(recEnd) {
					        break
					}

					if weeklyDays[int(current.Weekday())] {

						// Simple interval check:
						weeksBetween := int(current.Sub(event.StartDate).Hours() / (24 * 7))
						if weeksBetween%interval == 0 {
							result = append(result, createVirtualInstance(event, current, duration))
							count++
						}
					}
				}
			} else {
				// Standard weekly (same day as start)
				for i := 1; i < 53; i++ {
					newStart := event.StartDate.AddDate(0, 0, i*interval*7)
					if shouldStop(newStart, horizon, recEnd) {
						break
					}
					result = append(result, createVirtualInstance(event, newStart, duration))
				}
			}
		case "monthly":
			for i := 1; i < 13; i++ {
				newStart := event.StartDate.AddDate(0, i*interval, 0)
				if shouldStop(newStart, horizon, recEnd) {
					break
				}
				result = append(result, createVirtualInstance(event, newStart, duration))
			}
		case "yearly":
			for i := 1; i < 5; i++ {
				newStart := event.StartDate.AddDate(i*interval, 0, 0)
				if shouldStop(newStart, horizon, recEnd) {
					break
				}
				result = append(result, createVirtualInstance(event, newStart, duration))
			}
		}
	}

	return result
}

func shouldStop(current, horizon, recEnd time.Time) bool {
	if current.After(horizon) {
		return true
	}
	if !recEnd.IsZero() && current.After(recEnd) {
		return true
	}
	return false
}

func createVirtualInstance(base Event, newStart time.Time, duration time.Duration) Event {
	virtual := base
	virtual.StartDate = newStart
	virtual.EndDate = newStart.Add(duration)
	return virtual
}
func (db *DB) UpdateEvent(id int, event Event) error {
	allDayInt := 0
	if event.AllDay {
		allDayInt = 1
	}

	query := `
	        UPDATE events
	        SET title = ?, start_date = ?, end_date = ?, description = ?,
	            file_path = ?, file_name = ?, zoom_link = ?, reminder_minutes = ?,
	            recurrence_type = ?, recurrence_interval = ?, recurrence_end = ?,
	            recurrence_days = ?, category = ?, color = ?, all_day = ?
	        WHERE id = ?
	`

	_, err := db.conn.Exec(
		query,
		event.Title,
		event.StartDate,
		event.EndDate,
		event.Description,
		event.FilePath,
		event.FileName,
		event.ZoomLink,
		event.ReminderMinutes,
		event.RecurrenceType,
		event.RecurrenceInterval,
		event.RecurrenceEnd,
		event.RecurrenceDays,
		event.Category,
		event.Color,
		allDayInt,
		id,
	)

	if err != nil {
		return fmt.Errorf("failed to update event: %w", err)
	}
	return nil
}

func (db *DB) DeleteRecurringSeries(id int) error {
	return db.DeleteEvent(id)
}

func (db *DB) DeleteEvent(id int) error {
	query := `DELETE FROM events WHERE id = ?`
	_, err := db.conn.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to delete event: %w", err)
	}
	return nil
}

func (db *DB) GetUpcomingReminders(withinMinutes int) ([]Event, error) {
	now := time.Now()
	horizon := now.Add(time.Duration(withinMinutes) * time.Minute)

	query := `
	        SELECT ` + eventColumns + `
	        FROM events
	        WHERE reminder_minutes > 0
	        AND start_date > ?
	        AND start_date <= ?
	        ORDER BY start_date ASC
	`

	rows, err := db.conn.Query(query, now, horizon)
	if err != nil {
		return nil, fmt.Errorf("failed to query upcoming reminders: %w", err)
	}
	defer rows.Close()

	var events []Event
	for rows.Next() {
		event, err := scanEvent(rows)
		if err != nil {
			return nil, fmt.Errorf("failed to scan reminder event: %w", err)
		}
		events = append(events, event)
	}
	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating reminder events: %w", err)
	}

	return events, nil
}

func (db *DB) GetWeekEvents() ([]Event, error) {
	// Fetch all events to account for expanded recurring ones
	allEvents, err := db.GetAllEvents()
	if err != nil {
		return nil, err
	}

	now := time.Now()
	// Find the start of the current week (Sunday)
	offset := int(now.Weekday())
	startOfWeek := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location()).AddDate(0, 0, -offset)
	endOfWeek := startOfWeek.AddDate(0, 0, 7).Add(-time.Second)

	var weekEvents []Event
	for _, e := range allEvents {
		// Include event if it overlaps with the current week range
		if (e.StartDate.After(startOfWeek) || e.StartDate.Equal(startOfWeek)) && (e.StartDate.Before(endOfWeek) || e.StartDate.Equal(endOfWeek)) {
			weekEvents = append(weekEvents, e)
		} else if (e.EndDate.After(startOfWeek) || e.EndDate.Equal(startOfWeek)) && (e.EndDate.Before(endOfWeek) || e.EndDate.Equal(endOfWeek)) {
			weekEvents = append(weekEvents, e)
		}
	}

	return weekEvents, nil
}

func (db *DB) Close() error {
	return db.conn.Close()
}

func GetFilesDir() (string, error) {
	dataDir, err := getDataDir()
	if err != nil {
		return "", err
	}
	filesDir := filepath.Join(dataDir, "files")
	if err := os.MkdirAll(filesDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create files directory: %w", err)
	}
	return filesDir, nil
}
