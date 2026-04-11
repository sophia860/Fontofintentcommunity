import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { supabase } from '../lib/supabase';

type GardenState = 'seed' | 'sprout' | 'bloom';

type Piece = {
  id: string;
  title: string;
  state: GardenState;
  tags: string[] | null;
  word_count: number | null;
  in_bloom_pool: boolean | null;
  created_at: string;
  updated_at: string;
};

type TagPattern = { tag: string; count: number };

const STATE_COLOR: Record<GardenState, string> = {
  seed: '#C4B5A6',
  sprout: '#8BA67A',
  bloom: '#6B8E6B',
};

const STATE_NEXT: Record<GardenState, GardenState | null> = {
  seed: 'sprout',
  sprout: 'bloom',
  bloom: null,
};

const STATE_LABEL: Record<GardenState, string> = {
  seed: 'Seed',
  sprout: 'Sprout',
  bloom: 'Bloom',
};

export function WriterDashboard() {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [patterns, setPatterns] = useState<TagPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoting, setPromoting] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => { loadPieces(); }, []);

  async function loadPieces() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const [piecesRes, patternRes] = await Promise.all([
      supabase
        .from('writings')
        .select('id, title, state, tags, word_count, in_bloom_pool, created_at, updated_at')
        .eq('author_id', user.id)
        .order('updated_at', { ascending: false }),
      supabase.rpc('get_tag_patterns', { uid: user.id }).select('*'),
    ]);

    setPieces((piecesRes.data as Piece[]) || []);

    // Compute patterns client-side if RPC not available
    if (patternRes.error || !patternRes.data) {
      const allTags: string[] = [];
      for (const p of (piecesRes.data as Piece[]) || []) {
        for (const t of p.tags ?? []) allTags.push(t);
      }
      const freq: Record<string, number> = {};
      for (const t of allTags) freq[t] = (freq[t] ?? 0) + 1;
      const sorted = Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([tag, count]) => ({ tag, count }));
      setPatterns(sorted);
    } else {
      setPatterns(patternRes.data as TagPattern[]);
    }

    setLoading(false);
  }

  async function createNew() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate('/auth?returnTo=/dashboard/writer'); return; }
    const { data } = await supabase
      .from('writings')
      .insert({ title: 'Untitled', body: '', state: 'seed', author_id: user.id, word_count: 0, in_bloom_pool: false })
      .select('id')
      .single();
    if (data) navigate('/piece/' + data.id);
  }

  async function promoteState(piece: Piece) {
    const next = STATE_NEXT[piece.state];
    if (!next) return;
    setPromoting(piece.id);
    await supabase
      .from('writings')
      .update({
        state: next,
        in_bloom_pool: next === 'bloom' ? true : piece.in_bloom_pool,
        updated_at: new Date().toISOString(),
      })
      .eq('id', piece.id);
    setPieces(prev => prev.map(p =>
      p.id === piece.id
        ? { ...p, state: next, in_bloom_pool: next === 'bloom' ? true : p.in_bloom_pool }
        : p
    ));
    setPromoting(null);
  }

  if (loading) return (
    <main style={{ maxWidth: 760, margin: '3rem auto', padding: '0 1.5rem' }}>
      <p style={{ fontFamily: 'Georgia, serif', color: '#7a7067' }}>Loading your Garden…</p>
    </main>
  );

  const noUser = !loading && pieces.length === 0;

  return (
    <main style={{ maxWidth: 760, margin: '3rem auto', padding: '0 1.5rem', fontFamily: 'Georgia, serif' }}>
      <h1 style={{ fontWeight: 600, fontSize: 'clamp(2.2rem, 4vw, 3.25rem)', marginBottom: '0.25rem', lineHeight: 1.1, fontFamily: "'ACFrenchToast', cursive" }}>Your Garden</h1>
      <p style={{ color: '#666', fontStyle: 'italic', marginBottom: '2rem' }}>Writing in progress</p>

      {/* Pattern surfacing */}
      {patterns.length > 0 && (
        <div style={{ marginBottom: '2rem', padding: '1rem 1.25rem', backgroundColor: '#f5f0eb', borderLeft: '3px solid #c5bdb4' }}>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7a7067', marginBottom: '0.75rem' }}>
            Your obsessions
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {patterns.map(({ tag, count }) => (
              <span
                key={tag}
                style={{
                  fontSize: '0.8rem',
                  color: '#3d3830',
                  border: '1px solid #c5bdb4',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '2px',
                }}
              >
                {tag} <span style={{ color: '#7a7067', fontSize: '0.72rem' }}>×{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <button
        style={{ display: 'inline-block', padding: '0.6rem 1.4rem', background: '#1a1714', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.85rem', letterSpacing: '0.04em', marginBottom: '2rem', fontFamily: 'Georgia, serif' }}
        onClick={createNew}
      >
        + New Piece
      </button>

      {noUser && (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#999' }}>
          <p style={{ marginBottom: '1rem' }}>Sign in to see your Garden.</p>
          <Link to="/auth?returnTo=/dashboard/writer" style={{ color: '#1a1714', fontSize: '0.9rem' }}>Sign in →</Link>
        </div>
      )}

      {!noUser && pieces.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#999' }}>
          <p>No pieces yet. Plant your first seed.</p>
        </div>
      )}

      {pieces.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {pieces.map((p) => {
            const stateColor = STATE_COLOR[p.state] || STATE_COLOR.seed;
            const nextState = STATE_NEXT[p.state];
            return (
              <li key={p.id} style={{ padding: '1.25rem 0', borderBottom: '1px solid #e8e4df' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <Link
                      to={'/piece/' + p.id}
                      style={{ fontStyle: 'italic', fontSize: '1.05rem', color: '#1a1714', textDecoration: 'none', display: 'block', marginBottom: '0.3rem' }}
                    >
                      {p.title || 'Untitled'}
                    </Link>
                    {p.tags && p.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                        {p.tags.map(tag => (
                          <span key={tag} style={{ fontSize: '0.7rem', color: '#7a7067', border: '1px solid #dcd9d5', padding: '0.1rem 0.4rem', borderRadius: '2px' }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div style={{ fontSize: '0.8rem', color: '#999' }}>
                      {p.word_count ? `${p.word_count.toLocaleString()} words · ` : ''}
                      {new Date(p.updated_at).toLocaleDateString()}
                      {p.in_bloom_pool && <span style={{ marginLeft: '0.5rem', color: '#6B8E6B' }}>· in Bloom Pool</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', flexShrink: 0 }}>
                    <span style={{
                      fontSize: '0.68rem',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      padding: '0.2rem 0.6rem',
                      border: `1px solid ${stateColor}`,
                      color: stateColor,
                    }}>
                      {STATE_LABEL[p.state]}
                    </span>
                    {nextState && (
                      <button
                        disabled={promoting === p.id}
                        onClick={() => promoteState(p)}
                        style={{
                          fontSize: '0.7rem',
                          letterSpacing: '0.05em',
                          background: 'none',
                          border: '1px solid #c5bdb4',
                          padding: '0.15rem 0.5rem',
                          cursor: 'pointer',
                          color: '#7a7067',
                          fontFamily: 'Georgia, serif',
                          opacity: promoting === p.id ? 0.5 : 1,
                        }}
                      >
                        → {STATE_LABEL[nextState]}
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

export default WriterDashboard;
