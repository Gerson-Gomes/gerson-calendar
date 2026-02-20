package notifier

import (
	"context"
	"fmt"
	"os/exec"
	"sync"
	"time"

	"gerson-calendar/database"
)

// Notifier checks for upcoming events and fires desktop notifications.
type Notifier struct {
	db          *database.DB
	notifiedIDs map[int]bool
	mu          sync.Mutex
}

// New creates a new Notifier.
func New(db *database.DB) *Notifier {
	return &Notifier{
		db:          db,
		notifiedIDs: make(map[int]bool),
	}
}

// Start begins a background goroutine that checks every 60 seconds for
// events that should trigger a reminder notification.
func (n *Notifier) Start(ctx context.Context) {
	go func() {
		ticker := time.NewTicker(60 * time.Second)
		defer ticker.Stop()

		// Do an immediate check on startup
		n.check()

		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				n.check()
			}
		}
	}()
}

func (n *Notifier) check() {
	// Look 1440 minutes (24h) ahead — covers the largest reminder option (1 day)
	events, err := n.db.GetUpcomingReminders(1440)
	if err != nil {
		return
	}

	now := time.Now()

	for _, event := range events {
		n.mu.Lock()
		alreadySent := n.notifiedIDs[event.ID]
		n.mu.Unlock()

		if alreadySent {
			continue
		}

		// Fire notification if we're within the reminder window
		triggerTime := event.StartDate.Add(-time.Duration(event.ReminderMinutes) * time.Minute)
		if now.After(triggerTime) || now.Equal(triggerTime) {
			n.sendNotification(event)
			n.mu.Lock()
			n.notifiedIDs[event.ID] = true
			n.mu.Unlock()
		}
	}

	// Cleanup old IDs (events that already started) to avoid unbounded memory growth
	n.mu.Lock()
	for id := range n.notifiedIDs {
		// We keep IDs around during the session; they're small and
		// the app restarts fresh each session anyway.
		_ = id
	}
	n.mu.Unlock()
}

func (n *Notifier) sendNotification(event database.Event) {
	title := fmt.Sprintf("📅 %s", event.Title)

	minutesUntil := int(time.Until(event.StartDate).Minutes())
	var body string
	if minutesUntil <= 0 {
		body = "Starting now!"
	} else if minutesUntil < 60 {
		body = fmt.Sprintf("Starting in %d minutes", minutesUntil)
	} else {
		hours := minutesUntil / 60
		mins := minutesUntil % 60
		if mins > 0 {
			body = fmt.Sprintf("Starting in %dh %dm", hours, mins)
		} else {
			body = fmt.Sprintf("Starting in %d hour(s)", hours)
		}
	}

	cmd := exec.Command("notify-send",
		"--app-name=Gerson Calendar",
		"--urgency=normal",
		"--icon=calendar",
		title,
		body,
	)
	cmd.Start()
}
