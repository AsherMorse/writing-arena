/**
 * Centralized Logging Utility
 * 
 * Provides consistent logging format across the application.
 * Supports context-based logging with emoji prefixes for better visual scanning.
 * 
 * @example
 * ```typescript
 * import { logger } from '@/lib/utils/logger';
 * 
 * logger.info('MODULE', 'Operation completed successfully');
 * logger.error('MODULE', 'Operation failed', error);
 * logger.warn('MODULE', 'Using fallback value');
 * logger.debug('MODULE', 'Debug information', { data });
 * ```
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogOptions {
  context?: string;
  data?: any;
}

/**
 * Centralized logger with consistent formatting
 */
export const logger = {
  /**
   * Log informational messages (✅ prefix)
   */
  info: (context: string, message: string, data?: any): void => {
    console.log(`✅ ${context} - ${message}`, data || '');
  },

  /**
   * Log warning messages (⚠️ prefix)
   */
  warn: (context: string, message: string, data?: any): void => {
    console.warn(`⚠️ ${context} - ${message}`, data || '');
  },

  /**
   * Log error messages (❌ prefix)
   */
  error: (context: string, message: string, error?: Error | unknown, data?: any): void => {
    console.error(`❌ ${context} - ${message}`, error || '', data || '');
  },

  /**
   * Log debug messages (🔍 prefix) - only in development
   */
  debug: (context: string, message: string, data?: any): void => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 ${context} - ${message}`, data || '');
    }
  },
};

/**
 * Create a logger instance with a fixed context
 * Useful for module-level logging where context is always the same
 * 
 * @example
 * ```typescript
 * const moduleLogger = createLogger('SESSION MANAGER');
 * moduleLogger.info('Session created successfully');
 * moduleLogger.error('Failed to create session', error);
 * ```
 */
export function createLogger(context: string) {
  return {
    info: (message: string, data?: any) => logger.info(context, message, data),
    warn: (message: string, data?: any) => logger.warn(context, message, data),
    error: (message: string, error?: Error | unknown, data?: any) => logger.error(context, message, error, data),
    debug: (message: string, data?: any) => logger.debug(context, message, data),
  };
}

/**
 * Common log contexts used throughout the application
 * Use these constants for consistency
 */
export const LOG_CONTEXTS = {
  SESSION_MANAGER: 'SESSION MANAGER',
  SESSION_OPERATIONS: 'SESSION OPERATIONS',
  BATCH_RANKING: 'BATCH RANKING',
  IMPROVE_CHAT: 'IMPROVE CHAT',
  IMPROVE_ANALYZE: 'IMPROVE ANALYZE',
  RESULTS: 'RESULTS',
  REVISION: 'REVISION',
  PEER_FEEDBACK: 'PEER FEEDBACK',
  WRITING_SESSION: 'WRITING SESSION',
  PHASE_RANKINGS: 'PHASE RANKINGS',
  WAITING: 'WAITING',
  GENERATE_FEEDBACK: 'GENERATE FEEDBACK',
  AP_LANG_GRADE: 'AP LANG GRADE',
  RANKINGS_FETCHER: 'RANKINGS FETCHER',
  FIRESTORE_MATCH_STATE: 'FIRESTORE MATCH STATE',
  SESSION_FROM_PARAMS: 'SESSION FROM PARAMS',
  MOCK_GENERATOR: 'MOCK GENERATOR',
  AI_SUBMISSION: 'AI SUBMISSION',
  AUTO_SUBMIT: 'AUTO-SUBMIT',
  WAITING_FOR_PLAYERS: 'WAITING FOR PLAYERS',
  QUICK_MATCH: 'QUICK MATCH',
  PRACTICE: 'PRACTICE',
  PROFILE: 'PROFILE',
  DASHBOARD: 'DASHBOARD',
  AUTH: 'AUTH',
} as const;

