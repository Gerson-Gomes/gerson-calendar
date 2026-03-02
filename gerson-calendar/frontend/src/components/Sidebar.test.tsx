import { render, screen } from '@testing-library/react';
import { Sidebar } from './Sidebar';
import { describe, it, expect, vi } from 'vitest';

describe('Sidebar', () => {
  it('renders navigation links', () => {
    render(
      <Sidebar 
        searchQuery="" 
        setSearchQuery={() => {}} 
        isDarkMode={true} 
        setIsDarkMode={() => {}} 
        onImport={() => {}} 
        onExport={() => {}} 
        onAddEvent={() => {}} 
      />
    );
    
    expect(screen.getByPlaceholderText(/Search events/i)).toBeInTheDocument();
    expect(screen.getByText(/Import/i)).toBeInTheDocument();
    expect(screen.getByText(/Export/i)).toBeInTheDocument();
    expect(screen.getByText(/Add Event/i)).toBeInTheDocument();
  });
});
