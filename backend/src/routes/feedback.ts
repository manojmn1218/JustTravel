import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../db/prisma'
import { asyncHandler } from '../lib/asyncHandler'
import { requireAuth } from '../middleware/auth'
import { validateBody } from '../middleware/validate'

export const feedbackRouter = Router()

const CreateFeedbackSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(2),
  message: z.string().min(10),
})

// POST /api/feedback — authenticated users can submit feedback
feedbackRouter.post(
  '/',
  requireAuth,
  validateBody(CreateFeedbackSchema),
  asyncHandler(async (req, res) => {
    const userId = req.auth!.id
    const data = req.body as z.infer<typeof CreateFeedbackSchema>

    const feedback = await prisma.feedback.create({
      data: {
        ...data,
        userId,
      },
    })

    res.status(201).json({ feedback })
  }),
)
