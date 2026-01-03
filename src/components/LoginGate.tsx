import { useEffect, useRef } from 'react'
import type { User, AuthState } from '../types'
import {
  initializeGoogleSignIn,
  renderGoogleButton,
  loadGoogleScript,
} from '../services/authService'
import { Shield, AlertTriangle, Settings } from 'lucide-react'

interface LoginGateProps {
  authState: AuthState
  onSuccess: (user: User) => void
  onUnauthorized: () => void
}

export default function LoginGate({ authState, onSuccess, onUnauthorized }: LoginGateProps) {
  const buttonRef = useRef<HTMLDivElement>(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    if (authState === 'missing_config') return

    async function setup() {
      try {
        await loadGoogleScript()
        initializeGoogleSignIn(onSuccess, onUnauthorized)

        if (buttonRef.current) {
          renderGoogleButton(buttonRef.current)
        }

        initialized.current = true
      } catch (error) {
        console.error('Failed to initialize Google Sign-In:', error)
      }
    }

    setup()
  }, [authState, onSuccess, onUnauthorized])

  return (
    <div className="min-h-screen bg-cyber-darker flex items-center justify-center p-4">
      <div className="card max-w-md w-full text-center">
        {/* Logo */}
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto mb-4 relative">
            <img src="/wolf.svg" alt="CipherWolf" className="w-full h-full" />
            <div className="absolute inset-0 bg-cyber-cyan/20 rounded-full blur-xl animate-pulse-slow" />
          </div>
          <h1 className="text-3xl font-bold glow-text">CipherWolf</h1>
          <p className="text-gray-400 mt-2">Your AI Pack Leader for Robotics</p>
        </div>

        {/* State-specific content */}
        {authState === 'missing_config' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-yellow-500">
              <Settings size={24} />
              <span className="font-semibold">Configuration Required</span>
            </div>
            <p className="text-gray-400 text-sm">
              Google Client ID is not configured. Please add VITE_GOOGLE_CLIENT_ID to your
              environment variables.
            </p>
          </div>
        )}

        {authState === 'unauthorized' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-red-400">
              <AlertTriangle size={24} />
              <span className="font-semibold">Access Not Authorized</span>
            </div>
            <p className="text-gray-400 text-sm">
              Your account is not on the approved list. Please contact an administrator if you
              believe this is an error.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-outline mt-4"
            >
              Try Again
            </button>
          </div>
        )}

        {authState === 'idle' && (
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <Shield size={20} />
              <span className="text-sm">Secure sign-in required</span>
            </div>

            {/* Google Sign-In Button */}
            <div ref={buttonRef} className="flex justify-center" />

            <p className="text-gray-500 text-xs">
              Only approved accounts can access CipherWolf.
            </p>
          </div>
        )}

        {/* Features */}
        <div className="mt-8 pt-6 border-t border-cyber-light">
          <h2 className="text-sm font-semibold text-gray-400 mb-4">Learn with CipherWolf</h2>
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span className="text-cyber-cyan">{'>'}</span>
              <span>MicroPython</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-cyber-cyan">{'>'}</span>
              <span>Arduino</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-cyber-cyan">{'>'}</span>
              <span>Alvik Robot</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-cyber-cyan">{'>'}</span>
              <span>IoT & Robotics</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
