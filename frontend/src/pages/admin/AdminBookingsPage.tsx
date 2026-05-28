import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card'

type Booking = {
  package: string
  price: number
  name: string
  email: string
  phone: string
  date: string
  count: number
}

type User = { email: string; role: 'admin' | 'user'; name: string }

export default function AdminBookingsPage() {
  const navigate = useNavigate()
  const loggedIn: User | null = useMemo(
    () => JSON.parse(localStorage.getItem('loggedInUser') ?? 'null'),
    [],
  )
  const bookings: Booking[] = useMemo(
    () => JSON.parse(localStorage.getItem('bookings') ?? '[]'),
    [],
  )

  if (loggedIn?.role !== 'admin') {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold sm:text-3xl">Admin bookings</h1>
        <Card>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            You must be signed in as an admin to view this page.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold sm:text-3xl">Booked trips</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">All bookings across users.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin')}
          className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-offset-slate-950"
        >
          Back
        </button>
      </header>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full border-separate border-spacing-0 text-left text-sm">
            <thead className="bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold">User name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Location</th>
                <th className="px-4 py-3 font-semibold">Travel date</th>
                <th className="px-4 py-3 font-semibold">Travelers</th>
                <th className="px-4 py-3 font-semibold">Price</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-slate-600 dark:text-slate-300" colSpan={6}>
                    No bookings found
                  </td>
                </tr>
              ) : (
                bookings.map((b, idx) => (
                  <tr
                    key={`${b.email}-${b.date}-${idx}`}
                    className="odd:bg-white even:bg-slate-50 dark:odd:bg-slate-950 dark:even:bg-slate-900/40"
                  >
                    <td className="px-4 py-3">{b.name}</td>
                    <td className="px-4 py-3">{b.email}</td>
                    <td className="px-4 py-3">{b.package}</td>
                    <td className="px-4 py-3">{b.date}</td>
                    <td className="px-4 py-3">{b.count}</td>
                    <td className="px-4 py-3">₹{Number(b.price).toLocaleString('en-IN')}</td>
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
