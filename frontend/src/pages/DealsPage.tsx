import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'

type Deal = {
  id: string
  title: string
  priceInr: number
  imagePath: string
  highlights: string[]
}

const DEALS: Deal[] = [
  {
    id: 'maldives',
    title: 'Maldives overwater villa',
    priceInr: 39999,
    imagePath: '/images/maldives.png',
    highlights: [
      'Luxury overwater stay',
      'Private deck with ocean view',
      'Ideal for couples',
      'Peaceful island environment',
    ],
  },
  {
    id: 'goa',
    title: 'Goa long weekend',
    priceInr: 14499,
    imagePath: '/images/goa.png',
    highlights: [
      'Short beach getaway',
      'Perfect for friends & family',
      'Popular beaches',
      'Budget friendly',
    ],
  },
  {
    id: 'himachal',
    title: 'Himachal road trip',
    priceInr: 32999,
    imagePath: '/images/himachal.png',
    highlights: [
      'Scenic mountain journey',
      'Snow-capped views',
      'Ideal for nature lovers',
      'Cool climate',
    ],
  },
]

export default function DealsPage() {
  const [openDealId, setOpenDealId] = useState<string | null>(null)
  const openDeal = useMemo(() => DEALS.find((d) => d.id === openDealId) ?? null, [openDealId])

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold sm:text-3xl">Limited-time travel deals</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Tap a deal to see details, then book in a couple of clicks.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DEALS.map((d) => (
          <Card key={d.id} className="p-0 overflow-hidden">
            <div className="aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img
                src={d.imagePath}
                alt={d.title}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-5">
              <h2 className="text-base font-semibold">{d.title}</h2>
              <p className="mt-2 text-lg font-semibold">₹{d.priceInr.toLocaleString('en-IN')}</p>
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setOpenDealId(d.id)}
                  className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-offset-slate-950"
                >
                  Show more
                </button>
                <Link
                  to={`/book?package=${encodeURIComponent(d.title)}&price=${d.priceInr}`}
                  className="inline-flex flex-1 items-center justify-center rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
                >
                  Book now
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        title={openDeal?.title ?? 'Deal details'}
        open={openDeal != null}
        onClose={() => setOpenDealId(null)}
      >
        {openDeal ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">Highlights</p>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {openDeal.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            <div className="flex gap-3 pt-2">
              <Link
                to={`/book?package=${encodeURIComponent(openDeal.title)}&price=${openDeal.priceInr}`}
                className="inline-flex flex-1 items-center justify-center rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
              >
                Book now
              </Link>
              <button
                type="button"
                onClick={() => setOpenDealId(null)}
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-950"
              >
                Close
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
