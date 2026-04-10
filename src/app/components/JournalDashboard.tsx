import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Sub = {
  id: string;
  writing_id: string;
  journal_id: string;
  status: string;
  created_at: string;
  writings: { title: string; profiles: { display_name: string } | null } | null;
};

export function JournalDashboard() {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadSubs(); }, []);

  async function loadSubs() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from('submissions')
      .select('id, writing_id, journal_id, status, created_at, writings(title, profiles(display_name))')
      .order('created_at', { ascending: false });
    setSubs((data as any) || []);
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('submissions').update({ status }).eq('id', id);
    setSubs(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  }

  if (loading) return <main style={{ maxWidth: 760, margin: '3rem auto', padding: '0 1.5rem' }}><p>Loading…</p></main>;

  return (
    <main style={{ maxWidth: 760, margin: '3rem auto', padding: '0 1.5rem', fontFamily: 'Georgia, serif' }}>
      <h1 style={{ fontWeight: 400, fontSize: '2rem', marginBottom: '0.25rem' }}>Journal Dashboard</h1>
      <p style={{ color: '#666', fontStyle: 'italic', marginBottom: '2rem' }}>Review submissions to your journal</p>
      {subs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#999' }}>
          <p>No submissions yet.</p>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {subs.map((s) => (
            <li key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid #eee' }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: '1.05rem', color: '#1a1a1a' }}>{s.writings?.title || 'Untitled'}</div>
                <div style={{ fontSize: '0.85rem', color: '#999' }}>by {s.writings?.profiles?.display_name || 'Unknown'} • {new Date(s.created_at).toLocaleDateString()} • {s.status}</div>
              </div>
              {s.status === 'pending' && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    style={{ padding: '4px 12px', border: '1px solid #155724', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: '0.85rem', color: '#155724' }}
                    onClick={() => updateStatus(s.id, 'accepted')}
                  >Accept</button>
                  <button
                    style={{ padding: '4px 12px', border: '1px solid #721c24', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: '0.85rem', color: '#721c24' }}
                    onClick={() => updateStatus(s.id, 'rejected')}
                  >Reject</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default JournalDashboard;
