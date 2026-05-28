import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card'

type Feedback = {
  name: string
  email: string
  subject: string
  message: string
  dateIso: string
}

type User = { email: string; role: 'admin' | 'user'; name: string }

export default function AdminFeedbackPage() {
  const navigate = useNavigate()
  const loggedIn: User | null = useMemo(
    () => JSON.parse(localStorage.getItem('loggedInUser') ?? 'null'),
    [],
  )
  const feedbacks: Feedback[] = useMemo(
    () => JSON.parse(localStorage.getItem('feedbacks') ?? '[]'),
    [],
  )

  if (loggedIn?.role !== 'admin') {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold sm:text-3xl">Admin feedback</h1>
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
          <h1 className="text-2xl font-semibold sm:text-3xl">User feedback</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Support messages submitted by users.
          </p>
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
          <table className="min-w-[980px] w-full border-separate border-spacing-0 text-left text-sm">
            <thead className="bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Subject</th>
                <th className="px-4 py-3 font-semibold">Message</th>
                <th className="px-4 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-slate-600 dark:text-slate-300" colSpan={5}>
                    No feedback available
                  </td>
                </tr>
              ) : (
                feedbacks.map((f, idx) => (
                  <tr
                    key={`${f.email}-${f.dateIso}-${idx}`}
                    className="odd:bg-white even:bg-slate-50 dark:odd:bg-slate-950 dark:even:bg-slate-900/40"
                  >
                    <td className="px-4 py-3">{f.name}</td>
                    <td className="px-4 py-3">{f.email}</td>
                    <td className="px-4 py-3">{f.subject}</td>
                    <td className="px-4 py-3">{f.message}</td>
                    <td className="px-4 py-3">{new Date(f.dateIso).toLocaleString()}</td>
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
