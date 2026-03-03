import { render, screen } from '@testing-library/react';
import { UpcomingAppointments, WeeklyEvent } from '../components/UpcomingAppointments';
import { EventDetail, EventDetailData } from '../components/EventDetail';
import { describe, it, expect, vi } from 'vitest';

const mockWeeklyEvent: WeeklyEvent = {
  id: 1,
  title: 'Test Appointment',
  startDate: '2026-03-03T14:30:00Z', // 2:30 PM
  endDate: '2026-03-03T15:30:00Z',
  color: '#3b82f6',
  category: 'Work'
};

const mockEventDetail: EventDetailData = {
  id: 1,
  title: 'Detailed Event',
  startDate: '2026-03-03T14:30:00Z',
  endDate: '2026-03-03T15:30:00Z',
  description: 'A test event',
  filePath: '',
  fileName: '',
  zoomLink: '',
  reminderMinutes: 0,
  recurrenceType: 'none',
  recurrenceInterval: 1,
  recurrenceEnd: '',
  recurrenceDays: '',
  category: 'Work',
  color: '#3b82f6',
  allDay: false
};

describe('Time Formatting - 24 Hour Requirement', () => {
  it('UpcomingAppointments displays time in 24h format (14:30)', () => {
    render(<UpcomingAppointments events={[mockWeeklyEvent]} />);
    // This is expected to fail initially if the system locale is 12h
    // or if toLocaleTimeString defaults to 12h.
    // We want to see '14:30' (or '14:30' with some variations like leading zero)
    // but definitely NOT '2:30 PM'.
    const timeElement = screen.getByText(/14:30/);
    expect(timeElement).toBeInTheDocument();
    expect(screen.queryByText(/PM/i)).not.toBeInTheDocument();
  });

  it('EventDetail displays start and end time in 24h format', () => {
    render(
      <EventDetail 
        event={mockEventDetail} 
        onClose={() => {}} 
        onDelete={() => {}} 
        onDeleteSeries={() => {}} 
        onEdit={() => {}} 
        onOpenFile={() => {}} 
        onOpenURL={() => {}} 
      />
    );
    
    // Check for 14:30 and 15:30
    expect(screen.getAllByText(/14:30/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/15:30/)[0]).toBeInTheDocument();
    expect(screen.queryByText(/PM/i)).not.toBeInTheDocument();
  });
});
