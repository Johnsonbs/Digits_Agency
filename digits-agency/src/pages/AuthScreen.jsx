import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import './AuthScreen.css'

function friendlyError(message) {
  if (!message) return "That didn't work — please try again."
  if (/already registered/i.test(message)) return 'That email already has an account — try signing in instead.'
  if (/invalid login credentials/i.test(message)) return "That email and password don't match — try again."
  if (/duplicate key.*username/i.test(message) || /profiles_username_key/i.test(message)) {
    return 'Someone already picked that username — try another one.'
  }
  if (/password/i.test(message) && /least/i.test(message)) return 'Passwords need at least 6 characters.'
  return "That didn't work — please check your details and try again."
}

function AuthScreen() {
  const { signIn, signUp, continueAsGuest, requestPasswordReset } = useAuth()
  const [mode, setMode] = useState('signin') // 'signin' | 'signup' | 'forgot'
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [shake, setShake] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [checkEmail, setCheckEmail] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const showError = (message) => {
    setError(friendlyError(message))
    setShake(true)
    setTimeout(() => setShake(false), 400)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (mode === 'forgot') {
      setSubmitting(true)
      const { error: resetError } = await requestPasswordReset(email.trim())
      setSubmitting(false)
      if (resetError) {
        showError(resetError.message)
        return
      }
      setResetSent(true)
      return
    }

    if (mode === 'signup' && username.trim().length < 2) {
      showError('Please choose a username with at least 2 characters.')
      return
    }
    if (password.length < 6) {
      showError('Passwords need at least 6 characters.')
      return
    }

    setSubmitting(true)
    const { error: authError } =
      mode === 'signup' ? await signUp(email.trim(), password, username.trim()) : await signIn(email.trim(), password)
    setSubmitting(false)

    if (authError) {
      showError(authError.message)
      return
    }

    if (mode === 'signup') setCheckEmail(true)
  }

  return (
    <div className="auth-screen">
      <div className={`auth-card${shake ? ' auth-card--shake' : ''}`}>
        <h1 className="auth-card__title">Digit's Agency</h1>
        <p className="auth-card__subtitle">Sign in to save your progress and join the leaderboard.</p>

        {checkEmail ? (
          <div className="auth-card__notice">
            <span aria-hidden="true" style={{ fontSize: '2rem' }}>
              📬
            </span>
            <p>Almost there! Check your email to confirm your account, then sign in.</p>
            <button
              type="button"
              className="tool-btn tool-btn--purple"
              onClick={() => {
                setCheckEmail(false)
                setMode('signin')
              }}
            >
              Back to Sign In
            </button>
          </div>
        ) : resetSent ? (
          <div className="auth-card__notice">
            <span aria-hidden="true" style={{ fontSize: '2rem' }}>
              📬
            </span>
            <p>If that email has an account, a reset link is on its way. Check your inbox.</p>
            <button
              type="button"
              className="tool-btn tool-btn--purple"
              onClick={() => {
                setResetSent(false)
                setMode('signin')
              }}
            >
              Back to Sign In
            </button>
          </div>
        ) : mode === 'forgot' ? (
          <form className="auth-card__form" onSubmit={handleSubmit}>
            <p className="auth-card__subtitle" style={{ margin: '0 0 4px' }}>
              Enter your email and we'll send you a link to set a new password.
            </p>
            <label className="auth-card__field">
              Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>

            {error && <p className="auth-card__error">{error}</p>}

            <button type="submit" className="tool-btn tool-btn--purple auth-card__submit" disabled={submitting}>
              {submitting ? 'One sec…' : 'Send Reset Link'}
            </button>
            <button
              type="button"
              className="tool-btn tool-btn--ghost auth-card__submit"
              onClick={() => {
                setMode('signin')
                setError(null)
              }}
            >
              Back to Sign In
            </button>
          </form>
        ) : (
          <>
            <div className="auth-card__tabs">
              <button
                type="button"
                className={`auth-card__tab${mode === 'signin' ? ' auth-card__tab--active' : ''}`}
                onClick={() => {
                  setMode('signin')
                  setError(null)
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`auth-card__tab${mode === 'signup' ? ' auth-card__tab--active' : ''}`}
                onClick={() => {
                  setMode('signup')
                  setError(null)
                }}
              >
                Sign Up
              </button>
            </div>

            <form className="auth-card__form" onSubmit={handleSubmit}>
              {mode === 'signup' && (
                <label className="auth-card__field">
                  Username
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="What should the leaderboard call you?"
                    maxLength={24}
                    required
                  />
                </label>
              )}
              <label className="auth-card__field">
                Email
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </label>
              <label className="auth-card__field">
                Password
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </label>

              {error && <p className="auth-card__error">{error}</p>}

              <button type="submit" className="tool-btn tool-btn--purple auth-card__submit" disabled={submitting}>
                {submitting ? 'One sec…' : mode === 'signup' ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            {mode === 'signin' && (
              <button
                type="button"
                className="auth-card__forgot-link"
                onClick={() => {
                  setMode('forgot')
                  setError(null)
                }}
              >
                Forgot password?
              </button>
            )}

            <div className="auth-card__divider">
              <span>or</span>
            </div>

            <button type="button" className="tool-btn tool-btn--ghost auth-card__guest" onClick={continueAsGuest}>
              🎭 Play as Guest
            </button>
            <p className="auth-card__guest-note">
              Guests can play everything a new account can, but won't appear on the leaderboard.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default AuthScreen
