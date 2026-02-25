'use client'

import { useEffect, useState } from 'react'
import { useAuth } from './auth-context'

/**
 * Decode JWT payload (base64) to get claims. No verification in browser.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const payload = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(payload) as Record<string, unknown>
  } catch {
    return null
  }
}

export function useDisplayUser(): {
  displayName: string
  username: string
  fullName: string
  initial: string
  email?: string
} {
  const { isAuthenticated } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [initial, setInitial] = useState('R')
  const [email, setEmail] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!isAuthenticated || typeof window === 'undefined') {
      setDisplayName('')
      setUsername('')
      setFullName('')
      setInitial('R')
      setEmail(undefined)
      return
    }
    try {
      const raw = localStorage.getItem('auth_tokens')
      if (!raw) return
      const tokens = JSON.parse(raw) as { id_token?: string; access_token?: string }
      const payload = decodeJwtPayload(tokens.id_token || tokens.access_token || '')
      if (!payload) return
      const cognitoUsername = (payload['cognito:username'] as string) || ''
      const givenName = (payload.given_name as string) || ''
      const familyName = (payload.family_name as string) || ''
      const name = givenName || (payload.name as string) || cognitoUsername || (payload.sub as string) || ''
      const full = [givenName, familyName].filter(Boolean).join(' ') || name
      setDisplayName(name)
      setUsername(cognitoUsername)
      setFullName(full)
      setInitial(name ? name.charAt(0).toUpperCase() : cognitoUsername ? cognitoUsername.charAt(0).toUpperCase() : 'R')
      setEmail((payload.email as string) || undefined)
    } catch {
      setDisplayName('')
      setUsername('')
      setFullName('')
      setInitial('R')
      setEmail(undefined)
    }
  }, [isAuthenticated])

  return { displayName, username, fullName, initial, email }
}
