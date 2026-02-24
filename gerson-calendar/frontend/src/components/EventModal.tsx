import { useState, useEffect } from 'react';
import { SelectFile } from '../../wailsjs/go/main/App';
import './EventModal.css';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: EventFormData) => Promise<void>;
  onUpdate?: (id: number, event: EventFormData) => Promise<void>;
  selectedDate?: Date;
  editEvent?: EditEventData | null;
}

export interface EventFormData {
  title: string;
  startDate: string;
  endDate: string;
  description: string;
  filePath: string;
  zoomLink: string;
  reminderMinutes: number;
  recurrenceType: string;
  recurrenceInterval: number;
  recurrenceEnd: string;
  category: string;
  color: string;
  allDay: boolean;
}

export interface EditEventData extends EventFormData {
  id: number;
  fileName?: string;
}

export const CATEGORY_COLORS: Record<string, string> = {
  default: '#3b82f6',
  Work: '#ef4444',
  Personal: '#10b981',
  Health: '#f59e0b',
  Finance: '#8b5cf6',
  Other: '#6b7280',
};

export function EventModal({ isOpen, onClose, onSave, onUpdate, selectedDate, editEvent }: EventModalProps) {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('10:00');
  const [description, setDescription] = useState('');
  const [filePath, setFilePath] = useState('');
  const [fileName, setFileName] = useState('');
  const [zoomLink, setZoomLink] = useState('');
  const [reminderMinutes, setReminderMinutes] = useState(0);
  const [recurrenceType, setRecurrenceType] = useState('none');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [recurrenceEnd, setRecurrenceEnd] = useState('');
  const [category, setCategory] = useState('default');
  const [color, setColor] = useState('#3b82f6');
  const [allDay, setAllDay] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!editEvent;

  const toLocalDate = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const toLocalTime = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  useEffect(() => {
    if (!isOpen) return;

    if (editEvent) {
      setTitle(editEvent.title);
      const sd = new Date(editEvent.startDate);
      const ed = new Date(editEvent.endDate);
      const isAllDay = editEvent.allDay || false;
      setAllDay(isAllDay);
      if (isAllDay) {
        setStartDate(toLocalDate(sd));
        // For all-day, display end as the day before the exclusive end stored in DB
        const displayEnd = new Date(ed);
        displayEnd.setDate(displayEnd.getDate() - 1);
        setEndDate(toLocalDate(displayEnd));
        setStartTime('09:00');
        setEndTime('10:00');
      } else {
        setStartDate(toLocalDate(sd));
        setStartTime(toLocalTime(sd));
        setEndDate(toLocalDate(ed));
        setEndTime(toLocalTime(ed));
      }
      setDescription(editEvent.description || '');
      setFilePath(editEvent.filePath || '');
      setFileName(editEvent.fileName || '');
      setZoomLink(editEvent.zoomLink || '');
      setReminderMinutes(editEvent.reminderMinutes || 0);
      setRecurrenceType(editEvent.recurrenceType || 'none');
      setRecurrenceInterval(editEvent.recurrenceInterval || 1);
      setRecurrenceEnd(editEvent.recurrenceEnd || '');
      const cat = editEvent.category || 'default';
      setCategory(cat);
      setColor(editEvent.color || CATEGORY_COLORS[cat] || '#3b82f6');
    } else if (selectedDate) {
      setAllDay(false);
      setStartDate(toLocalDate(selectedDate));
      setStartTime('09:00');
      setEndDate(toLocalDate(selectedDate));
      setEndTime('10:00');
    }
  }, [selectedDate, isOpen, editEvent]);

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    setColor(CATEGORY_COLORS[newCategory] || '#3b82f6');
  };

  const handleAllDayToggle = (checked: boolean) => {
    setAllDay(checked);
    if (!checked) {
      // Switching to timed: ensure times are set
      if (!startTime) setStartTime('09:00');
      if (!endTime) setEndTime('10:00');
    }
  };

  const handleFileSelect = async () => {
    try {
      const selectedFile = await SelectFile();
      if (selectedFile) {
        setFilePath(selectedFile);
        const name = selectedFile.split('/').pop() || selectedFile.split('\\').pop() || '';
        setFileName(name);
      }
    } catch (err) {
      console.error('Failed to select file:', err);
      setError('Failed to select file');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!startDate || !endDate) {
      setError('Start and end dates are required');
      return;
    }

    let startISO: string;
    let endISO: string;

    if (allDay) {
      startISO = new Date(startDate + 'T00:00:00Z').toISOString();
      // Exclusive end: next day midnight
      const endD = new Date(endDate + 'T00:00:00Z');
      endD.setUTCDate(endD.getUTCDate() + 1);
      endISO = endD.toISOString();
    } else {
      const start = new Date(`${startDate}T${startTime || '09:00'}:00`);
      const end = new Date(`${endDate}T${endTime || '10:00'}:00`);
      if (end <= start) {
        setError('End must be after start');
        return;
      }
      startISO = start.toISOString();
      endISO = end.toISOString();
    }

    setIsSaving(true);

    try {
      const formData: EventFormData = {
        title: title.trim(),
        startDate: startISO,
        endDate: endISO,
        description: description.trim(),
        filePath,
        zoomLink: zoomLink.trim(),
        reminderMinutes,
        recurrenceType,
        recurrenceInterval,
        recurrenceEnd,
        category,
        color,
        allDay,
      };

      if (isEditing && onUpdate && editEvent) {
        await onUpdate(editEvent.id, formData);
      } else {
        await onSave(formData);
      }

      resetForm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save event');
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setStartDate('');
    setStartTime('09:00');
    setEndDate('');
    setEndTime('10:00');
    setDescription('');
    setFilePath('');
    setFileName('');
    setZoomLink('');
    setReminderMinutes(0);
    setRecurrenceType('none');
    setRecurrenceInterval(1);
    setRecurrenceEnd('');
    setCategory('default');
    setColor('#3b82f6');
    setAllDay(false);
    setError('');
  };

  const handleClose = () => {
    if (!isSaving) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Event' : 'Add Event'}</h2>
          <button className="close-button" onClick={handleClose} disabled={isSaving}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              disabled={isSaving}
              autoFocus
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                disabled={isSaving}
                className="reminder-select"
              >
                <option value="default">General</option>
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="Health">Health</option>
                <option value="Finance">Finance</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="color">Color</label>
              <div className="color-input-group">
                <input
                  id="color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  disabled={isSaving}
                  className="color-picker"
                />
                <span className="color-swatch" style={{ backgroundColor: color }} />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="allday-label">
              <input
                type="checkbox"
                checked={allDay}
                onChange={(e) => handleAllDayToggle(e.target.checked)}
                disabled={isSaving}
              />
              <span>All day</span>
            </label>
          </div>

          {allDay ? (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDateDay">Start Date *</label>
                <input
                  id="startDateDay"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={isSaving}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="endDateDay">End Date *</label>
                <input
                  id="endDateDay"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={isSaving}
                  required
                />
              </div>
            </div>
          ) : (
            <div className="form-row">
              <div className="form-group">
                <label>Start *</label>
                <div className="datetime-group">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    disabled={isSaving}
                    required
                  />
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    disabled={isSaving}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>End *</label>
                <div className="datetime-group">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={isSaving}
                    required
                  />
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    disabled={isSaving}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Event description"
              rows={3}
              disabled={isSaving}
            />
          </div>

          <div className="form-group">
            <label htmlFor="zoomLink">Zoom / Meeting Link</label>
            <input
              id="zoomLink"
              type="url"
              value={zoomLink}
              onChange={(e) => setZoomLink(e.target.value)}
              placeholder="https://zoom.us/j/..."
              disabled={isSaving}
            />
          </div>

          <div className="form-group">
            <label>Attachment</label>
            <div className="file-input-group">
              <button
                type="button"
                className="file-select-button"
                onClick={handleFileSelect}
                disabled={isSaving}
              >
                Choose File
              </button>
              {fileName && <span className="file-name">{fileName}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reminder">Remind me</label>
            <select
              id="reminder"
              value={reminderMinutes}
              onChange={(e) => setReminderMinutes(parseInt(e.target.value))}
              disabled={isSaving}
              className="reminder-select"
            >
              <option value={0}>No reminder</option>
              <option value={5}>5 minutes before</option>
              <option value={10}>10 minutes before</option>
              <option value={15}>15 minutes before</option>
              <option value={30}>30 minutes before</option>
              <option value={60}>1 hour before</option>
              <option value={1440}>1 day before</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="recurrenceType">Repeat</label>
            <select
              id="recurrenceType"
              value={recurrenceType}
              onChange={(e) => setRecurrenceType(e.target.value)}
              disabled={isSaving}
              className="reminder-select"
            >
              <option value="none">Does not repeat</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          {recurrenceType !== 'none' && (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="recurrenceInterval">Every</label>
                <input
                  id="recurrenceInterval"
                  type="number"
                  min={1}
                  max={99}
                  value={recurrenceInterval}
                  onChange={(e) => setRecurrenceInterval(parseInt(e.target.value) || 1)}
                  disabled={isSaving}
                />
              </div>
              <div className="form-group">
                <label htmlFor="recurrenceEnd">Until (optional)</label>
                <input
                  id="recurrenceEnd"
                  type="date"
                  value={recurrenceEnd}
                  onChange={(e) => setRecurrenceEnd(e.target.value)}
                  disabled={isSaving}
                />
              </div>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <div className="modal-footer">
            <button
              type="button"
              className="cancel-button"
              onClick={handleClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button type="submit" className="save-button" disabled={isSaving}>
              {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Save Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
