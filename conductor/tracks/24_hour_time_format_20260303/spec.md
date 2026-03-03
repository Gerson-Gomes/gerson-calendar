# Specification: 24-Hour Time Format

## Overview
This track aims to update the Gerson Calendar application to use a 24-hour time format globally across all user interface components. This change will replace the current 12-hour (AM/PM) representation with a standard 24-hour format (e.g., `HH:mm`).

## Functional Requirements
- **Global Display Update:** All timestamps and time-related information in the application (calendar views, sidebar lists, event summaries, etc.) must be displayed using the 24-hour format.
- **24-Hour Time Picker:** The event creation and editing forms must be updated to use a 24-hour time picker for both start and end times.
- **Consistent Representation:** Ensure that all parts of the UI, including date headers, week view, and event detail views, consistently use the 24-hour format.
- **FullCalendar Integration:** Configure the `@fullcalendar/react` component to display times in 24-hour format in all its views (dayGrid, timeGrid, etc.).

## Non-Functional Requirements
- **No User Configuration:** The change will be hardcoded as the new application default; no user setting for switching between 12-hour and 24-hour formats is required.
- **Explicit Application Control:** The application will explicitly use the 24-hour format regardless of the user's operating system or browser locale settings.
- **Performance:** Ensure that the formatting logic does not introduce any noticeable performance overhead.

## Acceptance Criteria
- [ ] All displayed times in the application follow the `HH:mm` format (e.g., `13:45` instead of `1:45 PM`).
- [ ] The time picker in the event creation/edit form allows selecting hours from `00` to `23`.
- [ ] FullCalendar views (month, week, day) correctly display 24-hour time labels and event times.
- [ ] Sidebar components (upcoming appointments, search results) use the 24-hour format for all listed events.

## Out of Scope
- **Time Format Toggle:** A setting to switch back to 12-hour (AM/PM) format is not part of this track.
- **System-Based Locale Detection:** Automatically adjusting the time format based on system settings is explicitly excluded.
