import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../db/prisma'
import { HttpError } from '../errors'
import { asyncHandler } from '../lib/asyncHandler'
import { validateBody } from '../middleware/validate'
import { getEnv } from '../env'

export const otpRouter = Router()

const env = getEnv()

const SendOtpSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(10),
})

otpRouter.post('/send', validateBody(SendOtpSchema), asyncHandler(async (req, res) => {
  const { email, phone } = req.body as z.infer<typeof SendOtpSchema>
  
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000)
  
  const verification = await prisma.otpVerification.create({
    data: { email, phone, code, expiresAt }
  })
  
  console.log(`[SIMULATE EMAIL] To: ${email}, Code: ${code}`)
  console.log(`[SIMULATE SMS] To: ${phone}, Code: ${code}`)

  res.json({ message: 'OTP sent', id: verification.id })
}))

const VerifyOtpSchema = z.object({
  id: z.string(),
  code: z.string()
})

otpRouter.post('/verify', validateBody(VerifyOtpSchema), asyncHandler(async (req, res) => {
  const { id, code } = req.body as z.infer<typeof VerifyOtpSchema>
  
  const verification = await prisma.otpVerification.findUnique({ where: { id } })
  if (!verification) throw new HttpError(404, 'Verification request not found')
  if (verification.verified) throw new HttpError(400, 'Already verified')
  if (new Date() > verification.expiresAt) throw new HttpError(400, 'OTP expired')
  if (verification.code !== code) throw new HttpError(400, 'Invalid OTP')
  
  await prisma.otpVerification.update({
    where: { id },
    data: { verified: true }
  })
  
  res.json({ message: 'Verified successfully' })
}))
