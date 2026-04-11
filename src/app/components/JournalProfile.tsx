import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { Nav } from './Nav';
import { supabase } from '../lib/supabase';
import { pickHeadingFont } from '../lib/fontMapper';

type Journal = {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  editorial_statement?: string;
  aesthetic_tags?: string[];
  website?: string;
  status?: string;
  pays_contributors?: boolean;
};

export function JournalProfile() {
  const { id } = useParams<{ id: string }>();
  const [journal, setJournal] = useState<Journal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    async function load() {
      // Try by slug first, then by id — avoids string interpolation in query
      const bySlug = await supabase
        .from('journals')
        .select('id, name, slug, description, editorial_statement, aesthetic_tags, website, status, pays_contributors')
        .eq('slug', id)
        .maybeSingle();

      let result = bySlug.data;

      if (!result) {
        const byId = await supabase
          .from('journals')
          .select('id, name, slug, description, editorial_statement, aesthetic_tags, website, status, pays_contributors')
          .eq('id', id)
          .maybeSingle();
        result = byId.data;
      }

      setJournal((result as Journal) || null);
      setLoading(false);
    }
    load();
  }, [id]);

  const S: Record<string, React.CSSProperties> = {
    page: { minHeight: '100vh', backgroundColor: '#F5EDE4', fontFamily: 'Georgia, serif', color: '#1a1714' },
    inner: { maxWidth: 760, margin: '0 auto', padding: '4rem 1.5rem' },
    label: { fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#7a7067', marginBottom: '1rem', display: 'block' },
    h1: { fontWeight: 600, fontSize: 'clamp(2.2rem, 4vw, 3.25rem)', marginBottom: '0.5rem', lineHeight: 1.1, fontFamily: pickHeadingFont('JournalProfile-h1') },
    editorial: { fontSize: '0.95rem', lineHeight: 1.75, color: '#3d3830', maxWidth: '580px', marginBottom: '2rem', fontStyle: 'italic' },
    body: { fontSize: '0.9rem', lineHeight: 1.7, color: '#3d3830', maxWidth: '580px', marginBottom: '1.5rem' },
    tags: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' as const, marginBottom: '2rem' },
    tag: { fontSize: '0.72rem', letterSpacing: '0.06em', color: '#7a7067', border: '1px solid #c5bdb4', padding: '0.2rem 0.6rem', borderRadius: '2px' },
    statusBadge: { fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' as const, padding: '0.2rem 0.6rem', display: 'inline-block', marginBottom: '1rem' },
    applyBtn: { display: 'inline-block', padding: '0.6rem 1.4rem', background: '#1a1714', color: '#fff', textDecoration: 'none', fontSize: '0.85rem', letterSpacing: '0.04em' },
  };

  return (
    <div style={S.page}>
      <Nav />
      <div style={S.inner}>
        {loading && <p style={{ color: '#7a7067', fontStyle: 'italic' }}>Loading…</p>}

        {!loading && !journal && (
          <div>
            <p style={{ color: '#7a7067', marginBottom: '1rem' }}>Journal not found.</p>
            <Link to="/journals" style={{ color: '#1a1714', fontSize: '0.9rem' }}>← All journals</Link>
          </div>
        )}

        {!loading && journal && (
          <>
            <span style={S.label}>Journal</span>
            <h1 style={S.h1}>{journal.name}</h1>

            {journal.status && (
              <span style={{
                ...S.statusBadge,
                color: journal.status === 'open' ? '#6B8E6B' : '#7a7067',
                border: `1px solid ${journal.status === 'open' ? '#6B8E6B' : '#c5bdb4'}`,
              }}>
                {journal.status === 'open' ? 'Reading open' : journal.status === 'closed' ? 'Closed' : journal.status}
              </span>
            )}

            {journal.editorial_statement && (
              <p style={S.editorial}>{journal.editorial_statement}</p>
            )}

            {journal.description && !journal.editorial_statement && (
              <p style={S.body}>{journal.description}</p>
            )}

            {journal.aesthetic_tags && journal.aesthetic_tags.length > 0 && (
              <>
                <p style={{ ...S.label, marginBottom: '0.5rem' }}>Looking for</p>
                <div style={S.tags}>
                  {journal.aesthetic_tags.map(tag => (
                    <span key={tag} style={S.tag}>{tag}</span>
                  ))}
                </div>
              </>
            )}

            {journal.pays_contributors !== undefined && (
              <p style={{ ...S.body, color: '#7a7067', fontSize: '0.82rem' }}>
                {journal.pays_contributors ? 'Pays contributors.' : 'Does not pay contributors.'}
              </p>
            )}

            {journal.website && (
              <p style={{ marginBottom: '2rem' }}>
                <a href={journal.website} target="_blank" rel="noopener noreferrer" style={{ color: '#1a1714', fontSize: '0.88rem' }}>
                  {journal.website.replace(/^https?:\/\//, '')} →
                </a>
              </p>
            )}

            {journal.status === 'open' && (
              <Link to="/apply?tab=tilth" style={S.applyBtn}>
                Submit a piece
              </Link>
            )}

            <p style={{ marginTop: '3rem' }}>
              <Link to="/journals" style={{ color: '#7a7067', fontSize: '0.85rem' }}>← All journals</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default JournalProfile;
