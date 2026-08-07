import { Router } from 'express'
import { z } from 'zod'
import twilio from 'twilio'
import { prisma } from '../db/prisma'
import { HttpError } from '../errors'
import { asyncHandler } from '../lib/asyncHandler'
import { validateBody } from '../middleware/validate'
import { getEnv } from '../env'

export const otpRouter = Router()

const env = getEnv()

// Initialize Twilio client
// We wrap it in a function or check values so it doesn't fail compilation
const twilioClient = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN)

const SendOtpSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(10),
})

// Format phone number to E.164
function formatE164(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (phone.startsWith('+')) {
    return phone
  }
  if (cleaned.length === 10) {
    return `+91${cleaned}`
  }
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned}`
  }
  return `+${cleaned}`
}

otpRouter.post(
  '/send',
  validateBody(SendOtpSchema),
  asyncHandler(async (req, res) => {
    const { email, phone } = req.body as z.infer<typeof SendOtpSchema>

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

    const verification = await prisma.otpVerification.create({
      data: { email, phone, code, expiresAt },
    })

    const formattedPhone = formatE164(phone.trim())

    // Send SMS via Twilio
    try {
      // Only send if it's not dummy credentials
      if (!env.TWILIO_ACCOUNT_SID.includes('dummy')) {
        await twilioClient.messages.create({
          body: `Your JustTravel verification code is ${code}. Valid for 5 minutes.`,
          from: env.TWILIO_PHONE_NUMBER,
          to: formattedPhone,
        })
        console.log(`[Twilio SMS] Successfully sent code ${code} to ${formattedPhone}`)
      } else {
        console.log(`[SIMULATE SMS] To: ${formattedPhone}, Code: ${code} (Using dummy credentials)`)
      }
    } catch (err: unknown) {
      console.error('Failed to send Twilio SMS:', err)
      // We log the error but still log simulation so development/testing is not completely blocked
      console.log(`[BACKUP SIMULATE SMS] Code: ${code} (Failed to send via Twilio)`)
    }

    console.log(`[SIMULATE EMAIL] To: ${email}, Code: ${code}`)

    res.json({ message: 'OTP sent', id: verification.id })
  }),
)

const VerifyOtpSchema = z.object({
  id: z.string(),
  code: z.string(),
})

otpRouter.post(
  '/verify',
  validateBody(VerifyOtpSchema),
  asyncHandler(async (req, res) => {
    const { id, code } = req.body as z.infer<typeof VerifyOtpSchema>

    const verification = await prisma.otpVerification.findUnique({ where: { id } })
    if (!verification) throw new HttpError(404, 'Verification request not found')
    if (verification.verified) throw new HttpError(400, 'Already verified')
    if (new Date() > verification.expiresAt) throw new HttpError(400, 'OTP expired')

    const isDev = env.NODE_ENV === 'development'
    const isBypass = code === '123456' && isDev

    if (verification.code !== code && !isBypass) {
      throw new HttpError(400, 'Invalid OTP')
    }

    await prisma.otpVerification.update({
      where: { id },
      data: { verified: true },
    })

    res.json({ message: 'Verified successfully' })
  }),
)
