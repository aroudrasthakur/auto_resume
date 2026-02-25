'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import type { AuthTokens } from './auth'

const STORAGE_KEY = 'auth_tokens'

interface AuthContextValue {
  isAuthenticated: boolean
  isLoading: boolean
  login: (tokens: AuthTokens) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadTokens(): AuthTokens | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const tokens = JSON.parse(raw) as AuthTokens
    if (tokens.expires_at && tokens.expires_at > Date.now()) {
      return tokens
    }
    localStorage.removeItem(STORAGE_KEY)
    return null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [tokens, setTokens] = useState<AuthTokens | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setTokens(loadTokens())
    setIsLoading(false)
  }, [])

  const login = useCallback((newTokens: AuthTokens) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTokens))
    setTokens(newTokens)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setTokens(null)
  }, [])

  const value: AuthContextValue = {
    isAuthenticated: !!tokens,
    isLoading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}

export function useRequireAuth(): AuthContextValue & { isLoading: boolean } {
  const ctx = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (ctx.isLoading) return
    if (!ctx.isAuthenticated) {
      router.replace('/login')
    }
  }, [ctx.isLoading, ctx.isAuthenticated, router])

  return ctx
}
