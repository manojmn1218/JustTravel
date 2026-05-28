import type { RequestHandler } from 'express'
import { HttpError } from '../errors'
import { verifyAccessToken } from '../lib/jwt'

export type AuthUser = {
  id: string
  role: 'admin' | 'user'
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AuthUser
    }
  }
}

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.header('authorization')
  if (!header) return next(new HttpError(401, 'Missing Authorization header'))

  const [scheme, token] = header.split(' ')
  if (scheme !== 'Bearer' || !token) return next(new HttpError(401, 'Invalid Authorization header'))

  try {
    const payload = verifyAccessToken(token)
    req.auth = { id: payload.sub, role: payload.role }
    next()
  } catch {
    next(new HttpError(401, 'Invalid or expired token'))
  }
}
