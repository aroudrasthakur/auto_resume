/**
 * API client for backend. Sends requests with auth token when available.
 */

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1`

export interface ApiErrorData {
  code?: string
  missing_sections?: string[]
}

export interface ApiResult<T = unknown> {
  ok: boolean
  data?: T
  error?: string
  errorData?: ApiErrorData
}

export function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem('auth_tokens')
    if (!raw) return {}
    const tokens = JSON.parse(raw) as { access_token?: string }
    if (tokens?.access_token) {
      return { Authorization: `Bearer ${tokens.access_token}` }
    }
  } catch {
    /* ignore */
  }
  return {}
}

/** Trigger file download. Uses auth when URL is our API (e.g. local storage). */
export async function downloadFile(url: string, filename: string): Promise<void> {
  const isOurApi = url.startsWith(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000')
  const res = await fetch(url, {
    headers: isOurApi ? getAuthHeaders() : undefined,
  })
  if (!res.ok) throw new Error('Download failed')
  const blob = await res.blob()
  const blobUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = blobUrl
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(blobUrl), 100)
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResult<T>> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...(options.headers as Record<string, string>),
  }
  try {
    const res = await fetch(url, {
      ...options,
      headers: { ...headers, ...(options.headers || {}) },
    })
    const text = await res.text()
    let data: T | undefined
    try {
      data = text ? (JSON.parse(text) as T) : undefined
    } catch {
      data = undefined
    }
    if (!res.ok) {
      const raw = data as { detail?: string | { detail?: string; code?: string; missing_sections?: string[] }; code?: string; missing_sections?: string[] }
      const inner = typeof raw?.detail === 'object' ? raw.detail : raw
      const errMsg =
        (typeof inner?.detail === 'string' ? inner.detail : null) ||
        (typeof raw?.detail === 'string' ? raw.detail : null) ||
        (raw as { message?: string })?.message ||
        res.statusText ||
        'Request failed'
      const hasStructuredError =
        (inner?.code != null) ||
        (Array.isArray(inner?.missing_sections) && inner.missing_sections.length > 0) ||
        (raw?.code != null) ||
        (Array.isArray(raw?.missing_sections) && raw.missing_sections.length > 0)
      const errorData: ApiErrorData | undefined = hasStructuredError
        ? { code: inner?.code ?? raw?.code, missing_sections: inner?.missing_sections ?? raw?.missing_sections }
        : undefined
      return {
        ok: false,
        error: typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg),
        errorData,
      }
    }
    return { ok: true, data }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { ok: false, error: msg }
  }
}
