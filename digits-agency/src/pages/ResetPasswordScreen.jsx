import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import './AuthScreen.css'

function ResetPasswordScreen() {
  const { updatePassword, completeRecovery } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState(null)
  const [shake, setShake] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const showError = (message) => {
    setError(message)
    setShake(true)
    setTimeout(() => setShake(false), 400)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      showError('Passwords need at least 6 characters.')
      return
    }
    if (password !== confirm) {
      showError("Those two passwords don't match — try typing them again.")
      return
    }

    setSubmitting(true)
    const { error: updateError } = await updatePassword(password)
    setSubmitting(false)

    if (updateError) {
      showError("That didn't work — please try the reset link again.")
      return
    }

    setDone(true)
  }

  return (
    <div className="auth-screen">
      <div className={`auth-card${shake ? ' auth-card--shake' : ''}`}>
        <h1 className="auth-card__title">Set a New Password</h1>

        {done ? (
          <div className="auth-card__notice">
            <span aria-hidden="true" style={{ fontSize: '2rem' }}>
              🎉
            </span>
            <p>Your password is updated! You're all set.</p>
            <button type="button" className="tool-btn tool-btn--purple" onClick={completeRecovery}>
              Continue to Digit's Agency
            </button>
          </div>
        ) : (
          <form className="auth-card__form" onSubmit={handleSubmit}>
            <label className="auth-card__field">
              New Password
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
            <label className="auth-card__field">
              Confirm Password
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            </label>

            {error && <p className="auth-card__error">{error}</p>}

            <button type="submit" className="tool-btn tool-btn--purple auth-card__submit" disabled={submitting}>
              {submitting ? 'One sec…' : 'Save New Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default ResetPasswordScreen
