import type { RequestHandler } from 'express'
import type { ZodSchema } from 'zod'
import { HttpError } from '../errors'

export function validateBody<T>(schema: ZodSchema<T>): RequestHandler {
  return (req, _res, next) => {
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) {
      return next(new HttpError(400, 'Invalid request body', parsed.error.flatten()))
    }
    req.body = parsed.data
    next()
  }
}
