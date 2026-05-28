import bcrypt from 'bcrypt'
import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../db/prisma'
import { HttpError } from '../errors'
import { asyncHandler } from '../lib/asyncHandler'
import { signAccessToken } from '../lib/jwt'
import { requireAuth } from '../middleware/auth'
import { validateBody } from '../middleware/validate'

export const authRouter = Router()

const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
})

authRouter.post(
  '/register',
  validateBody(RegisterSchema),
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body as z.infer<typeof RegisterSchema>
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) throw new HttpError(409, 'User already exists')

    const role: 'admin' | 'user' = email === 'admin@travel.com' ? 'admin' : 'user'
    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: { name, email, passwordHash, role },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true,
        phone: true,
        address: true,
        profilePic: true
      },
    })

    const token = signAccessToken({ sub: user.id, role: user.role as 'admin' | 'user' })
    res.status(201).json({ token, user })
  }),
)

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

authRouter.post(
  '/login',
  validateBody(LoginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body as z.infer<typeof LoginSchema>
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) throw new HttpError(401, 'Invalid credentials')

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) throw new HttpError(401, 'Invalid credentials')

    const token = signAccessToken({ sub: user.id, role: user.role as 'admin' | 'user' })
    res.json({
      token,
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        phone: user.phone,
        address: user.address,
        profilePic: user.profilePic
      },
    })
  }),
)

authRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.auth!.id
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        address: true,
        profilePic: true,
      },
    })
    if (!user) throw new HttpError(404, 'User not found')
    res.json({ user })
  }),
)

const UpdateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  profilePic: z.string().nullable().optional(),
  otp: z.string().optional(),
})

authRouter.post(
  '/send-otp',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.auth!.id
    
    // Generate 6 digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000) // 5 mins
    
    await prisma.user.update({
      where: { id: userId },
      data: { otpCode, otpExpiry }
    })
    
    console.log(`\n==============================\n[OTP SIMULATION] OTP for user ${userId} is: ${otpCode}\n==============================\n`)
    
    res.json({ message: 'OTP sent' })
  })
)

authRouter.patch(
  '/me',
  requireAuth,
  validateBody(UpdateProfileSchema),
  asyncHandler(async (req, res) => {
    const userId = req.auth!.id
    const data = req.body as z.infer<typeof UpdateProfileSchema>

    const currentUser = await prisma.user.findUnique({ where: { id: userId } })
    if (!currentUser) throw new HttpError(404, 'User not found')

    if (data.email || data.phone !== undefined) {
      if ((data.email && data.email !== currentUser.email) || (data.phone !== undefined && data.phone !== currentUser.phone)) {
        if (!data.otp) throw new HttpError(400, 'OTP is required to update email or phone number.')
        
        if (!currentUser.otpCode || !currentUser.otpExpiry) throw new HttpError(400, 'No OTP requested or OTP expired.')
        
        if (new Date() > currentUser.otpExpiry) {
          await prisma.user.update({ where: { id: userId }, data: { otpCode: null, otpExpiry: null } })
          throw new HttpError(400, 'OTP has expired. Please request a new one.')
        }
        
        if (currentUser.otpCode !== data.otp) throw new HttpError(400, 'Invalid OTP.')
      }
    }

    const { otp, ...updateData } = data
    const cleanedData = Object.fromEntries(Object.entries(updateData).filter(([_, v]) => v !== undefined))

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...cleanedData,
        otpCode: null,
        otpExpiry: null
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        address: true,
        profilePic: true,
      },
    })

    res.json({ user })
  }),
)

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
})

authRouter.patch(
  '/password',
  requireAuth,
  validateBody(ChangePasswordSchema),
  asyncHandler(async (req, res) => {
    const userId = req.auth!.id
    const { currentPassword, newPassword } = req.body as z.infer<typeof ChangePasswordSchema>

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new HttpError(404, 'User not found')

    const valid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!valid) throw new HttpError(401, 'Current password is incorrect')

    const newHash = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({ where: { id: userId }, data: { passwordHash: newHash } })

    res.json({ message: 'Password changed successfully' })
  }),
)
