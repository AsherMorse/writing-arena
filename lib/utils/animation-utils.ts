/**
 * Animation utility classes and helpers
 */

export const ANIMATIONS = {
  spin: 'animate-spin',
  bounce: 'animate-bounce',
  pulse: 'animate-pulse',
  ping: 'animate-ping',
} as const;

/**
 * Get spinner classes with size variant
 */
export function getSpinnerClasses(size: 'sm' | 'md' | 'lg' = 'md'): string {
  const sizes = {
    sm: 'h-8 w-8 border',
    md: 'h-16 w-16 border-b-2',
    lg: 'h-24 w-24 border-b-4',
  };
  
  return `${ANIMATIONS.spin} rounded-full ${sizes[size]} border-white`;
}

/**
 * Get bounce delay style for staggered animations
 */
export function getBounceDelay(index: number): string {
  return `style={{ animationDelay: '${index * 150}ms' }}`;
}

/**
 * Get loading dots container classes
 */
export function getLoadingDotsClasses(): string {
  return 'flex gap-2';
}

