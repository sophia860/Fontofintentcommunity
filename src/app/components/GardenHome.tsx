/**
 * GardenHome — Page Gallery Editions
 *
 * The Garden is not trying to publish you.
 * It is the place where writing lives before it becomes anything else.
 * Chapbooks are what the Garden occasionally produces as a verdict.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Nav } from './Nav';
import { supabase } from '../lib/supabase';

type Callout = {
  id: string;
  type: string;
  label: string;
  title: string;
  body: string;
  urgent: boolean;
};

type Journal = {
  id: string;
  name: string;
  slug: string;
  status: string;
};

// Writers Board: a piece of writing growing in the Garden
type GardenPiece = {
  id: string;
  title: string;
  excerpt: string;
  state: 'seed' | 'sprout' | 'bloom';
  tags: string[];
  wordCount: number;
  lastVisited: string; // ISO date string
  pattern?: string;   // surfaced insight, e.g. "returning to this every October"
  scouted?: boolean;  // flagged by a journal editor
};

// State label copy
const STATE_LABEL: Record<GardenPiece['state'], string> = {
  seed: 'Seed',
  sprout: 'Sprout',
  bloom: 'Bloom',
};

// Dot color per state
const STATE_COLOR: Record<GardenPiece['state'], string> = {
  seed: '#C4B5A6',
  sprout: '#8BA67A',
  bloom: '#6B8E6B',
};

// Filter types for the Writers Board
type BoardFilter = 'all' | 'seed' | 'sprout' | 'bloom' | 'scouted';

const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#faf8f5',
    fontFamily: 'Georgia, serif',
    color: '#1a1714',
  },
  hero: {
    padding: '6rem 3rem 5rem',
    maxWidth: '960px',
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: '4rem',
    alignItems: 'start',
  },
  heroText: {
    maxWidth: '520px',
  },
  heroDrawing: {
    width: '260px',
    flexShrink: 0,
    opacity: 0.9,
  },
  heroEpigraph: {
    fontSize: '0.8rem',
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    color: '#7a7067',
    marginBottom: '1.5rem',
  },
  heroTitle: {
    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
    fontWeight: 400,
    lineHeight: 1.15,
    margin: '0 0 2rem',
    letterSpacing: '-0.01em',
  },
  heroBody: {
    fontSize: '1.05rem',
    lineHeight: 1.75,
    color: '#3d3830',
    maxWidth: '520px',
    marginBottom: '2.5rem',
  },
  heroCta: {
    display: 'inline-flex',
    gap: '2rem',
    alignItems: 'baseline',
  },
  ctaPrimary: {
    fontSize: '0.85rem',
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
    color: '#faf8f5',
    backgroundColor: '#1a1714',
    padding: '0.6rem 1.4rem',
    textDecoration: 'none',
  },
  ctaSecondary: {
    fontSize: '0.85rem',
    color: '#7a7067',
    textDecoration: 'none',
    borderBottom: '1px solid #c5bdb4',
  },
  divider: {
    borderTop: '1px solid #e8e4df',
    margin: '0 3rem',
  },
  section: {
    padding: '4rem 3rem',
  },
  sectionLabel: {
    fontSize: '0.75rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: '#7a7067',
    marginBottom: '2rem',
  },
  calloutGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '0',
  },
  calloutItem: {
    borderTop: '1px solid #e8e4df',
    padding: '2rem 0 2rem 0',
    marginRight: '3rem',
  },
  calloutLabel: {
    fontSize: '0.7rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: '#7a7067',
    marginBottom: '0.75rem',
  },
  calloutTitle: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.4,
    marginBottom: '0.75rem',
  },
  calloutBody: {
    fontSize: '0.88rem',
    lineHeight: 1.65,
    color: '#3d3830',
  },
  journalRow: {
    display: 'grid',
    gridTemplateColumns: '1fr auto auto',
    alignItems: 'baseline',
    gap: '2rem',
    padding: '1.25rem 0',
    borderTop: '1px solid #e8e4df',
  },
  journalName: {
    fontSize: '0.95rem',
    textDecoration: 'none',
    color: '#1a1714',
  },
  journalMeta: {
    fontSize: '0.8rem',
    color: '#7a7067',
  },
  statusDot: {
    display: 'inline-block',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#6b9e6b',
    marginRight: '0.4rem',
    verticalAlign: 'middle',
  },
  manifesto: {
    padding: '5rem 3rem',
    backgroundColor: '#1a1714',
    color: '#faf8f5',
    maxWidth: '100%',
  },
  manifestoInner: {
    maxWidth: '640px',
  },
  manifestoTitle: {
    fontSize: '0.75rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: '#7a7067',
    marginBottom: '2rem',
  },
  manifestoParagraph: {
    fontSize: '1.05rem',
    lineHeight: 1.8,
    color: '#e8e4df',
    marginBottom: '1.5rem',
  },
  footer: {
    padding: '3rem',
    borderTop: '1px solid #e8e4df',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  footerNote: {
    fontSize: '0.8rem',
    color: '#7a7067',
  },
  // Writers Board styles
  boardHeader: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: '1.75rem',
    flexWrap: 'wrap' as const,
    gap: '1rem',
  },
  boardFilters: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'baseline',
  },
  filterBtn: {
    background: 'none',
    border: 'none',
    padding: '0',
    fontSize: '0.75rem',
    letterSpacing: '0.07em',
    textTransform: 'uppercase' as const,
    cursor: 'pointer',
    transition: 'color 0.15s',
  },
  pieceRow: {
    borderTop: '1px solid #e8e4df',
    padding: '1.5rem 0',
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: '1.5rem',
    alignItems: 'start',
  },
  pieceTitle: {
    fontSize: '0.98rem',
    fontWeight: 400,
    color: '#1a1714',
    marginBottom: '0.3rem',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
  },
  pieceExcerpt: {
    fontSize: '0.85rem',
    color: '#7a7067',
    lineHeight: 1.55,
    marginBottom: '0.6rem',
    maxWidth: '52ch',
  },
  piecePattern: {
    fontSize: '0.78rem',
    color: '#9c8f83',
    lineHeight: 1.5,
    marginBottom: '0.6rem',
    fontStyle: 'italic',
  },
  pieceMeta: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
  },
  pieceWords: {
    fontSize: '0.75rem',
    color: '#a09486',
    letterSpacing: '0.04em',
  },
  pieceDate: {
    fontSize: '0.75rem',
    color: '#a09486',
  },
  tagPill: {
    fontSize: '0.7rem',
    letterSpacing: '0.06em',
    color: '#7a7067',
    border: '1px solid #dcd9d5',
    padding: '0.15rem 0.5rem',
    borderRadius: '2px',
    textTransform: 'lowercase' as const,
  },
  stateChip: {
    fontSize: '0.68rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    padding: '0.2rem 0.6rem',
    border: '1px solid currentColor',
  },
  scoutedBadge: {
    fontSize: '0.68rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    padding: '0.2rem 0.6rem',
    backgroundColor: '#1a1714',
    color: '#faf8f5',
  },
  boardEmpty: {
    padding: '3rem 0',
    color: '#a09486',
    fontSize: '0.9rem',
    fontStyle: 'italic',
  },
  boardNewBtn: {
    fontSize: '0.8rem',
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    color: '#faf8f5',
    backgroundColor: '#1a1714',
    padding: '0.5rem 1.2rem',
    textDecoration: 'none',
    display: 'inline-block',
  },
};

function formatLastVisited(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

function WritersBoard() {
  const [filter, setFilter] = useState<BoardFilter>('all');
  const [pieces, setPieces] = useState<GardenPiece[]>([]);
  const [tagPatterns, setTagPatterns] = useState<{ tag: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setUserId(user.id);

      const { data } = await supabase
        .from('writings')
        .select('id, title, body, state, tags, word_count, updated_at, scouted')
        .eq('author_id', user.id)
        .order('updated_at', { ascending: false });

      if (data) {
        const mapped: GardenPiece[] = (data as any[]).map(row => ({
          id: row.id,
          title: row.title || '',
          excerpt: (row.body || '').slice(0, 120),
          state: row.state ?? 'seed',
          tags: row.tags ?? [],
          wordCount: row.word_count ?? 0,
          lastVisited: row.updated_at,
          scouted: row.scouted ?? false,
        }));
        setPieces(mapped);

        // Compute tag patterns
        const freq: Record<string, number> = {};
        for (const p of mapped) {
          for (const t of p.tags) freq[t] = (freq[t] ?? 0) + 1;
        }
        const top = Object.entries(freq)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([tag, count]) => ({ tag, count }));
        setTagPatterns(top);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const filtered = pieces.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'scouted') return p.scouted;
    return p.state === filter;
  });

  const filterLabel = (f: BoardFilter, label: string) => (
    <button
      key={f}
      style={{
        ...S.filterBtn,
        color: filter === f ? '#1a1714' : '#a09486',
        borderBottom: filter === f ? '1px solid #1a1714' : '1px solid transparent',
      }}
      onClick={() => setFilter(f)}
    >
      {label}
    </button>
  );

  // Not signed in
  if (!loading && !userId) {
    return (
      <div>
        <div style={S.boardHeader}>
          <p style={S.sectionLabel}>Your Garden</p>
          <Link to="/write" style={S.boardNewBtn}>+ New piece</Link>
        </div>
        <p style={{ ...S.boardEmpty, fontStyle: 'normal' }}>
          <Link to="/auth?returnTo=/" style={{ color: '#1a1714', borderBottom: '1px solid #c5bdb4' }}>Sign in</Link>
          {' '}to see your Garden.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <div style={S.boardHeader}>
          <p style={S.sectionLabel}>Your Garden</p>
        </div>
        <p style={S.boardEmpty}>Loading your Garden…</p>
      </div>
    );
  }

  return (
    <div>
      <div style={S.boardHeader}>
        <p style={S.sectionLabel}>Your Garden</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={S.boardFilters}>
            {filterLabel('all', 'All')}
            {filterLabel('seed', 'Seeds')}
            {filterLabel('sprout', 'Sprouts')}
            {filterLabel('bloom', 'Blooms')}
            {filterLabel('scouted', 'Scouted')}
          </div>
          <Link to="/write" style={S.boardNewBtn}>+ New piece</Link>
        </div>
      </div>

      {/* Pattern insights */}
      {tagPatterns.length > 0 && (
        <div style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', backgroundColor: '#f5f0eb', borderLeft: '3px solid #dcd9d5' }}>
          <p style={{ fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7a7067', marginBottom: '0.5rem' }}>
            Your obsessions
          </p>
          <p style={{ fontSize: '0.83rem', color: '#3d3830', lineHeight: 1.5 }}>
            {tagPatterns.map(({ tag, count }, i) => (
              <span key={tag}>
                <em>{tag}</em> ({count})
                {i < tagPatterns.length - 1 ? ' · ' : ''}
              </span>
            ))}
          </p>
        </div>
      )}

      {filtered.length === 0 && (
        <p style={S.boardEmpty}>
          {filter === 'scouted'
            ? 'No pieces have been scouted yet. Journals find what they need; it takes time.'
            : pieces.length === 0
              ? 'Nothing planted yet. Write your first seed.'
              : 'Nothing here yet.'}
        </p>
      )}

      {filtered.map(piece => (
        <div key={piece.id} style={S.pieceRow}>
          <div>
            <Link to={`/piece/${piece.id}`} style={{ textDecoration: 'none' }}>
              <p style={S.pieceTitle}>{piece.title || <em style={{ color: '#a09486' }}>untitled</em>}</p>
            </Link>
            {piece.excerpt && <p style={S.pieceExcerpt}>{piece.excerpt}</p>}
            {piece.pattern && (
              <p style={S.piecePattern}>↳ {piece.pattern}</p>
            )}
            <div style={S.pieceMeta}>
              {piece.tags.map(tag => (
                <span key={tag} style={S.tagPill}>{tag}</span>
              ))}
              <span style={S.pieceWords}>{piece.wordCount.toLocaleString()} words</span>
              <span style={S.pieceDate}>{formatLastVisited(piece.lastVisited)}</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', paddingTop: '0.1rem' }}>
            <span
              style={{
                ...S.stateChip,
                color: STATE_COLOR[piece.state],
                borderColor: STATE_COLOR[piece.state],
              }}
            >
              {STATE_LABEL[piece.state]}
            </span>
            {piece.scouted && (
              <span style={S.scoutedBadge}>Scouted</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function GardenHome() {
  const [callouts, setCallouts] = useState<Callout[]>([]);
  const [journals, setJournals] = useState<Journal[]>([]);

  useEffect(() => {
    async function fetchData() {
      const [calloutsRes, journalsRes] = await Promise.all([
        supabase
          .from('callouts')
          .select('id, type, label, title, body, urgent')
          .eq('active', true)
          .order('sort_order'),
        supabase
          .from('journals')
          .select('id, name, slug, status')
          .eq('is_public', true)
          .in('status', ['active', 'pre_launch'])
          .limit(6)
          .order('name'),
      ]);

      if (calloutsRes.data) setCallouts(calloutsRes.data);
      if (journalsRes.data) setJournals(journalsRes.data);
    }
    fetchData();
  }, []);

  return (
    <div style={S.page}>
      <Nav />

      {/* Hero */}
      <div style={S.hero}>
        <div style={S.heroText}>
          <p style={S.heroEpigraph}>Page Gallery Editions — The Garden</p>
          <h1 style={S.heroTitle}>
            The place where{' '}<br />
            writing lives before{' '}<br />
            it becomes anything else.
          </h1>
          <p style={S.heroBody}>
            A literary institution operating between London and New York.
            The Garden connects writers and journals.
            The Residency develops what is exceptional.
            Chapbooks are published when the work demands it and not before.
          </p>
          <div style={S.heroCta}>
            <Link to="/journals" style={S.ctaPrimary}>Enter the Garden</Link>
            <Link to="/editions" style={S.ctaSecondary}>Chapbooks &amp; Editions</Link>
          </div>
        </div>
        <img
          src="https://github.com/user-attachments/assets/4c23e424-70f2-4a8e-97d5-3c664eee8bf4"
          alt="A hand-drawn sketch of figures gathered around artwork — a scene from the Garden"
          style={S.heroDrawing}
        />
      </div>

      {/* Writers Board */}
      <hr style={S.divider} />
      <div style={S.section}>
        <WritersBoard />
      </div>

      {/* Callouts */}
      {callouts.length > 0 && (
        <>
          <hr style={S.divider} />
          <div style={S.section}>
            <p style={S.sectionLabel}>Current</p>
            <div style={S.calloutGrid}>
              {callouts.map(c => (
                <div key={c.id} style={S.calloutItem}>
                  <p style={S.calloutLabel}>{c.label}</p>
                  <p style={S.calloutTitle}>{c.title}</p>
                  <p style={S.calloutBody}>{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Journals in the Garden */}
      {journals.length > 0 && (
        <>
          <hr style={S.divider} />
          <div style={S.section}>
            <p style={S.sectionLabel}>Journals in the Garden</p>
            {journals.map(j => (
              <div key={j.id} style={S.journalRow}>
                <Link to={`/journals/${j.slug}`} style={S.journalName}>{j.name}</Link>
                <span style={S.journalMeta}>
                  {j.status === 'active' && (
                    <><span style={S.statusDot} />Open</>
                  )}
                  {j.status === 'pre_launch' && 'Coming soon'}
                </span>
              </div>
            ))}
            <div style={{ paddingTop: '1.5rem' }}>
              <Link to="/journals" style={S.ctaSecondary}>Browse all journals</Link>
            </div>
          </div>
        </>
      )}

      {/* Manifesto block */}
      <div style={S.manifesto}>
        <div style={S.manifestoInner}>
          <p style={S.manifestoTitle}>What the Garden believes</p>
          <p style={S.manifestoParagraph}>
            When a writer dies, the rough drafts go first — the note that trails off,
            the notebook with three pages and then nothing.
            This is not metaphorical but literal: the rough draft is the actual person.
          </p>
          <p style={S.manifestoParagraph}>
            Literary culture has always published the poem and discarded the rest.
            The Garden treats the rest as the substance. Not as backstory. As text.
          </p>
          <p style={S.manifestoParagraph}>
            Chapbooks are what the Garden occasionally produces as a verdict: fully illustrated,
            competitive to enter, published when the work demands it and not before.
            The bar is the institution's only editorial statement.
          </p>
          <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
            <Link to="/about" style={{ ...S.ctaSecondary, color: '#e8e4df', borderBottomColor: '#7a7067' }}>
              Read the full argument
            </Link>
            <Link to="/residency" style={{ ...S.ctaSecondary, color: '#e8e4df', borderBottomColor: '#7a7067' }}>
              Journal Residency
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={S.footer}>
        <span style={S.footerNote}>Page Gallery Editions — London / New York</span>
        <span style={S.footerNote}>The Garden · Chapbooks · Residency · Editions</span>
      </div>
    </div>
  );
}
