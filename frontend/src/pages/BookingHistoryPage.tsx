import { useEffect, useState } from 'react'
import { Card } from '../components/ui/Card'
import { ApiError, apiFetch } from '../lib/api'

type Booking = {
  id: string
  package: string
  priceInr: number
  travelDate: string
  travelers: number
  status: string
  refundAmount?: number
}

function getRefundInfo(booking: Booking) {
  const now = new Date()
  const travelDate = new Date(booking.travelDate)
  const diffTime = travelDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  let percent: number
  if (diffDays > 7) percent = 90
  else if (diffDays >= 3) percent = 50
  else percent = 0
  
  const refund = Math.floor(booking.priceInr * (percent / 100))
  const penalty = booking.priceInr - refund
  return { refund, penalty, percent }
}

export default function BookingHistoryPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiFetch<{ bookings: Booking[] }>('/api/bookings')
      .then((res) => setBookings(res.bookings))
      .catch((e: unknown) => {
        if (e instanceof ApiError) setError(e.message)
        else setError('Failed to load bookings.')
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleCancel(b: Booking) {
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

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold sm:text-3xl">My booking history</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">Your recent bookings.</p>
      </header>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full border-separate border-spacing-0 text-left text-sm">
            <thead className="bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold">Package</th>
                <th className="px-4 py-3 font-semibold">Travel date</th>
                <th className="px-4 py-3 font-semibold">Travelers</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-slate-600 dark:text-slate-300 text-center" colSpan={6}>
                    Loading…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td className="px-4 py-6 text-rose-700 dark:text-rose-200 text-center" colSpan={6}>
                    {error}
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-slate-600 dark:text-slate-300 text-center" colSpan={6}>
                    No bookings found
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr
                    key={b.id}
                    className="odd:bg-white even:bg-slate-50 dark:odd:bg-slate-950 dark:even:bg-slate-900/40"
                  >
                    <td className="px-4 py-3">{b.package}</td>
                    <td className="px-4 py-3">{new Date(b.travelDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{b.travelers}</td>
                    <td className="px-4 py-3">
                      ₹{Number(b.priceInr).toLocaleString('en-IN')}
                      {b.status === 'cancelled' && b.refundAmount !== undefined && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Refunded: ₹{b.refundAmount.toLocaleString('en-IN')}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {b.status === 'cancelled' ? (
                        <span className="text-rose-600 dark:text-rose-400">Cancelled</span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400">Confirmed</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {b.status === 'confirmed' ? (
                        <button
                          onClick={() => handleCancel(b)}
                          className="text-xs font-semibold text-rose-600 hover:underline dark:text-rose-400"
                        >
                          Cancel
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
