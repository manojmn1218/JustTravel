import { Router } from 'express'
import { z } from 'zod'
import crypto from 'crypto'
import { HttpError } from '../errors'
import { asyncHandler } from '../lib/asyncHandler'
import { requireAuth } from '../middleware/auth'
import { validateBody } from '../middleware/validate'

export const paymentsRouter = Router()

// Payments are only allowed for authenticated users
paymentsRouter.use(requireAuth)

const ProcessPaymentSchema = z.object({
  method: z.enum(['upi', 'card']),
  amount: z.number().int().positive(),
  upiId: z.string().optional(),
  cardNumber: z.string().optional(),
  expiry: z.string().optional(),
  cvv: z.string().optional(),
})

paymentsRouter.post(
  '/process',
  validateBody(ProcessPaymentSchema),
  asyncHandler(async (req, res) => {
    const { method, amount, upiId, cardNumber, expiry, cvv } = req.body as z.infer<
      typeof ProcessPaymentSchema
    >

    if (method === 'upi') {
      if (!upiId) {
        throw new HttpError(400, 'UPI ID is required for UPI payments.')
      }
      if (!/^[a-zA-Z0-9.\-_]{3,30}@[a-zA-Z]{2,15}$/.test(upiId!.trim())) {
        throw new HttpError(400, 'Please enter a valid UPI ID (e.g. name@bank).')
      }
    } else if (method === 'card') {
      if (!cardNumber || !expiry || !cvv) {
        throw new HttpError(400, 'Card number, expiry date, and CVV are required.')
      }
      if (cardNumber.trim().length !== 16 || cvv.trim().length < 3) {
        throw new HttpError(400, 'Please enter a valid 16-digit card number and CVV.')
      }

      const parts = expiry!.split('/')
      const mm = parts[0]
      const yy = parts[1]

      if (!mm || !yy) {
        throw new HttpError(400, 'Please enter a valid, unexpired Expiry Date (MM/YY).')
      }

      const month = parseInt(mm, 10)
      const year = parseInt(`20${yy}`, 10)
      const now = new Date()

      if (
        month < 1 ||
        month > 12 ||
        year < now.getFullYear() ||
        (year === now.getFullYear() && month < now.getMonth() + 1)
      ) {
        throw new HttpError(400, 'Please enter a valid, unexpired Expiry Date (MM/YY).')
      }
    }

    // Generate a simulated transaction ID
    const transactionId = `txn_${crypto.randomUUID().replace(/-/g, '').substring(0, 16)}`

    res.json({
      success: true,
      transactionId,
      message: 'Payment processed successfully',
    })
  }),
)
