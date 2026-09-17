import type { ErrorRequestHandler } from 'express'

export class HttpError extends Error {
  readonly status: number
  readonly details?: unknown

  constructor(status: number, message: string, details?: unknown) {
    super(message)
    this.status = status
    this.details = details
  }
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const isProduction = process.env.NODE_ENV === 'production'

  if (err instanceof HttpError) {
    res.status(err.status).json({
      error: {
        message: err.message,
        ...(err.details && !isProduction ? { details: err.details } : null),
      },
    })
    return
  }

  // For unexpected errors, hide details in production
  if (!isProduction) {
    console.error('[ERROR]', err)
  }

  res.status(500).json({
    error: {
      message: isProduction ? 'Internal server error' : (err instanceof Error ? err.message : 'Unknown error'),
    },
  })
}

