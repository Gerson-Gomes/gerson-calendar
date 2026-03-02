import { render, screen } from '@testing-library/react';
import { UpcomingAppointments, WeeklyEvent } from './UpcomingAppointments';
import { describe, it, expect } from 'vitest';

const mockEvents: WeeklyEvent[] = [
  {
    id: 1,
    title: 'Meeting with Omar',
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    color: '#3b82f6',
    category: 'Work'
  },
  {
    id: 2,
    title: 'Lunch Break',
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    color: '#10b981',
    category: 'Personal'
  }
];

describe('UpcomingAppointments', () => {
  it('renders a list of events', () => {
    render(<UpcomingAppointments events={mockEvents} />);
    
    expect(screen.getByText(/Meeting with Omar/i)).toBeInTheDocument();
    expect(screen.getByText(/Lunch Break/i)).toBeInTheDocument();
  });

  it('shows empty state when no events', () => {
    render(<UpcomingAppointments events={[]} />);
    expect(screen.getByText(/No appointments for this week/i)).toBeInTheDocument();
  });
});
