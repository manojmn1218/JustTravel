import { Router } from 'express'
import { prisma } from '../db/prisma'
import { asyncHandler } from '../lib/asyncHandler'
import { requireAuth } from '../middleware/auth'
import { requireRole } from '../middleware/rbac'

export const adminRouter = Router()

adminRouter.use(requireAuth, requireRole(['admin']))

// Dashboard stats
adminRouter.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const [totalUsers, totalBookings, totalFeedback, recentBookings] = await Promise.all([
      prisma.user.count(),
      prisma.booking.count(),
      prisma.feedback.count(),
      prisma.booking.aggregate({ _sum: { priceInr: true } }),
    ])
    res.json({
      stats: {
        totalUsers,
        totalBookings,
        totalFeedback,
        totalRevenue: recentBookings._sum.priceInr ?? 0,
      },
    })
  }),
)

// Users list
adminRouter.get(
  '/users',
  asyncHandler(async (_req, res) => {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })
    res.json({ users })
  }),
)

// Bookings list (with user info)
adminRouter.get(
  '/bookings',
  asyncHandler(async (_req, res) => {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, email: true } } },
    })
    res.json({ bookings })
  }),
)

// Feedback list
adminRouter.get(
  '/feedback',
  asyncHandler(async (_req, res) => {
    const feedback = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, email: true } } },
    })
    res.json({ feedback })
  }),
)
