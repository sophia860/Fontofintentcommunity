import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { supabase } from '../lib/supabase';

type Sub = {
  id: string;
  writing_id: string;
  journal_id: string;
  status: string;
  created_at: string;
  writings: { title: string; profiles: { display_name: string } | null } | null;
};

type BloomPiece = {
  id: string;
  title: string;
  body?: string;
  tags?: string[];
  word_count?: number;
  scouted?: boolean;
  author_id: string;
  updated_at: string;
  display_name?: string;
};

export function JournalDashboard() {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [bloomPieces, setBloomPieces] = useState<BloomPiece[]>([]);
  const [loading, setLoading] = useState(true);
  const [scouting, setScouting] = useState<string | null>(null);
  const [tab, setTab] = useState<'submissions' | 'bloom'>('bloom');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const [subsRes, bloomRes] = await Promise.all([
      supabase
        .from('submissions')
        .select('id, writing_id, journal_id, status, created_at, writings(title, profiles(display_name))')
        .order('created_at', { ascending: false }),
      // Bloom Pool: bloomed pieces open for journal discovery
      supabase
        .from('writings')
        .select('id, title, body, tags, word_count, scouted, author_id, updated_at, profiles(display_name)')
        .eq('state', 'bloom')
        .eq('in_bloom_pool', true)
        .order('updated_at', { ascending: false }),
    ]);

    setSubs((subsRes.data as any) || []);

    const bloom = ((bloomRes.data as any[]) || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      body: row.body,
      tags: row.tags,
      word_count: row.word_count,
      scouted: row.scouted,
      author_id: row.author_id,
      updated_at: row.updated_at,
      display_name: row.profiles?.display_name,
    }));
    setBloomPieces(bloom);
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('submissions').update({ status }).eq('id', id);
    setSubs(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  }

  async function scoutPiece(pieceId: string) {
    setScouting(pieceId);
    await supabase.from('writings').update({ scouted: true }).eq('id', pieceId);
    setBloomPieces(prev => prev.map(p => p.id === pieceId ? { ...p, scouted: true } : p));
    setScouting(null);
  }

  const S: Record<string, React.CSSProperties> = {
    page: { maxWidth: 780, margin: '3rem auto', padding: '0 1.5rem', fontFamily: 'Georgia, serif' },
    tabs: { display: 'flex', gap: '2rem', marginBottom: '2rem', borderBottom: '1px solid #e8e4df' },
    tab: { padding: '0 0 0.75rem', fontSize: '0.88rem', cursor: 'pointer', border: 'none', background: 'none', fontFamily: 'Georgia, serif', color: '#7a7067', borderBottom: '2px solid transparent', marginBottom: '-1px' },
    tabActive: { padding: '0 0 0.75rem', fontSize: '0.88rem', cursor: 'pointer', border: 'none', background: 'none', fontFamily: 'Georgia, serif', color: '#1a1714', borderBottom: '2px solid #1a1714', marginBottom: '-1px' },
    row: { padding: '1.25rem 0', borderBottom: '1px solid #e8e4df', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' },
    title: { fontStyle: 'italic', fontSize: '1rem', color: '#1a1714', textDecoration: 'none', display: 'block', marginBottom: '0.3rem' },
    meta: { fontSize: '0.78rem', color: '#aaa', lineHeight: 1.5 },
    tag: { fontSize: '0.68rem', color: '#7a7067', border: '1px solid #dcd9d5', padding: '0.1rem 0.4rem', borderRadius: '2px', marginRight: '0.3rem' },
    scoutBtn: { fontSize: '0.75rem', padding: '0.25rem 0.6rem', border: '1px solid #6B8E6B', color: '#6B8E6B', background: 'none', cursor: 'pointer', fontFamily: 'Georgia, serif', letterSpacing: '0.04em' },
    scoutedBadge: { fontSize: '0.68rem', color: '#6B8E6B', border: '1px solid #6B8E6B', padding: '0.15rem 0.5rem', letterSpacing: '0.04em' },
  };

  if (loading) return (
    <main style={S.page}><p style={{ color: '#7a7067', fontStyle: 'italic' }}>Loading…</p></main>
  );

  return (
    <main style={S.page}>
      <h1 style={{ fontWeight: 400, fontSize: '2rem', marginBottom: '0.25rem' }}>Journal Dashboard</h1>
      <p style={{ color: '#666', fontStyle: 'italic', marginBottom: '2rem' }}>Discover writers and review submissions</p>

      <div style={S.tabs}>
        <button style={tab === 'bloom' ? S.tabActive : S.tab} onClick={() => setTab('bloom')}>
          Bloom Pool {bloomPieces.length > 0 ? `(${bloomPieces.length})` : ''}
        </button>
        <button style={tab === 'submissions' ? S.tabActive : S.tab} onClick={() => setTab('submissions')}>
          Submissions {subs.length > 0 ? `(${subs.length})` : ''}
        </button>
      </div>

      {tab === 'bloom' && (
        <div>
          <p style={{ fontSize: '0.83rem', color: '#7a7067', marginBottom: '1.5rem', lineHeight: 1.65 }}>
            These pieces have been opened to journal discovery by their writers. Scout a piece to flag it for further reading.
          </p>
          {bloomPieces.length === 0 && (
            <p style={{ color: '#aaa', fontStyle: 'italic', fontSize: '0.9rem' }}>No pieces in the Bloom Pool yet.</p>
          )}
          {bloomPieces.map(p => (
            <div key={p.id} style={S.row}>
              <div style={{ flex: 1 }}>
                <Link to={`/piece/${p.id}`} style={S.title}>{p.title || <em style={{ color: '#aaa' }}>Untitled</em>}</Link>
                {p.body && (
                  <p style={{ fontSize: '0.85rem', color: '#7a7067', lineHeight: 1.6, marginBottom: '0.5rem' }}>
                    {p.body.slice(0, 150)}{p.body.length > 150 ? '…' : ''}
                  </p>
                )}
                <div style={{ marginBottom: '0.25rem' }}>
                  {(p.tags || []).map(tag => (
                    <span key={tag} style={S.tag}>{tag}</span>
                  ))}
                </div>
                <p style={S.meta}>
                  {p.display_name || 'Anonymous'} ·{' '}
                  {p.word_count ? `${p.word_count.toLocaleString()} words · ` : ''}
                  {new Date(p.updated_at).toLocaleDateString()}
                </p>
              </div>
              <div style={{ flexShrink: 0, paddingTop: '0.1rem' }}>
                {p.scouted ? (
                  <span style={S.scoutedBadge}>Scouted</span>
                ) : (
                  <button
                    style={S.scoutBtn}
                    disabled={scouting === p.id}
                    onClick={() => scoutPiece(p.id)}
                  >
                    {scouting === p.id ? 'Scouting…' : 'Scout'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'submissions' && (
        <div>
          {subs.length === 0 ? (
            <p style={{ color: '#aaa', fontStyle: 'italic', fontSize: '0.9rem' }}>No submissions yet.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {subs.map((s) => (
                <li key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid #e8e4df' }}>
                  <div>
                    <div style={{ fontStyle: 'italic', fontSize: '1rem', color: '#1a1714', marginBottom: '0.2rem' }}>{s.writings?.title || 'Untitled'}</div>
                    <div style={{ fontSize: '0.78rem', color: '#999' }}>
                      by {s.writings?.profiles?.display_name || 'Unknown'} · {new Date(s.created_at).toLocaleDateString()} · {s.status}
                    </div>
                  </div>
                  {s.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        style={{ padding: '4px 12px', border: '1px solid #6B8E6B', background: '#fff', cursor: 'pointer', fontSize: '0.82rem', color: '#6B8E6B', fontFamily: 'Georgia, serif' }}
                        onClick={() => updateStatus(s.id, 'accepted')}
                      >Accept</button>
                      <button
                        style={{ padding: '4px 12px', border: '1px solid #c5bdb4', background: '#fff', cursor: 'pointer', fontSize: '0.82rem', color: '#7a7067', fontFamily: 'Georgia, serif' }}
                        onClick={() => updateStatus(s.id, 'rejected')}
                      >Decline</button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </main>
  );
}

export default JournalDashboard;
