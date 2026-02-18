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
}

export interface EditEventData extends EventFormData {
  id: number;
  fileName?: string;
}

export function EventModal({ isOpen, onClose, onSave, onUpdate, selectedDate, editEvent }: EventModalProps) {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [filePath, setFilePath] = useState('');
  const [fileName, setFileName] = useState('');
  const [zoomLink, setZoomLink] = useState('');
  const [reminderMinutes, setReminderMinutes] = useState(0);
  const [recurrenceType, setRecurrenceType] = useState('none');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [recurrenceEnd, setRecurrenceEnd] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!editEvent;

  // Helper to convert a Date or ISO string to local datetime-local format
  const toLocalDatetime = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  useEffect(() => {
    if (!isOpen) return;

    if (editEvent) {
      setTitle(editEvent.title);
      setStartDate(toLocalDatetime(new Date(editEvent.startDate)));
      setEndDate(toLocalDatetime(new Date(editEvent.endDate)));
      setDescription(editEvent.description || '');
      setFilePath(editEvent.filePath || '');
      setFileName(editEvent.fileName || '');
      setZoomLink(editEvent.zoomLink || '');
      setReminderMinutes(editEvent.reminderMinutes || 0);
      setRecurrenceType(editEvent.recurrenceType || 'none');
      setRecurrenceInterval(editEvent.recurrenceInterval || 1);
      setRecurrenceEnd(editEvent.recurrenceEnd || '');
    } else if (selectedDate) {
      setStartDate(toLocalDatetime(selectedDate));
      const endDateTime = new Date(selectedDate);
      endDateTime.setHours(endDateTime.getHours() + 1);
      setEndDate(toLocalDatetime(endDateTime));
    }
  }, [selectedDate, isOpen, editEvent]);

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

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      setError('End date must be after start date');
      return;
    }

    setIsSaving(true);

    try {
      const formData: EventFormData = {
        title: title.trim(),
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        description: description.trim(),
        filePath,
        zoomLink: zoomLink.trim(),
        reminderMinutes,
        recurrenceType,
        recurrenceInterval,
        recurrenceEnd,
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
    setEndDate('');
    setDescription('');
    setFilePath('');
    setFileName('');
    setZoomLink('');
    setReminderMinutes(0);
    setRecurrenceType('none');
    setRecurrenceInterval(1);
    setRecurrenceEnd('');
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
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date *</label>
              <input
                id="startDate"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isSaving}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">End Date *</label>
              <input
                id="endDate"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isSaving}
                required
              />
            </div>
          </div>

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
            <label htmlFor="zoomLink">Zoom Link</label>
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
