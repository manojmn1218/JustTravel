import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthProvider'

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'rounded-md px-3 py-2 text-sm font-medium transition',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950',
          isActive
            ? 'bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900'
            : 'text-slate-700 hover:bg-slate-200 dark:text-slate-200 dark:hover:bg-slate-800',
        ].join(' ')
      }
      end={to === '/'}
    >
      {label}
    </NavLink>
  )
}

function Logo() {
  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      {/* Minimal airplane icon */}
      <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-md shadow-indigo-500/20">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-white"
          aria-hidden="true"
        >
          <path
            d="M21.71 2.29a1 1 0 0 0-1.1-.21L2.61 9.08a1 1 0 0 0-.09 1.82l6.57 3.29 3.29 6.57a1 1 0 0 0 .9.54h.05a1 1 0 0 0 .88-.64l7-18a1 1 0 0 0-.21-1.1l-.29.29.29-.29ZM14.59 18.68l-2.37-4.73 3.49-3.49a1 1 0 0 0-1.42-1.42l-3.49 3.49-4.73-2.37L19.1 4.9l-4.51 13.78Z"
            fill="currentColor"
          />
        </svg>
      </div>
      {/* Brand text */}
      <div className="flex flex-col leading-none">
        <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
          Just<span className="text-indigo-500">Travel</span>
        </span>
        <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
          Explore · Book · Go
        </span>
      </div>
    </div>
  )
}

export function Navbar() {
  const { user } = useAuth()


  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
          aria-label="JustTravel home"
        >
          <Logo />
        </Link>

        <nav aria-label="Primary" className="flex items-center gap-1">
          {user ? (
            <>
              <NavItem to="/app" label="Dashboard" />
              <NavItem to="/explore" label="Explore" />
              <NavItem to="/deals" label="Deals" />
              {user.role !== 'admin' ? <NavItem to="/support" label="Support" /> : null}
              {user.role === 'admin' ? <NavItem to="/admin" label="Admin" /> : null}
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  [
                    'ml-2 grid size-9 place-items-center overflow-hidden rounded-full border-2 transition',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950',
                    isActive
                      ? 'border-indigo-500 shadow-md shadow-indigo-500/25'
                      : 'border-slate-300 hover:border-indigo-400 dark:border-slate-600 dark:hover:border-indigo-400',
                  ].join(' ')
                }
                aria-label="Profile"
              >
                <span className="grid size-full place-items-center bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white">
                  {user.name?.[0]?.toUpperCase() ?? 'U'}
                </span>
              </NavLink>
            </>
          ) : (
            <>
              <NavItem to="/" label="Home" />
              <NavItem to="/login" label="Login" />
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
