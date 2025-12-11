declare global {
  interface Window {
    __debugDayOffset?: number;
    __debugPromptId?: string;
    __debugTimerPaused?: boolean;
  }
}

export function getDebugDayOffset(): number {
  if (typeof window === 'undefined') return 0;
  return window.__debugDayOffset ?? 0;
}

export function getDebugDate(): Date {
  const now = new Date();
  const offset = getDebugDayOffset();
  now.setDate(now.getDate() + offset);
  return now;
}

export function getDebugYesterday(): Date {
  const debugNow = getDebugDate();
  debugNow.setDate(debugNow.getDate() - 1);
  return debugNow;
}

export function setDebugDayOffset(offset: number): void {
  if (typeof window !== 'undefined') {
    window.__debugDayOffset = offset;
  }
}

export function getDebugPromptId(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return window.__debugPromptId;
}

export function setDebugPromptId(id: string | undefined): void {
  if (typeof window !== 'undefined') {
    window.__debugPromptId = id;
  }
}

/**
 * @description Check if debug timer is paused. Defaults to true in dev mode.
 */
export function isDebugTimerPaused(): boolean {
  if (typeof window === 'undefined') return false;
  return window.__debugTimerPaused ?? true;
}

/**
 * @description Set debug timer paused state and dispatch event for components to react.
 */
export function setDebugTimerPaused(paused: boolean): void {
  if (typeof window !== 'undefined') {
    window.__debugTimerPaused = paused;
    window.dispatchEvent(new CustomEvent('debug-timer-toggle', { detail: paused }));
  }
}

/**
 * @description Dispatch event to skip all timers to completion.
 */
export function skipDebugTimers(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('debug-timer-skip'));
  }
}

