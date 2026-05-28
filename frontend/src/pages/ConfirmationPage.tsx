import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'

export default function ConfirmationPage() {
  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <Card className="text-center">
        <h1 className="text-2xl font-semibold sm:text-3xl">Booking confirmed</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Your trip has been booked successfully.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/bookings"
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
          >
            View your bookings
          </Link>
          <Link
            to="/app"
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-offset-slate-950"
          >
            Back to dashboard
          </Link>
        </div>
      </Card>
    </div>
  )
}
