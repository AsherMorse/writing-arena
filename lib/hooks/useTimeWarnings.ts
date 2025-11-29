/**
 * Hook for displaying time warnings at specific thresholds
 * Provides consistent time warning UX across all phases
 */

import { useEffect, useState } from 'react';

interface TimeWarning {
  message: string;
  severity: 'info' | 'warning' | 'urgent';
}

interface UseTimeWarningsOptions {
  /** Time remaining in seconds */
  timeRemaining: number;
  /** Warning thresholds in seconds */
  thresholds?: {
    /** Show info message at this time (default: 60) */
    info?: number;
    /** Show warning at this time (default: 30) */
    warning?: number;
    /** Show urgent warning at this time (default: 15) */
    urgent?: number;
  };
  /** Callback when warning should be shown */
  onWarning?: (warning: TimeWarning) => void;
}

/**
 * Hook that triggers time warnings at configured thresholds
 */
export function useTimeWarnings({
  timeRemaining,
  thresholds = { info: 60, warning: 30, urgent: 15 },
  onWarning,
}: UseTimeWarningsOptions): TimeWarning | null {
  const [currentWarning, setCurrentWarning] = useState<TimeWarning | null>(null);
  const { info = 60, warning = 30, urgent = 15 } = thresholds;
  
  useEffect(() => {
    let warningToShow: TimeWarning | null = null;
    
    if (timeRemaining <= urgent && timeRemaining > 0) {
      warningToShow = {
        message: `${timeRemaining} seconds remaining!`,
        severity: 'urgent',
      };
    } else if (timeRemaining <= warning) {
      warningToShow = {
        message: `${Math.ceil(timeRemaining / 60)} minute${Math.ceil(timeRemaining / 60) !== 1 ? 's' : ''} remaining`,
        severity: 'warning',
      };
    } else if (timeRemaining <= info && timeRemaining > warning) {
      warningToShow = {
        message: `${Math.ceil(timeRemaining / 60)} minute${Math.ceil(timeRemaining / 60) !== 1 ? 's' : ''} remaining`,
        severity: 'info',
      };
    }
    
    if (warningToShow && warningToShow.message !== currentWarning?.message) {
      setCurrentWarning(warningToShow);
      onWarning?.(warningToShow);
    } else if (!warningToShow) {
      setCurrentWarning(null);
    }
  }, [timeRemaining, info, warning, urgent, currentWarning, onWarning]);
  
  return currentWarning;
}

