/**
 * CountdownTimer Component Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CountdownTimer } from './CountdownTimer';

describe('CountdownTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('display formatting', () => {
    it('should display days and hours for > 24 hours', () => {
      const endTime = Date.now() + 3 * 24 * 60 * 60 * 1000; // 3 days from now

      render(<CountdownTimer endTime={endTime} />);

      expect(screen.getByText(/3d/)).toBeInTheDocument();
    });

    it('should display hours and minutes for < 24 hours', () => {
      const endTime = Date.now() + 5 * 60 * 60 * 1000; // 5 hours from now

      render(<CountdownTimer endTime={endTime} />);

      expect(screen.getByText(/5h/)).toBeInTheDocument();
    });

    it('should display minutes and seconds for < 1 hour', () => {
      const endTime = Date.now() + 30 * 60 * 1000; // 30 minutes from now

      render(<CountdownTimer endTime={endTime} />);

      expect(screen.getByText(/30m/)).toBeInTheDocument();
      expect(screen.getByText(/0s/)).toBeInTheDocument();
    });

    it('should update every second', async () => {
      const endTime = Date.now() + 61 * 1000; // 61 seconds from now

      render(<CountdownTimer endTime={endTime} />);

      // Initial state
      expect(screen.getByText(/1m 1s/)).toBeInTheDocument();

      // Advance 1 second
      vi.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(screen.getByText(/1m 0s/)).toBeInTheDocument();
      });
    });
  });

  describe('urgency styling', () => {
    it('should show normal styling for > 24 hours', () => {
      const endTime = Date.now() + 48 * 60 * 60 * 1000; // 48 hours

      const { container } = render(<CountdownTimer endTime={endTime} />);

      const timerDiv = container.querySelector('.bg-gray-700');
      expect(timerDiv).toBeInTheDocument();
    });

    it('should show warning styling for < 24 hours', () => {
      const endTime = Date.now() + 12 * 60 * 60 * 1000; // 12 hours

      const { container } = render(<CountdownTimer endTime={endTime} />);

      const timerDiv = container.querySelector('.bg-yellow-500');
      expect(timerDiv).toBeInTheDocument();
    });

    it('should show urgent styling for < 1 hour', () => {
      const endTime = Date.now() + 30 * 60 * 1000; // 30 minutes

      const { container } = render(<CountdownTimer endTime={endTime} />);

      const timerDiv = container.querySelector('.bg-orange-500');
      expect(timerDiv).toBeInTheDocument();
    });

    it('should show critical styling for < 5 minutes', () => {
      const endTime = Date.now() + 3 * 60 * 1000; // 3 minutes

      const { container } = render(<CountdownTimer endTime={endTime} />);

      const timerDiv = container.querySelector('.bg-red-600');
      expect(timerDiv).toBeInTheDocument();
    });

    it('should pulse animation for critical time', () => {
      const endTime = Date.now() + 2 * 60 * 1000; // 2 minutes

      const { container } = render(<CountdownTimer endTime={endTime} />);

      const timerDiv = container.querySelector('.animate-pulse');
      expect(timerDiv).toBeInTheDocument();
    });
  });

  describe('season end handling', () => {
    it('should display "Season Ending..." when time reaches zero', async () => {
      const endTime = Date.now() + 1000; // 1 second from now

      render(<CountdownTimer endTime={endTime} />);

      // Advance past end time
      vi.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(screen.getByText('Season Ending...')).toBeInTheDocument();
      });
    });

    it('should call onSeasonEnd callback when time reaches zero', async () => {
      const onSeasonEnd = vi.fn();
      const endTime = Date.now() + 1000; // 1 second from now

      render(<CountdownTimer endTime={endTime} onSeasonEnd={onSeasonEnd} />);

      // Advance past end time
      vi.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(onSeasonEnd).toHaveBeenCalledTimes(1);
      });
    });

    it('should only call onSeasonEnd once', async () => {
      const onSeasonEnd = vi.fn();
      const endTime = Date.now() + 1000; // 1 second from now

      render(<CountdownTimer endTime={endTime} onSeasonEnd={onSeasonEnd} />);

      // Advance past end time multiple times
      vi.advanceTimersByTime(2000);
      vi.advanceTimersByTime(2000);
      vi.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(onSeasonEnd).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle negative time remaining', () => {
      const endTime = Date.now() - 1000; // 1 second ago

      render(<CountdownTimer endTime={endTime} />);

      expect(screen.getByText('Season Ending...')).toBeInTheDocument();
    });
  });

  describe('icon display', () => {
    it('should show clock icon for normal time', () => {
      const endTime = Date.now() + 48 * 60 * 60 * 1000; // 48 hours

      render(<CountdownTimer endTime={endTime} />);

      expect(screen.getByText('⏱️')).toBeInTheDocument();
    });

    it('should show alarm icon for urgent time', () => {
      const endTime = Date.now() + 30 * 60 * 1000; // 30 minutes

      render(<CountdownTimer endTime={endTime} />);

      expect(screen.getByText('⏰')).toBeInTheDocument();
    });

    it('should show siren icon for critical time', () => {
      const endTime = Date.now() + 3 * 60 * 1000; // 3 minutes

      render(<CountdownTimer endTime={endTime} />);

      expect(screen.getByText('🚨')).toBeInTheDocument();
    });
  });

  describe('custom className', () => {
    it('should apply custom className', () => {
      const endTime = Date.now() + 1000;

      const { container } = render(<CountdownTimer endTime={endTime} className="custom-class" />);

      const timerDiv = container.querySelector('.custom-class');
      expect(timerDiv).toBeInTheDocument();
    });

    it('should merge custom className with default classes', () => {
      const endTime = Date.now() + 48 * 60 * 60 * 1000;

      const { container } = render(<CountdownTimer endTime={endTime} className="custom-class" />);

      const timerDiv = container.querySelector('.custom-class.bg-gray-700');
      expect(timerDiv).toBeInTheDocument();
    });
  });

  describe('label display', () => {
    it('should show "Season Ends In" label', () => {
      const endTime = Date.now() + 1000;

      render(<CountdownTimer endTime={endTime} />);

      expect(screen.getByText('Season Ends In')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle exactly 0 time remaining', () => {
      const endTime = Date.now();

      render(<CountdownTimer endTime={endTime} />);

      expect(screen.getByText('Season Ending...')).toBeInTheDocument();
    });

    it('should handle very large time values', () => {
      const endTime = Date.now() + 365 * 24 * 60 * 60 * 1000; // 1 year

      render(<CountdownTimer endTime={endTime} />);

      expect(screen.getByText(/365d/)).toBeInTheDocument();
    });

    it('should cleanup interval on unmount', () => {
      const endTime = Date.now() + 1000;

      const { unmount } = render(<CountdownTimer endTime={endTime} />);

      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });

  describe('time calculations', () => {
    it('should correctly calculate days, hours, minutes, seconds', () => {
      // 2 days, 3 hours, 15 minutes, 30 seconds
      const endTime = Date.now() + (2 * 24 * 60 * 60 + 3 * 60 * 60 + 15 * 60 + 30) * 1000;

      render(<CountdownTimer endTime={endTime} />);

      expect(screen.getByText(/2d 3h/)).toBeInTheDocument();
    });

    it('should handle transition from days to hours', async () => {
      // Start with just over 24 hours
      const endTime = Date.now() + (24 * 60 * 60 + 5) * 1000;

      render(<CountdownTimer endTime={endTime} />);

      // Should show days
      expect(screen.getByText(/1d/)).toBeInTheDocument();

      // Advance to under 24 hours
      vi.advanceTimersByTime(10 * 1000);

      await waitFor(() => {
        expect(screen.getByText(/23h/)).toBeInTheDocument();
      });
    });

    it('should handle transition from hours to minutes', async () => {
      // Start with just over 1 hour
      const endTime = Date.now() + (60 * 60 + 5) * 1000;

      render(<CountdownTimer endTime={endTime} />);

      // Should show hours
      expect(screen.getByText(/1h/)).toBeInTheDocument();

      // Advance to under 1 hour
      vi.advanceTimersByTime(10 * 1000);

      await waitFor(() => {
        expect(screen.getByText(/59m/)).toBeInTheDocument();
      });
    });
  });
});
