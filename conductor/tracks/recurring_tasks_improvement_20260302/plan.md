# Implementation Plan: Recurring Tasks Improvement

This plan outlines the steps for enhancing recurring task support, including specific days for weekly recurrence and fixing calendar visibility.

## Phase 1: Database and Backend Core [checkpoint: b370ba3]
- [x] Task: **Database: Add recurrence_days column** 5741cef
    - [ ] Add `recurrence_days` column to the `events` table in `database.go`.
    - [ ] Update `Event` struct and `scanEvent` to handle the new column.
    - [ ] Update `SaveEvent` and `UpdateEvent` to include the new column.
- [x] Task: **TDD: Update expandRecurring for Multiple Days and End Date** 5741cef
    - [ ] Write unit tests for `expandRecurring` in `database_test.go` covering daily/weekly recurrence with end dates and specific days.
    - [ ] Implement support for `recurrence_days` for weekly recurrence in `expandRecurring`.
    - [ ] Ensure `expandRecurring` respects `recurrence_end` strictly.
- [x] Task: **Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)** b370ba3

## Phase 2: Frontend Implementation
- [ ] Task: **UI: Update EventModal for Recurring Days**
    - [ ] Add checkboxes for days of the week in `EventModal.tsx` when "Weekly" is selected.
    - [ ] Update state and form submission to send `recurrence_days` to the backend.
    - [ ] Ensure `editEvent` correctly populates the days of the week checkboxes.
- [ ] Task: **Bug Fix: Calendar Visibility (FullCalendar IDs)**
    - [ ] Update `App.tsx` `calendarEvents` mapping to generate unique IDs for virtual instances (e.g., `id: "${event.id}-${event.startDate}"`).
    - [ ] Verify that all instances now appear on the main calendar.
- [ ] Task: **Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)**

## Phase 3: Final Verification and Cleanup
- [ ] Task: **Integration: End-to-End Verification**
    - [ ] Manually verify creating, editing, and deleting recurring tasks with specific days and end dates.
    - [ ] Confirm no regressions in existing task management features.
- [ ] Task: **Documentation: Update Tech Stack/Product Guide (if needed)**
- [ ] Task: **Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)**
