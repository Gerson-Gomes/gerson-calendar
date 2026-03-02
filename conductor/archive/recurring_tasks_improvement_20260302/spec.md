# Specification: Recurring Tasks Improvement and Fix

## Overview
This track aims to enhance the recurring task system in Gerson Calendar by adding support for specific days in weekly recurrence and fixing a bug where recurring tasks do not appear in the main calendar view. It also ensures that recurrence end dates are strictly honored.

## Functional Requirements

### 1. Advanced Weekly Recurrence
- **Requirement:** Users must be able to select specific days of the week (e.g., Monday, Wednesday, Friday) for an event to repeat.
- **UI Change:** In `EventModal.tsx`, when "Weekly" is selected as the repeat type, a set of checkboxes for all 7 days of the week must be displayed.
- **Storage:** A new column `recurrence_days` will be added to the `events` table to store a comma-separated list of day indices (0=Sunday to 6=Saturday).

### 2. Recurrence End Date Support
- **Requirement:** Recurring events must stop appearing in the calendar after the specified `recurrenceEnd` date.
- **Logic Change:** The `expandRecurring` function in the backend must be updated to strictly stop generating instances once the `recurrenceEnd` is reached.

### 3. Fix Calendar Visibility (Bug Fix)
- **Requirement:** All instances of a recurring event must be visible in the main calendar (FullCalendar).
- **Bug Root Cause:** FullCalendar likely ignores multiple events with the same `id`.
- **Fix:** Ensure each virtual instance of a recurring event has a unique identifier for the frontend (e.g., `id: "{base_id}-{timestamp}"`).

### 4. Expansion Horizon
- **Requirement:** Recurring events should be expanded up to 1 year into the future by default, or until their `recurrenceEnd`.

## Non-Functional Requirements
- **Performance:** The `expandRecurring` function should remain efficient even with many recurring events.
- **Data Integrity:** Database migrations must be handled gracefully.

## Acceptance Criteria
- [ ] User can create an event that repeats every Tuesday and Thursday.
- [ ] The event appears on all designated Tuesdays and Thursdays in both the sidebar and the main calendar.
- [ ] Changing the recurrence to end on a specific date causes all instances after that date to disappear.
- [ ] Editing the "All Instances" of a recurring series correctly updates all visible instances.
- [ ] Existing events remain unaffected by the database schema change.

## Out of Scope
- Complex recurrence rules like "last Friday of the month" or "every first Monday".
- Handling "Exceptional" instances (editing only one instance in a series) - the user specifically requested "All Instances" for now.
