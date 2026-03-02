# UI Refactor Analysis & Component Mapping

## Current State
- **Layout**: Top-down flex layout with a `calendar-header` and a `calendar-container`.
- **Navigation**: All actions (Add Event, Search, Theme Toggle, Import/Export) are located in the top header.
- **Main View**: FullCalendar `dayGridMonth` occupies the entire container.
- **Theme**: Basic CSS variables for light/dark modes.

## Target State (Modern UI)
- **Layout**: Sidebar-based layout (Flex-row: Sidebar + Main Content).
- **Navigation**: Move primary navigation and actions to the Sidebar.
- **New Component**: `UpcomingAppointments` list to be integrated into the sidebar or a dedicated panel.
- **Visual Style**: "Vibrant" aesthetic with deep dark backgrounds, glowing accents, and modern typography.
- **Interactivity**: Smooth transitions and hover effects on all interactive elements.

## Component Mapping & Changes

| Component | Current Role | Future Role | Key Changes |
|-----------|--------------|-------------|-------------|
| `App.tsx` | Main shell & header | Main layout shell (Sidebar + Content) | Change layout to flex-row; Integrate `Sidebar`. |
| `App.css` | Global styles & variables | Theme foundation | Update CSS variables to "vibrant" palette. |
| `Sidebar` | N/A | Primary navigation & info | **New Component**: Houses Search, Actions, and `UpcomingAppointments`. |
| `UpcomingAppointments` | N/A | Weekly summary | **New Component**: Lists events for the current week. |
| `FullCalendar` | Main calendar grid | Refined calendar grid | Update styles for a more modern, integrated look. |
| `EventModal` | Event creation/edit | Modernized modal | Update styling and animations. |
| `EventDetail` | Event details | Modernized side panel/modal | Update styling and transitions. |

## New Feature: Upcoming Weekly Appointments
- **Logic**: Needs a new Go backend function to fetch events for the next 7 days.
- **UI**: A scrolling list of cards showing event title, time, and category color.
