import { GOOGLE_CLIENT_ID, ALLOWED_EMAILS } from '../constants'
import type { User, AuthState } from '../types'
import { saveUser, getUser, clearUser } from './storageService'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleIdConfig) => void
          renderButton: (element: HTMLElement, config: GoogleButtonConfig) => void
          prompt: () => void
          revoke: (email: string, callback: () => void) => void
        }
      }
    }
  }
}

interface GoogleIdConfig {
  client_id: string
  callback: (response: GoogleCredentialResponse) => void
  auto_select?: boolean
}

interface GoogleButtonConfig {
  theme?: 'outline' | 'filled_blue' | 'filled_black'
  size?: 'large' | 'medium' | 'small'
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
  shape?: 'rectangular' | 'pill' | 'circle' | 'square'
  width?: number
}

interface GoogleCredentialResponse {
  credential: string
  select_by?: string
}

interface JwtPayload {
  email: string
  name: string
  picture?: string
  sub: string
  exp: number
}

function decodeJwt(token: string): JwtPayload {
  const base64Url = token.split('.')[1]
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  )
  return JSON.parse(jsonPayload)
}

function isTokenExpired(payload: JwtPayload): boolean {
  return Date.now() >= payload.exp * 1000
}

export function isEmailAllowed(email: string): boolean {
  // If no emails are configured, allow all (for development)
  if (ALLOWED_EMAILS.length === 0) {
    console.warn('No allowed emails configured - allowing all users (development mode)')
    return true
  }
  return ALLOWED_EMAILS.includes(email.toLowerCase())
}

export function isConfigured(): boolean {
  return Boolean(GOOGLE_CLIENT_ID)
}

export function getStoredUser(): User | null {
  return getUser()
}

export function signOut(): void {
  const user = getUser()
  if (user && window.google) {
    window.google.accounts.id.revoke(user.email, () => {
      clearUser()
    })
  } else {
    clearUser()
  }
}

export function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Sign-In'))
    document.head.appendChild(script)
  })
}

export function initializeGoogleSignIn(
  onSuccess: (user: User) => void,
  onUnauthorized: () => void
): void {
  if (!window.google) {
    console.error('Google Sign-In not loaded')
    return
  }

  window.google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: (response: GoogleCredentialResponse) => {
      try {
        const payload = decodeJwt(response.credential)

        if (isTokenExpired(payload)) {
          onUnauthorized()
          return
        }

        if (!isEmailAllowed(payload.email)) {
          onUnauthorized()
          return
        }

        const user: User = {
          email: payload.email,
          name: payload.name,
          picture: payload.picture,
        }

        saveUser(user)
        onSuccess(user)
      } catch (error) {
        console.error('Failed to process credential:', error)
        onUnauthorized()
      }
    },
  })
}

export function renderGoogleButton(element: HTMLElement): void {
  if (!window.google) {
    console.error('Google Sign-In not loaded')
    return
  }

  window.google.accounts.id.renderButton(element, {
    theme: 'outline',
    size: 'large',
    text: 'signin_with',
    shape: 'rectangular',
  })
}

export function checkAuthState(): AuthState {
  if (!isConfigured()) {
    return 'missing_config'
  }

  const user = getUser()
  if (!user) {
    return 'idle'
  }

  if (!isEmailAllowed(user.email)) {
    clearUser()
    return 'unauthorized'
  }

  return 'authenticated'
}
