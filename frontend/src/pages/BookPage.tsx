import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { FormField, TextInput } from '../components/ui/FormField'
import { apiFetch, ApiError } from '../lib/api'

type BookingDraft = {
  name: string
  email: string
  phone: string
  date: string
  count: number
}

export type PendingBooking = BookingDraft & {
  package: string
  price: number
}

function parsePositiveInt(value: string | null, fallback: number): number {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback
}

export default function BookPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const pkg = searchParams.get('package') ?? 'N/A'
  const price = parsePositiveInt(searchParams.get('price'), 0)

  const [draft, setDraft] = useState<BookingDraft>({
    name: '',
    email: '',
    phone: '',
    date: '',
    count: 1,
  })
  const [error, setError] = useState<string | null>(null)

  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpId, setOtpId] = useState<string | null>(null)
  const [otpCode, setOtpCode] = useState('')

  const canSubmit = useMemo(() => {
    let validDate = false
    if (draft.date) {
      const selected = new Date(draft.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      validDate = selected >= today
    }
    return (
      draft.name.trim().length >= 2 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(draft.email) &&
      draft.phone.trim().length === 10 &&
      validDate &&
      draft.count >= 1 &&
      draft.count <= 9
    )
  }, [draft])

  async function onProceed() {
    setError(null)
    if (!canSubmit) {
      setError('Please fill all fields correctly. Travel date must be in the future, and travelers between 1-9.')
      return
    }

    setLoading(true)
    try {
      const res = await apiFetch<{ message: string, id: string }>('/api/otp/send', {
        method: 'POST',
        body: JSON.stringify({ email: draft.email.trim(), phone: draft.phone.trim() })
      })
      setOtpId(res.id)
      setOtpSent(true)
    } catch (e: unknown) {
      if (e instanceof ApiError) setError(e.message)
      else setError('Failed to send verification code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function onVerifyOtp() {
    setError(null)
    if (otpCode.length !== 6) {
      setError('Please enter a valid 6-digit code.')
      return
    }
    if (!otpId) return
    
    setLoading(true)
    try {
      await apiFetch('/api/otp/verify', {
        method: 'POST',
        body: JSON.stringify({ id: otpId, code: otpCode })
      })
      
      const booking: PendingBooking = {
        package: pkg,
        price: price * draft.count,
        name: draft.name.trim(),
        email: draft.email.trim(),
        phone: draft.phone.trim(),
        date: draft.date,
        count: draft.count,
      }

      localStorage.setItem('pendingBooking', JSON.stringify(booking))
      navigate('/payment')
    } catch (e: unknown) {
      if (e instanceof ApiError) setError(e.message)
      else setError('Invalid or expired code. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold sm:text-3xl">Booking details</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Package: <span className="font-semibold text-slate-900 dark:text-slate-50">{pkg}</span><br/>
          Base Price: ₹{price.toLocaleString('en-IN')} per person <br/>
          <span className="mt-1 inline-block text-base font-semibold text-rose-600 dark:text-rose-400">
            Total Amount: ₹{(price * draft.count).toLocaleString('en-IN')}
          </span>
        </p>
      </header>

      <Card>
        {!otpSent ? (
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              onProceed()
            }}
          >
            <FormField label="Name">
              <TextInput
                required
                minLength={2}
                value={draft.name}
                onChange={(e) => setDraft((s) => ({ ...s, name: e.target.value }))}
              />
            </FormField>
            <FormField label="Email">
              <TextInput
                required
                type="email"
                pattern="^[^\s@]+@[^\s@]+\.[^\s@]{2,}$"
                title="e.g. name@domain.com"
                value={draft.email}
                onChange={(e) => setDraft((s) => ({ ...s, email: e.target.value }))}
                inputMode="email"
              />
            </FormField>
            <FormField label="Phone">
              <TextInput
                required
                type="tel"
                pattern="[0-9]{10}"
                maxLength={10}
                title="10-digit phone number"
                value={draft.phone}
                onChange={(e) => setDraft((s) => ({ ...s, phone: e.target.value.replace(/\D/g, '') }))}
              />
            </FormField>
            <FormField label="Travel date">
              <TextInput
                required
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={draft.date}
                onClick={(e) => {
                  try {
                    ;(e.target as HTMLInputElement).showPicker()
                  } catch {
                    // Ignore if unsupported in older browsers
                  }
                }}
                onChange={(e) => setDraft((s) => ({ ...s, date: e.target.value }))}
              />
            </FormField>
            <FormField label="Travelers" hint="Min 1, max 9">
              <TextInput
                required
                type="text"
                inputMode="numeric"
                pattern="[1-9]"
                maxLength={1}
                value={draft.count || ''}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '')
                  setDraft((s) => ({ ...s, count: val ? parseInt(val, 10) : 0 }))
                }}
              />
            </FormField>

            {error ? (
              <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">
                {error}
              </p>
            ) : null}

            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={loading}
                className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Go Back
              </button>
              <button
                type="submit"
                className="inline-flex flex-1 items-center justify-center rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!canSubmit || loading}
              >
                {loading ? 'Sending code...' : 'Proceed to payment'}
              </button>
            </div>
          </form>
        ) : (
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              onVerifyOtp()
            }}
          >
            <div className="text-center mb-4">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Verify Your Contact Info</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                We sent a 6-digit code to your email and phone number. Enter it below to proceed.
              </p>
            </div>

            <FormField label="Verification Code">
              <TextInput
                required
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="text-center tracking-widest text-lg font-bold"
              />
            </FormField>

            {error ? (
              <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">
                {error}
              </p>
            ) : null}

            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false)
                  setOtpCode('')
                  setError(null)
                }}
                disabled={loading}
                className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Go Back
              </button>
              <button
                type="submit"
                className="inline-flex flex-1 items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={otpCode.length !== 6 || loading}
              >
                {loading ? 'Verifying...' : 'Verify and Book'}
              </button>
            </div>
          </form>
        )}
      </Card>
    </div>
  )
}
