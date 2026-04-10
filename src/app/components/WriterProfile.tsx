import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { Nav } from './Nav';
import { supabase } from '../lib/supabase';

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

      // If no id param, show the current user's profile
      const targetId = id || user?.id;
      if (!targetId) { setLoading(false); return; }

      const profileRes = await supabase
        .from('profiles')
        .select('id, display_name, bio, location, forms_worked_in, website')
        .eq('id', targetId)
        .single();

      // Public view: only bloom pieces that are in the bloom pool.
      // Own view: all pieces regardless of state.
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

  const S: Record<string, React.CSSProperties> = {
    page: { minHeight: '100vh', backgroundColor: '#faf8f5', fontFamily: 'Georgia, serif', color: '#1a1714' },
    inner: { maxWidth: 760, margin: '0 auto', padding: '4rem 1.5rem' },
    label: { fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#7a7067', marginBottom: '1rem', display: 'block' },
    h1: { fontWeight: 400, fontSize: '2.25rem', marginBottom: '0.5rem' },
    bio: { fontSize: '0.95rem', lineHeight: 1.75, color: '#3d3830', maxWidth: '540px', marginBottom: '1.5rem' },
    meta: { fontSize: '0.78rem', color: '#7a7067', marginBottom: '2.5rem', lineHeight: 1.6 },
    pieceRow: { padding: '1.25rem 0', borderBottom: '1px solid #e8e4df' },
    pieceTitle: { fontStyle: 'italic', fontSize: '1rem', color: '#1a1714', textDecoration: 'none', display: 'block', marginBottom: '0.3rem' },
    pieceExcerpt: { fontSize: '0.85rem', color: '#7a7067', lineHeight: 1.6, marginBottom: '0.5rem' },
    pieceMeta: { fontSize: '0.75rem', color: '#aaa' },
  };

  return (
    <div style={S.page}>
      <Nav />
      <div style={S.inner}>
        {loading && <p style={{ color: '#7a7067', fontStyle: 'italic' }}>Loading…</p>}

        {!loading && !profile && (
          <p style={{ color: '#7a7067' }}>
            {id ? 'Writer not found.' : (
              <>Sign in to see your profile. <Link to="/auth" style={{ color: '#1a1714' }}>Sign in →</Link></>
            )}
          </p>
        )}

        {!loading && profile && (
          <>
            <span style={S.label}>Writer</span>
            <h1 style={S.h1}>{profile.display_name}</h1>

            {profile.bio && <p style={S.bio}>{profile.bio}</p>}

            <div style={S.meta}>
              {profile.location && <span>{profile.location} · </span>}
              {profile.forms_worked_in && profile.forms_worked_in.length > 0 && (
                <span>{profile.forms_worked_in.join(', ')} · </span>
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
                  <p style={S.pieceExcerpt}>{w.body.slice(0, 160)}{w.body.length > 160 ? '…' : ''}</p>
                )}
                <p style={S.pieceMeta}>
                  {w.word_count ? `${w.word_count.toLocaleString()} words · ` : ''}
                  {new Date(w.created_at).toLocaleDateString('en-GB', { year: 'numeric', month: 'long' })}
                  {w.tags && w.tags.length > 0 ? ' · ' + w.tags.join(', ') : ''}
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
