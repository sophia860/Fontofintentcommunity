/**
 * AuthPage — sign in to the Garden.
 * Magic link is the default — works for all existing Garden members with no password.
 * Password tab available for users who have set one.
 */
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { useGardenAuth } from '../lib/useGardenAuth'

const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#faf8f5',
    fontFamily: 'Georgia, serif',
    color: '#1a1714',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
  },
  eyebrow: {
    fontSize: '0.75rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: '#7a7067',
    marginBottom: '1.5rem',
    display: 'block',
  },
  h1: {
    fontSize: 'clamp(2.2rem, 4vw, 3rem)',
    fontWeight: 600,
    margin: '0 0 2rem',
    lineHeight: 1.15,
    fontFamily: "'ACFrenchToast', cursive",
  },
  tabs: {
    display: 'flex',
    gap: '2rem',
    marginBottom: '2rem',
    borderBottom: '1px solid #e8e4df',
  },
  tab: {
    padding: '0 0 0.75rem',
    fontSize: '0.9rem',
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    fontFamily: 'Georgia, serif',
    color: '#7a7067',
    borderBottom: '2px solid transparent',
    marginBottom: '-1px',
  },
  tabActive: {
    padding: '0 0 0.75rem',
    fontSize: '0.9rem',
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    fontFamily: 'Georgia, serif',
    color: '#1a1714',
    borderBottom: '2px solid #1a1714',
    marginBottom: '-1px',
  },
  fieldGroup: {
    marginBottom: '1.5rem',
  },
  fieldLabel: {
    display: 'block',
    fontSize: '0.78rem',
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    color: '#3d3830',
    marginBottom: '0.4rem',
  },
  input: {
    width: '100%',
    padding: '0.6rem 0.75rem',
    border: '1px solid #c5bdb4',
    backgroundColor: '#faf8f5',
    fontFamily: 'Georgia, serif',
    fontSize: '0.9rem',
    color: '#1a1714',
    outline: 'none',
    boxSizing: 'border-box' as const,
  },
  submit: {
    width: '100%',
    fontSize: '0.85rem',
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
    color: '#faf8f5',
    backgroundColor: '#1a1714',
    padding: '0.75rem',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'Georgia, serif',
    marginTop: '0.5rem',
  },
  error: {
    fontSize: '0.85rem',
    color: '#9b2335',
    marginBottom: '1rem',
    lineHeight: 1.5,
  },
  success: {
    fontSize: '0.88rem',
    color: '#3d3830',
    lineHeight: 1.65,
    padding: '1rem 1.25rem',
    backgroundColor: '#f2ede8',
    borderLeft: '3px solid #c5bdb4',
    marginBottom: '1rem',
  },
  ghostLink: {
    display: 'block',
    textAlign: 'center' as const,
    marginTop: '1rem',
    fontSize: '0.78rem',
    color: '#7a7067',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    fontFamily: 'Georgia, serif',
    textDecoration: 'underline',
    textUnderlineOffset: '3px',
  },
  note: {
    fontSize: '0.78rem',
    color: '#7a7067',
    lineHeight: 1.6,
    marginTop: '1.5rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid #e8e4df',
  },
  noteInline: {
    fontSize: '0.78rem',
    color: '#7a7067',
    lineHeight: 1.6,
    marginTop: '1rem',
  },
}

type Mode = 'magic' | 'password'

export function AuthPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const returnTo = searchParams.get('returnTo') || '/'

  const { signInWithMagicLink, signInWithPassword, loading, error } = useGardenAuth()

  const [mode, setMode] = useState<Mode>('magic')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [sent, setSent] = useState(false)
  const [localError, setLocalError] = useState('')

  function switchMode(m: Mode) {
    setMode(m)
    setLocalError('')
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLocalError('')
    const { error: err } = await signInWithMagicLink(email, returnTo)
    if (err) {
      setLocalError(err.message)
    } else {
      setSent(true)
    }
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault()
    setLocalError('')
    const { error: err } = await signInWithPassword(email, password)
    if (!err) navigate(returnTo, { replace: true })
    else setLocalError(err.message)
  }

  const displayError = localError || error || ''

  return (
    <div style={S.page}>
      <div style={S.card}>
        <span style={S.eyebrow}>Page Gallery Editions</span>
        <h1 style={S.h1}>
          {sent ? 'Check your inbox.' : 'Sign in to the Garden.'}
        </h1>

        {sent ? (
          <>
            <p style={S.success}>
              We've sent a sign-in link to <strong>{email}</strong>.
              Follow it to enter the Garden — no password needed.
            </p>
            <button style={S.ghostLink} onClick={() => setSent(false)}>
              Try a different email
            </button>
          </>
        ) : (
          <>
            {/* Mode tabs */}
            <div style={S.tabs}>
              <button
                style={mode === 'magic' ? S.tabActive : S.tab}
                onClick={() => switchMode('magic')}
              >
                Email link
              </button>
              <button
                style={mode === 'password' ? S.tabActive : S.tab}
                onClick={() => switchMode('password')}
              >
                Password
              </button>
            </div>

            {mode === 'magic' ? (
              <form onSubmit={handleMagicLink}>
                {displayError && <p style={S.error}>{displayError}</p>}
                <div style={S.fieldGroup}>
                  <label style={S.fieldLabel}>Email address</label>
                  <input
                    style={S.input}
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="hello@example.com"
                  />
                </div>
                <button style={S.submit} type="submit" disabled={loading || !email}>
                  {loading ? 'Sending…' : 'Send me a sign-in link'}
                </button>
                <p style={S.noteInline}>
                  Works for all existing Garden members — no password required.
                </p>
              </form>
            ) : (
              <form onSubmit={handlePassword}>
                {displayError && <p style={S.error}>{displayError}</p>}
                <div style={S.fieldGroup}>
                  <label style={S.fieldLabel}>Email address</label>
                  <input
                    style={S.input}
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="hello@example.com"
                  />
                </div>
                <div style={S.fieldGroup}>
                  <label style={S.fieldLabel}>Password</label>
                  <input
                    style={S.input}
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Your password"
                  />
                </div>
                <button style={S.submit} type="submit" disabled={loading || !email || !password}>
                  {loading ? 'Signing in…' : 'Sign in'}
                </button>
                <button style={S.ghostLink} type="button" onClick={() => switchMode('magic')}>
                  No password? Use an email link instead
                </button>
              </form>
            )}

            <p style={S.note}>
              The Garden is a private writing environment. Your work is yours.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
