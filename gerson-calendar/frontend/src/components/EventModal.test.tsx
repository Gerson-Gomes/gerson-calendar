import { render, screen } from '@testing-library/react';
import { EventModal } from './EventModal';
import { describe, it, expect, vi } from 'vitest';

describe('EventModal', () => {
  it('renders with modern styling when open', () => {
    render(
      <EventModal 
        isOpen={true} 
        onClose={() => {}} 
        onSave={async () => {}} 
        onUpdate={async () => {}} 
      />
    );
    
    const content = screen.getByText(/Add Event/i).closest('.modal-content');
    expect(content).toHaveClass('modal-content');
    expect(screen.getByText(/Add Event/i)).toBeInTheDocument();
  });
});
