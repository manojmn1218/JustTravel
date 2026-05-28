import jwt from 'jsonwebtoken'
import { getEnv } from '../env'

export type JwtPayload = {
  sub: string
  role: 'admin' | 'user'
}

export function signAccessToken(payload: JwtPayload): string {
  const env = getEnv()
  return jwt.sign(payload, env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: '2h',
  })
}

export function verifyAccessToken(token: string): JwtPayload {
  const env = getEnv()
  const decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] })
  if (
    typeof decoded !== 'object' ||
    decoded == null ||
    typeof (decoded as { sub?: unknown }).sub !== 'string' ||
    ((decoded as { role?: unknown }).role !== 'admin' &&
      (decoded as { role?: unknown }).role !== 'user')
  ) {
    throw new Error('Invalid token')
  }
  return decoded as JwtPayload
}
