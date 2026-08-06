import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { FormField, TextInput } from '../components/ui/FormField'
import { ApiError, apiFetch } from '../lib/api'
import type { PendingBooking } from './BookPage'

type Method = 'upi' | 'card'

export default function PaymentPage() {
  const navigate = useNavigate()
  const [method, setMethod] = useState<Method | null>(null)
  const [upiId, setUpiId] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pending: PendingBooking | null = useMemo(
    () => JSON.parse(localStorage.getItem('pendingBooking') ?? 'null'),
    [],
  )

  async function processPayment() {
    setError(null)
    if (!pending) {
      setError('No pending booking found. Please book a trip first.')
      return
    }

    if (method === 'upi') {
      if (!/^[a-zA-Z0-9.\-_]{3,30}@[a-zA-Z]{2,15}$/.test(upiId.trim())) {
        return setError('Please enter a valid UPI ID (e.g. name@bank).')
      }
    } else if (method === 'card') {
      if (cardNumber.trim().length !== 16 || cvv.trim().length < 3) {
        return setError('Please enter a valid 16-digit card number and CVV.')
      }
      
      const [mm, yy] = expiry.split('/')
      const month = parseInt(mm, 10)
      const year = parseInt(`20${yy}`, 10)
      const now = new Date()
      
      if (!mm || !yy || month < 1 || month > 12 || year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
        return setError('Please enter a valid, unexpired Expiry Date (MM/YY).')
      }
    } else {
      return setError('Please choose a payment method.')
    }

    setLoading(true)
    let transactionId: string

    try {
      const payload: Record<string, unknown> = {
        method,
        amount: pending.price,
      }
      if (method === 'upi') {
        payload.upiId = upiId.trim()
      } else {
        payload.cardNumber = cardNumber.trim()
        payload.expiry = expiry.trim()
        payload.cvv = cvv.trim()
      }

      const res = await apiFetch<{ success: boolean; transactionId: string }>(
        '/api/payments/process',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
      )
      transactionId = res.transactionId
    } catch (e: unknown) {
      if (e instanceof ApiError) setError(e.message)
      else setError('Payment processing failed. Please check your details.')
      setLoading(false)
      return
    }

    try {
      await apiFetch('/api/bookings', {
        method: 'POST',
        body: JSON.stringify({
          package: pending.package,
          priceInr: pending.price,
          travelDate: new Date(pending.date).toISOString(),
          travelers: pending.count,
          paymentMethod: method,
          transactionId,
        }),
      })
      localStorage.removeItem('pendingBooking')
    } catch (e: unknown) {
      if (e instanceof ApiError) setError(e.message)
      else setError('Failed to create booking.')
      setLoading(false)
      return
    }

    setLoading(false)
    navigate('/confirmation')
  }

  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold sm:text-3xl">Payment</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Amount to pay:{' '}
          <span className="font-semibold text-slate-900 dark:text-slate-50">
            ₹{(pending?.price ?? 0).toLocaleString('en-IN')}
          </span>
        </p>
      </header>

      <Card>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            processPayment()
          }}
        >
          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold">Payment method</legend>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="method"
              checked={method === 'upi'}
              onChange={() => setMethod('upi')}
            />
            UPI
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="method"
              checked={method === 'card'}
              onChange={() => setMethod('card')}
            />
            Card
          </label>
        </fieldset>

        {method === 'upi' ? (
          <FormField label="UPI ID">
            <TextInput
              required
              pattern="^[a-zA-Z0-9.\-_]{3,30}@[a-zA-Z]{2,15}$"
              maxLength={45}
              title="e.g. name@bank"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="name@bank"
            />
          </FormField>
        ) : null}

        {method === 'card' ? (
          <div className="grid gap-4">
            <FormField label="Card number">
              <TextInput
                required
                pattern="[0-9]{16}"
                maxLength={16}
                title="16-digit card number"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                inputMode="numeric"
                placeholder="0000000000000000"
              />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Expiry (MM/YY)">
                <TextInput
                  required
                  pattern="(0[1-9]|1[0-2])\/[0-9]{2}"
                  maxLength={5}
                  title="MM/YY format"
                  value={expiry}
                  onChange={(e) => {
                    let val = e.target.value.replace(/[^0-9/]/g, '')
                    if (val.length === 2 && !val.includes('/') && expiry.length !== 3) {
                      val += '/'
                    }
                    setExpiry(val)
                  }}
                  placeholder="MM/YY"
                />
              </FormField>
              <FormField label="CVV">
                <TextInput 
                  required
                  pattern="[0-9]{3,4}"
                  maxLength={4}
                  title="3 or 4 digit CVV"
                  value={cvv} 
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))} 
                  type="password" 
                  inputMode="numeric"
                />
              </FormField>
            </div>
          </div>
        ) : null}

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
            disabled={loading}
            className="inline-flex flex-1 items-center justify-center rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Processing…' : 'Confirm payment'}
          </button>
        </div>
        </form>
      </Card>
    </div>
  )
}
