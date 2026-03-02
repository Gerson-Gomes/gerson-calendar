# Implementation Plan: Modern UI Refactor & Week Appointments

## Phase 1: Foundation & Theme Setup [checkpoint: ca7df7b]
- [x] Task: Analyze current UI structure and `stitch-assets` image to map component changes. af346f8
- [x] Task: Define the new global CSS variables (colors, spacing, typography) in `index.css` or a dedicated theme file. 995382f
- [x] Task: Conductor - User Manual Verification 'Foundation & Theme Setup' (Protocol in workflow.md) ca7df7b

## Phase 2: Core Layout Refactor (TDD)
- [x] Task: Implement the new Sidebar Navigation layout. 573a6d9
    - [x] Write failing tests for the new Sidebar component structure and navigation links.
    - [x] Implement the Sidebar component with modern styling and responsive behavior.
    - [x] Verify tests pass and integrate with Wails runtime for navigation.
- [x] Task: Refactor the Main Application Shell to support the sidebar and content area. ff83a78
    - [x] Write failing tests for the updated layout grid/flex structure.
    - [x] Implement the new shell layout, ensuring smooth transitions between views.
    - [x] Verify tests pass.
- [~] Task: Conductor - User Manual Verification 'Core Layout Refactor' (Protocol in workflow.md)

## Phase 3: Weekly Appointments Feature (TDD)
- [ ] Task: Implement backend logic for fetching the current week's appointments.
    - [ ] Write failing Go tests in `database/database_test.go` (or similar) for a "GetWeekEvents" function.
    - [ ] Implement the Go function to query SQLite for events within the current 7-day range.
    - [ ] Verify Go tests pass.
- [ ] Task: Create the "Upcoming Appointments" frontend component.
    - [ ] Write failing React tests for the `UpcomingAppointments` component.
    - [ ] Implement the component to display the list of events, styled according to the modern design.
    - [ ] Verify React tests pass.
- [ ] Task: Conductor - User Manual Verification 'Weekly Appointments Feature' (Protocol in workflow.md)

## Phase 4: Visual Polish & Component Updates (TDD)
- [ ] Task: Refactor the Calendar Month/Day views to match the new aesthetic.
    - [ ] Write failing tests for updated view components.
    - [ ] Apply modern styling, vibrant accents, and improved typography to the calendar grid.
    - [ ] Verify tests pass.
- [ ] Task: Refactor Event Creation and Edit Modals.
    - [ ] Write failing tests for the new modal design.
    - [ ] Update the UI of modals to be consistent with the modern dark mode theme.
    - [ ] Verify tests pass.
- [ ] Task: Implement Interactive Elements (Animations & Transitions).
    - [ ] Write failing tests for interaction states (e.g., hover effects, list transitions).
    - [ ] Add Vanilla CSS animations and transitions for a "vibrant" feel.
    - [ ] Verify tests pass.
- [ ] Task: Conductor - User Manual Verification 'Visual Polish & Component Updates' (Protocol in workflow.md)

## Phase 5: Final Integration & Verification
- [ ] Task: Perform full application regression testing to ensure no existing functionality is broken.
- [ ] Task: Conduct a final visual review against the `stitch-assets` image.
- [ ] Task: Conductor - User Manual Verification 'Final Integration & Verification' (Protocol in workflow.md)
