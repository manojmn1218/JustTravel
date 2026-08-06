import { useEffect, useRef, useState } from 'react'
import { Card } from '../../components/ui/Card'
import { ApiError, apiFetch } from '../../lib/api'

/* ── types ────────────────────────────────────────────────── */

type AdminTab = 'overview' | 'users' | 'bookings' | 'feedback' | 'locations' | 'settings'

type Stats = {
  totalUsers: number
  totalBookings: number
  totalFeedback: number
  totalRevenue: number
}

type User = {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

type Booking = {
  id: string
  package: string
  priceInr: number
  travelDate: string
  travelers: number
  status: string
  createdAt: string
  user: { id: string; name: string; email: string }
}

type Feedback = {
  id: string
  subject: string
  message: string
  email: string
  name: string
  createdAt: string
  user: { id: string; name: string; email: string } | null
}

type Location = {
  id: string
  name: string
  category: string
  duration: string
  price: number
  image: string
  description: string
  rating: number
  popular: boolean
}

type LocationDraft = {
  name: string
  category: 'beach' | 'city' | 'mountain'
  duration: string
  price: string
  image: string
  description: string
  rating: string
  popular: boolean
}

const IMAGE_OPTIONS = [
  { label: '🏖 Tropical / Beach', value: '/images/tropical.jpg' },
  { label: '🌊 Maldives', value: '/images/maldives.png' },
  { label: '☀️ Goa', value: '/images/goa.png' },
  { label: '🏙 City', value: '/images/city.jpeg' },
  { label: '🏔 Himachal / Mountains', value: '/images/himachal.png' },
  { label: '🥾 Trek', value: '/images/trek.png' },
]

const EMPTY_DRAFT: LocationDraft = {
  name: '',
  category: 'beach',
  duration: '',
  price: '',
  image: '/images/tropical.jpg',
  description: '',
  rating: '4.5',
  popular: false,
}

/* ── icons ────────────────────────────────────────────────── */

function UsersIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function BookingIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function FeedbackIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function RevenueIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className ?? 'size-6'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="size-3.5" viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
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

/* ── spinner ──────────────────────────────────────────────── */

function Spinner({ text = 'Loading…' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500 dark:text-slate-400">
      <div className="size-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      {text}
    </div>
  )
}

/* ── tab config ───────────────────────────────────────────── */

const tabList: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg> },
  { id: 'users', label: 'Users', icon: <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg> },
  { id: 'bookings', label: 'Bookings', icon: <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg> },
  { id: 'feedback', label: 'Feedback', icon: <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg> },
  { id: 'locations', label: 'Locations', icon: <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg> },
  { id: 'settings', label: 'Settings', icon: <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg> },
]

/* ── Add Location Modal ───────────────────────────────────── */

function AddLocationModal({
  open,
  onClose,
  onAdded,
}: {
  open: boolean
  onClose: () => void
  onAdded: (loc: Location) => void
}) {
  const [draft, setDraft] = useState<LocationDraft>(EMPTY_DRAFT)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const firstInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraft(EMPTY_DRAFT)
      setError(null)
      setTimeout(() => firstInputRef.current?.focus(), 50)
    }
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const price = parseInt(draft.price, 10)
    const rating = parseFloat(draft.rating)

    if (!draft.name.trim()) return setError('Name is required.')
    if (!draft.duration.trim()) return setError('Duration is required.')
    if (isNaN(price) || price <= 0) return setError('Price must be a positive number.')
    if (!draft.description.trim()) return setError('Description is required.')
    if (isNaN(rating) || rating < 0 || rating > 5) return setError('Rating must be between 0 and 5.')

    setSaving(true)
    try {
      const { location } = await apiFetch<{ location: Location }>('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: draft.name.trim(),
          category: draft.category,
          duration: draft.duration.trim(),
          price,
          image: draft.image,
          description: draft.description.trim(),
          rating,
          popular: draft.popular,
        }),
      })
      onAdded(location)
      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save location')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Add new location"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add New Destination</h2>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              Fill in the details to add it to the platform
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="grid gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Destination Name <span className="text-rose-500">*</span>
            </label>
            <input
              ref={firstInputRef}
              type="text"
              value={draft.name}
              onChange={(e) => setDraft((s) => ({ ...s, name: e.target.value }))}
              placeholder="e.g. Tokyo, Japan"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
            />
          </div>

          {/* Category */}
          <div className="grid gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Category <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['beach', 'city', 'mountain'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setDraft((s) => ({ ...s, category: cat }))}
                  className={[
                    'rounded-xl border py-2.5 text-sm font-semibold transition',
                    draft.category === cat
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-900/40 dark:text-indigo-300'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
                  ].join(' ')}
                >
                  {cat === 'beach' ? '🏖 Beach' : cat === 'city' ? '🏙 City' : '🏔 Mountain'}
                </button>
              ))}
            </div>
          </div>

          {/* Duration + Price */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Duration <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={draft.duration}
                onChange={(e) => setDraft((s) => ({ ...s, duration: e.target.value }))}
                placeholder="e.g. 5 days"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
              />
            </div>
            <div className="grid gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Price (₹ per person) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={draft.price}
                onChange={(e) => setDraft((s) => ({ ...s, price: e.target.value }))}
                placeholder="e.g. 85000"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
              />
            </div>
          </div>

          {/* Image */}
          <div className="grid gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Image <span className="text-rose-500">*</span>
            </label>
            <select
              value={draft.image}
              onChange={(e) => setDraft((s) => ({ ...s, image: e.target.value }))}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            >
              {IMAGE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            {draft.image && (
              <div className="mt-1 aspect-[16/6] overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                <img src={draft.image} alt="Preview" className="h-full w-full object-cover" />
              </div>
            )}
          </div>

          {/* Description */}
          <div className="grid gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={draft.description}
              onChange={(e) => setDraft((s) => ({ ...s, description: e.target.value }))}
              placeholder="Describe what makes this destination special..."
              className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
            />
          </div>

          {/* Rating + Popular */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Rating (0–5)
              </label>
              <input
                type="number"
                min={0}
                max={5}
                step={0.1}
                value={draft.rating}
                onChange={(e) => setDraft((s) => ({ ...s, rating: e.target.value }))}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div className="grid gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Mark as Popular?
              </label>
              <button
                type="button"
                onClick={() => setDraft((s) => ({ ...s, popular: !s.popular }))}
                className={[
                  'inline-flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition',
                  draft.popular
                    ? 'border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-500 dark:bg-amber-900/30 dark:text-amber-300'
                    : 'border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
                ].join(' ')}
              >
                {draft.popular ? '⭐ Popular' : '☆ Not Popular'}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="rounded-xl bg-rose-50 px-3 py-2.5 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
              ⚠️ {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-indigo-500 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving…
                </>
              ) : (
                <>
                  <PlusIcon />
                  Add Destination
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── main component ───────────────────────────────────────── */

export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>('overview')

  // Data states
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [locations, setLocations] = useState<Location[]>([])

  // Loading/error states
  const [statsLoading, setStatsLoading] = useState(true)
  const [usersLoading, setUsersLoading] = useState(false)
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [locationsLoading, setLocationsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Track loaded tabs
  const [loaded, setLoaded] = useState<Set<AdminTab>>(new Set())

  // Location state
  const [locationFilter, setLocationFilter] = useState<'all' | 'beach' | 'city' | 'mountain'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)

  // Fetch stats on mount
  useEffect(() => {
    apiFetch<{ stats: Stats }>('/api/admin/stats')
      .then((r) => setStats(r.stats))
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Failed to load stats'))
      .finally(() => setStatsLoading(false))
  }, [])

  // Fetch tab data lazily
  useEffect(() => {
    if (loaded.has(tab)) return

    if (tab === 'users' || tab === 'overview') {
      if (!loaded.has('users')) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUsersLoading(true)
        apiFetch<{ users: User[] }>('/api/admin/users')
          .then((r) => { setUsers(r.users); setLoaded((s) => new Set(s).add('users')) })
          .catch(() => {})
          .finally(() => setUsersLoading(false))
      }
    }

    if (tab === 'bookings' || tab === 'overview') {
      if (!loaded.has('bookings')) {
        setBookingsLoading(true)
        apiFetch<{ bookings: Booking[] }>('/api/admin/bookings')
          .then((r) => { setBookings(r.bookings); setLoaded((s) => new Set(s).add('bookings')) })
          .catch(() => {})
          .finally(() => setBookingsLoading(false))
      }
    }

    if (tab === 'feedback') {
      setFeedbackLoading(true)
      apiFetch<{ feedback: Feedback[] }>('/api/admin/feedback')
        .then((r) => { setFeedback(r.feedback); setLoaded((s) => new Set(s).add('feedback')) })
        .catch(() => {})
        .finally(() => setFeedbackLoading(false))
    }

    if (tab === 'locations') {
      setLocationsLoading(true)
      apiFetch<{ locations: Location[] }>('/api/locations')
        .then((r) => { setLocations(r.locations); setLoaded((s) => new Set(s).add('locations')) })
        .catch(() => {})
        .finally(() => setLocationsLoading(false))
    }
  }, [tab, loaded])

  const filteredLocations = locationFilter === 'all'
    ? locations
    : locations.filter((l) => l.category === locationFilter)

  async function handleDeleteLocation(id: string) {
    if (!window.confirm('Delete this destination? This cannot be undone.')) return
    setDeletingId(id)
    try {
      await apiFetch(`/api/locations/${id}`, { method: 'DELETE' })
      setLocations((prev) => prev.filter((l) => l.id !== id))
    } catch {
      alert('Failed to delete location')
    } finally {
      setDeletingId(null)
    }
  }

  async function handleDeleteUser(id: string, name: string) {
    if (!window.confirm(`Delete user "${name}"? This will also remove all their bookings. This cannot be undone.`)) return
    setDeletingUserId(id)
    try {
      await apiFetch(`/api/admin/users/${id}`, { method: 'DELETE' })
      setUsers((prev) => prev.filter((u) => u.id !== id))
      setBookings((prev) => prev.filter((b) => b.user.id !== id))
      setStats((s) => s ? { ...s, totalUsers: s.totalUsers - 1 } : s)
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to delete user')
    } finally {
      setDeletingUserId(null)
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {/* ── Header ───────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 shadow-sm dark:border-slate-800">
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 px-8 py-8 sm:py-10">
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-indigo-200">Manage users, bookings, feedback, and destinations</p>
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────────── */}
      <div className="flex gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900/60">
        {tabList.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={[
              'flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
              tab === t.id
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
            ].join(' ')}
          >
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── TAB CONTENT ───────────────────────────────────── */}

      {/* Overview */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {statsLoading ? (
            <Spinner text="Loading statistics…" />
          ) : error ? (
            <Card><p className="text-sm text-rose-600">{error}</p></Card>
          ) : stats && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Total Users', value: stats.totalUsers, icon: <UsersIcon />, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-600 dark:text-blue-300' },
                { label: 'Total Bookings', value: stats.totalBookings, icon: <BookingIcon />, color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-600 dark:text-emerald-300' },
                { label: 'Feedback', value: stats.totalFeedback, icon: <FeedbackIcon />, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-600 dark:text-amber-300' },
                { label: 'Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, icon: <RevenueIcon />, color: 'from-purple-500 to-fuchsia-500', bg: 'bg-purple-100 dark:bg-purple-900/40', text: 'text-purple-600 dark:text-purple-300' },
              ].map((s) => (
                <Card key={s.label} className="relative overflow-hidden">
                  <div className={`absolute -right-4 -top-4 size-20 rounded-full bg-gradient-to-br ${s.color} opacity-10`} />
                  <div className="flex items-center gap-4">
                    <div className={`grid size-12 place-items-center rounded-xl ${s.bg} ${s.text}`}>
                      {s.icon}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{s.label}</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Recent bookings */}
          <Card className="p-0 overflow-hidden">
            <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-700">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Recent Bookings</h2>
            </div>
            {bookingsLoading ? <Spinner /> : (
              <div className="overflow-x-auto">
                <table className="min-w-[700px] w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                    <tr>
                      <th className="px-5 py-3 font-medium">User</th>
                      <th className="px-5 py-3 font-medium">Package</th>
                      <th className="px-5 py-3 font-medium">Date</th>
                      <th className="px-5 py-3 font-medium">Amount</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.slice(0, 5).map((b) => (
                      <tr key={b.id} className="border-b border-slate-100 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                        <td className="px-5 py-3">
                          <div className="font-medium text-slate-900 dark:text-white">{b.user.name}</div>
                          <div className="text-xs text-slate-500">{b.user.email}</div>
                        </td>
                        <td className="px-5 py-3 text-slate-700 dark:text-slate-300">{b.package}</td>
                        <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{new Date(b.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        <td className="px-5 py-3 font-semibold text-slate-900 dark:text-white">₹{b.priceInr.toLocaleString('en-IN')}</td>
                        <td className="px-5 py-3"><StatusBadge status={b.status} /></td>
                      </tr>
                    ))}
                    {bookings.length === 0 && (
                      <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-500">No bookings yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Quick links */}
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Manage Users', desc: `${users.length} registered`, tab: 'users' as AdminTab, gradient: 'from-blue-500 to-indigo-600' },
              { label: 'View All Bookings', desc: `${bookings.length} total`, tab: 'bookings' as AdminTab, gradient: 'from-emerald-500 to-teal-600' },
              { label: 'Browse Locations', desc: `${locations.length} destinations`, tab: 'locations' as AdminTab, gradient: 'from-purple-500 to-fuchsia-600' },
            ].map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => setTab(link.tab)}
                className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900/40 dark:hover:bg-slate-800/60"
              >
                <div className={`inline-flex rounded-lg bg-gradient-to-br ${link.gradient} px-3 py-1.5 text-xs font-semibold text-white`}>
                  {link.label}
                </div>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{link.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <Card className="p-0 overflow-hidden">
          <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">All Users</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Registered users on the platform</p>
          </div>
          {usersLoading ? <Spinner /> : (
            <div className="overflow-x-auto">
              <table className="min-w-[640px] w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                  <tr>
                    <th className="px-5 py-3 font-medium">User</th>
                    <th className="px-5 py-3 font-medium">Email</th>
                    <th className="px-5 py-3 font-medium">Role</th>
                    <th className="px-5 py-3 font-medium">Joined</th>
                    <th className="px-5 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-slate-100 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white">
                            {u.name[0]?.toUpperCase() ?? '?'}
                          </div>
                          <span className="font-medium text-slate-900 dark:text-white">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{u.email}</td>
                      <td className="px-5 py-3">
                        <span className={[
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
                        ].join(' ')}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-500 dark:text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {u.role !== 'admin' ? (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            disabled={deletingUserId === u.id}
                            title="Delete user"
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-rose-500 transition hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
                          >
                            {deletingUserId === u.id ? (
                              <div className="size-3.5 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
                            ) : (
                              <TrashIcon />
                            )}
                            {deletingUserId === u.id ? 'Deleting…' : 'Delete'}
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-500">No users found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Bookings */}
      {tab === 'bookings' && (
        <Card className="p-0 overflow-hidden">
          <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">All Bookings</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Every booking across all users</p>
          </div>
          {bookingsLoading ? <Spinner /> : (
            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                  <tr>
                    <th className="px-5 py-3 font-medium">User</th>
                    <th className="px-5 py-3 font-medium">Package</th>
                    <th className="px-5 py-3 font-medium">Travel Date</th>
                    <th className="px-5 py-3 font-medium">Travelers</th>
                    <th className="px-5 py-3 font-medium">Amount</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id} className="border-b border-slate-100 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                      <td className="px-5 py-3">
                        <div className="font-medium text-slate-900 dark:text-white">{b.user.name}</div>
                        <div className="text-xs text-slate-500">{b.user.email}</div>
                      </td>
                      <td className="px-5 py-3 text-slate-700 dark:text-slate-300">{b.package}</td>
                      <td className="px-5 py-3 text-slate-500 dark:text-slate-400">
                        {new Date(b.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{b.travelers}</td>
                      <td className="px-5 py-3 font-semibold text-slate-900 dark:text-white">₹{b.priceInr.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-3"><StatusBadge status={b.status} /></td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-500">No bookings found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Feedback */}
      {tab === 'feedback' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">User Feedback</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Support messages and feedback from users</p>
            </div>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
              {feedback.length} messages
            </span>
          </div>

          {feedbackLoading ? <Spinner /> : feedback.length === 0 ? (
            <Card className="py-12 text-center">
              <FeedbackIcon />
              <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">No feedback received yet</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">User feedback will appear here</p>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {feedback.map((f) => (
                <Card key={f.id} className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-sm font-bold text-white">
                        {f.name[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{f.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{f.email}</p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {new Date(f.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{f.subject}</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{f.message}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Locations */}
      {tab === 'locations' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Travel Destinations</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {locations.length} destinations · manage and add new ones
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Category filter */}
              {(['all', 'beach', 'city', 'mountain'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setLocationFilter(f)}
                  className={[
                    'rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                    locationFilter === f
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
                  ].join(' ')}
                >
                  {f === 'all' ? '🌍 All' : f === 'beach' ? '🏖 Beach' : f === 'city' ? '🏙 City' : '🏔 Mountain'}
                </button>
              ))}

              {/* Add button */}
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-indigo-500 hover:to-purple-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <PlusIcon />
                Add Destination
              </button>
            </div>
          </div>

          {locationsLoading ? <Spinner text="Loading destinations…" /> : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredLocations.map((loc) => (
                <Card key={loc.id} className="group p-0 overflow-hidden">
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={loc.image}
                      alt={loc.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    {loc.popular && (
                      <span className="absolute right-3 top-3 rounded-full bg-amber-400 px-2.5 py-0.5 text-xs font-bold text-amber-900 shadow-sm">
                        ⭐ Popular
                      </span>
                    )}
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-slate-900 backdrop-blur dark:bg-slate-900/80 dark:text-slate-100">
                      {loc.category === 'beach' ? '🏖' : loc.category === 'city' ? '🏙' : '🏔'} {loc.category}
                    </span>
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-base font-bold text-white">{loc.name}</h3>
                    </div>
                  </div>

                  <div className="space-y-3 p-4">
                    <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">{loc.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <StarIcon key={s} filled={s <= Math.round(loc.rating)} />
                        ))}
                        <span className="ml-1 text-xs font-medium text-slate-600 dark:text-slate-400">{loc.rating}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
                        <MapPinIcon className="size-4" />
                        <span className="text-xs">{loc.duration}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-700">
                      <div>
                        <span className="text-lg font-bold text-slate-900 dark:text-white">
                          ₹{loc.price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400"> / person</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteLocation(loc.id)}
                        disabled={deletingId === loc.id}
                        title="Delete destination"
                        className="grid size-8 place-items-center rounded-lg text-rose-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 dark:hover:bg-rose-950/30"
                      >
                        {deletingId === loc.id ? (
                          <div className="size-3.5 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
                        ) : (
                          <TrashIcon />
                        )}
                      </button>
                    </div>
                  </div>
                </Card>
              ))}

              {filteredLocations.length === 0 && !locationsLoading && (
                <div className="col-span-full rounded-2xl border-2 border-dashed border-slate-200 py-14 text-center dark:border-slate-800">
                  <MapPinIcon className="mx-auto size-10 text-slate-300 dark:text-slate-600" />
                  <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">No destinations in this category</p>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
                  >
                    <PlusIcon /> Add the first one
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Settings */}
      {tab === 'settings' && (
        <div className="space-y-6">
          {/* Change Password */}
          <Card className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300">
                <LockIcon />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Change Password</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Update your admin account password</p>
              </div>
            </div>
            <AdminChangePasswordForm />
          </Card>
        </div>
      )}

      {/* ── Add Location Modal ───────────────────────────── */}
      <AddLocationModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdded={(loc) => {
          setLocations((prev) => [...prev, loc])
          setStats((s) => s ? { ...s } : s)
        }}
      />
    </div>
  )
}

/* ── helper components ────────────────────────────────────── */

function AdminChangePasswordForm() {
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
    <form onSubmit={onSubmit} className="space-y-4">
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

      {/* Password strength */}
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
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === 'confirmed'
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
      : status === 'cancelled'
        ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles}`}>
      {status}
    </span>
  )
}
