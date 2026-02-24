import './EventDetail.css';

export interface EventDetailData {
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
}

interface EventDetailProps {
  event: EventDetailData | null;
  onClose: () => void;
  onDelete: (id: number) => void;
  onDeleteSeries: (id: number) => void;
  onEdit: (event: EventDetailData) => void;
  onOpenFile: (filePath: string) => void;
  onOpenURL: (url: string) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  default: 'General',
  Work: 'Work',
  Personal: 'Personal',
  Health: 'Health',
  Finance: 'Finance',
  Other: 'Other',
};

function formatDateTime(iso: string, allDay?: boolean): string {
  const d = new Date(iso);
  if (allDay) {
    return d.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  }
  return d.toLocaleString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatRecurrence(type: string, interval: number, end: string): string {
  if (!type || type === 'none') return '';
  const unit = type === 'daily' ? 'day' : type === 'weekly' ? 'week' : type === 'monthly' ? 'month' : 'year';
  const plural = interval > 1 ? `${interval} ${unit}s` : unit;
  let str = `Every ${plural}`;
  if (end) str += ` until ${end}`;
  return str;
}

export function EventDetail({ event, onClose, onDelete, onDeleteSeries, onEdit, onOpenFile, onOpenURL }: EventDetailProps) {
  if (!event) return null;

  const isRecurring = event.recurrenceType && event.recurrenceType !== 'none';
  const categoryLabel = CATEGORY_LABELS[event.category] || event.category || 'General';

  const handleDelete = () => {
    if (isRecurring) {
      const choice = window.confirm(
        `"${event.title}" is a recurring event.\n\nClick OK to delete the entire series, or Cancel to keep it.`
      );
      if (choice) {
        onDeleteSeries(event.id);
        onClose();
      }
    } else {
      if (window.confirm(`Delete "${event.title}"?`)) {
        onDelete(event.id);
        onClose();
      }
    }
  };

  const handleEdit = () => {
    onEdit(event);
    onClose();
  };

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-content" onClick={(e) => e.stopPropagation()}>
        <div className="detail-header">
          <div className="detail-title-row">
            <span className="detail-color-dot" style={{ backgroundColor: event.color || '#3b82f6' }} />
            <h2>{event.title}</h2>
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="detail-body">
          <div className="detail-row">
            <span className="detail-label">Category</span>
            <span className="detail-value detail-category">
              <span className="category-dot" style={{ backgroundColor: event.color || '#3b82f6' }} />
              {categoryLabel}
            </span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Start</span>
            <span className="detail-value">{formatDateTime(event.startDate, event.allDay)}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">End</span>
            <span className="detail-value">{formatDateTime(event.endDate, event.allDay)}</span>
          </div>

          {event.allDay && (
            <div className="detail-row">
              <span className="detail-label">Type</span>
              <span className="detail-value">All day</span>
            </div>
          )}

          {event.description && (
            <div className="detail-row detail-row--block">
              <span className="detail-label">Description</span>
              <p className="detail-description">{event.description}</p>
            </div>
          )}

          {event.fileName && (
            <div className="detail-row">
              <span className="detail-label">Attachment</span>
              <button
                className="detail-action-link"
                onClick={() => onOpenFile(event.filePath)}
              >
                {event.fileName}
              </button>
            </div>
          )}

          {event.zoomLink && (
            <div className="detail-row">
              <span className="detail-label">Zoom</span>
              <button
                className="detail-action-link detail-action-link--zoom"
                onClick={() => onOpenURL(event.zoomLink)}
              >
                Join Meeting
              </button>
            </div>
          )}

          {event.reminderMinutes > 0 && (
            <div className="detail-row">
              <span className="detail-label">Reminder</span>
              <span className="detail-value">
                {event.reminderMinutes < 60
                  ? `${event.reminderMinutes} min before`
                  : event.reminderMinutes === 60
                    ? '1 hour before'
                    : event.reminderMinutes === 1440
                      ? '1 day before'
                      : `${event.reminderMinutes} min before`}
              </span>
            </div>
          )}

          {isRecurring && (
            <div className="detail-row">
              <span className="detail-label">Repeats</span>
              <span className="detail-value">
                {formatRecurrence(event.recurrenceType, event.recurrenceInterval, event.recurrenceEnd)}
              </span>
            </div>
          )}
        </div>

        <div className="detail-footer">
          <button className="delete-button" onClick={handleDelete}>
            {isRecurring ? 'Delete Series' : 'Delete Event'}
          </button>
          <div className="detail-footer-right">
            <button className="edit-button" onClick={handleEdit}>
              Edit
            </button>
            <button className="close-detail-button" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
