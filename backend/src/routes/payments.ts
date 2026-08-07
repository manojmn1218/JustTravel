import { Router } from 'express'
import { z } from 'zod'
import crypto from 'crypto'
import Razorpay from 'razorpay'
import { HttpError } from '../errors'
import { asyncHandler } from '../lib/asyncHandler'
import { requireAuth } from '../middleware/auth'
import { validateBody } from '../middleware/validate'
import { getEnv } from '../env'

export const paymentsRouter = Router()

paymentsRouter.use(requireAuth)

const env = getEnv()

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
})

// ── Step 1: Create a Razorpay order ──────────────────────
const CreateOrderSchema = z.object({
  amount: z.number().int().positive(),
})

paymentsRouter.post(
  '/create-order',
  validateBody(CreateOrderSchema),
  asyncHandler(async (req, res) => {
    const { amount } = req.body as z.infer<typeof CreateOrderSchema>

    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    })

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: env.RAZORPAY_KEY_ID, // frontend needs this to open checkout
    })
  }),
)

// ── Step 2: Verify payment after Razorpay checkout ───────
const VerifyPaymentSchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
})

paymentsRouter.post(
  '/verify',
  validateBody(VerifyPaymentSchema),
  asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body as z.infer<typeof VerifyPaymentSchema>

    // Verify signature using HMAC SHA256
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      throw new HttpError(400, 'Payment verification failed. Invalid signature.')
    }

    res.json({
      success: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    })
  }),
)
