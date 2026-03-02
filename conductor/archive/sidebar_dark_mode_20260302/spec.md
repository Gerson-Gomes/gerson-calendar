# Specification: Sidebar and Dark Mode Enhancements

## Overview
This track focuses on improving the user experience of Gerson Calendar by refining the "Upcoming Appointments" sidebar logic and fixing text visibility issues in dark mode, specifically within the task editing interface.

## Functional Requirements
1.  **Sidebar Filtering**:
    -   The "Upcoming Appointments" sidebar list MUST only display events/tasks that are current or upcoming.
    -   A task MUST be removed from this list exactly 60 minutes after its scheduled start time.
    -   This logic applies strictly to the "Upcoming" section of the sidebar.
2.  **Dark Mode Readability**:
    -   Font colors in the "Edit Task" modal/form MUST be updated to ensure high contrast and readability when dark mode is active.
    -   This includes input text, labels, and placeholders within the edit interface.

## Non-Functional Requirements
-   **Performance**: The sidebar filtering logic should be efficient and not cause noticeable lag when the list updates.
-   **Consistency**: UI changes must align with the existing React component structure and Vanilla CSS styling patterns.

## Acceptance Criteria
-   [ ] A task starting at 10:00 AM remains in the sidebar until 11:00 AM, then disappears.
-   [ ] When dark mode is enabled, all text in the task edit form is clearly legible.
-   [ ] The application correctly handles state updates when a task "expires" from the sidebar.

## Out of Scope
-   Configurable thresholds for the sidebar removal logic.
-   Global font color overhaul outside of the "Edit Task" context (unless absolutely necessary for consistency).
