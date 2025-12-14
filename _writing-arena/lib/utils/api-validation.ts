/**
 * API request body validation utilities
 */

import { createErrorResponse } from './api-responses';
import { NextResponse } from 'next/server';

export interface ValidationRule<T> {
  field: keyof T;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
  validator?: (value: any) => boolean | string; // Returns true if valid, or error message string
  customError?: string;
}

export interface ValidationResult<T> {
  valid: boolean;
  data?: T;
  error?: string;
}

/**
 * Validate request body against rules
 */
export function validateRequestBody<T extends Record<string, any>>(
  body: any,
  rules: ValidationRule<T>[]
): ValidationResult<T> {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  for (const rule of rules) {
    const value = body[rule.field as string];

    // Check required fields
    if (rule.required && (value === undefined || value === null || value === '')) {
      return {
        valid: false,
        error: rule.customError || `${String(rule.field)} is required`,
      };
    }

    // Skip type checking if field is not required and missing
    if (!rule.required && (value === undefined || value === null)) {
      continue;
    }

    // Check type
    if (rule.type) {
      const typeCheck = checkType(value, rule.type);
      if (!typeCheck.valid) {
        return {
          valid: false,
          error: rule.customError || `${String(rule.field)} must be of type ${rule.type}`,
        };
      }
    }

    // Run custom validator
    if (rule.validator) {
      const validatorResult = rule.validator(value);
      if (validatorResult !== true) {
        return {
          valid: false,
          error: rule.customError || (typeof validatorResult === 'string' ? validatorResult : `${String(rule.field)} is invalid`),
        };
      }
    }
  }

  return { valid: true, data: body as T };
}

/**
 * Check if value matches expected type
 */
function checkType(value: any, expectedType: string): { valid: boolean; error?: string } {
  switch (expectedType) {
    case 'string':
      return { valid: typeof value === 'string' };
    case 'number':
      return { valid: typeof value === 'number' && !isNaN(value) };
    case 'boolean':
      return { valid: typeof value === 'boolean' };
    case 'array':
      return { valid: Array.isArray(value) };
    case 'object':
      return { valid: typeof value === 'object' && value !== null && !Array.isArray(value) };
    default:
      return { valid: false, error: `Unknown type: ${expectedType}` };
  }
}

/**
 * Validate array length
 */
export function validateArrayLength<T>(
  array: T[] | undefined | null,
  minLength: number,
  maxLength?: number
): boolean | string {
  if (!array || !Array.isArray(array)) {
    return `Must be an array`;
  }
  if (array.length < minLength) {
    return `Must have at least ${minLength} items`;
  }
  if (maxLength !== undefined && array.length > maxLength) {
    return `Must have at most ${maxLength} items`;
  }
  return true;
}

/**
 * Helper to create validation rules for common patterns
 */
export const ValidationHelpers = {
  requiredString: <T>(field: keyof T, customError?: string): ValidationRule<T> => ({
    field,
    required: true,
    type: 'string',
    customError,
  }),

  requiredArray: <T>(field: keyof T, minLength?: number, customError?: string): ValidationRule<T> => ({
    field,
    required: true,
    type: 'array',
    validator: (value) => {
      if (minLength !== undefined) {
        return validateArrayLength(value, minLength);
      }
      return true;
    },
    customError,
  }),

  optionalString: <T>(field: keyof T): ValidationRule<T> => ({
    field,
    required: false,
    type: 'string',
  }),

  optionalNumber: <T>(field: keyof T): ValidationRule<T> => ({
    field,
    required: false,
    type: 'number',
  }),
};

/**
 * Validate and return error response if invalid
 * Use this helper in API routes for cleaner code
 */
export function validateOrError<T extends Record<string, any> = Record<string, any>>(
  body: any,
  rules: ValidationRule<T>[]
): { valid: true; data: T } | { valid: false; response: NextResponse } {
  const result = validateRequestBody<T>(body, rules);
  if (!result.valid) {
    return { valid: false, response: createErrorResponse(result.error || 'Invalid request', 400) };
  }
  return { valid: true, data: result.data! };
}

