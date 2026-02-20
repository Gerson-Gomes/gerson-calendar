import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventModal, EventFormData, EditEventData } from './components/EventModal';
import { EventDetail, EventDetailData } from './components/EventDetail';
import { SaveEvent, GetAllEvents, DeleteEvent, UpdateEvent, DeleteRecurringSeries, ImportICS, OpenFile, OpenURL } from '../wailsjs/go/main/App';
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
  createdAt: string;
}

function App() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [detailEvent, setDetailEvent] = useState<EventDetailData | null>(null);
  const [editEvent, setEditEvent] = useState<EditEventData | null>(null);
  const [error, setError] = useState('');

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
    });
  };

  const handleDeleteEvent = async (id: number) => {
    try {
      await DeleteEvent(id);
      await loadEvents();
      setError('');
    } catch (err) {
      setError('Failed to delete event.');
    }
  };

  const handleDeleteSeries = async (id: number) => {
    try {
      await DeleteRecurringSeries(id);
      await loadEvents();
      setError('');
    } catch (err) {
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
    } catch (err) {
      setError('Failed to import ICS file.');
    }
  };

  const calendarEvents = events.map(event => ({
    id: event.id.toString(),
    title: event.title,
    start: event.startDate,
    end: event.endDate,
    extendedProps: {
      description: event.description,
      filePath: event.filePath,
      fileName: event.fileName,
      zoomLink: event.zoomLink,
      reminderMinutes: event.reminderMinutes,
      recurrenceType: event.recurrenceType,
      recurrenceInterval: event.recurrenceInterval,
      recurrenceEnd: event.recurrenceEnd,
    },
  }));

  return (
    <div id="App">
      <div className="calendar-header">
        <h1>Gerson Calendar</h1>
        <div className="header-actions">
          <button className="import-button" onClick={handleImportICS}>
            📥 Import ICS
          </button>
          <button className="add-event-button" onClick={() => { setEditEvent(null); setIsModalOpen(true); }}>
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
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={calendarEvents}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
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
