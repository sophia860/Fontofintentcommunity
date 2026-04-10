/**
 * WriterProfile — Page Gallery Garden
 *
 * Public view of a single writer's profile, fetched from the Supabase
 * public.profiles table. Accessible by slug or UUID.
 */
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { Nav } from './Nav';
import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/types';

const S: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', backgroundColor: '#faf8f5', fontFamily: 'Georgia, serif', color: '#1a1714' },
  body: { maxWidth: '680px', margin: '0 auto', padding: '4rem 3rem' },
  label: { fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#7a7067', marginBottom: '1.5rem' },
  name: { fontSize: '2rem', fontWeight: 400, margin: '0 0 0.5rem', lineHeight: 1.15 },
  location: { fontSize: '0.9rem', color: '#7a7067', marginBottom: '2rem' },
  shortBio: { fontSize: '1.05rem', lineHeight: 1.75, color: '#3d3830', marginBottom: '2rem', maxWidth: '520px' },
  fullBio: { fontSize: '0.95rem', lineHeight: 1.8, color: '#3d3830', marginBottom: '2rem' },
  section: { marginBottom: '2rem' },
  sectionLabel: { fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#7a7067', marginBottom: '0.75rem' },
  tags: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' as const },
  tag: { fontSize: '0.78rem', padding: '0.2rem 0.6rem', border: '1px solid #e8e4df', color: '#7a7067' },
  themeTag: { fontSize: '0.78rem', padding: '0.2rem 0.6rem', border: '1px solid #f0ece7', color: '#9a9088' },
  pubHistory: { fontSize: '0.88rem', lineHeight: 1.7, color: '#3d3830', whiteSpace: 'pre-wrap' as const },
  links: { display: 'flex', gap: '1.5rem', flexWrap: 'wrap' as const },
  link: { fontSize: '0.85rem', color: '#1a1714', borderBottom: '1px solid #c5bdb4', textDecoration: 'none' },
  divider: { borderTop: '1px solid #e8e4df', margin: '2rem 0' },
  back: { fontSize: '0.82rem', color: '#7a7067', textDecoration: 'none', borderBottom: '1px solid transparent' },
  loading: { padding: '4rem 3rem', color: '#7a7067', fontSize: '0.9rem' },
  notFound: { padding: '4rem 3rem', color: '#7a7067', fontSize: '0.9rem', fontStyle: 'italic' },
};

export function WriterProfile() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function fetchProfile() {
      setLoading(true);
      setNotFound(false);

      // Try matching by slug first, fall back to UUID match
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('is_public', true);

      // If it looks like a UUID use id column, otherwise use slug
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id ?? '');
      query = isUuid ? query.eq('id', id) : query.eq('slug', id);

      const { data, error } = await query.maybeSingle();

      if (error || !data) {
        setNotFound(true);
      } else {
        setProfile(data as Profile);
      }
      setLoading(false);
    }

    fetchProfile();
  }, [id]);

  return (
    <div style={S.page}>
      <Nav />
      <div style={S.body}>
        <Link to="/writers" style={S.back}>← Writers</Link>

        {loading && <p style={S.loading}>Loading profile…</p>}

        {!loading && notFound && (
          <p style={S.notFound}>This writer profile does not exist or is not public.</p>
        )}

        {!loading && profile && (
          <>
            <p style={{ ...S.label, marginTop: '2rem' }}>
              {profile.role === 'editor' ? 'Editor' : profile.role === 'journal' ? 'Journal' : 'Writer'} — The Garden
            </p>
            <h1 style={S.name}>{profile.display_name ?? '(unnamed)'}</h1>
            {profile.location && <p style={S.location}>{profile.location}</p>}

            {profile.short_bio && <p style={S.shortBio}>{profile.short_bio}</p>}

            {profile.full_bio && (
              <>
                <hr style={S.divider} />
                <p style={S.fullBio}>{profile.full_bio}</p>
              </>
            )}

            {(profile.genres.length > 0 || profile.themes.length > 0) && (
              <>
                <hr style={S.divider} />
                {profile.genres.length > 0 && (
                  <div style={S.section}>
                    <p style={S.sectionLabel}>Genres & forms</p>
                    <div style={S.tags}>
                      {profile.genres.map(g => <span key={g} style={S.tag}>{g}</span>)}
                    </div>
                  </div>
                )}
                {profile.themes.length > 0 && (
                  <div style={S.section}>
                    <p style={S.sectionLabel}>Themes</p>
                    <div style={S.tags}>
                      {profile.themes.map(t => <span key={t} style={S.themeTag}>{t}</span>)}
                    </div>
                  </div>
                )}
              </>
            )}

            {profile.publication_history && (
              <>
                <hr style={S.divider} />
                <div style={S.section}>
                  <p style={S.sectionLabel}>Publication history</p>
                  <p style={S.pubHistory}>{profile.publication_history}</p>
                </div>
              </>
            )}

            {(profile.website || profile.instagram) && (
              <>
                <hr style={S.divider} />
                <div style={S.links}>
                  {profile.website && (
                    <a href={profile.website} style={S.link} target="_blank" rel="noopener noreferrer">
                      Website ↗
                    </a>
                  )}
                  {profile.instagram && (
                    <a
                      href={`https://instagram.com/${profile.instagram.replace('@', '')}`}
                      style={S.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Instagram ↗
                    </a>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default WriterProfile;
