import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../db/prisma'
import { HttpError } from '../errors'
import { asyncHandler } from '../lib/asyncHandler'
import { validateBody } from '../middleware/validate'
import { Resend } from 'resend'
import twilio from 'twilio'
import { getEnv } from '../env'

export const otpRouter = Router()

const env = getEnv()
const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null
const twilioClient = (env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN) 
  ? twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN) 
  : null

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
  
  if (resend) {
    try {
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        subject: 'Your Booking OTP Verification Code',
        html: `<p>Your verification code is: <strong>${code}</strong></p><p>It expires in 5 minutes.</p>`,
      })
    } catch (e) {
      console.error('Resend error:', e)
    }
  } else {
    console.log(`[SIMULATE EMAIL] To: ${email}, Code: ${code}`)
  }

  if (twilioClient && env.TWILIO_FROM_NUMBER) {
    try {
      let toPhone = phone
      if (!toPhone.startsWith('+')) {
        toPhone = `+91${phone}`
      }
      
      await twilioClient.messages.create({
        body: `Your JustTravel booking verification code is: ${code}`,
        from: env.TWILIO_FROM_NUMBER,
        to: toPhone
      })
    } catch (e) {
      console.error('Twilio error:', e)
    }
  } else {
    console.log(`[SIMULATE SMS] To: ${phone}, Code: ${code}`)
  }

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
