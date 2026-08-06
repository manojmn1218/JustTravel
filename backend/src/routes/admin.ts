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

// Delete a user (admin cannot delete themselves)
adminRouter.delete(
  '/users/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id as string
    const currentUserId = req.auth!.id

    if (id === currentUserId) {
      res.status(400).json({ error: { message: 'You cannot delete your own account.' } })
      return
    }

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      res.status(404).json({ error: { message: 'User not found.' } })
      return
    }

    // Delete related OTP verifications by email
    await prisma.otpVerification.deleteMany({ where: { email: user.email } })

    // Bookings cascade-delete via schema, just delete the user
    await prisma.user.delete({ where: { id } })

    res.json({ message: 'User deleted successfully.' })
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
