import React, { useState, useEffect } from 'react';
import './UpcomingAppointments.css';

export interface WeeklyEvent {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  color: string;
  category: string;
}

interface UpcomingAppointmentsProps {
  events: WeeklyEvent[];
}

export const UpcomingAppointments: React.FC<UpcomingAppointmentsProps> = ({ events }) => {
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    // Update current time every minute to trigger re-render and filtering
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const filteredEvents = (events || []).filter((event) => {
    const startTime = new Date(event.startDate).getTime();
    // Keep if event started less than 1 hour ago (3600000 ms)
    return startTime > currentTime - 3600000;
  });

  if (filteredEvents.length === 0) {
    return (
      <div className="upcoming-appointments empty">
        <p className="empty-message">No appointments for this week</p>
      </div>
    );
  }

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const getDayName = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString([], { weekday: 'short' });
  };

  return (
    <div className="upcoming-appointments">
      <div className="appointments-list">
        {filteredEvents.map((event) => (
          <div key={`${event.id}-${event.startDate}`} className="appointment-card">
            <div className="card-accent" style={{ backgroundColor: event.color || 'var(--accent)' }}></div>
            <div className="card-content">
              <div className="card-header">
                <span className="day-badge">{getDayName(event.startDate)}</span>
                <span className="time-label">{formatTime(event.startDate)}</span>
              </div>
              <p className="appointment-title">{event.title}</p>
              {event.category && event.category !== 'default' && (
                <span className="category-tag">{event.category}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
