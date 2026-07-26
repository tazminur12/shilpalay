import { NextResponse } from 'next/server';

/**
 * Map common Mongoose / Mongo errors to API responses.
 */
export function mongoErrorResponse(error, fallbackMessage) {
  if (error?.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || 'field';
    return NextResponse.json(
      { message: `${field} already exists` },
      { status: 400 }
    );
  }

  if (error?.name === 'ValidationError') {
    const errors = Object.values(error.errors || {}).map((err) => err.message);
    return NextResponse.json(
      { message: errors[0] || 'Validation error', errors },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { message: error?.message || fallbackMessage },
    { status: 500 }
  );
}
