export class ApiError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(status: number, message: string, body: unknown) {
    super(message)
    this.status = status
    this.body = body
  }
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000'

export function getToken(): string | null {
  return localStorage.getItem('authToken')
}

export function setToken(token: string | null) {
  if (!token) localStorage.removeItem('authToken')
  else localStorage.setItem('authToken', token)
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('accept', 'application/json')

  if (init.body && !headers.has('content-type')) {
    headers.set('content-type', 'application/json')
  }

  const token = getToken()
  if (token) headers.set('authorization', `Bearer ${token}`)

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers })
  const text = await res.text()
  const body = text ? (safeJson(text) ?? text) : null

  if (!res.ok) {
    const message =
      typeof body === 'object' && body && 'error' in body
        ? String((body as { error?: { message?: unknown } }).error?.message ?? 'Request failed')
        : `Request failed (${res.status})`
    throw new ApiError(res.status, message, body)
  }

  return body as T
}

function safeJson(text: string): unknown | null {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}
