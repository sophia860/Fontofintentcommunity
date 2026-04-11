/**
 * WritersPage — A writer's public-facing page in the Garden.
 *
 * Shows:
 *   1. Writer header — name, bio, tags, join date
 *   2. Featured piece — rendered live through BurstRenderer using
 *      font-of-intent signal data (confidence/hesitation → weight/opacity)
 *   3. Writers Board — all pieces with state chips, filters,
 *      tag patterns, scouted badges, word counts, mini-burst excerpts
 *
 * Uses the full font-of-intent stack:
 *   signalProcessor → burstDetector → fontMapper → BurstRenderer
 *
 * Demo data mirrors real Supabase row shapes — swap DEMO_WRITER / DEMO_PIECES
 * with a useEffect + supabase query when persisting pieces.
 */
import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { Nav } from './Nav';
import { BurstRenderer } from './BurstRenderer';
import { buildBurstsFromEvents } from '../lib/burstDetector';
import type { Burst } from '../lib/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PieceState = 'seed' | 'sprout' | 'bloom';
type BoardFilter = 'all' | 'seed' | 'sprout' | 'bloom' | 'scouted';

interface SignalEvent {
  type: 'insert' | 'delete';
  char?: string;
  iki: number;
  confidence: number;
  hesitation: number;
  pause: number;
}

interface GardenPiece {
  id: string;
  title: string;
  excerpt: string;
  state: PieceState;
  tags: string[];
  wordCount: number;
  lastVisited: string;
  pattern?: string;
  scouted?: boolean;
  signalEvents?: SignalEvent[];
}

interface WriterProfile {
  id: string;
  name: string;
  bio: string;
  joinedAt: string;
  tags: string[];
  location?: string;
  featuredPieceId: string;
}

// ---------------------------------------------------------------------------
// Demo signal events — built with same IKI extremes as sampleSession.ts
// so BurstRenderer produces visible weight contrast in the prototype.
// ---------------------------------------------------------------------------

function makePhrase(
  text: string,
  iki: number,
  opts: { confidence: number; hesitation: number; pause?: number; jitter?: number }
): SignalEvent[] {
  const jitter = opts.jitter ?? 8;
  return text.split('').map((char, i) => ({
    type: 'insert' as const,
    char,
    iki: i === 0 && opts.pause ? opts.pause : Math.max(35, iki + ((i % 3) - 1) * jitter),
    confidence: opts.confidence,
    hesitation: opts.hesitation,
    pause: i === 0 && opts.pause ? opts.pause : 0,
  }));
}

const FEATURED_SIGNALS: SignalEvent[] = [
  ...makePhrase('There is a specific gesture', 58, { confidence: 0.92, hesitation: 0.04 }),
  ...makePhrase(' that every literary platform performs', 310, { confidence: 0.15, hesitation: 0.72, pause: 2500, jitter: 20 }),
  ...makePhrase(' and nobody mentions it.', 145, { confidence: 0.5, hesitation: 0.25 }),
  ...makePhrase(' The gesture is this:', 50, { confidence: 0.96, hesitation: 0.02, pause: 3000 }),
  ...makePhrase(' a text field,', 280, { confidence: 0.18, hesitation: 0.68, jitter: 25 }),
  ...makePhrase(' a word count,', 52, { confidence: 0.94, hesitation: 0.03 }),
  ...makePhrase(' a submit button.', 330, { confidence: 0.12, hesitation: 0.78, jitter: 30 }),
];

const MOTHER_SIGNALS: SignalEvent[] = [
  ...makePhrase('She kept the receipts but not the letters.', 140, { confidence: 0.48, hesitation: 0.28 }),
  ...makePhrase(' I kept asking why', 300, { confidence: 0.14, hesitation: 0.74, pause: 2800, jitter: 22 }),
  ...makePhrase(' until I understood', 55, { confidence: 0.91, hesitation: 0.04 }),
  ...makePhrase(' that receipts are evidence of having shown up.', 160, { confidence: 0.52, hesitation: 0.22 }),
];

const BODY_SIGNALS: SignalEvent[] = [
  ...makePhrase('Every time I return to the piece', 160, { confidence: 0.44, hesitation: 0.32 }),
  ...makePhrase(' it means something different.', 60, { confidence: 0.89, hesitation: 0.05, pause: 2200 }),
  ...makePhrase(' Not because I have changed', 290, { confidence: 0.16, hesitation: 0.66, jitter: 20 }),
  ...makePhrase(' but because the words have.', 58, { confidence: 0.93, hesitation: 0.03 }),
];

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const DEMO_WRITER: WriterProfile = {
  id: 'demo',
  name: 'Anna Voss',
  bio: 'Poet and essayist interested in grief, attention, and the sentence before the sentence. Based between Berlin and Glasgow.',
  joinedAt: '2025-09-12',
  tags: ['grief', 'essay', 'lyric', 'labour', 'mothers'],
  location: 'Berlin / Glasgow',
  featuredPieceId: 'piece-1',
};

const DEMO_PIECES: GardenPiece[] = [
  {
    id: 'piece-1',
    title: 'The Gesture Nobody Names',
    excerpt: 'There is a specific gesture that every literary platform performs and nobody mentions.',
    state: 'bloom',
    tags: ['essay', 'infrastructure', 'attention'],
    wordCount: 1840,
    lastVisited: new Date(Date.now() - 2 * 86400000).toISOString(),
    pattern: 'infrastructure and attention appear together in four pieces this month',
    scouted: true,
    signalEvents: FEATURED_SIGNALS,
  },
  {
    id: 'piece-2',
    title: 'What My Mother Carried',
    excerpt: 'She kept the receipts but not the letters. I kept asking why until I understood that receipts are evidence of having shown up.',
    state: 'sprout',
    tags: ['grief', 'mothers', 'lyric'],
    wordCount: 620,
    lastVisited: new Date(Date.now() - 8 * 86400000).toISOString(),
    pattern: 'grief and mothers circle each other across six pieces',
    signalEvents: MOTHER_SIGNALS,
  },
  {
    id: 'piece-3',
    title: 'Eleven Things I Left Unfinished',
    excerpt: '',
    state: 'seed',
    tags: ['list', 'labour'],
    wordCount: 88,
    lastVisited: new Date(Date.now() - 22 * 86400000).toISOString(),
  },
  {
    id: 'piece-4',
    title: 'The Body Keeps the Score, The Score Keeps Changing',
    excerpt: 'Every time I return to the piece it means something different. Not because I have changed but because the words have.',
    state: 'sprout',
    tags: ['body', 'revision', 'essay'],
    wordCount: 1110,
    lastVisited: new Date(Date.now() - 4 * 86400000).toISOString(),
    signalEvents: BODY_SIGNALS,
  },
  {
    id: 'piece-5',
    title: '',
    excerpt: 'The light at 4pm in November is not the same light as October and I have been trying to say this for three years.',
    state: 'seed',
    tags: ['lyric', 'season'],
    wordCount: 43,
    lastVisited: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
];

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATE_LABEL: Record<PieceState, string> = { seed: 'Seed', sprout: 'Sprout', bloom: 'Bloom' };
const STATE_COLOR: Record<PieceState, string> = { seed: '#C4B5A6', sprout: '#8BA67A', bloom: '#6B8E6B' };

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

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const S: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', backgroundColor: '#faf8f5', fontFamily: 'Georgia, serif', color: '#1a1714' },
  divider: { borderTop: '1px solid #e8e4df', margin: '0' },
  // Writer header
  writerHeader: { padding: '5rem 3rem 4rem', maxWidth: '860px', margin: '0 auto' },
  writerEpigraph: { fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#7a7067', marginBottom: '1.5rem' },
  writerName: { fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 600, lineHeight: 1.1, letterSpacing: '-0.01em', margin: '0 0 1.5rem', fontFamily: "'Caveat', cursive" },
  writerBio: { fontSize: '1rem', lineHeight: 1.75, color: '#3d3830', maxWidth: '52ch', marginBottom: '1.75rem' },
  writerMeta: { display: 'flex', flexWrap: 'wrap' as const, gap: '1rem', alignItems: 'center' },
  writerMuted: { fontSize: '0.8rem', color: '#7a7067', fontFamily: 'system-ui, sans-serif' },
  tagPill: { fontSize: '0.7rem', letterSpacing: '0.05em', color: '#7a7067', border: '1px solid #dcd9d5', padding: '0.15rem 0.5rem', borderRadius: '2px', textTransform: 'lowercase' as const },
  // Featured piece
  featuredSection: { padding: '4rem 3rem', maxWidth: '860px', margin: '0 auto' },
  featuredLabel: { fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#7a7067', marginBottom: '2rem' },
  featuredTitle: { fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)', fontWeight: 500, lineHeight: 1.2, fontStyle: 'italic', color: '#1a1714', marginBottom: '1.5rem', fontFamily: "'Caveat', cursive" },
  featuredExplainer: { fontSize: '0.76rem', color: '#a09486', letterSpacing: '0.04em', marginBottom: '1.25rem', fontFamily: 'system-ui, sans-serif', lineHeight: 1.6 },
  burstContainer: { padding: '2rem 2.5rem', backgroundColor: '#f5f0eb', borderLeft: '1px solid #dcd9d5' },
  scoutedBar: { display: 'flex', alignItems: 'baseline', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' as const },
  scoutedBadgeLg: { fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase' as const, backgroundColor: '#1a1714', color: '#faf8f5', padding: '0.2rem 0.6rem', fontFamily: 'system-ui, sans-serif' },
  readLink: { fontSize: '0.8rem', color: '#7a7067', borderBottom: '1px solid #c5bdb4', textDecoration: 'none' },
  pieceStat: { fontSize: '0.74rem', color: '#a09486', fontFamily: 'system-ui, sans-serif', letterSpacing: '0.03em' },
  // Board
  boardSection: { padding: '4rem 3rem', maxWidth: '860px', margin: '0 auto' },
  boardHeader: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap' as const, gap: '1rem' },
  boardLabel: { fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#7a7067' },
  boardFilters: { display: 'flex', gap: '1rem', alignItems: 'baseline', flexWrap: 'wrap' as const },
  filterBtn: { background: 'none', border: 'none', padding: '0', fontSize: '0.75rem', letterSpacing: '0.07em', textTransform: 'uppercase' as const, cursor: 'pointer' },
  patternBar: { marginBottom: '1.75rem', padding: '0.9rem 1.25rem', backgroundColor: '#f5f0eb', borderLeft: '2px solid #dcd9d5' },
  patternLabel: { fontSize: '0.7rem', letterSpacing: '0.09em', textTransform: 'uppercase' as const, color: '#7a7067', marginBottom: '0.4rem', fontFamily: 'system-ui, sans-serif' },
  patternText: { fontSize: '0.83rem', color: '#3d3830', lineHeight: 1.5 },
  pieceRow: { borderTop: '1px solid #e8e4df', padding: '1.75rem 0', display: 'grid', gridTemplateColumns: '1fr auto', gap: '1.5rem', alignItems: 'start' },
  pieceTitle: { fontSize: '0.98rem', fontWeight: 400, color: '#1a1714', marginBottom: '0.35rem', fontStyle: 'italic', textDecoration: 'none', display: 'block' },
  pieceExcerpt: { fontSize: '0.85rem', color: '#7a7067', lineHeight: 1.55, marginBottom: '0.5rem', maxWidth: '52ch' },
  miniBurstWrap: { marginBottom: '0.5rem', maxWidth: '52ch' },
  piecePattern: { fontSize: '0.77rem', color: '#9c8f83', fontStyle: 'italic', marginBottom: '0.6rem', lineHeight: 1.5 },
  pieceMeta: { display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' as const, marginTop: '0.5rem' },
  stateChip: { fontSize: '0.66rem', letterSpacing: '0.09em', textTransform: 'uppercase' as const, padding: '0.2rem 0.55rem', border: '1px solid currentColor', whiteSpace: 'nowrap' as const, fontFamily: 'system-ui, sans-serif' },
  scoutedBadge: { fontSize: '0.66rem', letterSpacing: '0.09em', textTransform: 'uppercase' as const, padding: '0.2rem 0.55rem', backgroundColor: '#1a1714', color: '#faf8f5', whiteSpace: 'nowrap' as const, fontFamily: 'system-ui, sans-serif' },
  boardEmpty: { padding: '2.5rem 0', color: '#a09486', fontSize: '0.9rem', fontStyle: 'italic' },
  // Footer
  footer: { padding: '2.5rem 3rem', borderTop: '1px solid #e8e4df', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' },
  footerNote: { fontSize: '0.78rem', color: '#7a7067', fontFamily: 'system-ui, sans-serif' },
};

// ---------------------------------------------------------------------------
// FeaturedPiece
// ---------------------------------------------------------------------------

function FeaturedPiece({ piece }: { piece: GardenPiece }) {
  const bursts: Burst[] = useMemo(() => {
    if (!piece.signalEvents?.length) return [];
    return buildBurstsFromEvents(piece.signalEvents);
  }, [piece.signalEvents]);

  return (
    <div style={S.featuredSection}>
      <p style={S.featuredLabel}>Featured piece</p>
      {piece.title && <p style={S.featuredTitle}>{piece.title}</p>}

      {bursts.length > 0 ? (
        <>
          <p style={S.featuredExplainer}>
            Weight and opacity reflect the confidence and hesitation with which each phrase arrived —
            this is the writing as it actually happened.
          </p>
          <div style={S.burstContainer}>
            <BurstRenderer bursts={bursts} fontSize="clamp(1rem, 1.8vw, 1.15rem)" lineHeight={1.85} />
          </div>
        </>
      ) : (
        <div style={S.burstContainer}>
          <p style={{ fontSize: '1rem', lineHeight: 1.85, color: '#3d3830' }}>{piece.excerpt}</p>
        </div>
      )}

      <div style={S.scoutedBar}>
        {piece.scouted && <span style={S.scoutedBadgeLg}>Scouted</span>}
        <Link to={`/piece/${piece.id}`} style={S.readLink}>Read full piece →</Link>
        <span style={{ ...S.pieceStat, fontSize: '0.78rem' }}>{piece.wordCount.toLocaleString()} words</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MiniPieceBurst — compact burst excerpt inside board rows
// ---------------------------------------------------------------------------

function MiniPieceBurst({ events }: { events: SignalEvent[] }) {
  const bursts = useMemo(() => buildBurstsFromEvents(events), [events]);
  if (!bursts.length) return null;
  return (
    <div style={S.miniBurstWrap}>
      <BurstRenderer bursts={bursts} fontSize="0.84rem" lineHeight={1.6} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// WritersBoard
// ---------------------------------------------------------------------------

function WritersBoard({ pieces }: { pieces: GardenPiece[] }) {
  const [filter, setFilter] = useState<BoardFilter>('all');

  const tagPatterns = useMemo(() => {
    const freq: Record<string, number> = {};
    for (const p of pieces) for (const t of p.tags) freq[t] = (freq[t] ?? 0) + 1;
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([tag, count]) => ({ tag, count }));
  }, [pieces]);

  const filtered = pieces.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'scouted') return p.scouted;
    return p.state === filter;
  });

  const filterBtn = (f: BoardFilter, label: string) => (
    <button
      key={f}
      style={{ ...S.filterBtn, color: filter === f ? '#1a1714' : '#a09486', borderBottom: filter === f ? '1px solid #1a1714' : '1px solid transparent' }}
      onClick={() => setFilter(f)}
    >
      {label}
    </button>
  );

  return (
    <div style={S.boardSection}>
      <div style={S.boardHeader}>
        <p style={S.boardLabel}>The Garden — all pieces</p>
        <div style={S.boardFilters}>
          {filterBtn('all', 'All')}
          {filterBtn('seed', 'Seeds')}
          {filterBtn('sprout', 'Sprouts')}
          {filterBtn('bloom', 'Blooms')}
          {filterBtn('scouted', 'Scouted')}
        </div>
      </div>

      {tagPatterns.length > 0 && (
        <div style={S.patternBar}>
          <p style={S.patternLabel}>Recurring obsessions</p>
          <p style={S.patternText}>
            {tagPatterns.map(({ tag, count }, i) => (
              <span key={tag}>
                <em>{tag}</em>
                <span style={{ color: '#a09486', fontSize: '0.78rem' }}> ×{count}</span>
                {i < tagPatterns.length - 1 ? <span style={{ color: '#dcd9d5' }}> · </span> : null}
              </span>
            ))}
          </p>
        </div>
      )}

      {filtered.length === 0 && (
        <p style={S.boardEmpty}>
          {filter === 'scouted'
            ? 'No pieces have been scouted yet. Journals find what they need.'
            : 'Nothing here yet.'}
        </p>
      )}

      {filtered.map(piece => (
        <div key={piece.id} style={S.pieceRow}>
          <div>
            <Link to={`/piece/${piece.id}`} style={S.pieceTitle}>
              {piece.title || <em style={{ color: '#a09486' }}>untitled</em>}
            </Link>

            {piece.signalEvents?.length
              ? <MiniPieceBurst events={piece.signalEvents} />
              : piece.excerpt
                ? <p style={S.pieceExcerpt}>{piece.excerpt}</p>
                : null
            }

            {piece.pattern && <p style={S.piecePattern}>↳ {piece.pattern}</p>}

            <div style={S.pieceMeta}>
              {piece.tags.map(tag => <span key={tag} style={S.tagPill}>{tag}</span>)}
              <span style={S.pieceStat}>{piece.wordCount.toLocaleString()} words</span>
              <span style={S.pieceStat}>{formatLastVisited(piece.lastVisited)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.45rem', paddingTop: '0.1rem' }}>
            <span style={{ ...S.stateChip, color: STATE_COLOR[piece.state], borderColor: STATE_COLOR[piece.state] }}>
              {STATE_LABEL[piece.state]}
            </span>
            {piece.scouted && <span style={S.scoutedBadge}>Scouted</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// WritersPage — main export
// ---------------------------------------------------------------------------

export function WritersPage() {
  const writer = DEMO_WRITER;
  const pieces = DEMO_PIECES;
  const featured = pieces.find(p => p.id === writer.featuredPieceId) ?? pieces[0];

  return (
    <div style={S.page}>
      <Nav />

      {/* Writer header */}
      <div style={S.writerHeader}>
        <p style={S.writerEpigraph}>The Garden — Writer</p>
        <h1 style={S.writerName}>{writer.name}</h1>
        <p style={S.writerBio}>{writer.bio}</p>
        <div style={S.writerMeta}>
          {writer.location && <span style={S.writerMuted}>{writer.location}</span>}
          <span style={S.writerMuted}>
            In the Garden since {new Date(writer.joinedAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
          </span>
          {writer.tags.map(tag => <span key={tag} style={S.tagPill}>{tag}</span>)}
        </div>
      </div>

      {/* Featured piece with live burst rendering */}
      <hr style={S.divider} />
      {featured && <FeaturedPiece piece={featured} />}

      {/* Full writers board */}
      <hr style={S.divider} />
      <WritersBoard pieces={pieces} />

      {/* Footer */}
      <hr style={S.divider} />
      <div style={S.footer}>
        <Link to="/" style={{ ...S.footerNote, textDecoration: 'none' }}>← The Garden</Link>
        <span style={S.footerNote}>Page Gallery</span>
      </div>
    </div>
  );
}
