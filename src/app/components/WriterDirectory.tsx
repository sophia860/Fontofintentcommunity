/**
 * WriterDirectory — Page Gallery Garden
 *
 * Public listing of writer profiles where is_public = true.
 * Journals and editors can browse writers without exposing private draft information.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Nav } from './Nav';
import { supabase } from '../lib/supabase';
import { pickHeadingFont } from '../lib/fontMapper';

/** Subset of Profile used in directory listings. */
type ProfileListItem = {
  id: string;
  display_name: string | null;
  slug: string | null;
  short_bio: string | null;
  location: string | null;
  genres: string[];
  themes: string[];
  role: string;
};

const ALL_GENRES = ['poetry', 'fiction', 'essay', 'prose poem', 'hybrid', 'lyric essay', 'nonfiction', 'criticism'];

const S: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', backgroundColor: '#faf8f5', fontFamily: 'Georgia, serif', color: '#1a1714' },
  header: { padding: '4rem 3rem 2rem', borderBottom: '1px solid #e8e4df' },
  headerLabel: { fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#7a7067', marginBottom: '1rem' },
  headerTitle: { fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', fontWeight: 600, margin: '0 0 1rem', lineHeight: 1.1, fontFamily: pickHeadingFont('WriterDirectory-headerTitle') },
  headerBody: { fontSize: '0.9rem', color: '#3d3830', lineHeight: 1.65, maxWidth: '540px' },
  filters: { padding: '1.5rem 3rem', borderBottom: '1px solid #e8e4df', display: 'flex', gap: '1rem', flexWrap: 'wrap' as const, alignItems: 'center' },
  filterLabel: { fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#7a7067', marginRight: '0.5rem' },
  filterChip: { fontSize: '0.78rem', padding: '0.25rem 0.7rem', border: '1px solid #c5bdb4', backgroundColor: 'transparent', color: '#3d3830', cursor: 'pointer', fontFamily: 'Georgia, serif' },
  filterChipActive: { fontSize: '0.78rem', padding: '0.25rem 0.7rem', border: '1px solid #1a1714', backgroundColor: '#1a1714', color: '#faf8f5', cursor: 'pointer', fontFamily: 'Georgia, serif' },
  list: { padding: '0 3rem' },
  writerCard: { padding: '2rem 0', borderBottom: '1px solid #e8e4df' },
  writerTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' },
  writerName: { fontSize: '1.1rem', fontWeight: 400, textDecoration: 'none', color: '#1a1714' },
  writerMeta: { fontSize: '0.8rem', color: '#7a7067' },
  writerBio: { fontSize: '0.88rem', color: '#3d3830', lineHeight: 1.6, marginBottom: '1rem', maxWidth: '640px' },
  tags: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' as const },
  tag: { fontSize: '0.72rem', padding: '0.15rem 0.5rem', border: '1px solid #e8e4df', color: '#7a7067' },
  themeTag: { fontSize: '0.72rem', padding: '0.15rem 0.5rem', border: '1px solid #f0ece7', color: '#9a9088' },
  loading: { padding: '4rem 3rem', color: '#7a7067', fontSize: '0.9rem' },
  cta: { padding: '3rem', borderTop: '1px solid #e8e4df', textAlign: 'center' as const },
};

export function WriterDirectory() {
  const [writers, setWriters] = useState<ProfileListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGenre, setActiveGenre] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWriters() {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, slug, short_bio, location, genres, themes, role, is_public, created_at, updated_at')
        .eq('is_public', true)
        .order('display_name');

      if (!error && data) {
        setWriters(data as ProfileListItem[]);
      }
      setLoading(false);
    }
    fetchWriters();
  }, []);

  const filtered = writers.filter(w => {
    if (activeGenre && !w.genres.includes(activeGenre)) return false;
    return true;
  });

  return (
    <div style={S.page}>
      <Nav />
      <div style={S.header}>
        <p style={S.headerLabel}>The Garden — Writers</p>
        <h1 style={S.headerTitle}>Writer Directory</h1>
        <p style={S.headerBody}>
          Writers registered in the Garden ecosystem. Journals may browse this directory to discover
          writers whose work aligns with their editorial focus. Every profile here has been placed by the writer themselves.
        </p>
      </div>

      {/* Genre filter */}
      <div style={S.filters}>
        <span style={S.filterLabel}>Filter</span>
        {ALL_GENRES.map(g => (
          <button
            key={g}
            style={activeGenre === g ? S.filterChipActive : S.filterChip}
            onClick={() => setActiveGenre(activeGenre === g ? null : g)}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Writer list */}
      <div style={S.list}>
        {loading && <p style={S.loading}>Loading writers…</p>}
        {!loading && filtered.length === 0 && (
          <p style={S.loading}>No writers match these filters.</p>
        )}
        {filtered.map(w => (
          <div key={w.id} style={S.writerCard}>
            <div style={S.writerTop}>
              <Link
                to={`/writers/${w.slug ?? w.id}`}
                style={S.writerName}
              >
                {w.display_name ?? '(unnamed)'}
              </Link>
              {w.location && <span style={S.writerMeta}>{w.location}</span>}
            </div>
            {w.short_bio && <p style={S.writerBio}>{w.short_bio}</p>}
            <div style={S.tags}>
              {w.genres.map(g => <span key={g} style={S.tag}>{g}</span>)}
              {w.themes.map(t => <span key={t} style={S.themeTag}>{t}</span>)}
            </div>
          </div>
        ))}
      </div>

      <div style={S.cta}>
        <p style={{ fontSize: '0.88rem', color: '#3d3830', marginBottom: '1rem' }}>
          Are you a writer? Create your Garden profile.
        </p>
        <Link
          to="/dashboard/writer"
          style={{ fontSize: '0.85rem', color: '#1a1714', borderBottom: '1px solid #1a1714', textDecoration: 'none' }}
        >
          Set up your profile
        </Link>
      </div>
    </div>
  );
}

export default WriterDirectory;
