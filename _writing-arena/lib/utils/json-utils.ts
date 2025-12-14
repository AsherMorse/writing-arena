/**
 * JSON parsing and serialization utilities
 * Provides safe JSON operations with consistent error handling
 */

/**
 * Safely parse JSON string with error handling
 * 
 * @param json - JSON string to parse
 * @param fallback - Fallback value if parsing fails (default: null)
 * @returns Parsed object or fallback value
 * 
 * @example
 * ```ts
 * const data = safeParseJSON('{"key": "value"}'); // { key: "value" }
 * const fallback = safeParseJSON('invalid', {}); // {}
 * ```
 */
export function safeParseJSON<T>(json: string, fallback?: T): T | null {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    console.error('❌ JSON PARSE - Failed to parse JSON:', error);
    if (fallback !== undefined) {
      return fallback;
    }
    return null;
  }
}

/**
 * Safely stringify an object to JSON
 * 
 * @param obj - Object to stringify
 * @param fallback - Fallback string if stringification fails (default: '{}')
 * @returns JSON string or fallback
 * 
 * @example
 * ```ts
 * const json = safeStringifyJSON({ key: 'value' }); // '{"key":"value"}'
 * const fallback = safeStringifyJSON(circularObj, '{}'); // '{}'
 * ```
 */
export function safeStringifyJSON(obj: any, fallback: string = '{}'): string {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    console.error('❌ JSON STRINGIFY - Failed to stringify:', error);
    return fallback;
  }
}

/**
 * Parse JSON response from a fetch Response object
 * 
 * @param response - Fetch Response object
 * @returns Parsed JSON data
 * @throws Error if parsing fails
 * 
 * @example
 * ```ts
 * const response = await fetch('/api/data');
 * const data = await parseJSONResponse<MyType>(response);
 * ```
 */
export async function parseJSONResponse<T>(response: Response): Promise<T> {
  try {
    return await response.json() as T;
  } catch (error) {
    console.error('❌ JSON RESPONSE - Failed to parse response:', error);
    throw new Error(`Failed to parse JSON response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Deep clone an object using JSON serialization
 * Note: This only works for JSON-serializable objects (no functions, dates, etc.)
 * 
 * @param obj - Object to clone
 * @returns Cloned object
 * 
 * @example
 * ```ts
 * const original = { a: 1, b: { c: 2 } };
 * const cloned = deepClone(original);
 * ```
 */
export function deepClone<T>(obj: T): T {
  return safeParseJSON<T>(safeStringifyJSON(obj)) as T;
}

/**
 * Check if a string is valid JSON
 * 
 * @param str - String to check
 * @returns True if string is valid JSON
 * 
 * @example
 * ```ts
 * isValidJSON('{"key": "value"}'); // true
 * isValidJSON('invalid'); // false
 * ```
 */
export function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

