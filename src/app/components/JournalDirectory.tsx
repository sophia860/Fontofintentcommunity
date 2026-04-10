/**
 * JournalDirectory — Page Gallery Garden
 *
 * The curated registry of journals in the ecosystem.
 * Not everyone gets published. Everyone can enter the ecology.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Nav } from './Nav';
import { supabase } from '../lib/supabase';

type Journal = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  looking_for: string | null;
  publish_frequency: string | null;
  status: string;
  is_public: boolean;
};

const ALL_FORMS = ['poetry', 'fiction', 'essay', 'prose poem', 'hybrid', 'lyric essay', 'nonfiction', 'art'];

function parseForms(looking_for: string | null): string[] {
  if (!looking_for) return [];
  const parts = looking_for.split('|');
  return parts[0]?.split(',').map(s => s.trim()).filter(Boolean) || [];
}

function parseThemes(looking_for: string | null): string[] {
  if (!looking_for) return [];
  const parts = looking_for.split('|');
  return parts[1]?.split(',').map(s => s.trim()).filter(Boolean) || [];
}

function displayStatus(status: string): 'open' | 'rolling' | 'closed' {
  if (status === 'active') return 'open';
  if (status === 'pre_launch') return 'closed';
  return 'closed';
}

const S: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', backgroundColor: '#faf8f5', fontFamily: 'Georgia, serif', color: '#1a1714' },
  header: { padding: '4rem 3rem 2rem', borderBottom: '1px solid #e8e4df' },
  headerLabel: { fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#7a7067', marginBottom: '1rem' },
  headerTitle: { fontSize: '2rem', fontWeight: 400, margin: '0 0 1rem', lineHeight: 1.2 },
  headerBody: { fontSize: '0.9rem', color: '#3d3830', lineHeight: 1.65, maxWidth: '540px' },
  filters: { padding: '1.5rem 3rem', borderBottom: '1px solid #e8e4df', display: 'flex', gap: '1rem', flexWrap: 'wrap' as const, alignItems: 'center' },
  filterLabel: { fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#7a7067', marginRight: '0.5rem' },
  filterChip: { fontSize: '0.78rem', padding: '0.25rem 0.7rem', border: '1px solid #c5bdb4', backgroundColor: 'transparent', color: '#3d3830', cursor: 'pointer', fontFamily: 'Georgia, serif' },
  filterChipActive: { fontSize: '0.78rem', padding: '0.25rem 0.7rem', border: '1px solid #1a1714', backgroundColor: '#1a1714', color: '#faf8f5', cursor: 'pointer', fontFamily: 'Georgia, serif' },
  list: { padding: '0 3rem' },
  journalCard: { padding: '2rem 0', borderBottom: '1px solid #e8e4df' },
  journalTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' },
  journalName: { fontSize: '1.1rem', fontWeight: 400, textDecoration: 'none', color: '#1a1714' },
  journalMeta: { fontSize: '0.8rem', color: '#7a7067', display: 'flex', gap: '1.5rem', alignItems: 'center' },
  journalMission: { fontSize: '0.88rem', color: '#3d3830', lineHeight: 1.6, marginBottom: '1rem', maxWidth: '640px' },
  journalTags: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' as const },
  tag: { fontSize: '0.72rem', padding: '0.15rem 0.5rem', border: '1px solid #e8e4df', color: '#7a7067' },
  statusOpen: { display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: '#4a7a4a' },
  statusDot: { width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#6b9e6b', display: 'inline-block' },
  loading: { padding: '4rem 3rem', color: '#7a7067', fontSize: '0.9rem' },
  cta: { padding: '3rem', borderTop: '1px solid #e8e4df', textAlign: 'center' as const },
};

export function JournalDirectory() {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [showOnlyOpen, setShowOnlyOpen] = useState(false);

  useEffect(() => {
    async function fetchJournals() {
      const { data, error } = await supabase
        .from('journals')
        .select('id, name, slug, description, looking_for, publish_frequency, status, is_public')
        .eq('is_public', true)
        .order('name');

      if (!error && data) {
        setJournals(data);
      }
      setLoading(false);
    }
    fetchJournals();
  }, []);

  const filtered = journals.filter(j => {
    const forms = parseForms(j.looking_for);
    const ds = displayStatus(j.status);
    if (activeForm && !forms.includes(activeForm)) return false;
    if (showOnlyOpen && ds !== 'open' && ds !== 'rolling') return false;
    return true;
  });

  return (
    <div style={S.page}>
      <Nav />
      <div style={S.header}>
        <p style={S.headerLabel}>The Garden — Journals</p>
        <h1 style={S.headerTitle}>Journal Directory</h1>
        <p style={S.headerBody}>
          Independent literary journals in the Garden ecosystem. Registered journals can discover writers,
          access print partnerships, and apply for the annual Residency Programme.
          Any journal may register. Not every journal will be invited to residency.
        </p>
      </div>

      {/* Filters */}
      <div style={S.filters}>
        <span style={S.filterLabel}>Filter</span>
        {ALL_FORMS.map(f => (
          <button
            key={f}
            style={activeForm === f ? S.filterChipActive : S.filterChip}
            onClick={() => setActiveForm(activeForm === f ? null : f)}
          >
            {f}
          </button>
        ))}
        <button
          style={showOnlyOpen ? S.filterChipActive : S.filterChip}
          onClick={() => setShowOnlyOpen(v => !v)}
        >
          Open now
        </button>
      </div>

      {/* Journal list */}
      <div style={S.list}>
        {loading && <p style={S.loading}>Loading journals…</p>}
        {!loading && filtered.length === 0 && (
          <p style={S.loading}>No journals match these filters.</p>
        )}
        {filtered.map(j => {
          const forms = parseForms(j.looking_for);
          const themes = parseThemes(j.looking_for);
          const ds = displayStatus(j.status);
          return (
            <div key={j.id} style={S.journalCard}>
              <div style={S.journalTop}>
                <Link to={`/journals/${j.slug}`} style={S.journalName}>{j.name}</Link>
                <div style={S.journalMeta}>
                  {j.publish_frequency && <span>{j.publish_frequency}</span>}
                  {ds === 'open' && (
                    <span style={S.statusOpen}>
                      <span style={S.statusDot} />
                      Open
                    </span>
                  )}
                  {ds === 'rolling' && <span style={{ fontSize: '0.78rem', color: '#7a7067' }}>Rolling</span>}
                  {ds === 'closed' && <span style={{ fontSize: '0.78rem', color: '#7a7067' }}>Closed</span>}
                </div>
              </div>
              {j.description && <p style={S.journalMission}>{j.description}</p>}
              <div style={S.journalTags}>
                {forms.map(f => <span key={f} style={S.tag}>{f}</span>)}
                {themes.map(t => <span key={t} style={{ ...S.tag, color: '#9a9088', borderColor: '#f0ece7' }}>{t}</span>)}
              </div>
            </div>
          );
        })}
      </div>

      <div style={S.cta}>
        <p style={{ fontSize: '0.88rem', color: '#3d3830', marginBottom: '1rem' }}>
          Are you a journal? Register in the Garden.
        </p>
        <Link to="/apply" style={{ fontSize: '0.85rem', color: '#1a1714', borderBottom: '1px solid #1a1714', textDecoration: 'none' }}>
          Register your journal
        </Link>
      </div>
    </div>
  );
}
