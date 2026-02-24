package main

import (
	"context"
	"fmt"
	"os/exec"
	"runtime"
	"time"

	"gerson-calendar/database"
	"gerson-calendar/filemanager"
	"gerson-calendar/icsexport"
	"gerson-calendar/icsparser"
	"gerson-calendar/notifier"

	wailsRuntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx      context.Context
	db       *database.DB
	notifier *notifier.Notifier
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	db, err := database.Initialize()
	if err != nil {
		wailsRuntime.LogErrorf(ctx, "Failed to initialize database: %v", err)
		return
	}
	a.db = db

	// Start the notification daemon
	a.notifier = notifier.New(db)
	a.notifier.Start(ctx)
}

func (a *App) shutdown(ctx context.Context) {
	if a.db != nil {
		a.db.Close()
	}
}

type EventInput struct {
	Title              string `json:"title"`
	StartDate          string `json:"startDate"`
	EndDate            string `json:"endDate"`
	Description        string `json:"description"`
	FilePath           string `json:"filePath"`
	ZoomLink           string `json:"zoomLink"`
	ReminderMinutes    int    `json:"reminderMinutes"`
	RecurrenceType     string `json:"recurrenceType"`
	RecurrenceInterval int    `json:"recurrenceInterval"`
	RecurrenceEnd      string `json:"recurrenceEnd"`
	Category           string `json:"category"`
	Color              string `json:"color"`
	AllDay             bool   `json:"allDay"`
}

func parseEventDates(startStr, endStr string) (time.Time, time.Time, error) {
	startDate, err := time.Parse(time.RFC3339, startStr)
	if err != nil {
		return time.Time{}, time.Time{}, fmt.Errorf("invalid start date: %w", err)
	}
	endDate, err := time.Parse(time.RFC3339, endStr)
	if err != nil {
		return time.Time{}, time.Time{}, fmt.Errorf("invalid end date: %w", err)
	}
	return startDate, endDate, nil
}

func (a *App) SaveEvent(input EventInput) (int64, error) {
	startDate, endDate, err := parseEventDates(input.StartDate, input.EndDate)
	if err != nil {
		return 0, err
	}

	category := input.Category
	if category == "" {
		category = "default"
	}
	color := input.Color
	if color == "" {
		color = "#3b82f6"
	}

	event := database.Event{
		Title:              input.Title,
		StartDate:          startDate,
		EndDate:            endDate,
		Description:        input.Description,
		ZoomLink:           input.ZoomLink,
		ReminderMinutes:    input.ReminderMinutes,
		RecurrenceType:     input.RecurrenceType,
		RecurrenceInterval: input.RecurrenceInterval,
		RecurrenceEnd:      input.RecurrenceEnd,
		Category:           category,
		Color:              color,
		AllDay:             input.AllDay,
	}

	if input.FilePath != "" {
		fileInfo, err := filemanager.CopyFileToStorage(input.FilePath)
		if err != nil {
			return 0, fmt.Errorf("failed to copy file: %w", err)
		}
		event.FilePath = fileInfo.StoredPath
		event.FileName = fileInfo.FileName
	}

	id, err := a.db.SaveEvent(event)
	if err != nil {
		return 0, fmt.Errorf("failed to save event: %w", err)
	}

	return id, nil
}

func (a *App) GetAllEvents() ([]database.Event, error) {
	events, err := a.db.GetAllEvents()
	if err != nil {
		return nil, fmt.Errorf("failed to get events: %w", err)
	}
	return events, nil
}

func (a *App) DeleteEvent(id int) error {
	return a.db.DeleteEvent(id)
}

func (a *App) UpdateEvent(id int, input EventInput) error {
	startDate, endDate, err := parseEventDates(input.StartDate, input.EndDate)
	if err != nil {
		return err
	}

	category := input.Category
	if category == "" {
		category = "default"
	}
	color := input.Color
	if color == "" {
		color = "#3b82f6"
	}

	event := database.Event{
		Title:              input.Title,
		StartDate:          startDate,
		EndDate:            endDate,
		Description:        input.Description,
		ZoomLink:           input.ZoomLink,
		ReminderMinutes:    input.ReminderMinutes,
		RecurrenceType:     input.RecurrenceType,
		RecurrenceInterval: input.RecurrenceInterval,
		RecurrenceEnd:      input.RecurrenceEnd,
		Category:           category,
		Color:              color,
		AllDay:             input.AllDay,
	}

	if input.FilePath != "" {
		fileInfo, err := filemanager.CopyFileToStorage(input.FilePath)
		if err != nil {
			return fmt.Errorf("failed to copy file: %w", err)
		}
		event.FilePath = fileInfo.StoredPath
		event.FileName = fileInfo.FileName
	}

	return a.db.UpdateEvent(id, event)
}

func (a *App) DeleteRecurringSeries(id int) error {
	return a.db.DeleteRecurringSeries(id)
}

func (a *App) ImportICS() (int, error) {
	filePath, err := wailsRuntime.OpenFileDialog(a.ctx, wailsRuntime.OpenDialogOptions{
		Title: "Import ICS Calendar File",
		Filters: []wailsRuntime.FileFilter{
			{
				DisplayName: "ICS Files",
				Pattern:     "*.ics",
			},
		},
	})

	if err != nil {
		return 0, fmt.Errorf("failed to open file dialog: %w", err)
	}

	if filePath == "" {
		return 0, nil
	}

	events, err := icsparser.ParseICSFile(filePath)
	if err != nil {
		return 0, fmt.Errorf("failed to parse ICS file: %w", err)
	}

	imported := 0
	for _, event := range events {
		if _, err := a.db.SaveEvent(event); err != nil {
			continue
		}
		imported++
	}

	return imported, nil
}

func (a *App) ExportICS() (string, error) {
	events, err := a.db.GetAllEvents()
	if err != nil {
		return "", fmt.Errorf("failed to get events: %w", err)
	}

	filePath, err := icsexport.ExportToFile(events)
	if err != nil {
		return "", err
	}

	return filePath, nil
}

func (a *App) OpenFile(filePath string) error {
	return filemanager.OpenFileWithDefaultApp(filePath)
}

func (a *App) OpenURL(url string) error {
	var cmd *exec.Cmd

	switch runtime.GOOS {
	case "linux":
		cmd = exec.Command("xdg-open", url)
	case "darwin":
		cmd = exec.Command("open", url)
	case "windows":
		cmd = exec.Command("cmd", "/c", "start", url)
	default:
		return fmt.Errorf("unsupported platform")
	}

	return cmd.Start()
}

func (a *App) SelectFile() (string, error) {
	filePath, err := wailsRuntime.OpenFileDialog(a.ctx, wailsRuntime.OpenDialogOptions{
		Title: "Select File to Attach",
		Filters: []wailsRuntime.FileFilter{
			{
				DisplayName: "All Files",
				Pattern:     "*.*",
			},
			{
				DisplayName: "PDF Files",
				Pattern:     "*.pdf",
			},
			{
				DisplayName: "Documents",
				Pattern:     "*.doc;*.docx;*.txt",
			},
		},
	})

	if err != nil {
		return "", err
	}

	return filePath, nil
}
