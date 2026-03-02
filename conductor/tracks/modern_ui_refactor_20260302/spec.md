# Specification: Modern UI Refactor & Week Appointments

## Overview
Refactor the Gerson Calendar user interface to align with the "vibrant modern dark mode" design found in `stitch-assets`. This involves a complete visual overhaul, a new navigation layout, and the implementation of an upcoming weekly appointments list.

## Functional Requirements
- **Vibrant Modern Visual Style**: Implement the dark mode aesthetic, including the color palette, typography, and component styling from the reference design.
- **New Navigation Layout**: Replace the current navigation with a new layout (e.g., sidebar) as suggested by the modern UI design.
- **Upcoming Weekly Appointments**: Add a dedicated field or component that lists all scheduled appointments for the current week.
- **Enhanced Interactivity**: Implement modern UI interactions, such as smooth transitions, hover effects, and responsive feedback for interactive elements.
- **Component Refactoring**: Update all core calendar components (Event Creation, Day/Month views, Event Details) to match the new design system.

## Non-Functional Requirements
- **Performance**: Maintain fast startup and smooth UI performance, especially for transitions and data loading.
- **Consistency**: Ensure a cohesive look and feel across all screens and components.
- **Maintainability**: Utilize modular React components and clear CSS styling (Vanilla CSS as per tech stack).

## Acceptance Criteria
- The application UI matches the visual style and layout of the reference image in `stitch-assets`.
- Users can navigate between different calendar views and sections using the new navigation layout.
- The "Upcoming Appointments" list correctly displays all events for the current week, updated dynamically as events are added or changed.
- All existing functionality (event creation, editing, deletion) is fully integrated into the new UI without regressions.

## Out of Scope
- Backend database schema changes (unless strictly necessary for the new appointments list).
- Integration with external calendar services (Google Calendar, etc.).
- Mobile responsiveness (focus remains on Linux desktop).
