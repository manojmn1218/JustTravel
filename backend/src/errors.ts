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
  const status = err instanceof HttpError ? err.status : 500
  const message = err instanceof Error ? err.message : 'Unknown error'

  res.status(status).json({
    error: {
      message,
      ...(err instanceof HttpError && err.details ? { details: err.details } : null),
    },
  })
}
