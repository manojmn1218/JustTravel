import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../db/prisma'
import { HttpError } from '../errors'
import { asyncHandler } from '../lib/asyncHandler'
import { requireAuth } from '../middleware/auth'
import { validateBody } from '../middleware/validate'

export const bookingsRouter = Router()

bookingsRouter.use(requireAuth)

function getIdParam(raw: unknown): string {
  if (typeof raw === 'string' && raw.length > 0) return raw
  throw new HttpError(400, 'Invalid id parameter')
}

bookingsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const userId = req.auth!.id
    const bookings = await prisma.booking.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
    res.json({ bookings })
  }),
)

const CreateBookingSchema = z.object({
  package: z.string().min(2),
  priceInr: z.number().int().nonnegative(),
  travelDate: z.string().datetime(),
  travelers: z.number().int().min(1).max(10),
  paymentMethod: z.string(),
  transactionId: z.string(),
})

bookingsRouter.post(
  '/',
  validateBody(CreateBookingSchema),
  asyncHandler(async (req, res) => {
    const userId = req.auth!.id
    const body = req.body as z.infer<typeof CreateBookingSchema>

    const booking = await prisma.booking.create({
      data: {
        userId,
        package: body.package,
        priceInr: body.priceInr,
        travelDate: new Date(body.travelDate),
        travelers: body.travelers,
        paymentMethod: body.paymentMethod,
        transactionId: body.transactionId,
      },
    })
    res.status(201).json({ booking })
  }),
)

bookingsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const userId = req.auth!.id
    const id = getIdParam(req.params.id)
    const booking = await prisma.booking.findUnique({ where: { id } })
    if (!booking || booking.userId !== userId) throw new HttpError(404, 'Booking not found')
    res.json({ booking })
  }),
)

const UpdateBookingSchema = z.object({
  travelDate: z.string().datetime().optional(),
  travelers: z.number().int().min(1).max(10).optional(),
})

bookingsRouter.patch(
  '/:id',
  validateBody(UpdateBookingSchema),
  asyncHandler(async (req, res) => {
    const userId = req.auth!.id
    const id = getIdParam(req.params.id)
    const existing = await prisma.booking.findUnique({ where: { id } })
    if (!existing || existing.userId !== userId) throw new HttpError(404, 'Booking not found')

    const body = req.body as z.infer<typeof UpdateBookingSchema>
    const booking = await prisma.booking.update({
      where: { id: existing.id },
      data: {
        ...(body.travelDate ? { travelDate: new Date(body.travelDate) } : null),
        ...(body.travelers ? { travelers: body.travelers } : null),
      },
    })
    res.json({ booking })
  }),
)

bookingsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const userId = req.auth!.id
    const id = getIdParam(req.params.id)
    const existing = await prisma.booking.findUnique({ where: { id } })
    if (!existing || existing.userId !== userId) throw new HttpError(404, 'Booking not found')
    await prisma.booking.delete({ where: { id: existing.id } })
    res.status(204).send()
  }),
)

bookingsRouter.post(
  '/:id/cancel',
  asyncHandler(async (req, res) => {
    const userId = req.auth!.id
    const id = getIdParam(req.params.id)
    const booking = await prisma.booking.findUnique({ where: { id } })
    
    if (!booking || booking.userId !== userId) throw new HttpError(404, 'Booking not found')
    if (booking.status === 'cancelled') throw new HttpError(400, 'Booking is already cancelled')
    
    const now = new Date()
    const travelDate = new Date(booking.travelDate)
    
    const diffTime = travelDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    let refundPercent = 0
    if (diffDays > 7) {
      refundPercent = 90
    } else if (diffDays >= 3) {
      refundPercent = 50
    } else {
      refundPercent = 0
    }
    
    const refundAmount = Math.floor(booking.priceInr * (refundPercent / 100))
    
    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'cancelled',
        refundAmount
      }
    })
    
    res.json({ booking: updated })
  })
)
