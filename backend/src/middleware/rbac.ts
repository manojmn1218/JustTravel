import type { RequestHandler } from 'express'
import { HttpError } from '../errors'

export function requireRole(allowed: Array<'admin' | 'user'>): RequestHandler {
  return (req, _res, next) => {
    if (!req.auth) return next(new HttpError(401, 'Not authenticated'))
    if (!allowed.includes(req.auth.role)) return next(new HttpError(403, 'Forbidden'))
    next()
  }
}
