import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ApiError } from '../lib/api'
import { useAuth } from '../features/auth/AuthProvider'

type Mode = 'login' | 'signup'

type AuthFormState = {
  name: string
  email: string
  password: string
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [form, setForm] = useState<AuthFormState>({ name: '', email: '', password: '' })
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { login, register } = useAuth()

  const title = useMemo(() => (mode === 'login' ? 'Login' : 'Sign up'), [mode])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const trimmed = {
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password.trim(),
    }

    if (mode === 'signup' && trimmed.name.length < 2) {
      setError('Please enter your full name.')
      return
    }
    if (!isEmail(trimmed.email)) {
      setError('Please enter a valid email.')
      return
    }
    if (trimmed.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    try {
      if (mode === 'signup') {
        await register({ name: trimmed.name, email: trimmed.email, password: trimmed.password })
      } else {
        await login({ email: trimmed.email, password: trimmed.password })
      }

      const from = (location.state as { from?: string } | null)?.from
      navigate(from ?? '/app', { replace: true })
    } catch (e) {
      if (e instanceof ApiError) setError(e.message)
      else setError('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-md gap-6">
      <header className="text-center">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Welcome back — let’s get you to your next trip.
        </p>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
        <form
          className="grid gap-4"
          onSubmit={onSubmit}
          aria-describedby={error ? 'auth-error' : undefined}
        >
          {mode === 'signup' ? (
            <label className="grid gap-1">
              <span className="text-sm font-medium">Full name</span>
              <input
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-950 dark:focus-visible:ring-offset-slate-950"
                value={form.name}
                onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                autoComplete="name"
              />
            </label>
          ) : null}

          <label className="grid gap-1">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-950 dark:focus-visible:ring-offset-slate-950"
              value={form.email}
              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              autoComplete="email"
              inputMode="email"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium">Password</span>
            <input
              type="password"
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-950 dark:focus-visible:ring-offset-slate-950"
              value={form.password}
              onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </label>

          {error ? (
            <p
              id="auth-error"
              className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-200"
            >
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            className="mt-1 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
          >
            {mode === 'login' ? 'Login' : 'Create account'}
          </button>

          <p className="text-center text-sm text-slate-600 dark:text-slate-300">
            {mode === 'login' ? (
              <>
                Don’t have an account?{' '}
                <button
                  type="button"
                  className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                  onClick={() => {
                    setMode('signup')
                    setError(null)
                  }}
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                  onClick={() => {
                    setMode('login')
                    setError(null)
                  }}
                >
                  Login
                </button>
              </>
            )}
          </p>
        </form>
      </section>
    </div>
  )
}
