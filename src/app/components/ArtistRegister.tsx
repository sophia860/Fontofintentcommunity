/**
 * ArtistRegister — Join The Garden as an artist.
 * Creates an `artists` row linked to the signed-in user's profile.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useGardenAuth } from '../lib/useGardenAuth';
import { Nav } from './Nav';

const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#faf8f5',
    fontFamily: 'Georgia, serif',
    color: '#1a1714',
  },
  hero: {
    padding: '7rem 3rem 5rem',
    maxWidth: '640px',
    margin: '0 auto',
  },
  eyebrow: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.75rem',
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: '#7a7067',
    marginBottom: '1.5rem',
  },
  headline: {
    fontFamily: 'Georgia, serif',
    fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
    fontWeight: 400,
    lineHeight: 1.15,
    color: '#1a1714',
    marginBottom: '1.25rem',
  },
  subtitle: {
    fontFamily: 'Georgia, serif',
    fontSize: '1rem',
    fontStyle: 'italic',
    color: '#7a7067',
    lineHeight: 1.6,
    maxWidth: '480px',
    marginBottom: '3rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.75rem',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  label: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.72rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: '#7a7067',
  },
  input: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.95rem',
    color: '#1a1714',
    backgroundColor: '#f5f1ec',
    border: '1px solid #e8e4df',
    padding: '0.7rem 0.9rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as const,
  },
  textarea: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.95rem',
    color: '#1a1714',
    backgroundColor: '#f5f1ec',
    border: '1px solid #e8e4df',
    padding: '0.7rem 0.9rem',
    outline: 'none',
    resize: 'vertical' as const,
    minHeight: '110px',
    width: '100%',
    boxSizing: 'border-box' as const,
  },
  hint: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.8rem',
    color: '#b0a89e',
    fontStyle: 'italic',
  },
  btnPrimary: {
    alignSelf: 'flex-start' as const,
    fontFamily: 'Georgia, serif',
    fontSize: '0.9rem',
    letterSpacing: '0.04em',
    color: '#faf8f5',
    backgroundColor: '#1a1714',
    border: 'none',
    padding: '0.75rem 2rem',
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
  authPrompt: {
    padding: '7rem 3rem',
    maxWidth: '640px',
    margin: '0 auto',
    fontFamily: 'Georgia, serif',
    fontSize: '1rem',
    color: '#7a7067',
    fontStyle: 'italic',
  },
  authLink: {
    color: '#1a1714',
    textDecoration: 'none',
    borderBottom: '1px solid #1a1714',
    paddingBottom: '1px',
    fontStyle: 'normal' as const,
  },
};

export function ArtistRegister() {
  const { isAuthenticated, loading: authLoading, authUser } = useGardenAuth();
  const navigate = useNavigate();

  const [bio, setBio] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [specialism, setSpecialism] = useState('');
  const [rateInput, setRateInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  // Check if this user already has an artist profile.
  useEffect(() => {
    if (!authUser) return;
    supabase
      .from('artists')
      .select('id')
      .eq('user_id', authUser.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setAlreadyRegistered(true);
      });
  }, [authUser]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!authUser) {
      toast.error('You must be signed in to register as an artist.');
      return;
    }

    const rateCents = parseInt(rateInput || '0', 10) * 100;

    setSubmitting(true);

    const { error } = await supabase.from('artists').insert({
      user_id: authUser.id,
      bio: bio.trim() || null,
      portfolio_url: portfolioUrl.trim() || null,
      specialism: specialism.trim() || null,
      rate_cents: rateCents,
      is_accepting: true,
    });

    setSubmitting(false);

    if (error) {
      if (error.code === '23505') {
        toast.error('You already have an artist profile.');
      } else {
        toast.error('Something went wrong. Please try again.');
        console.error('[ArtistRegister] insert error:', error);
      }
      return;
    }

    toast.success('Your artist profile is live in The Garden.');
    navigate('/commissions');
  }

  if (authLoading) return null;

  if (!isAuthenticated) {
    return (
      <div style={S.page}>
        <Nav />
        <p style={S.authPrompt}>
          You need to{' '}
          <a href="/auth?returnTo=/artist-register" style={S.authLink}>
            sign in
          </a>{' '}
          to join The Garden as an artist.
        </p>
      </div>
    );
  }

  if (alreadyRegistered) {
    return (
      <div style={S.page}>
        <Nav />
        <p style={S.authPrompt}>
          You already have an artist profile in The Garden.{' '}
          <a href="/commissions" style={S.authLink}>
            View the commissions page →
          </a>
        </p>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <Nav />

      <section style={S.hero}>
        <p style={S.eyebrow}>The Garden</p>
        <h1 style={S.headline}>Join as an Artist</h1>
        <p style={S.subtitle}>
          List yourself as a commission-ready artist and connect with writers,
          journals, and publications in The Garden.
        </p>

        <form style={S.form} onSubmit={handleSubmit}>
          <div style={S.fieldGroup}>
            <label style={S.label} htmlFor="ar-specialism">Specialism</label>
            <input
              id="ar-specialism"
              type="text"
              style={S.input}
              value={specialism}
              onChange={(e) => setSpecialism(e.target.value)}
              placeholder="e.g. Cover design, typographic composition"
              required
            />
          </div>

          <div style={S.fieldGroup}>
            <label style={S.label} htmlFor="ar-bio">Bio</label>
            <textarea
              id="ar-bio"
              style={S.textarea}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell writers a little about your practice and approach…"
            />
          </div>

          <div style={S.fieldGroup}>
            <label style={S.label} htmlFor="ar-portfolio">Portfolio URL</label>
            <input
              id="ar-portfolio"
              type="url"
              style={S.input}
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              placeholder="https://yoursite.com"
            />
          </div>

          <div style={S.fieldGroup}>
            <label style={S.label} htmlFor="ar-rate">Starting rate (£)</label>
            <input
              id="ar-rate"
              type="number"
              min={0}
              step={1}
              style={S.input}
              value={rateInput}
              onChange={(e) => setRateInput(e.target.value)}
              placeholder="0"
            />
            <span style={S.hint}>Leave blank or 0 to show "Rate on request".</span>
          </div>

          <button type="submit" style={S.btnPrimary} disabled={submitting}>
            {submitting ? 'Saving…' : 'Join The Garden as an artist'}
          </button>
        </form>
      </section>
    </div>
  );
}
