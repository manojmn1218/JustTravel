import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../lib/api'

/* ── Types ──────────────────────────────────────────────── */

type Category = 'all' | 'beach' | 'city' | 'mountain'

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

/* ── Star rating ─────────────────────────────────────────── */

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          xmlns="http://www.w3.org/2000/svg"
          className="size-3.5 text-amber-400"
          viewBox="0 0 24 24"
          fill={s <= Math.round(rating) ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      <span className="ml-1 text-xs font-semibold text-slate-600 dark:text-slate-400">{rating}</span>
    </div>
  )
}

/* ── Skeleton card ───────────────────────────────────────── */

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/40 animate-pulse">
      <div className="aspect-[16/10] bg-slate-200 dark:bg-slate-800" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-3 w-4/5 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="flex justify-between pt-2">
          <div className="h-6 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-8 w-1/4 rounded-xl bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
    </div>
  )
}

/* ── Location card ───────────────────────────────────────── */

function LocationCard({ loc }: { loc: Location }) {
  const categoryEmoji = loc.category === 'beach' ? '🏖' : loc.category === 'city' ? '🏙' : '🏔'
  const categoryLabel = loc.category.charAt(0).toUpperCase() + loc.category.slice(1)

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/40 dark:hover:shadow-indigo-900/20">
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={loc.image}
          alt={loc.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Category badge */}
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-800 shadow backdrop-blur-sm dark:bg-slate-900/80 dark:text-slate-100">
          {categoryEmoji} {categoryLabel}
        </span>

        {/* Popular badge */}
        {loc.popular && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-xs font-bold text-amber-900 shadow">
            ⭐ Popular
          </span>
        )}

        {/* Name overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h2 className="text-base font-bold leading-tight text-white drop-shadow">{loc.name}</h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          {loc.description}
        </p>

        <div className="flex items-center justify-between">
          <StarRating rating={loc.rating} />
          <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
            ⏱ {loc.duration}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
          <div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              ₹{loc.price.toLocaleString('en-IN')}
            </span>
            <span className="ml-1 text-xs text-slate-500 dark:text-slate-400">/ person</span>
          </div>
          <Link
            to={`/book?package=${encodeURIComponent(loc.name)}&price=${loc.price}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-rose-200 transition-all hover:from-rose-400 hover:to-pink-400 hover:shadow-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 dark:shadow-rose-900/30 dark:focus-visible:ring-offset-slate-950"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            Book Now
          </Link>
        </div>
      </div>
    </article>
  )
}

/* ── Filter chip ─────────────────────────────────────────── */

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'inline-flex items-center gap-1.5 rounded-2xl px-4 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
        active
          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/30'
          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

/* ── Main page ───────────────────────────────────────────── */

export default function ExplorePage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [category, setCategory] = useState<Category>('all')

  useEffect(() => {
    apiFetch<{ locations: Location[] }>('/api/locations')
      .then((r) => setLocations(r.locations))
      .catch((e) => setError(e?.message ?? 'Failed to load destinations'))
      .finally(() => setLoading(false))
  }, [])

  const filtered =
    category === 'all' ? locations : locations.filter((l) => l.category === category)

  const counts = {
    all: locations.length,
    beach: locations.filter((l) => l.category === 'beach').length,
    city: locations.filter((l) => l.category === 'city').length,
    mountain: locations.filter((l) => l.category === 'mountain').length,
  }

  return (
    <div className="space-y-8">
      {/* ── Hero header ──────────────────────────────────── */}
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 px-8 py-12 text-white shadow-lg">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-200">
            Curated Destinations
          </p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Explore the World 🌍
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-indigo-100 sm:text-base">
            From sun-soaked beaches to vibrant city streets and majestic mountain peaks — find your
            perfect escape and book in minutes.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
            <span>✈️</span>
            <span>{locations.length} destinations available</span>
          </div>
        </div>
      </header>

      {/* ── Category filter ───────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        <FilterChip active={category === 'all'} onClick={() => setCategory('all')}>
          🌍 All <span className="ml-1 rounded-full bg-current/20 px-1.5 py-0.5 text-xs opacity-70">{counts.all}</span>
        </FilterChip>
        <FilterChip active={category === 'beach'} onClick={() => setCategory('beach')}>
          🏖 Beach <span className="ml-1 rounded-full bg-current/20 px-1.5 py-0.5 text-xs opacity-70">{counts.beach}</span>
        </FilterChip>
        <FilterChip active={category === 'city'} onClick={() => setCategory('city')}>
          🏙 City <span className="ml-1 rounded-full bg-current/20 px-1.5 py-0.5 text-xs opacity-70">{counts.city}</span>
        </FilterChip>
        <FilterChip active={category === 'mountain'} onClick={() => setCategory('mountain')}>
          🏔 Mountain <span className="ml-1 rounded-full bg-current/20 px-1.5 py-0.5 text-xs opacity-70">{counts.mountain}</span>
        </FilterChip>
      </div>

      {/* ── Grid ─────────────────────────────────────────── */}
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-8 text-center text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
          <p className="text-2xl">⚠️</p>
          <p className="mt-2 font-semibold">Failed to load destinations</p>
          <p className="text-xs">{error}</p>
        </div>
      ) : loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center dark:border-slate-800 dark:bg-slate-900/40">
          <p className="text-4xl">🗺️</p>
          <p className="mt-3 text-base font-semibold text-slate-700 dark:text-slate-200">No destinations found</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Try a different category filter
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((loc) => (
            <LocationCard key={loc.id} loc={loc} />
          ))}
        </div>
      )}
    </div>
  )
}
