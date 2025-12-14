/**
 * Standardized API response utilities
 */

import { NextResponse } from 'next/server';

/**
 * Create a standardized error response
 */
export function createErrorResponse(message: string, status: number = 400): NextResponse {
  return NextResponse.json(
    { error: message },
    { status }
  );
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(data: T, status: number = 200): NextResponse<T> {
  return NextResponse.json(data, { status });
}

