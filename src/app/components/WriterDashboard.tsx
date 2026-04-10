import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { supabase } from '../lib/supabase';

type Piece = { id: string; title: string; status: string; created_at: string; updated_at: string };

const badgeColor: Record<string, { bg: string; fg: string }> = {
  raw_seed: { bg: '#f0f0f0', fg: '#666' },
  draft: { bg: '#fff3cd', fg: '#856404' },
  submitted: { bg: '#cce5ff', fg: '#004085' },
  published: { bg: '#d4edda', fg: '#155724' },
};

export function WriterDashboard() {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { loadPieces(); }, []);

  async function loadPieces() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from('writings')
      .select('id, title, status, created_at, updated_at')
      .eq('author_id', user.id)
      .order('updated_at', { ascending: false });
    setPieces(data || []);
    setLoading(false);
  }

  async function createNew() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('writings')
      .insert({ title: 'Untitled', body: '', status: 'raw_seed', author_id: user.id })
      .select('id')
      .single();
    if (data) navigate('/piece/' + data.id);
  }

  if (loading) return <main style={{ maxWidth: 760, margin: '3rem auto', padding: '0 1.5rem' }}><p>Loading…</p></main>;

  return (
    <main style={{ maxWidth: 760, margin: '3rem auto', padding: '0 1.5rem', fontFamily: 'Georgia, serif' }}>
      <h1 style={{ fontWeight: 400, fontSize: '2rem', marginBottom: '0.25rem' }}>Writer Dashboard</h1>
      <p style={{ color: '#666', fontStyle: 'italic', marginBottom: '2rem' }}>Your garden of words</p>
      <button
        style={{ display: 'inline-block', padding: '0.6rem 1.4rem', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.95rem', marginBottom: '2rem' }}
        onClick={createNew}
      >+ New Piece</button>
      {pieces.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#999' }}>
          <p>No pieces yet. Plant your first seed.</p>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {pieces.map((p) => {
            const bc = badgeColor[p.status] || badgeColor.raw_seed;
            return (
              <li key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid #eee' }}>
                <div>
                  <Link to={'/piece/' + p.id} style={{ fontWeight: 500, fontSize: '1.1rem', color: '#1a1a1a', textDecoration: 'none' }}>{p.title || 'Untitled'}</Link>
                  <div style={{ fontSize: '0.85rem', color: '#999' }}>{new Date(p.updated_at).toLocaleDateString()}</div>
                </div>
                <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 12, fontSize: '0.8rem', fontWeight: 500, background: bc.bg, color: bc.fg }}>{p.status.replace('_', ' ')}</span>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

export default WriterDashboard;
