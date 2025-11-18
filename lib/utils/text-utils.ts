/**
 * Text utility functions
 */

export function countWords(text: string): number {
  if (!text || typeof text !== 'string') return 0;
  return text.trim().split(/\s+/).filter((w: string) => w.length > 0).length;
}

export function countCharacters(text: string): number {
  if (!text || typeof text !== 'string') return 0;
  return text.trim().length;
}

export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function isEmpty(text: string | null | undefined): boolean {
  return !text || text.trim().length === 0;
}

