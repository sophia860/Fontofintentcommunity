/**
 * WriterDashboard — Page Gallery Garden
 *
 * Authenticated view: sign in, view your profile, and edit it.
 * Reads from and upserts to public.profiles in Supabase.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Nav } from './Nav';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/useAuth';
import type { Profile } from '../lib/types';

type ProfileDraft = Omit<Profile, 'id' | 'created_at' | 'updated_at'>;

const BLANK_DRAFT: ProfileDraft = {
  display_name: null,
  slug: null,
  avatar_url: null,
  short_bio: null,
  full_bio: null,
  location: null,
  website: null,
  instagram: null,
  genres: [],
  themes: [],
  publication_history: null,
  is_public: true,
  role: 'writer',
};

const GENRE_OPTIONS = ['poetry', 'fiction', 'essay', 'prose poem', 'hybrid', 'lyric essay', 'nonfiction', 'criticism'];

const S: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', backgroundColor: '#faf8f5', fontFamily: 'Georgia, serif', color: '#1a1714' },
  body: { maxWidth: '640px', margin: '0 auto', padding: '4rem 3rem' },
  heading: { fontSize: '2rem', fontWeight: 400, margin: '0 0 0.5rem' },
  sub: { fontSize: '0.88rem', color: '#7a7067', marginBottom: '3rem' },
  label: { display: 'block', fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#7a7067', marginBottom: '0.4rem' },
  input: { width: '100%', padding: '0.5rem 0', border: 'none', borderBottom: '1px solid #c5bdb4', backgroundColor: 'transparent', fontFamily: 'Georgia, serif', fontSize: '0.95rem', color: '#1a1714', outline: 'none', boxSizing: 'border-box' as const },
  textarea: { width: '100%', padding: '0.5rem 0', border: 'none', borderBottom: '1px solid #c5bdb4', backgroundColor: 'transparent', fontFamily: 'Georgia, serif', fontSize: '0.95rem', color: '#1a1714', outline: 'none', resize: 'vertical' as const, boxSizing: 'border-box' as const, minHeight: '80px' },
  field: { marginBottom: '2rem' },
  tagRow: { display: 'flex', flexWrap: 'wrap' as const, gap: '0.5rem', marginTop: '0.5rem' },
  chip: { fontSize: '0.78rem', padding: '0.25rem 0.7rem', border: '1px solid #c5bdb4', backgroundColor: 'transparent', color: '#3d3830', cursor: 'pointer', fontFamily: 'Georgia, serif' },
  chipActive: { fontSize: '0.78rem', padding: '0.25rem 0.7rem', border: '1px solid #1a1714', backgroundColor: '#1a1714', color: '#faf8f5', cursor: 'pointer', fontFamily: 'Georgia, serif' },
  toggleRow: { display: 'flex', alignItems: 'center', gap: '1rem' },
  toggle: { cursor: 'pointer' },
  submit: { padding: '0.7rem 2rem', backgroundColor: '#1a1714', color: '#faf8f5', border: 'none', fontFamily: 'Georgia, serif', fontSize: '0.88rem', letterSpacing: '0.05em', cursor: 'pointer', marginTop: '1rem' },
  divider: { borderTop: '1px solid #e8e4df', margin: '2.5rem 0' },
  status: { fontSize: '0.85rem', color: '#7a7067', marginTop: '1rem', fontStyle: 'italic' },
  signInSection: { textAlign: 'center' as const },
  signInHeading: { fontSize: '1.4rem', fontWeight: 400, marginBottom: '1rem' },
  signInBody: { fontSize: '0.9rem', color: '#3d3830', marginBottom: '2rem', lineHeight: 1.65 },
  emailInput: { width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #c5bdb4', backgroundColor: '#fff', fontFamily: 'Georgia, serif', fontSize: '0.95rem', color: '#1a1714', outline: 'none', boxSizing: 'border-box' as const, marginBottom: '1rem' },
  ctaLink: { fontSize: '0.85rem', color: '#7a7067', borderBottom: '1px solid #c5bdb4', textDecoration: 'none' },
};

// ─── Sign-in form (magic link) ────────────────────────────────────────────────

function SignInForm() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const { error: err } = await supabase.auth.signInWithOtp({ email });
    if (err) setError(err.message);
    else setSent(true);
  }

  if (sent) {
    return (
      <p style={S.status}>
        Check your inbox — a sign-in link has been sent to <strong>{email}</strong>.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        required
        placeholder="your@email.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={S.emailInput}
      />
      {error && <p style={{ ...S.status, color: '#b04040' }}>{error}</p>}
      <button type="submit" style={S.submit}>Send sign-in link</button>
    </form>
  );
}

// ─── Profile edit form ────────────────────────────────────────────────────────

function ProfileForm({ userId }: { userId: string }) {
  const [draft, setDraft] = useState<ProfileDraft>(BLANK_DRAFT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    async function loadProfile() {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (data) {
        const { id: _id, created_at: _c, updated_at: _u, ...rest } = data as Profile;
        setDraft({ ...BLANK_DRAFT, ...rest });
      }
      setLoading(false);
    }
    loadProfile();
  }, [userId]);

  function set<K extends keyof ProfileDraft>(key: K, value: ProfileDraft[K]) {
    setDraft(d => ({ ...d, [key]: value }));
  }

  function toggleGenre(g: string) {
    setDraft(d => ({
      ...d,
      genres: d.genres.includes(g) ? d.genres.filter(x => x !== g) : [...d.genres, g],
    }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveStatus('');

    const { error } = await supabase
      .from('profiles')
      .upsert({ id: userId, ...draft }, { onConflict: 'id' });

    setSaving(false);
    if (error) {
      setSaveStatus(`Error: ${error.message}`);
    } else {
      setSaveStatus('Profile saved.');
    }
  }

  if (loading) return <p style={S.status}>Loading your profile…</p>;

  return (
    <form onSubmit={handleSave}>
      <div style={S.field}>
        <label style={S.label}>Display name</label>
        <input
          style={S.input}
          value={draft.display_name ?? ''}
          onChange={e => set('display_name', e.target.value || null)}
          placeholder="Your name as it appears in the directory"
        />
      </div>

      <div style={S.field}>
        <label style={S.label}>Slug (URL handle)</label>
        <input
          style={S.input}
          value={draft.slug ?? ''}
          onChange={e => set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-') || null)}
          placeholder="e.g. ada-lovelace → /writers/ada-lovelace"
        />
      </div>

      <div style={S.field}>
        <label style={S.label}>Location</label>
        <input
          style={S.input}
          value={draft.location ?? ''}
          onChange={e => set('location', e.target.value || null)}
          placeholder="City, country"
        />
      </div>

      <div style={S.field}>
        <label style={S.label}>Short bio <span style={{ textTransform: 'none', letterSpacing: 0 }}>(appears in directory listings)</span></label>
        <textarea
          style={S.textarea}
          value={draft.short_bio ?? ''}
          onChange={e => set('short_bio', e.target.value || null)}
          placeholder="One or two sentences"
          rows={3}
        />
      </div>

      <div style={S.field}>
        <label style={S.label}>Full statement</label>
        <textarea
          style={S.textarea}
          value={draft.full_bio ?? ''}
          onChange={e => set('full_bio', e.target.value || null)}
          placeholder="A longer artist statement or bio"
          rows={6}
        />
      </div>

      <div style={S.field}>
        <label style={S.label}>Genres & forms</label>
        <div style={S.tagRow}>
          {GENRE_OPTIONS.map(g => (
            <button
              key={g}
              type="button"
              style={draft.genres.includes(g) ? S.chipActive : S.chip}
              onClick={() => toggleGenre(g)}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div style={S.field}>
        <label style={S.label}>Themes <span style={{ textTransform: 'none', letterSpacing: 0 }}>(comma-separated)</span></label>
        <input
          style={S.input}
          value={draft.themes.join(', ')}
          onChange={e => set('themes', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
          placeholder="e.g. grief, migration, queerness"
        />
      </div>

      <div style={S.field}>
        <label style={S.label}>Publication history</label>
        <textarea
          style={S.textarea}
          value={draft.publication_history ?? ''}
          onChange={e => set('publication_history', e.target.value || null)}
          placeholder="Where your work has appeared"
          rows={4}
        />
      </div>

      <div style={S.field}>
        <label style={S.label}>Website</label>
        <input
          style={S.input}
          type="url"
          value={draft.website ?? ''}
          onChange={e => set('website', e.target.value || null)}
          placeholder="https://yoursite.com"
        />
      </div>

      <div style={S.field}>
        <label style={S.label}>Instagram handle</label>
        <input
          style={S.input}
          value={draft.instagram ?? ''}
          onChange={e => set('instagram', e.target.value || null)}
          placeholder="@handle"
        />
      </div>

      <div style={S.field}>
        <label style={S.label}>Profile visibility</label>
        <div style={S.toggleRow}>
          <input
            type="checkbox"
            id="is_public"
            checked={draft.is_public}
            onChange={e => set('is_public', e.target.checked)}
            style={S.toggle}
          />
          <label htmlFor="is_public" style={{ fontSize: '0.9rem', color: '#3d3830', cursor: 'pointer' }}>
            {draft.is_public ? 'Public — visible in the writer directory' : 'Private — hidden from the directory'}
          </label>
        </div>
      </div>

      <hr style={S.divider} />

      <button type="submit" style={S.submit} disabled={saving}>
        {saving ? 'Saving…' : 'Save profile'}
      </button>

      {saveStatus && <p style={S.status}>{saveStatus}</p>}

      {draft.slug && (
        <p style={{ ...S.status, marginTop: '0.75rem' }}>
          <Link to={`/writers/${draft.slug}`} style={S.ctaLink}>
            View your public profile →
          </Link>
        </p>
      )}
    </form>
  );
}

// ─── Dashboard shell ──────────────────────────────────────────────────────────

export function WriterDashboard() {
  const { user, loading, signOut } = useAuth();

  return (
    <div style={S.page}>
      <Nav />
      <div style={S.body}>
        <h1 style={S.heading}>Writer Dashboard</h1>

        {loading && <p style={S.sub}>Loading…</p>}

        {!loading && !user && (
          <>
            <p style={S.sub}>
              Sign in to create or edit your Garden profile.
            </p>
            <div style={S.signInSection}>
              <p style={S.signInBody}>
                We use passwordless magic links — enter your email and we'll send you a sign-in link.
              </p>
              <SignInForm />
            </div>
          </>
        )}

        {!loading && user && (
          <>
            <p style={S.sub}>
              Signed in as {user.email}.{' '}
              <button
                onClick={signOut}
                style={{ background: 'none', border: 'none', fontFamily: 'Georgia, serif', fontSize: '0.88rem', color: '#7a7067', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
              >
                Sign out
              </button>
            </p>
            <ProfileForm userId={user.id} />
          </>
        )}
      </div>
    </div>
  );
}

export default WriterDashboard;
