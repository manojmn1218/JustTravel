import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../db/prisma'
import { asyncHandler } from '../lib/asyncHandler'
import { requireAuth } from '../middleware/auth'
import { requireRole } from '../middleware/rbac'
import { validateBody } from '../middleware/validate'

export const locationsRouter = Router()

// GET /api/locations — public (no auth required)
locationsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { category } = req.query
    const where: any = {}
    if (category) {
      where.category = String(category)
    }
    const locations = await prisma.location.findMany({
      where,
      orderBy: [{ popular: 'desc' }, { createdAt: 'asc' }],
    })
    res.json({ locations })
  }),
)

const CreateLocationSchema = z.object({
  name: z.string().min(2),
  category: z.enum(['beach', 'city', 'mountain']),
  duration: z.string().min(1),
  price: z.number().int().positive(),
  image: z.string().min(1),
  description: z.string().min(5),
  rating: z.number().min(0).max(5).default(4.5),
  popular: z.boolean().default(false),
})

// POST /api/locations — admin only
locationsRouter.post(
  '/',
  requireAuth,
  requireRole(['admin']),
  validateBody(CreateLocationSchema),
  asyncHandler(async (req, res) => {
    const data = req.body as z.infer<typeof CreateLocationSchema>
    const location = await prisma.location.create({ data })
    res.status(201).json({ location })
  }),
)

// DELETE /api/locations/:id — admin only
locationsRouter.delete(
  '/:id',
  requireAuth,
  requireRole(['admin']),
  asyncHandler(async (req, res) => {
    const id = String(req.params.id)
    await prisma.location.delete({ where: { id } })
    res.status(204).send()
  }),
)
