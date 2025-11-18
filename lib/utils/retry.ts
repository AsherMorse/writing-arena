/**
 * Retry logic utilities for async operations
 */

export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  onRetry?: (attempt: number) => void;
  exponentialBackoff?: boolean;
}

/**
 * Retry an async operation with configurable attempts and delays
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T | null>,
  options: RetryOptions = {}
): Promise<T | null> {
  const { 
    maxAttempts = 5, 
    delayMs = 1500, 
    onRetry,
    exponentialBackoff = false,
  } = options;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const result = await fn();
      if (result) return result;
    } catch (error) {
      console.error(`Attempt ${attempt + 1}/${maxAttempts} failed:`, error);
    }
    
    if (attempt < maxAttempts - 1) {
      onRetry?.(attempt + 1);
      const delay = exponentialBackoff 
        ? delayMs * Math.pow(2, attempt)
        : delayMs;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return null;
}

/**
 * Retry an async operation until it succeeds or max attempts reached
 */
export async function retryUntilSuccess<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T | null> {
  const { 
    maxAttempts = 5, 
    delayMs = 1500, 
    onRetry,
  } = options;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      console.error(`Attempt ${attempt + 1}/${maxAttempts} failed:`, error);
      
      if (attempt < maxAttempts - 1) {
        onRetry?.(attempt + 1);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  
  return null;
}

