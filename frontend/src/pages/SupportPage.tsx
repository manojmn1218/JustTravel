import { useState } from 'react'
import { Card } from '../components/ui/Card'
import { FormField, TextArea, TextInput } from '../components/ui/FormField'

type SupportForm = {
  name: string
  email: string
  subject: string
  message: string
}

type Feedback = SupportForm & { dateIso: string }

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export default function SupportPage() {
  const [form, setForm] = useState<SupportForm>({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function onSubmit(e: React.FormEvent) {
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
    if (trimmed.message.length < 10)
      return setError('Please describe your issue in a bit more detail.')

    const feedback: Feedback = { ...trimmed, dateIso: new Date().toISOString() }
    const feedbacks: Feedback[] = JSON.parse(localStorage.getItem('feedbacks') ?? '[]')
    feedbacks.push(feedback)
    localStorage.setItem('feedbacks', JSON.stringify(feedbacks))

    setForm({ name: '', email: '', subject: '', message: '' })
    setSuccess(true)
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold sm:text-3xl">Support</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">We’re here to help you.</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-3">
          <h2 className="text-base font-semibold">Contact information</h2>
          <div className="text-sm text-slate-600 dark:text-slate-300">
            <p>Email: support@travelwebsite.com</p>
            <p>Phone: +91 01234 56789</p>
            <p>Support hours: 9:00 AM – 6:00 PM</p>
          </div>
          <div className="pt-2 text-sm text-slate-600 dark:text-slate-300">
            We usually respond within 24 hours.
          </div>
        </Card>

        <Card>
          <h2 className="text-base font-semibold">Contact support</h2>
          <form className="mt-4 grid gap-4" onSubmit={onSubmit}>
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
            <FormField label="Subject">
              <TextInput
                value={form.subject}
                onChange={(e) => setForm((s) => ({ ...s, subject: e.target.value }))}
              />
            </FormField>
            <FormField label="Message">
              <TextArea
                value={form.message}
                onChange={(e) => setForm((s) => ({ ...s, message: e.target.value }))}
              />
            </FormField>

            {error ? (
              <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">
                {error}
              </p>
            ) : null}
            {success ? (
              <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
                Feedback submitted successfully.
              </p>
            ) : null}

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
            >
              Submit
            </button>
          </form>
        </Card>
      </div>

      <Card>
        <h2 className="text-base font-semibold">Frequently asked questions</h2>
        <div className="mt-3 space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <p>
            <span className="font-semibold text-slate-900 dark:text-slate-50">
              How do I book a trip?
            </span>
            <br />
            Choose a deal and click Book now.
          </p>
          <p>
            <span className="font-semibold text-slate-900 dark:text-slate-50">
              Can I cancel my booking?
            </span>
            <br />
            Yes, cancellation depends on the package.
          </p>
          <p>
            <span className="font-semibold text-slate-900 dark:text-slate-50">
              When will I get a refund?
            </span>
            <br />
            Refunds are processed within 5–7 working days.
          </p>
        </div>
      </Card>
    </div>
  )
}
