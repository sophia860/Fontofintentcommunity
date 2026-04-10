/**
 * JournalDirectory — Page Gallery Garden
 * The curated registry of journals in the ecosystem.
 * Not everyone gets published. Everyone can enter the ecology.
 */
import { useState } from 'react';
import { Link } from 'react-router';
import { Nav } from './Nav';

const MOCK_JOURNALS = [
  {
    id: '1', name: 'Prototype Journal', location: 'London', founded: '2019',
    mission: 'A journal of innovative writing at the intersection of form and politics.',
    forms: ['poetry', 'fiction', 'essay'], themes: ['form', 'politics', 'language'],
    status: 'open', pays: true, payNote: 'Flat fee per piece',
    gardenPartner: true, residencyAlumnus: false, pageGalleryImprint: false,
  },
  {
    id: '2', name: 'The Scores', location: 'Edinburgh', founded: '2017',
    mission: 'Publishing experimental and innovative writing from Scotland and beyond.',
    forms: ['poetry', 'prose poem', 'hybrid'], themes: ['experiment', 'place', 'sound'],
    status: 'open', pays: true, payNote: 'Scottish Book Trust rates',
    gardenPartner: true, residencyAlumnus: true, pageGalleryImprint: false,
  },
  {
    id: '3', name: 'Perverse', location: 'New York', founded: '2021',
    mission: 'A journal of queer poetics, committed to work that refuses legibility.',
    forms: ['poetry', 'lyric essay'], themes: ['queerness', 'refusal', 'desire'],
    status: 'rolling', pays: false, payNote: '',
    gardenPartner: true, residencyAlumnus: false, pageGalleryImprint: false,
  },
  {
    id: '4', name: 'Ambit', location: 'London', founded: '1959',
    mission: 'One of the oldest independent literary magazines in the UK, publishing poetry, prose, and art.',
    forms: ['poetry', 'fiction', 'art'], themes: ['avant-garde', 'visual', 'international'],
    status: 'closed', pays: true, payNote: 'Per piece',
    gardenPartner: false, residencyAlumnus: false, pageGalleryImprint: false,
  },
  {
    id: '5', name: 'Gutter', location: 'Glasgow', founded: '2009',
    mission: 'Publishing the best new Scottish writing alongside international voices.',
    forms: ['poetry', 'fiction', 'nonfiction'], themes: ['Scotland', 'place', 'identity'],
    status: 'open', pays: true, payNote: 'SBT rates',
    gardenPartner: true, residencyAlumnus: false, pageGalleryImprint: false,
  },
];

const ALL_FORMS = ['poetry', 'fiction', 'essay', 'prose poem', 'hybrid', 'lyric essay', 'nonfiction', 'art'];

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
  badgeResidency: { fontSize: '0.7rem', padding: '0.15rem 0.5rem', backgroundColor: '#3d3830', color: '#faf8f5', letterSpacing: '0.04em', textTransform: 'uppercase' as const },
  badgeImprint: { fontSize: '0.7rem', padding: '0.15rem 0.5rem', backgroundColor: '#1a1714', color: '#faf8f5', letterSpacing: '0.04em', textTransform: 'uppercase' as const },
  statusOpen: { display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: '#4a7a4a' },
  statusDot: { width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#6b9e6b', display: 'inline-block' },
  cta: { padding: '3rem', borderTop: '1px solid #e8e4df', textAlign: 'center' as const },
};

export function JournalDirectory() {
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [showOnlyOpen, setShowOnlyOpen] = useState(false);
  const [showOnlyPays, setShowOnlyPays] = useState(false);

  const filtered = MOCK_JOURNALS.filter(j => {
    if (activeForm && !j.forms.includes(activeForm)) return false;
    if (showOnlyOpen && j.status !== 'open' && j.status !== 'rolling') return false;
    if (showOnlyPays && !j.pays) return false;
    return true;
  });

  return (
    <div style={S.page}>
      <Nav />

      <div style={S.header}>
        <p style={S.headerLabel}>The Garden — Journals</p>
        <h1 style={S.headerTitle}>Journal Directory</h1>
        <p style={S.headerBody}>
          Independent literary journals in the Garden ecosystem.
          Registered journals can discover writers, access print partnerships,
          and apply for the annual Residency Programme.
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
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem' }}>
          <button
            style={showOnlyOpen ? S.filterChipActive : S.filterChip}
            onClick={() => setShowOnlyOpen(v => !v)}
          >
            Open now
          </button>
          <button
            style={showOnlyPays ? S.filterChipActive : S.filterChip}
            onClick={() => setShowOnlyPays(v => !v)}
          >
            Pays contributors
          </button>
        </div>
      </div>

      {/* Journal list */}
      <div style={S.list}>
        {filtered.length === 0 && (
          <p style={{ padding: '3rem 0', color: '#7a7067', fontSize: '0.9rem' }}>No journals match these filters.</p>
        )}
        {filtered.map(j => (
          <div key={j.id} style={S.journalCard}>
            <div style={S.journalTop}>
              <Link to={`/journals/${j.id}`} style={S.journalName}>{j.name}</Link>
              <div style={S.journalMeta}>
                {j.residencyAlumnus && <span style={S.badgeResidency}>Residency</span>}
                {j.pageGalleryImprint && <span style={S.badgeImprint}>PG Imprint</span>}
                {j.pays && <span>Pays</span>}
                <span>{j.location}</span>
                {j.founded && <span>Est. {j.founded}</span>}
                {j.status === 'open' && (
                  <span style={S.statusOpen}>
                    <span style={S.statusDot} /> Open
                  </span>
                )}
                {j.status === 'rolling' && <span style={{ ...S.statusOpen, color: '#7a7067' }}>Rolling</span>}
                {j.status === 'closed' && <span style={{ ...S.statusOpen, color: '#b0a89e' }}>Closed</span>}
              </div>
            </div>
            <p style={S.journalMission}>{j.mission}</p>
            <div style={S.journalTags}>
              {j.forms.map(f => <span key={f} style={S.tag}>{f}</span>)}
              {j.themes.map(t => <span key={t} style={{ ...S.tag, fontStyle: 'italic' }}>{t}</span>)}
            </div>
          </div>
        ))}
      </div>

      <div style={S.cta}>
        <p style={{ fontSize: '0.9rem', color: '#3d3830', marginBottom: '1rem' }}>
          Are you a journal? Register in the Garden.
        </p>
        <Link
          to="/apply"
          style={{ fontSize: '0.85rem', color: '#1a1714', borderBottom: '1px solid #1a1714', textDecoration: 'none', paddingBottom: '2px' }}
        >
          Register your journal
        </Link>
      </div>
    </div>
  );
}
