import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Toast, ToastContainer } from './Toast';

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render success toast', () => {
    render(<Toast message="Success!" type="success" onClose={vi.fn()} />);
    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('should render error toast', () => {
    render(<Toast message="Error occurred" type="error" onClose={vi.fn()} />);
    expect(screen.getByText('Error occurred')).toBeInTheDocument();
    expect(screen.getByText('✕')).toBeInTheDocument();
  });

  it('should render info toast', () => {
    render(<Toast message="Information" type="info" onClose={vi.fn()} />);
    expect(screen.getByText('Information')).toBeInTheDocument();
    expect(screen.getByText('ℹ')).toBeInTheDocument();
  });

  it('should render warning toast', () => {
    render(<Toast message="Warning!" type="warning" onClose={vi.fn()} />);
    expect(screen.getByText('Warning!')).toBeInTheDocument();
    expect(screen.getByText('⚠')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<Toast message="Test" type="info" onClose={onClose} />);
    
    const closeButton = screen.getByLabelText('Close notification');
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });

  it('should auto-dismiss after duration', () => {
    const onClose = vi.fn();
    render(<Toast message="Test" type="info" onClose={onClose} duration={3000} />);
    
    expect(onClose).not.toHaveBeenCalled();
    
    vi.advanceTimersByTime(3000);
    
    expect(onClose).toHaveBeenCalled();
  });

  it('should not auto-dismiss when duration is 0', () => {
    const onClose = vi.fn();
    render(<Toast message="Test" type="info" onClose={onClose} duration={0} />);
    
    vi.advanceTimersByTime(10000);
    
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should have correct styling for success type', () => {
    const { container } = render(<Toast message="Test" type="success" onClose={vi.fn()} />);
    const toast = container.querySelector('.bg-green-500');
    expect(toast).toBeInTheDocument();
  });

  it('should have correct styling for error type', () => {
    const { container } = render(<Toast message="Test" type="error" onClose={vi.fn()} />);
    const toast = container.querySelector('.bg-red-500');
    expect(toast).toBeInTheDocument();
  });
});

describe('ToastContainer', () => {
  it('should render multiple toasts', () => {
    const toasts = [
      { id: '1', message: 'First toast', type: 'success' as const },
      { id: '2', message: 'Second toast', type: 'error' as const },
      { id: '3', message: 'Third toast', type: 'info' as const },
    ];

    render(<ToastContainer toasts={toasts} onRemove={vi.fn()} />);
    
    expect(screen.getByText('First toast')).toBeInTheDocument();
    expect(screen.getByText('Second toast')).toBeInTheDocument();
    expect(screen.getByText('Third toast')).toBeInTheDocument();
  });

  it('should call onRemove when toast is closed', () => {
    const onRemove = vi.fn();
    const toasts = [
      { id: '1', message: 'Test toast', type: 'info' as const },
    ];

    render(<ToastContainer toasts={toasts} onRemove={onRemove} />);
    
    const closeButton = screen.getByLabelText('Close notification');
    fireEvent.click(closeButton);
    
    expect(onRemove).toHaveBeenCalledWith('1');
  });

  it('should render empty container when no toasts', () => {
    const { container } = render(<ToastContainer toasts={[]} onRemove={vi.fn()} />);
    expect(container.firstChild?.childNodes.length).toBe(0);
  });
});
