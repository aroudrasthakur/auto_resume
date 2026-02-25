/**
 * Auth helpers: login, signup, OAuth callback, forgot password.
 * Uses backend /auth/* endpoints and Cognito Hosted UI for OAuth.
 */

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1`
const COGNITO_DOMAIN = process.env.NEXT_PUBLIC_COGNITO_DOMAIN || ''
const COGNITO_CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || ''
const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI || 'http://localhost:3000/callback'

export interface AuthTokens {
  access_token: string
  id_token: string
  refresh_token?: string
  expires_in: number
  expires_at: number
}

export async function loginWithCredentials(params: {
  usernameOrEmail: string
  password: string
}): Promise<AuthTokens> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username_or_email: params.usernameOrEmail,
      password: params.password,
    }),
  })
  const data = await res.json()
  if (!res.ok) {
    const msg = Array.isArray(data.detail)
      ? data.detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join('; ') || 'Login failed'
      : data.detail || data.message || 'Login failed'
    throw new Error(msg)
  }
  return data
}

export async function signupWithDetails(params: {
  username: string
  password: string
  email: string
  firstName: string
  lastName: string
  nickname: string
  birthdate: string
}): Promise<{ user_sub: string; user_confirmed: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.detail || data.message || 'Signup failed')
  }
  return data
}

export async function exchangeCodeForTokens(code: string): Promise<AuthTokens> {
  if (!COGNITO_DOMAIN || !COGNITO_CLIENT_ID) {
    throw new Error('OAuth not configured')
  }
  const tokenUrl = `${COGNITO_DOMAIN}/oauth2/token`
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: COGNITO_CLIENT_ID,
    code,
    redirect_uri: REDIRECT_URI,
  })
  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error_description || data.error || 'Token exchange failed')
  }
  const expiresIn = data.expires_in || 3600
  return {
    access_token: data.access_token,
    id_token: data.id_token,
    refresh_token: data.refresh_token,
    expires_in: expiresIn,
    expires_at: Date.now() + expiresIn * 1000,
  }
}

export async function forgotPasswordStart(username: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.detail || data.message || 'Failed to send reset code')
  }
  return data
}

export async function confirmSignUp(params: {
  username: string
  confirmationCode: string
}): Promise<{ user_confirmed: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/auth/confirm-signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.detail || data.message || 'Verification failed')
  }
  return data
}

export async function resendSignUpCode(username: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/auth/resend-signup-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.detail || data.message || 'Could not resend code')
  }
  return data
}

export async function confirmForgotPassword(params: {
  username: string
  confirmationCode: string
  newPassword: string
}): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/auth/confirm-forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.detail || data.message || 'Failed to reset password')
  }
  return data
}
