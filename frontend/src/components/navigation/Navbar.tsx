import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthProvider'
import { useTheme } from '../theme/ThemeProvider'

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
          <img
            src="/images/logo-light.png"
            alt="Just Travel - Explore • Book • Go"
            className="h-12 w-auto object-contain transition-opacity duration-300"
          />
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
