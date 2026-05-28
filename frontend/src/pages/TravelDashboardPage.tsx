import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

type Deal = {
  id: string
  title: string
  priceInr: number
  description: string
}

const deals: Deal[] = [
  {
    id: 'maldives',
    title: 'Maldives overwater villa',
    priceInr: 39999,
    description: 'Featured island escape with ocean views.',
  },
  {
    id: 'goa',
    title: 'Goa long weekend',
    priceInr: 14499,
    description: 'Beach getaway for friends & family.',
  },
  {
    id: 'himachal',
    title: 'Himachal road trip',
    priceInr: 32999,
    description: 'Mountain journey with scenic routes.',
  },
]

export default function TravelDashboardPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <h1 className="text-balance text-2xl font-semibold sm:text-3xl">
          Escape the ordinary—handpicked trips for every kind of traveler
        </h1>
        <p className="text-pretty text-sm text-slate-600 dark:text-slate-300 sm:text-base">
          Curated destinations, flexible dates and transparent pricing. Find your next adventure
          with simple search and inspiration.
        </p>
      </header>

      <section className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
        <label className="grid gap-1">
          <span className="text-sm font-medium">Search</span>
          <input
            placeholder="What's on your mind"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-950 dark:focus-visible:ring-offset-slate-950"
          />
        </label>
        <Link
          to="/deals"
          className="inline-flex items-center justify-center rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
        >
          Search
        </Link>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-widest text-indigo-600 dark:text-indigo-400">
              TOP PICKS
            </p>
            <h2 className="mt-1 text-lg font-semibold">Limited-time travel deals</h2>
          </div>
          <Link
            className="text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
            to="/deals"
          >
            View all
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {deals.map((d) => (
            <motion.article
              key={d.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40"
            >
              <h3 className="text-base font-semibold">{d.title}</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{d.description}</p>
              <p className="mt-4 text-lg font-semibold">₹{d.priceInr.toLocaleString('en-IN')}</p>
              <div className="mt-4 flex gap-3">
                <Link
                  to={`/book?package=${encodeURIComponent(d.title)}&price=${d.priceInr}`}
                  className="inline-flex flex-1 items-center justify-center rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
                >
                  Book now
                </Link>
                <Link
                  to="/bookings"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-offset-slate-950"
                >
                  My bookings
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  )
}
