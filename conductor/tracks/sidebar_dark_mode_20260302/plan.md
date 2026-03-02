# Implementation Plan: Sidebar & Dark Mode Enhancements

## Phase 1: Sidebar Filtering Logic

- [x] Task: Sidebar Logic Analysis 503e905
    - [x] Identify the sidebar's component responsible for rendering "Upcoming Appointments."
    - [x] Locate the logic where appointments are fetched or filtered.
- [x] Task: TDD - Sidebar Filtering (React/TypeScript) 53029cb
    - [x] **Write Tests**: Create a unit test for the `UpcomingAppointments` component (or its filtering hook) using Vitest.
    - [x] **Red Phase**: Define tests for:
        - [x] Current/Future appointments are displayed.
        - [x] Appointments starting > 60 minutes ago are excluded.
    - [x] **Green Phase**: Implement the filtering logic using a `setInterval` or a timer-based check to ensure the list updates dynamically.
    - [x] **Refactor**: Optimize the filter and ensure it doesn't cause unnecessary re-renders.
- [ ] Task: Conductor - User Manual Verification 'Sidebar Filtering' (Protocol in workflow.md)

## Phase 2: Dark Mode Readability Fixes

- [x] Task: Dark Mode CSS Analysis 503e905
    - [x] Identify the CSS classes used for the Edit Task modal/form in dark mode.
    - [x] Pinpoint the specific elements (labels, input fields) with low contrast.
- [ ] Task: TDD - CSS/Readability (Visual/Code)
    - [ ] **Write Tests**: Since this is visual, create or update a snapshot/visual regression test if available, or a unit test to verify the correct CSS classes are applied in dark mode.
    - [ ] **Red Phase**: Confirm that dark mode classes result in the problematic font colors.
    - [ ] **Green Phase**: Update Vanilla CSS to provide high-contrast font colors (e.g., `#FFFFFF` or a light gray for text on dark backgrounds) within the Edit Task context.
    - [ ] **Refactor**: Consolidate these style fixes into the main dark mode stylesheet or component-specific CSS.
- [ ] Task: Conductor - User Manual Verification 'Dark Mode Readability' (Protocol in workflow.md)

## Phase 3: Final Integration & Review

- [ ] Task: Final Quality Gate Check
    - [ ] Verify both sidebar filtering and dark mode readability in a unified build.
    - [ ] Ensure no regressions in the task editing flow.
- [ ] Task: Conductor - User Manual Verification 'Final Integration' (Protocol in workflow.md)
