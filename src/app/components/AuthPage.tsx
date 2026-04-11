/**
 * AuthPage — sign in / sign up for the Garden.
 * Minimal, typographic, literary register — matches the rest of the site.
 */
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { supabase } from '../lib/supabase';

const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#F5EDE4',
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
  label: {
    fontSize: '0.75rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: '#7a7067',
    marginBottom: '1.5rem',
    display: 'block',
  },
  h1: {
    fontSize: '2rem',
    fontWeight: 400,
    margin: '0 0 2rem',
    lineHeight: 1.2,
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
    backgroundColor: '#F5EDE4',
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
    color: '#F5EDE4',
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
    backgroundColor: '#EDE1D5',
    borderLeft: '3px solid #c5bdb4',
    marginBottom: '1rem',
  },
  note: {
    fontSize: '0.78rem',
    color: '#7a7067',
    lineHeight: 1.6,
    marginTop: '1.5rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid #e8e4df',
  },
};

export function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/';

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [signupSent, setSignupSent] = useState(false);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      navigate(returnTo, { replace: true });
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}${returnTo}`,
      },
    });
    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setSignupSent(true);
    }
  }

  return (
    <div style={S.page}>
      <div style={S.card}>
        <span style={S.label}>Page Gallery Editions</span>
        <h1 style={S.h1}>
          {mode === 'signin' ? 'Sign in to the Garden.' : 'Enter the Garden.'}
        </h1>

        <div style={S.tabs}>
          <button style={mode === 'signin' ? S.tabActive : S.tab} onClick={() => { setMode('signin'); setError(''); setSignupSent(false); }}>
            Sign in
          </button>
          <button style={mode === 'signup' ? S.tabActive : S.tab} onClick={() => { setMode('signup'); setError(''); setSignupSent(false); }}>
            Create account
          </button>
        </div>

        {signupSent ? (
          <p style={S.success}>
            Check your email. We've sent a confirmation link to <strong>{email}</strong>. Follow it to activate your Garden account.
          </p>
        ) : (
          <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp}>
            {error && <p style={S.error}>{error}</p>}
            <div style={S.fieldGroup}>
              <label style={S.fieldLabel}>Email</label>
              <input
                style={S.input}
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="hello@example.com"
                required
                autoFocus
              />
            </div>
            <div style={S.fieldGroup}>
              <label style={S.fieldLabel}>Password</label>
              <input
                style={S.input}
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'Choose a password (8+ characters)' : 'Your password'}
                required
                minLength={mode === 'signup' ? 8 : undefined}
              />
            </div>
            <button style={S.submit} type="submit" disabled={loading}>
              {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>
        )}

        <p style={S.note}>
          {mode === 'signin'
            ? 'The Garden is a free private writing environment. Your work is private by default.'
            : 'The Garden is free for writers. Your work is private unless you choose to share it.'}
        </p>
      </div>
    </div>
  );
}
