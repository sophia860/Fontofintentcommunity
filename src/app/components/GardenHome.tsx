/**
 * GardenHome — Page Gallery Editions
 *
 * The Garden is not trying to publish you.
 * It is the place where writing lives before it becomes anything else.
 * Tilth is what the Garden occasionally produces as a verdict.
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

const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#faf8f5',
    fontFamily: 'Georgia, serif',
    color: '#1a1714',
  },
  hero: {
    padding: '6rem 3rem 5rem',
    maxWidth: '680px',
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
};

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
          Tilth publishes what cannot be ignored.
        </p>
        <div style={S.heroCta}>
          <Link to="/journals" style={S.ctaPrimary}>Enter the Garden</Link>
          <Link to="/editions" style={S.ctaSecondary}>Read Tilth</Link>
        </div>
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
            Tilth is what the Garden occasionally produces as a verdict: fully illustrated,
            competitive to enter, published when the work demands it and not before.
            The bar is the institution’s only editorial statement.
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
        <span style={S.footerNote}>The Garden · Tilth · Residency · Editions</span>
      </div>
    </div>
  );
}
