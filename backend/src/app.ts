import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import { getEnv } from './env'
import { errorHandler, HttpError } from './errors'
import { authRouter } from './routes/auth'
import { bookingsRouter } from './routes/bookings'
import { adminRouter } from './routes/admin'
import { locationsRouter } from './routes/locations'
import { feedbackRouter } from './routes/feedback'

export function createApp() {
  const env = getEnv()
  const app = express()

  app.set('trust proxy', 1)

  app.use(helmet())
  app.use(
    cors({
      origin: function (origin, callback) {
        if (!origin) return callback(null, true)
        if (origin === env.CORS_ORIGIN || origin.endsWith('.vercel.app')) {
          return callback(null, true)
        }
        return callback(null, false)
      },
      credentials: true,
    }),
  )
  app.use(express.json({ limit: '1mb' }))
  app.use(
    rateLimit({
      windowMs: 60_000,
      limit: 120,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
    }),
  )

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true })
  })

  app.use('/api/auth', authRouter)
  app.use('/api/bookings', bookingsRouter)
  app.use('/api/admin', adminRouter)
  app.use('/api/locations', locationsRouter)
  app.use('/api/feedback', feedbackRouter)

  // Fallback for any other /api route
  app.use('/api', (_req, _res, next) => next(new HttpError(404, 'Not found')))

  app.use(errorHandler)

  return app
}
