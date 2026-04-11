import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { Nav } from './Nav';
import { supabase } from '../lib/supabase';
import { pickHeadingFont } from '../lib/fontMapper';

type Profile = {
  id: string;
  display_name: string;
  bio?: string;
  location?: string;
  forms_worked_in?: string[];
  website?: string;
};

type Writing = {
  id: string;
  title: string;
  body?: string;
  state: string;
  tags?: string[];
  word_count?: number;
  created_at: string;
};

const S: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', backgroundColor: '#F5EDE4', fontFamily: 'Georgia, serif', color: '#1a1714' },
  inner: { maxWidth: 760, margin: '0 auto', padding: '4rem 1.5rem' },
  label: { fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#7a7067', marginBottom: '1rem', display: 'block' },
  h1: { fontWeight: 600, fontSize: 'clamp(2.2rem, 4vw, 3.25rem)', marginBottom: '0.5rem', lineHeight: 1.1, fontFamily: pickHeadingFont('WriterProfile-h1') },
  bio: { fontSize: '0.95rem', lineHeight: 1.75, color: '#3d3830', maxWidth: '540px', marginBottom: '1.5rem' },
  meta: { fontSize: '0.78rem', color: '#7a7067', marginBottom: '2.5rem', lineHeight: 1.6 },
  pieceRow: { padding: '1.25rem 0', borderBottom: '1px solid #e8e4df' },
  pieceTitle: { fontStyle: 'italic', fontSize: '1rem', color: '#1a1714', textDecoration: 'none', display: 'block', marginBottom: '0.3rem' },
  pieceExcerpt: { fontSize: '0.85rem', color: '#7a7067', lineHeight: 1.6, marginBottom: '0.5rem' },
  pieceMeta: { fontSize: '0.75rem', color: '#aaa' },
  // Logged-out landing styles
  landingHeader: { padding: '5rem 0 3rem' },
  landingTitle: { fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', fontWeight: 600, lineHeight: 1.1, marginBottom: '1.5rem', fontFamily: pickHeadingFont('WriterProfile-landingTitle') },
  landingBody: { fontSize: '1rem', lineHeight: 1.75, color: '#3d3830', maxWidth: '540px', marginBottom: '2rem' },
  howSection: { padding: '3rem 0', borderTop: '1px solid #e8e4df' },
  howGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '2rem', marginTop: '1.5rem' },
  howItem: { borderTop: '2px solid #e8e4df', paddingTop: '1rem' },
  howItemTitle: { fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '0.02em' },
  howItemBody: { fontSize: '0.85rem', lineHeight: 1.6, color: '#7a7067' },
  ctaBlock: { padding: '3rem 0', borderTop: '1px solid #e8e4df', display: 'flex', gap: '2rem', alignItems: 'baseline', flexWrap: 'wrap' as const },
  ctaPrimary: { fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase' as const, color: '#F5EDE4', backgroundColor: '#1a1714', padding: '0.6rem 1.4rem', textDecoration: 'none' },
  ctaSecondary: { fontSize: '0.85rem', color: '#7a7067', textDecoration: 'none', borderBottom: '1px solid #c5bdb4' },
};

function WriterLanding() {
  return (
    <div style={S.inner}>
      <div style={S.landingHeader}>
        <span style={S.label}>The Garden — Writers</span>
        <h1 style={S.landingTitle}>A place for writing that isn't finished yet.</h1>
        <p style={S.landingBody}>
          The Garden is not a submissions portal. It is a space where drafts,
          fragments, and unfinished work can exist without destination. Your
          writing lives here — privately — until you decide otherwise.
        </p>
        <p style={S.landingBody}>
          Journals registered in the Garden can discover writers through their
          work. If an editor is drawn to what you're doing, they may scout a
          piece. You keep full control. Nothing is published without your consent.
        </p>
      </div>

      <div style={S.howSection}>
        <span style={S.label}>How it works</span>
        <div style={S.howGrid}>
          <div style={S.howItem}>
            <p style={S.howItemTitle}>Write</p>
            <p style={S.howItemBody}>
              Use the writing surface to create pieces. Every keystroke is
              recorded as signal data — the hesitations, the confidence, the
              pace of your thinking.
            </p>
          </div>
          <div style={S.howItem}>
            <p style={S.howItemTitle}>Grow</p>
            <p style={S.howItemBody}>
              Pieces move through states: seed, sprout, bloom. You decide when
              something is ready. The Garden tracks your patterns and obsessions
              over time.
            </p>
          </div>
          <div style={S.howItem}>
            <p style={S.howItemTitle}>Be found</p>
            <p style={S.howItemBody}>
              When a piece reaches bloom and you place it in the bloom pool,
              journal editors browsing the Garden can see it. Scouting is quiet
              — no public metrics, no likes.
            </p>
          </div>
        </div>
      </div>

      <div style={S.ctaBlock}>
        <Link to="/apply" style={S.ctaPrimary}>Join as a writer</Link>
        <Link to="/auth" style={S.ctaSecondary}>Already have an account? Sign in</Link>
      </div>
    </div>
  );
}

export function WriterProfile() {
  const { id } = useParams<{ id?: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [writings, setWritings] = useState<Writing[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id ?? null);
      const targetId = id || user?.id;
      if (!targetId) { setLoading(false); return; }

      const profileRes = await supabase
        .from('profiles')
        .select('id, display_name, bio, location, forms_worked_in, website')
        .eq('id', targetId)
        .single();

      const isOwner = user?.id === targetId;
      let writingsQuery = supabase
        .from('writings')
        .select('id, title, body, state, tags, word_count, created_at')
        .eq('author_id', targetId)
        .order('created_at', { ascending: false });

      if (!isOwner) {
        writingsQuery = writingsQuery.eq('state', 'bloom').eq('in_bloom_pool', true);
      }

      const writingsRes = await writingsQuery;
      if (profileRes.data) setProfile(profileRes.data as Profile);
      setWritings((writingsRes.data as Writing[]) || []);
      setLoading(false);
    }
    load();
  }, [id]);

  // Logged-out visitor with no specific writer ID — show landing page
  if (!loading && !profile && !id) {
    return (
      <div style={S.page}>
        <Nav />
        <WriterLanding />
      </div>
    );
  }

  return (
    <div style={S.page}>
      <Nav />
      <div style={S.inner}>
        {loading && <p style={{ color: '#7a7067', fontStyle: 'italic' }}>Loading\u2026</p>}

        {!loading && !profile && (
          <p style={{ color: '#7a7067' }}>
            Writer not found.
          </p>
        )}

        {!loading && profile && (
          <>
            <span style={S.label}>Writer</span>
            <h1 style={S.h1}>{profile.display_name}</h1>
            {profile.bio && <p style={S.bio}>{profile.bio}</p>}
            <div style={S.meta}>
              {profile.location && <span>{profile.location} \u00b7 </span>}
              {profile.forms_worked_in && profile.forms_worked_in.length > 0 && (
                <span>{profile.forms_worked_in.join(', ')} \u00b7 </span>
              )}
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noopener noreferrer" style={{ color: '#7a7067' }}>
                  {profile.website.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>

            <p style={{ ...S.label, marginBottom: '1rem' }}>
              {currentUserId === (id || currentUserId) ? 'Your writing' : 'Published work'}
            </p>

            {writings.length === 0 && (
              <p style={{ color: '#7a7067', fontStyle: 'italic', fontSize: '0.9rem' }}>No pieces here yet.</p>
            )}

            {writings.map(w => (
              <div key={w.id} style={S.pieceRow}>
                <Link to={`/piece/${w.id}`} style={S.pieceTitle}>
                  {w.title || <em style={{ color: '#aaa' }}>Untitled</em>}
                </Link>
                {w.body && (
                  <p style={S.pieceExcerpt}>{w.body.slice(0, 160)}{w.body.length > 160 ? '\u2026' : ''}</p>
                )}
                <p style={S.pieceMeta}>
                  {w.word_count ? `${w.word_count.toLocaleString()} words \u00b7 ` : ''}
                  {new Date(w.created_at).toLocaleDateString('en-GB', { year: 'numeric', month: 'long' })}
                  {w.tags && w.tags.length > 0 ? ' \u00b7 ' + w.tags.join(', ') : ''}
                </p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default WriterProfile;
