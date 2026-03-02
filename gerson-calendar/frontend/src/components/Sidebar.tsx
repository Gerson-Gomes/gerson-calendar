import React from 'react';
import './Sidebar.css';

interface SidebarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean | ((prev: boolean) => boolean)) => void;
  onImport: () => void;
  onExport: () => void;
  onAddEvent: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  searchQuery,
  setSearchQuery,
  isDarkMode,
  setIsDarkMode,
  onImport,
  onExport,
  onAddEvent,
}) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Gerson</h2>
        <button
          className="theme-toggle"
          onClick={() => setIsDarkMode(d => !d)}
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? '☀' : '☾'}
        </button>
      </div>

      <div className="sidebar-search">
        <input
          type="search"
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <nav className="sidebar-nav">
        <button className="nav-item add-event" onClick={onAddEvent}>
          <span className="icon">+</span>
          <span className="label">Add Event</span>
        </button>
        
        <div className="nav-group">
          <p className="group-title">Tools</p>
          <button className="nav-item" onClick={onImport}>
            <span className="icon">↓</span>
            <span className="label">Import ICS</span>
          </button>
          <button className="nav-item" onClick={onExport}>
            <span className="icon">↑</span>
            <span className="label">Export ICS</span>
          </button>
        </div>
      </nav>

      <div className="sidebar-footer">
        {/* Placeholder for Upcoming Appointments */}
        <div className="upcoming-appointments-placeholder">
          <p className="group-title">Upcoming</p>
          <div className="empty-state">Weekly view coming soon</div>
        </div>
      </div>
    </aside>
  );
};
