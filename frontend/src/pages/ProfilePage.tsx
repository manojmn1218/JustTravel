import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { FormField, TextArea, TextInput } from '../components/ui/FormField'
import { useAuth } from '../features/auth/AuthProvider'
import { useTheme, type ThemePreference } from '../components/theme/ThemeProvider'
import { ApiError, apiFetch } from '../lib/api'

/* ── types ────────────────────────────────────────────── */

type Tab = 'profile' | 'bookings' | 'settings' | 'support'

type Booking = {
  id: string
  package: string
  priceInr: number
  travelDate: string
  travelers: number
  status: string
  refundAmount?: number | null
}

/* ── icons (inline SVGs) ──────────────────────────────── */

function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function SupportIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function MonitorIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

function CameraIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
    </svg>
  )
}

/* ── PasswordInput component ─────────────────────────── */

function PasswordInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pr-10 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  )
}

/* ── Change Password Card ────────────────────────────── */

function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!currentPassword) return setError('Current password is required.')
    if (newPassword.length < 6) return setError('New password must be at least 6 characters.')
    if (newPassword !== confirmPassword) return setError('Passwords do not match.')
    if (currentPassword === newPassword) return setError('New password must be different from current password.')

    setSaving(true)
    try {
      await apiFetch('/api/auth/password', {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      setSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to change password.')
    } finally {
      setSaving(false)
    }
  }

  const canSubmit = currentPassword && newPassword.length >= 6 && confirmPassword === newPassword

  return (
    <Card className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="grid size-10 place-items-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300">
          <LockIcon />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Change Password</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Update your account password</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-1">
          <div className="grid gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Current Password</label>
            <PasswordInput
              value={currentPassword}
              onChange={(e) => { setCurrentPassword(e.target.value); setSuccess(false); setError(null) }}
              placeholder="Enter current password"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">New Password</label>
              <PasswordInput
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setSuccess(false); setError(null) }}
                placeholder="Min 6 characters"
              />
            </div>
            <div className="grid gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Confirm New Password</label>
              <PasswordInput
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setSuccess(false); setError(null) }}
                placeholder="Re-enter new password"
              />
            </div>
          </div>
        </div>

        {/* Password strength hint */}
        {newPassword.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex flex-1 gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={[
                    'h-1 flex-1 rounded-full transition-colors',
                    newPassword.length >= i * 3
                      ? i <= 1 ? 'bg-rose-400' : i <= 2 ? 'bg-amber-400' : i <= 3 ? 'bg-emerald-400' : 'bg-emerald-500'
                      : 'bg-slate-200 dark:bg-slate-700',
                  ].join(' ')}
                />
              ))}
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {newPassword.length < 6 ? 'Too short' : newPassword.length < 9 ? 'Fair' : newPassword.length < 12 ? 'Good' : 'Strong'}
            </span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="size-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            Password changed successfully!
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!canSubmit || saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-slate-950"
          >
            {saving ? (
              <>
                <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Updating…
              </>
            ) : (
              <>
                <LockIcon />
                Update Password
              </>
            )}
          </button>
        </div>
      </form>
    </Card>
  )
}

/* ── Support Form (inline) ───────────────────────────── */

function SupportTab({ userName, userEmail }: { userName: string; userEmail: string }) {
  const [form, setForm] = useState({
    name: userName,
    email: userEmail,
    subject: '',
    message: '',
  })
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  function isEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    const trimmed = {
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
    }

    if (trimmed.name.length < 2) return setError('Please enter your name.')
    if (!isEmail(trimmed.email)) return setError('Please enter a valid email.')
    if (trimmed.subject.length < 2) return setError('Please enter a subject.')
    if (trimmed.message.length < 10) return setError('Please describe your issue in a bit more detail.')

    setSending(true)

    // Save to localStorage (same as before) + try API
    const feedback = { ...trimmed, dateIso: new Date().toISOString() }
    const feedbacks = JSON.parse(localStorage.getItem('feedbacks') ?? '[]')
    feedbacks.push(feedback)
    localStorage.setItem('feedbacks', JSON.stringify(feedbacks))

    try {
      await apiFetch('/api/feedback', {
        method: 'POST',
        body: JSON.stringify(trimmed),
      })
    } catch {
      // Even if API call fails, the feedback was saved locally
    }

    setSending(false)
    setForm({ name: userName, email: userEmail, subject: '', message: '' })
    setSuccess(true)
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Contact info card */}
        <Card className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Contact Information</h2>
          </div>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <p>📧 Email: support@justtravel.com</p>
            <p>📞 Phone: +91 01234 56789</p>
            <p>⏰ Support hours: 9:00 AM – 6:00 PM</p>
          </div>
          <div className="rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300">
            💡 We usually respond within 24 hours.
          </div>
        </Card>

        {/* FAQ */}
        <Card className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Frequently Asked</h2>
          </div>
          <div className="space-y-3 text-sm">
            {[
              { q: 'How do I book a trip?', a: 'Go to Explore, pick a destination, and click Book Now.' },
              { q: 'Can I cancel my booking?', a: 'Yes, cancellation depends on the package.' },
              { q: 'When will I get a refund?', a: 'Refunds are processed within 5–7 working days.' },
            ].map((faq) => (
              <div key={faq.q} className="rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                <p className="font-semibold text-slate-900 dark:text-white">{faq.q}</p>
                <p className="mt-0.5 text-slate-500 dark:text-slate-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Contact form */}
      <Card className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300">
            <SupportIcon />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Send us a Message</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">We'd love to hear from you</p>
          </div>
        </div>

        <form className="grid gap-4" onSubmit={onSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Your name">
              <TextInput
                value={form.name}
                onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              />
            </FormField>
            <FormField label="Your email">
              <TextInput
                value={form.email}
                onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                inputMode="email"
              />
            </FormField>
          </div>
          <FormField label="Subject">
            <TextInput
              value={form.subject}
              onChange={(e) => { setForm((s) => ({ ...s, subject: e.target.value })); setSuccess(false) }}
            />
          </FormField>
          <FormField label="Message">
            <TextArea
              value={form.message}
              onChange={(e) => { setForm((s) => ({ ...s, message: e.target.value })); setSuccess(false) }}
              placeholder="Describe your issue or feedback..."
            />
          </FormField>

          {error && (
            <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
              ✅ Feedback submitted successfully! We'll get back to you soon.
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-rose-400 hover:to-pink-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 disabled:opacity-50 dark:focus-visible:ring-offset-slate-950"
            >
              {sending ? 'Sending…' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  )
}

function getRefundInfo(booking: any) {
  const now = new Date()
  const travelDate = new Date(booking.travelDate)
  const diffTime = travelDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  let percent = 0
  if (diffDays > 7) percent = 90
  else if (diffDays >= 3) percent = 50
  else percent = 0
  
  const refund = Math.floor(booking.priceInr * (percent / 100))
  const penalty = booking.priceInr - refund
  return { refund, penalty, percent }
}

/* ── tab config ───────────────────────────────────────── */

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'profile', label: 'Profile', icon: <UserIcon /> },
  { id: 'bookings', label: 'Bookings', icon: <CalendarIcon /> },
  { id: 'support', label: 'Support', icon: <SupportIcon /> },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
]

/* ── main component ───────────────────────────────────── */

export default function ProfilePage() {
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement | null>(null)
  const { user: authUser, logout, refreshMe } = useAuth()
  const { preference, setPreference, resolvedTheme } = useTheme()

  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [name, setName] = useState(authUser?.name ?? '')
  const [email, setEmail] = useState(authUser?.email ?? '')
  const [phone, setPhone] = useState(authUser?.phone ?? '')
  const [address, setAddress] = useState(authUser?.address ?? '')
  const [profilePic, setProfilePic] = useState(authUser?.profilePic ?? '')
  const [success, setSuccess] = useState(false)
  const [saving, setSaving] = useState(false)

  // OTP state
  const [otpModalOpen, setOtpModalOpen] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [otpError, setOtpError] = useState<string | null>(null)

  // Booking history state
  const [bookings, setBookings] = useState<Booking[]>([])
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [bookingsError, setBookingsError] = useState<string | null>(null)
  const [bookingsLoaded, setBookingsLoaded] = useState(false)

  // Sync from authUser when it refreshes
  useEffect(() => {
    if (authUser) {
      setName(authUser.name)
      setEmail(authUser.email)
      setPhone(authUser.phone ?? '')
      setAddress(authUser.address ?? '')
      setProfilePic(authUser.profilePic ?? '')
    }
  }, [authUser])

  // Load bookings when switching to bookings tab
  useEffect(() => {
    if (activeTab !== 'bookings' || bookingsLoaded) return
    setBookingsLoading(true)
    apiFetch<{ bookings: Booking[] }>('/api/bookings')
      .then((res) => setBookings(res.bookings))
      .catch((e: unknown) => {
        if (e instanceof ApiError) setBookingsError(e.message)
        else setBookingsError('Failed to load bookings.')
      })
      .finally(() => {
        setBookingsLoading(false)
        setBookingsLoaded(true)
      })
  }, [activeTab, bookingsLoaded])

  async function handleCancel(b: any) {
    const info = getRefundInfo(b)
    const confirmMsg = `Are you sure you want to cancel this booking?\n\n`
      + `Package: ${b.package}\n`
      + `Price: ₹${b.priceInr.toLocaleString('en-IN')}\n\n`
      + `Penalty (${100 - info.percent}%): ₹${info.penalty.toLocaleString('en-IN')}\n`
      + `Refund (${info.percent}%): ₹${info.refund.toLocaleString('en-IN')}\n\n`
      + `Click OK to confirm cancellation.`
      
    if (!window.confirm(confirmMsg)) return
    
    try {
      await apiFetch(`/api/bookings/${b.id}/cancel`, { method: 'POST' })
      setBookings(prev => prev.map(x => x.id === b.id ? { ...x, status: 'cancelled', refundAmount: info.refund } : x))
    } catch (e: unknown) {
      if (e instanceof ApiError) alert(e.message)
      else alert('Failed to cancel booking.')
    }
  }

  if (!authUser) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold sm:text-3xl">My profile</h1>
        <Card>
          <p className="text-sm text-slate-600 dark:text-slate-300">You're not signed in.</p>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="mt-4 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
          >
            Go to login
          </button>
        </Card>
      </div>
    )
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  async function onPickPhoto(file: File) {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.onload = () => resolve(String(reader.result))
      reader.readAsDataURL(file)
    })
    setProfilePic(dataUrl)
    // Also save immediately via API
    try {
      await apiFetch('/api/auth/me', {
        method: 'PATCH',
        body: JSON.stringify({ profilePic: dataUrl }),
      })
      await refreshMe()
    } catch {
      // Silently handle, photo is shown locally
    }
  }

  async function onSave() {
    setSuccess(false)
    setSaving(true)
    
    const emailChanged = email.trim() !== authUser?.email
    const phoneChanged = phone.trim() !== (authUser?.phone || '')
    
    if (emailChanged || phoneChanged) {
      try {
        await apiFetch('/api/auth/send-otp', { method: 'POST' })
        setOtpModalOpen(true)
        setOtpError(null)
        setOtpCode('')
      } catch (err) {
        alert('Failed to send OTP')
      } finally {
        setSaving(false)
      }
      return
    }
    
    await submitProfileUpdate()
  }

  async function submitProfileUpdate(otp?: string) {
    try {
      setSaving(true)
      setOtpError(null)
      await apiFetch('/api/auth/me', {
        method: 'PATCH',
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          address: address.trim() || null,
          profilePic: profilePic || null,
          ...(otp ? { otp } : {})
        }),
      })
      await refreshMe()
      setSuccess(true)
      setOtpModalOpen(false)
    } catch (e: unknown) {
      if (otp) {
        setOtpError(e instanceof ApiError ? e.message : 'Invalid OTP')
      } else {
        alert('Failed to update profile')
      }
    } finally {
      setSaving(false)
    }
  }

  const avatarLetter = authUser.name?.trim()?.[0]?.toUpperCase() ?? 'U'

  const themeOptions: { value: ThemePreference; label: string; icon: React.ReactNode; desc: string }[] = [
    { value: 'light', label: 'Light', icon: <SunIcon />, desc: 'Bright & clean' },
    { value: 'dark', label: 'Dark', icon: <MoonIcon />, desc: 'Easy on the eyes' },
    { value: 'system', label: 'System', icon: <MonitorIcon />, desc: `Follows OS (${resolvedTheme})` },
  ]

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* ── Hero banner ─────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 shadow-sm dark:border-slate-800">
        {/* Gradient banner */}
        <div className="h-36 bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-500 sm:h-44" />

        {/* Profile card overlay */}
        <div className="relative -mt-14 px-6 pb-6 sm:-mt-16 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            {/* Avatar + info */}
            <div className="flex items-end gap-4">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="group relative grid size-24 shrink-0 place-items-center overflow-hidden rounded-2xl border-4 border-white bg-slate-200 text-2xl font-bold text-slate-900 shadow-lg transition hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-900 dark:bg-slate-800 dark:text-slate-50 sm:size-28"
                aria-label="Upload profile photo"
              >
                {profilePic ? (
                  <img src={profilePic} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="bg-gradient-to-br from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                    {avatarLetter}
                  </span>
                )}
                {/* Camera overlay on hover */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                  <CameraIcon />
                </div>
              </button>
              <div className="mb-1">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
                  {authUser.name}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {authUser.email}
                </p>
                <span className="mt-1 inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                  {authUser.role.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex gap-6 text-center sm:mb-1">
              <div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {bookingsLoaded ? bookings.filter(b => b.status === 'confirmed').length : '—'}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Upcoming Trips</div>
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {bookingsLoaded && bookings.length > 0
                    ? `₹${bookings.reduce((s, b) => {
                        if (b.status === 'cancelled') return s + (b.priceInr - (b.refundAmount ?? 0))
                        return s + b.priceInr
                      }, 0).toLocaleString('en-IN')}`
                    : '—'}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Total Spent</div>
              </div>
            </div>
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (!file) return
            void onPickPhoto(file)
          }}
        />
      </div>

      {/* ── Tabs ────────────────────────────────────────── */}
      <div className="flex gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900/60">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={[
              'flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
              activeTab === tab.id
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
            ].join(' ')}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── Tab Content ─────────────────────────────────── */}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <Card className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Personal Information</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Update your personal details</p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Full name">
              <TextInput
                value={name}
                onChange={(e) => { setName(e.target.value); setSuccess(false) }}
              />
            </FormField>
            <FormField label="Email">
              <TextInput 
                value={email} 
                onChange={(e) => { setEmail(e.target.value); setSuccess(false) }} 
                inputMode="email"
              />
            </FormField>
            <FormField label="Phone">
              <TextInput
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setSuccess(false) }}
                placeholder="+91 XXXXX XXXXX"
              />
            </FormField>
            <FormField label="Role">
              <TextInput value={authUser.role.toUpperCase()} disabled />
            </FormField>
            <div className="sm:col-span-2">
              <FormField label="Address">
                <TextArea
                  value={address}
                  onChange={(e) => { setAddress(e.target.value); setSuccess(false) }}
                  placeholder="Enter your full address"
                />
              </FormField>
            </div>
          </div>

          {success && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="size-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Profile updated successfully!
            </div>
          )}

          <div className="flex justify-end border-t border-slate-200 pt-4 dark:border-slate-700">
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50 dark:focus-visible:ring-offset-slate-950"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </Card>
      )}

      {/* OTP Verification Modal */}
      {otpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Verify Changes</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              We've sent a 6-digit verification code to authorize this change. Check the backend server terminal to see your code!
            </p>
            <FormField label="Verification Code">
              <TextInput 
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                maxLength={6}
              />
            </FormField>
            {otpError && <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">{otpError}</p>}
            <div className="flex justify-end gap-3 mt-4">
              <button 
                type="button" 
                onClick={() => setOtpModalOpen(false)}
                disabled={saving}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={() => submitProfileUpdate(otpCode)}
                disabled={saving || otpCode.length !== 6}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
              >
                {saving ? 'Verifying...' : 'Confirm'}
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (() => {
        const now = new Date()
        now.setHours(0,0,0,0)
        
        const cancelledCount = bookings.filter(b => b.status === 'cancelled').length
        const upcomingCount = bookings.filter(b => b.status === 'confirmed' && new Date(b.travelDate) >= now).length
        const completedCount = bookings.filter(b => b.status === 'confirmed' && new Date(b.travelDate) < now).length
        
        return (
        <Card className="p-0 overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Booking History</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Your recent trips and reservations</p>
            </div>
            
            {bookingsLoaded && bookings.length > 0 && (
              <div className="flex gap-3">
                <div className="rounded-xl bg-emerald-50 px-3 py-1.5 text-center dark:bg-emerald-950/30">
                  <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{upcomingCount}</div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Upcoming</div>
                </div>
                <div className="rounded-xl bg-indigo-50 px-3 py-1.5 text-center dark:bg-indigo-950/30">
                  <div className="text-lg font-bold text-indigo-700 dark:text-indigo-300">{completedCount}</div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Completed</div>
                </div>
                <div className="rounded-xl bg-rose-50 px-3 py-1.5 text-center dark:bg-rose-950/30">
                  <div className="text-lg font-bold text-rose-700 dark:text-rose-300">{cancelledCount}</div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">Cancelled</div>
                </div>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full border-separate border-spacing-0 text-left text-sm">
              <thead className="bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                <tr>
                  <th className="px-5 py-3 font-semibold">Package</th>
                  <th className="px-5 py-3 font-semibold">Travel date</th>
                  <th className="px-5 py-3 font-semibold">Travelers</th>
                  <th className="px-5 py-3 font-semibold">Price</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {bookingsLoading ? (
                  <tr>
                    <td className="px-5 py-8 text-center text-slate-500 dark:text-slate-400" colSpan={6}>
                      <div className="flex items-center justify-center gap-2">
                        <div className="size-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                        Loading bookings…
                      </div>
                    </td>
                  </tr>
                ) : bookingsError ? (
                  <tr>
                    <td className="px-5 py-8 text-center text-rose-700 dark:text-rose-200" colSpan={6}>
                      {bookingsError}
                    </td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td className="px-5 py-12 text-center" colSpan={6}>
                      <div className="space-y-2">
                        <CalendarIcon />
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No bookings yet</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          Your travel history will appear here
                        </p>
                        <button
                          type="button"
                          onClick={() => navigate('/explore')}
                          className="mt-2 inline-flex items-center rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-500"
                        >
                          Explore destinations
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  bookings.map((b) => {
                    const isPast = new Date(b.travelDate) < (() => { const d = new Date(); d.setHours(0,0,0,0); return d; })();
                    return (
                    <tr
                      key={b.id}
                      className="border-b border-slate-100 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                    >
                      <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-white">{b.package}</td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                        {new Date(b.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{b.travelers}</td>
                      <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-white">
                        ₹{Number(b.priceInr).toLocaleString('en-IN')}
                        {b.status === 'cancelled' && b.refundAmount !== undefined && (
                          <p className="mt-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                            Refunded: ₹{(b.refundAmount ?? 0).toLocaleString('en-IN')}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={[
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                          b.status === 'confirmed' && !isPast
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : b.status === 'confirmed' && isPast
                              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
                              : b.status === 'cancelled'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
                        ].join(' ')}>
                          {b.status === 'confirmed' && isPast ? 'completed' : b.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {b.status === 'confirmed' && !isPast ? (
                          <button
                            onClick={() => handleCancel(b)}
                            className="text-xs font-semibold text-rose-600 hover:underline dark:text-rose-400"
                          >
                            Cancel
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  )})
                )}
              </tbody>
            </table>
          </div>
        </Card>
        )
      })()}

      {/* Support Tab */}
      {activeTab === 'support' && (
        <SupportTab userName={authUser.name} userEmail={authUser.email} />
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Theme */}
          <Card className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Appearance</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Choose your preferred theme</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {themeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPreference(opt.value)}
                  className={[
                    'flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                    preference === opt.value
                      ? 'border-indigo-500 bg-indigo-50 shadow-sm dark:border-indigo-400 dark:bg-indigo-950/30'
                      : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-slate-600',
                  ].join(' ')}
                >
                  <div className={[
                    'grid size-10 place-items-center rounded-lg',
                    preference === opt.value
                      ? 'bg-indigo-500 text-white'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
                  ].join(' ')}>
                    {opt.icon}
                  </div>
                  <div>
                    <div className={[
                      'text-sm font-semibold',
                      preference === opt.value
                        ? 'text-indigo-700 dark:text-indigo-300'
                        : 'text-slate-900 dark:text-white',
                    ].join(' ')}>
                      {opt.label}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Change Password */}
          <ChangePasswordCard />

          {/* Account Actions */}
          <Card className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Account</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Manage your account</p>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-left text-sm font-semibold text-rose-700 transition hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300 dark:hover:bg-rose-950/50"
              >
                <LogoutIcon />
                <div>
                  <div>Sign out</div>
                  <div className="text-xs font-normal text-rose-500 dark:text-rose-400">
                    Sign out of your account on this device
                  </div>
                </div>
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
