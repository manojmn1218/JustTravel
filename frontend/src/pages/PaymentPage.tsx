import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { ApiError, apiFetch } from '../lib/api'
import type { PendingBooking } from './BookPage'

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void
      on: (event: string, handler: () => void) => void
    }
  }
}

export default function PaymentPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pending: PendingBooking | null = useMemo(
    () => JSON.parse(localStorage.getItem('pendingBooking') ?? 'null'),
    [],
  )

  async function handlePay() {
    setError(null)
    if (!pending) {
      setError('No pending booking found. Please book a trip first.')
      return
    }

    setLoading(true)

    // Step 1: Create a Razorpay order on the backend
    let orderId: string
    let keyId: string
    try {
      const res = await apiFetch<{
        orderId: string
        amount: number
        currency: string
        keyId: string
      }>('/api/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({ amount: pending.price }),
      })
      orderId = res.orderId
      keyId = res.keyId
    } catch (e: unknown) {
      if (e instanceof ApiError) setError(e.message)
      else setError('Failed to create payment order. Please try again.')
      setLoading(false)
      return
    }

    // Step 2: Open Razorpay checkout popup
    const options: Record<string, unknown> = {
      key: keyId,
      amount: pending.price * 100,
      currency: 'INR',
      name: 'JustTravel',
      description: `${pending.package} — ${pending.count} traveler${pending.count > 1 ? 's' : ''}`,
      order_id: orderId,
      theme: {
        color: '#e11d48',
      },
      prefill: {
        name: pending.name,
        email: pending.email,
        contact: pending.phone,
      },
      handler: async function (response: {
        razorpay_order_id: string
        razorpay_payment_id: string
        razorpay_signature: string
      }) {
        // Step 3: Verify payment on the backend
        try {
          await apiFetch('/api/payments/verify', {
            method: 'POST',
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          })

          // Step 4: Create the booking
          await apiFetch('/api/bookings', {
            method: 'POST',
            body: JSON.stringify({
              package: pending.package,
              priceInr: pending.price,
              travelDate: new Date(pending.date).toISOString(),
              travelers: pending.count,
              paymentMethod: 'razorpay',
              transactionId: response.razorpay_payment_id,
            }),
          })

          localStorage.removeItem('pendingBooking')
          navigate('/confirmation')
        } catch (e: unknown) {
          if (e instanceof ApiError) setError(e.message)
          else setError('Payment verification failed. Please contact support.')
          setLoading(false)
        }
      },
      modal: {
        ondismiss: function () {
          setLoading(false)
          setError('Payment was cancelled.')
        },
      },
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold sm:text-3xl">Payment</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Complete your payment using Razorpay's secure checkout.
        </p>
      </header>

      <Card>
        <div className="space-y-5">
          {/* Order Summary */}
          <div className="space-y-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Order summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Package</span>
                <span className="font-medium text-slate-900 dark:text-white">{pending?.package ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Travelers</span>
                <span className="font-medium text-slate-900 dark:text-white">{pending?.count ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Travel date</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {pending?.date
                    ? new Date(pending.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '—'}
                </span>
              </div>
              <div className="mt-2 border-t border-slate-200 pt-2 dark:border-slate-700">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">Total amount</span>
                  <span className="text-lg font-bold text-rose-600 dark:text-rose-400">
                    ₹{(pending?.price ?? 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment methods info */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              Cards
            </span>
            <span className="flex items-center gap-1">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              UPI
            </span>
            <span className="flex items-center gap-1">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z"/></svg>
              Wallets
            </span>
            <span className="flex items-center gap-1">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              Net Banking
            </span>
          </div>

          {error ? (
            <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">
              {error}
            </p>
          ) : null}

          <div className="flex gap-4 pt-1">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={loading}
              className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Go Back
            </button>
            <button
              type="button"
              onClick={handlePay}
              disabled={loading || !pending}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Processing…
                </>
              ) : (
                <>
                  <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  Pay ₹{(pending?.price ?? 0).toLocaleString('en-IN')}
                </>
              )}
            </button>
          </div>

          <p className="text-center text-[10px] text-slate-400 dark:text-slate-500">
            Secured by Razorpay. Your payment information is encrypted.
          </p>
        </div>
      </Card>
    </div>
  )
}
