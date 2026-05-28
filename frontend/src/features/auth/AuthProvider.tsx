/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/set-state-in-effect */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { apiFetch, setToken } from '../../lib/api'

export type Role = 'admin' | 'user'

export type AuthUser = {
  id: string
  name: string
  email: string
  role: Role
  phone?: string | null
  address?: string | null
  profilePic?: string | null
}

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  login: (input: { email: string; password: string }) => Promise<void>
  register: (input: { name: string; email: string; password: string }) => Promise<void>
  logout: () => void
  refreshMe: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshMe = useCallback(async () => {
    try {
      const res = await apiFetch<{ user: AuthUser }>('/api/auth/me')
      setUser(res.user)
    } catch {
      setUser(null)
      setToken(null)
    }
  }, [])

  useEffect(() => {
    refreshMe()
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [refreshMe])

  const login = useCallback(async (input: { email: string; password: string }) => {
    const res = await apiFetch<{ token: string; user: AuthUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    })
    setToken(res.token)
    setUser(res.user)
  }, [])

  const register = useCallback(async (input: { name: string; email: string; password: string }) => {
    const res = await apiFetch<{ token: string; user: AuthUser }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    })
    setToken(res.token)
    setUser(res.user)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refreshMe }),
    [user, loading, login, register, logout, refreshMe],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
