import { useState, useEffect, useRef, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventModal, EventFormData, EditEventData } from './components/EventModal';
import { EventDetail, EventDetailData } from './components/EventDetail';
import { SaveEvent, GetAllEvents, DeleteEvent, UpdateEvent, DeleteRecurringSeries, ImportICS, ExportICS, OpenFile, OpenURL } from '../wailsjs/go/main/App';
import './App.css';

interface CalendarEvent {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  description: string;
  filePath: string;
  fileName: string;
  zoomLink: string;
  reminderMinutes: number;
  recurrenceType: string;
  recurrenceInterval: number;
  recurrenceEnd: string;
  category: string;
  color: string;
  allDay: boolean;
  createdAt: string;
}

function App() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [detailEvent, setDetailEvent] = useState<EventDetailData | null>(null);
  const [editEvent, setEditEvent] = useState<EditEventData | null>(null);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('gc-theme') === 'dark');

  const calendarRef = useRef<FullCalendar>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('gc-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const fetched = await GetAllEvents();
      setEvents(fetched ?? []);
    } catch (err) {
      console.error('Failed to load events:', err);
      setError('Failed to load events from database.');
    }
  };

  const handleExportICS = useCallback(async () => {
    try {
      const filePath = await ExportICS();
      if (filePath) {
        await OpenFile(filePath);
      }
    } catch {
      setError('Failed to export calendar.');
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement)?.tagName;
      const inInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag);

      if (e.key === 'Escape') {
        setIsModalOpen(false);
        setDetailEvent(null);
        return;
      }

      if (inInput) return;

      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        setEditEvent(null);
        setIsModalOpen(true);
        return;
      }
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        handleExportICS();
        return;
      }

      const cal = calendarRef.current?.getApi();
      if (!cal) return;

      if (e.key === 't' || e.key === 'T') cal.today();
      else if (e.key === 'ArrowLeft') cal.prev();
      else if (e.key === 'ArrowRight') cal.next();
      else if (e.key === 'm' || e.key === 'M') cal.changeView('dayGridMonth');
      else if (e.key === 'w' || e.key === 'W') cal.changeView('dayGridWeek');
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleExportICS]);

  const handleDateClick = (arg: { date: Date }) => {
    setSelectedDate(arg.date);
    setEditEvent(null);
    setIsModalOpen(true);
  };

  const handleSaveEvent = async (eventData: EventFormData) => {
    try {
      await SaveEvent(eventData);
      await loadEvents();
      setError('');
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to save event');
    }
  };

  const handleUpdateEvent = async (id: number, eventData: EventFormData) => {
    try {
      await UpdateEvent(id, eventData);
      await loadEvents();
      setError('');
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update event');
    }
  };

  const handleEventClick = (clickInfo: { event: { id: string; extendedProps: Record<string, unknown> } }) => {
    const { id, extendedProps } = clickInfo.event;
    const base = events.find(e => e.id === parseInt(id));
    if (!base) return;

    setDetailEvent({
      id: base.id,
      title: base.title,
      startDate: base.startDate,
      endDate: base.endDate,
      description: (extendedProps.description as string) ?? base.description,
      filePath: (extendedProps.filePath as string) ?? base.filePath,
      fileName: (extendedProps.fileName as string) ?? base.fileName,
      zoomLink: (extendedProps.zoomLink as string) ?? base.zoomLink,
      reminderMinutes: (extendedProps.reminderMinutes as number) ?? base.reminderMinutes,
      recurrenceType: (extendedProps.recurrenceType as string) ?? base.recurrenceType,
      recurrenceInterval: (extendedProps.recurrenceInterval as number) ?? base.recurrenceInterval,
      recurrenceEnd: (extendedProps.recurrenceEnd as string) ?? base.recurrenceEnd,
      category: (extendedProps.category as string) ?? base.category,
      color: (extendedProps.color as string) ?? base.color,
      allDay: (extendedProps.allDay as boolean) ?? base.allDay,
    });
  };

  const handleDeleteEvent = async (id: number) => {
    try {
      await DeleteEvent(id);
      await loadEvents();
      setError('');
    } catch {
      setError('Failed to delete event.');
    }
  };

  const handleDeleteSeries = async (id: number) => {
    try {
      await DeleteRecurringSeries(id);
      await loadEvents();
      setError('');
    } catch {
      setError('Failed to delete recurring series.');
    }
  };

  const handleEditEvent = (event: EventDetailData) => {
    setEditEvent({
      id: event.id,
      title: event.title,
      startDate: event.startDate,
      endDate: event.endDate,
      description: event.description,
      filePath: event.filePath,
      fileName: event.fileName,
      zoomLink: event.zoomLink,
      reminderMinutes: event.reminderMinutes,
      recurrenceType: event.recurrenceType,
      recurrenceInterval: event.recurrenceInterval,
      recurrenceEnd: event.recurrenceEnd,
      category: event.category,
      color: event.color,
      allDay: event.allDay,
    });
    setIsModalOpen(true);
  };

  const handleOpenFile = (filePath: string) => {
    OpenFile(filePath).catch(() => setError('Failed to open attachment.'));
  };

  const handleOpenURL = (url: string) => {
    OpenURL(url).catch(() => setError('Failed to open link.'));
  };

  const handleImportICS = async () => {
    try {
      const count = await ImportICS();
      if (count > 0) {
        await loadEvents();
        setError('');
        alert(`Successfully imported ${count} event(s).`);
      }
    } catch {
      setError('Failed to import ICS file.');
    }
  };

  const handleEventDrop = async (dropInfo: {
    event: { id: string; start: Date | null; end: Date | null; allDay: boolean };
    revert: () => void;
  }) => {
    const { event, revert } = dropInfo;
    const base = events.find(e => e.id === parseInt(event.id));
    if (!base || !event.start) { revert(); return; }

    const newStart = event.start;
    const newEnd = event.end || new Date(newStart.getTime() + 3600000);

    try {
      const formData: EventFormData = {
        title: base.title,
        startDate: newStart.toISOString(),
        endDate: newEnd.toISOString(),
        description: base.description,
        filePath: base.filePath,
        zoomLink: base.zoomLink,
        reminderMinutes: base.reminderMinutes,
        recurrenceType: base.recurrenceType,
        recurrenceInterval: base.recurrenceInterval,
        recurrenceEnd: base.recurrenceEnd,
        category: base.category,
        color: base.color,
        allDay: event.allDay,
      };
      await UpdateEvent(parseInt(event.id), formData);
      await loadEvents();
    } catch {
      revert();
      setError('Failed to reschedule event.');
    }
  };

  const filteredEvents = searchQuery.trim()
    ? events.filter(e =>
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : events;

  const calendarEvents = filteredEvents.map(event => ({
    id: event.id.toString(),
    title: event.title,
    start: event.startDate,
    end: event.endDate,
    allDay: event.allDay,
    backgroundColor: event.color || '#3b82f6',
    borderColor: event.color || '#3b82f6',
    extendedProps: {
      description: event.description,
      filePath: event.filePath,
      fileName: event.fileName,
      zoomLink: event.zoomLink,
      reminderMinutes: event.reminderMinutes,
      recurrenceType: event.recurrenceType,
      recurrenceInterval: event.recurrenceInterval,
      recurrenceEnd: event.recurrenceEnd,
      category: event.category,
      color: event.color,
      allDay: event.allDay,
    },
  }));

  return (
    <div id="App">
      <div className="calendar-header">
        <h1>Gerson Calendar</h1>
        <div className="search-bar-wrapper">
          <input
            ref={searchRef}
            type="search"
            className="search-bar"
            placeholder="Search events... (Ctrl+F)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="header-actions">
          <button
            className="theme-toggle"
            onClick={() => setIsDarkMode(d => !d)}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? '☀' : '☾'}
          </button>
          <button className="import-button" onClick={handleImportICS} title="Import ICS calendar file">
            Import ICS
          </button>
          <button className="export-button" onClick={handleExportICS} title="Export all events to ICS (Ctrl+E)">
            Export ICS
          </button>
          <button
            className="add-event-button"
            onClick={() => { setEditEvent(null); setIsModalOpen(true); }}
            title="New event (Ctrl+N)"
          >
            + Add Event
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner" onClick={() => setError('')}>
          {error} <span className="error-dismiss">✕</span>
        </div>
      )}

      <div className="calendar-container">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={calendarEvents}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          editable={true}
          height="auto"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek',
          }}
        />
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDate(undefined);
          setEditEvent(null);
        }}
        onSave={handleSaveEvent}
        onUpdate={handleUpdateEvent}
        selectedDate={selectedDate}
        editEvent={editEvent}
      />

      <EventDetail
        event={detailEvent}
        onClose={() => setDetailEvent(null)}
        onDelete={handleDeleteEvent}
        onDeleteSeries={handleDeleteSeries}
        onEdit={handleEditEvent}
        onOpenFile={handleOpenFile}
        onOpenURL={handleOpenURL}
      />
    </div>
  );
}

export default App;
