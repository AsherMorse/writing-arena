declare global {
  interface Window {
    __debugDayOffset?: number;
    __debugPromptId?: string;
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

