import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function HomePage() {
  return (
    <div className="space-y-14">
      <section className="grid gap-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 sm:p-10 lg:grid-cols-2 lg:items-center">
        <div className="space-y-5">
          <p className="text-xs font-semibold tracking-widest text-indigo-600 dark:text-indigo-400">
            JUSTTRAVEL
          </p>
          <h1 className="text-balance text-3xl font-semibold leading-tight sm:text-4xl">
            Discover your next adventure
          </h1>
          <p className="text-pretty text-sm text-slate-600 dark:text-slate-300 sm:text-base">
            Seamless travel planning, curated destinations, and unforgettable journeys — all in one
            place.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
            >
              Get started
            </Link>
            <Link
              to="/app"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-offset-slate-950"
            >
              Explore trips
            </Link>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl"
        >
          {/* Main hero image */}
          <div className="relative h-64 overflow-hidden rounded-2xl sm:h-72 lg:h-80">
            <img
              src="/images/tropical.jpg"
              alt="Tropical paradise destination"
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-300">
                Featured Destination
              </p>
              <p className="mt-1 text-xl font-bold text-white sm:text-2xl">
                Explore Paradise
              </p>
            </div>
          </div>

          {/* Destination thumbnails */}
          <div className="mt-3 grid grid-cols-3 gap-3">
            {[
              { src: '/images/maldives.png', label: 'Maldives' },
              { src: '/images/goa.png', label: 'Goa' },
              { src: '/images/himachal.png', label: 'Himachal' },
            ].map((dest) => (
              <div
                key={dest.label}
                className="group relative h-20 overflow-hidden rounded-xl sm:h-24"
              >
                <img
                  src={dest.src}
                  alt={dest.label}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/30 transition-colors group-hover:bg-black/40" />
                <span className="absolute bottom-1.5 left-2 text-xs font-semibold text-white drop-shadow sm:text-sm">
                  {dest.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          {
            title: 'Global destinations',
            body: 'Explore the world’s most beautiful and exciting places.',
          },
          { title: 'Smart planning', body: 'Organize your trips with intuitive tools.' },
          { title: 'Trusted service', body: 'Reliable travel planning backed by experts.' },
        ].map((f) => (
          <article
            key={f.title}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40"
          >
            <h2 className="text-base font-semibold">{f.title}</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{f.body}</p>
          </article>
        ))}
      </section>
    </div>
  )
}
