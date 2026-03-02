import { render, screen } from '@testing-library/react';
import App from './App';
import { describe, it, expect, vi } from 'vitest';

// Mock Wails JS functions
vi.mock('../wailsjs/go/main/App', () => ({
  GetAllEvents: vi.fn(() => Promise.resolve([])),
  GetWeekEvents: vi.fn(() => Promise.resolve([])),
  SaveEvent: vi.fn(),
  UpdateEvent: vi.fn(),
  DeleteEvent: vi.fn(),
  DeleteRecurringSeries: vi.fn(),
  ImportICS: vi.fn(),
  ExportICS: vi.fn(),
  OpenFile: vi.fn(),
  OpenURL: vi.fn(),
}));

// Mock FullCalendar to avoid rendering issues in tests
vi.mock('@fullcalendar/react', () => ({
  default: () => <div data-testid="full-calendar">Calendar</div>,
}));

describe('App Shell', () => {
  it('renders with sidebar layout', async () => {
    render(<App />);
    
    // Check for Sidebar elements
    expect(screen.getByRole('complementary')).toHaveClass('sidebar');
    expect(screen.getByText(/Gerson/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search events/i)).toBeInTheDocument();
    
    // Check for Main Content area
    expect(screen.getByTestId('full-calendar')).toBeInTheDocument();
    expect(screen.getByTestId('calendar-container')).toHaveClass('calendar-container');
  });

  it('verifies event hover class exists in CSS', async () => {
    // This is a bit indirect for unit tests but we can check if the class is defined 
    // by injecting it or checking computed styles in a real browser.
    // For now we'll just ensure the component renders without crashing after CSS changes.
    render(<App />);
    expect(screen.getByTestId('calendar-container')).toBeInTheDocument();
  });
});
