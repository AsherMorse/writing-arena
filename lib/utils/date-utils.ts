/**
 * Date and time formatting utilities
 * Provides consistent date formatting across the application
 */

export type DateFormat = 'short' | 'long' | 'iso' | 'time' | 'date';

export type DateInput = Date | string | number;

/**
 * Format a date with various options
 * 
 * @param date - Date to format (Date, string, or timestamp)
 * @param format - Format type: 'short', 'long', 'iso', 'time', or 'date'
 * @returns Formatted date string
 * 
 * @example
 * ```ts
 * formatDate(new Date(), 'short') // "Jan 15, 2024"
 * formatDate(Date.now(), 'long') // "January 15, 2024, 2:30 PM"
 * formatDate('2024-01-15', 'iso') // "2024-01-15T00:00:00.000Z"
 * ```
 */
export function formatDate(date: DateInput, format: DateFormat = 'short'): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  // Validate date
  if (isNaN(d.getTime())) {
    console.warn('⚠️ DATE UTILS - Invalid date provided:', date);
    return 'Invalid Date';
  }
  
  switch (format) {
    case 'iso':
      return d.toISOString();
    
    case 'long':
      return d.toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    
    case 'time':
      return d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    
    case 'date':
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    
    case 'short':
    default:
      return d.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
      });
  }
}

/**
 * Format a timestamp (number) to a readable date string
 * 
 * @param timestamp - Unix timestamp in milliseconds
 * @param format - Format type (default: 'long')
 * @returns Formatted date string
 */
export function formatTimestamp(timestamp: number, format: DateFormat = 'long'): string {
  return formatDate(timestamp, format);
}

/**
 * Get current timestamp in milliseconds
 * 
 * @returns Current timestamp
 */
export function getCurrentTimestamp(): number {
  return Date.now();
}

/**
 * Format a date for display in chat/conversation contexts
 * Shows relative time if recent, otherwise formatted date
 * 
 * @param date - Date to format
 * @returns Formatted date string with relative time if applicable
 */
export function formatChatDate(date: DateInput): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) {
    return 'Just now';
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else {
    return formatDate(d, 'short');
  }
}

/**
 * Format a date range (start and end dates)
 * 
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Formatted date range string
 */
export function formatDateRange(startDate: DateInput, endDate: DateInput): string {
  const start = formatDate(startDate, 'short');
  const end = formatDate(endDate, 'short');
  return `${start} - ${end}`;
}

