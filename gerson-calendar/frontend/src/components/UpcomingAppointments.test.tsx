import { render, screen, act } from '@testing-library/react';
import { UpcomingAppointments, WeeklyEvent } from './UpcomingAppointments';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockEvents: WeeklyEvent[] = [
  {
    id: 1,
    title: 'Future Event',
    startDate: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    endDate: new Date(Date.now() + 7200000).toISOString(),
    color: '#3b82f6',
    category: 'Work'
  },
  {
    id: 2,
    title: 'Current Event',
    startDate: new Date(Date.now() - 1800000).toISOString(), // 30 mins ago
    endDate: new Date(Date.now() + 1800000).toISOString(),
    color: '#10b981',
    category: 'Personal'
  },
  {
    id: 3,
    title: 'Old Event',
    startDate: new Date(Date.now() - 3660000).toISOString(), // 61 mins ago
    endDate: new Date(Date.now() - 60000).toISOString(),
    color: '#ef4444',
    category: 'Chore'
  }
];

describe('UpcomingAppointments', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders a list of events', () => {
    render(<UpcomingAppointments events={mockEvents} />);
    
    expect(screen.getByText(/Future Event/i)).toBeInTheDocument();
    expect(screen.getByText(/Current Event/i)).toBeInTheDocument();
    expect(screen.queryByText(/Old Event/i)).not.toBeInTheDocument();
  });

  it('removes events automatically after 1 hour', async () => {
    const events: WeeklyEvent[] = [
      {
        id: 4,
        title: 'Expiring Soon',
        startDate: new Date(Date.now() - 3540000).toISOString(), // 59 mins ago
        endDate: new Date(Date.now() + 600000).toISOString(),
        color: '#f59e0b',
        category: 'Work'
      }
    ];

    render(<UpcomingAppointments events={events} />);
    expect(screen.getByText(/Expiring Soon/i)).toBeInTheDocument();

    // Advance time by 2 minutes (it should expire now)
    act(() => {
      vi.advanceTimersByTime(120000);
    });

    expect(screen.queryByText(/Expiring Soon/i)).not.toBeInTheDocument();
  });

  it('shows empty state when no events', () => {
    render(<UpcomingAppointments events={[]} />);
    expect(screen.getByText(/No appointments for this week/i)).toBeInTheDocument();
  });
});
