import { render, screen } from '@testing-library/react';
import { UpcomingAppointments, WeeklyEvent } from '../components/UpcomingAppointments';
import { EventDetail, EventDetailData } from '../components/EventDetail';
import { describe, it, expect, vi } from 'vitest';

// Use fixed dates that result in predictable local times or use a helper to get local 24h string
const getLocal24h = (iso: string) => {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
};

const mockWeeklyEvent: WeeklyEvent = {
  id: 1,
  title: 'Test Appointment',
  startDate: '2026-03-03T14:30:00Z',
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
  it('UpcomingAppointments displays time in 24h format', () => {
    render(<UpcomingAppointments events={[mockWeeklyEvent]} />);
    const expectedTime = getLocal24h(mockWeeklyEvent.startDate);
    const timeElement = screen.getByText(new RegExp(expectedTime));
    expect(timeElement).toBeInTheDocument();
    expect(screen.queryByText(/PM/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/AM/i)).not.toBeInTheDocument();
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
    
    const expectedStart = getLocal24h(mockEventDetail.startDate);
    const expectedEnd = getLocal24h(mockEventDetail.endDate);

    expect(screen.getAllByText(new RegExp(expectedStart))[0]).toBeInTheDocument();
    expect(screen.getAllByText(new RegExp(expectedEnd))[0]).toBeInTheDocument();
    expect(screen.queryByText(/PM/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/AM/i)).not.toBeInTheDocument();
  });
});
