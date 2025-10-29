import { useEffect, useState } from 'react';

export const usePixelCredits = (nextCreditTime: number) => {
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    const updateTimeRemaining = () => {
      if (nextCreditTime === 0) {
        setTimeRemaining(0);
        return;
      }

      const now = Date.now();
      const remaining = Math.max(0, nextCreditTime - now);
      setTimeRemaining(remaining);
    };

    // Update immediately
    updateTimeRemaining();

    // Update every second
    const interval = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [nextCreditTime]);

  // Format time as MM:SS
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    timeRemaining,
    formattedTime: formatTime(timeRemaining),
    hasTimeRemaining: timeRemaining > 0,
  } as const;
};
