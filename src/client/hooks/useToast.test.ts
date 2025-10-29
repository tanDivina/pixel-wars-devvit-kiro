import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast } from './useToast';

describe('useToast', () => {
  it('should initialize with empty toasts', () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toasts).toEqual([]);
  });

  it('should add a toast', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.addToast('Test message', 'info');
    });
    
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe('Test message');
    expect(result.current.toasts[0].type).toBe('info');
  });

  it('should add multiple toasts', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.addToast('First', 'info');
      result.current.addToast('Second', 'success');
      result.current.addToast('Third', 'error');
    });
    
    expect(result.current.toasts).toHaveLength(3);
  });

  it('should remove a toast by id', () => {
    const { result } = renderHook(() => useToast());
    
    let toastId: string;
    act(() => {
      toastId = result.current.addToast('Test', 'info');
    });
    
    expect(result.current.toasts).toHaveLength(1);
    
    act(() => {
      result.current.removeToast(toastId);
    });
    
    expect(result.current.toasts).toHaveLength(0);
  });

  it('should add success toast', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.success('Success message');
    });
    
    expect(result.current.toasts[0].type).toBe('success');
    expect(result.current.toasts[0].message).toBe('Success message');
  });

  it('should add error toast', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.error('Error message');
    });
    
    expect(result.current.toasts[0].type).toBe('error');
    expect(result.current.toasts[0].message).toBe('Error message');
  });

  it('should add info toast', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.info('Info message');
    });
    
    expect(result.current.toasts[0].type).toBe('info');
    expect(result.current.toasts[0].message).toBe('Info message');
  });

  it('should add warning toast', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.warning('Warning message');
    });
    
    expect(result.current.toasts[0].type).toBe('warning');
    expect(result.current.toasts[0].message).toBe('Warning message');
  });

  it('should generate unique ids for toasts', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.addToast('First', 'info');
      result.current.addToast('Second', 'info');
    });
    
    const ids = result.current.toasts.map((t) => t.id);
    expect(ids[0]).not.toBe(ids[1]);
  });

  it('should only remove specified toast', () => {
    const { result } = renderHook(() => useToast());
    
    let firstId: string;
    let secondId: string;
    
    act(() => {
      firstId = result.current.addToast('First', 'info');
      secondId = result.current.addToast('Second', 'info');
    });
    
    act(() => {
      result.current.removeToast(firstId);
    });
    
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].id).toBe(secondId);
  });
});
