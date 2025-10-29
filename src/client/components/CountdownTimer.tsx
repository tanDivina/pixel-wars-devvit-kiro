/**
 * CountdownTimer Component
 * 
 * Displays time remaining in current season with dynamic formatting
 * and urgency styling based on time left.
 */

import { useState, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';

interface CountdownTimerProps {
  endTime: number; // Unix timestamp
  onSeasonEnd?: () => void;
  className?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  endTime,
  onSeasonEnd,
  className,
}) => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() =>
    calculateTimeRemaining(endTime)
  );
  const [hasEnded, setHasEnded] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const remaining = calculateTimeRemaining(endTime);
      setTimeRemaining(remaining);

      // Check if season has ended
      if (remaining.total <= 0 && !hasEnded) {
        setHasEnded(true);
        onSeasonEnd?.();
      }
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endTime, hasEnded, onSeasonEnd]);

  // Determine urgency level
  const urgency = getUrgencyLevel(timeRemaining.total);

  // Format display text
  const displayText = formatTimeDisplay(timeRemaining);

  // Get styling based on urgency
  const containerClasses = twMerge(
    'flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300',
    urgency === 'critical' && 'bg-red-600 text-white animate-pulse',
    urgency === 'urgent' && 'bg-orange-500 text-white',
    urgency === 'warning' && 'bg-yellow-500 text-gray-900',
    urgency === 'normal' && 'bg-gray-700 text-white',
    className
  );

  const iconClasses = twMerge(
    'text-xl',
    urgency === 'critical' && 'animate-bounce'
  );

  if (timeRemaining.total <= 0) {
    return (
      <div className={twMerge('flex items-center gap-2 px-4 py-2 rounded-lg font-semibold bg-red-700 text-white', className)}>
        <span className="text-xl">⏱️</span>
        <span>Season Ending...</span>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <span className={iconClasses}>
        {urgency === 'critical' ? '🚨' : urgency === 'urgent' ? '⏰' : '⏱️'}
      </span>
      <div className="flex flex-col">
        <span className="text-xs opacity-80">Season Ends In</span>
        <span className="text-sm font-bold">{displayText}</span>
      </div>
    </div>
  );
};

/**
 * Calculate time remaining from end time
 */
function calculateTimeRemaining(endTime: number): TimeRemaining {
  const now = Date.now();
  const total = Math.max(0, endTime - now);

  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return { days, hours, minutes, seconds, total };
}

/**
 * Determine urgency level based on time remaining
 */
function getUrgencyLevel(totalMs: number): 'normal' | 'warning' | 'urgent' | 'critical' {
  const minutes = totalMs / (1000 * 60);
  const hours = totalMs / (1000 * 60 * 60);

  if (minutes < 5) return 'critical';
  if (hours < 1) return 'urgent';
  if (hours < 24) return 'warning';
  return 'normal';
}

/**
 * Format time display based on time remaining
 */
function formatTimeDisplay(time: TimeRemaining): string {
  const { days, hours, minutes, seconds, total } = time;
  const totalHours = total / (1000 * 60 * 60);

  // Less than 1 hour: show minutes and seconds
  if (totalHours < 1) {
    return `${minutes}m ${seconds}s`;
  }

  // Less than 24 hours: show hours and minutes
  if (totalHours < 24) {
    return `${hours}h ${minutes}m`;
  }

  // More than 24 hours: show days and hours
  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}
