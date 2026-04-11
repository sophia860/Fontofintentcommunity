/**
 * ResidencyProgramme — Page Gallery Editions
 *
 * The most distinctive function of the institution.
 * Quality earns payment. The institution pays to be associated
 * with work it believes in.
 */
import { Link } from 'react-router';
import { Nav } from './Nav';

const CURRENT_RESIDENTS = [
  {
    id: '2',
    name: 'The Scores',
    location: 'Edinburgh',
    cohort: '2024–25',
    status: 'current',
    mentorNote: 'In residence through summer 2025. Working on form and distribution infrastructure.',
  },
];

const PAST_RESIDENTS: typeof CURRENT_RESIDENTS = [];

const S: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', backgroundColor: '#faf8f5', fontFamily: 'Georgia, serif', color: '#1a1714' },
  hero: { padding: '5rem 3rem 4rem', borderBottom: '1px solid #e8e4df', maxWidth: '700px' },
  label: { fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#7a7067', marginBottom: '1rem' },
  h1: { fontSize: '2.5rem', fontWeight: 400, margin: '0 0 1.5rem', lineHeight: 1.15 },
  body: { fontSize: '1rem', lineHeight: 1.75, color: '#3d3830', marginBottom: '1.25rem' },
  section: { padding: '4rem 3rem', borderBottom: '1px solid #e8e4df' },
  h2: { fontSize: '1.1rem', fontWeight: 400, marginBottom: '1.5rem', letterSpacing: '0.02em' },
  offerGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '2rem', marginTop: '2rem' },
  offerItem: { borderTop: '3px solid #e8e4df', paddingTop: '1.25rem' },
  offerTitle: { fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '0.02em' },
  offerBody: { fontSize: '0.85rem', lineHeight: 1.65, color: '#3d3830' },
  residentCard: { padding: '2rem', backgroundColor: '#f2ede8', marginBottom: '1.5rem' },
  residentName: { fontSize: '1.1rem', marginBottom: '0.25rem', fontWeight: 400 },
  residentMeta: { fontSize: '0.8rem', color: '#7a7067', marginBottom: '1rem' },
  residentNote: { fontSize: '0.88rem', lineHeight: 1.65, color: '#3d3830', fontStyle: 'italic' },
  pathwaySection: { padding: '4rem 3rem', backgroundColor: '#1a1714', color: '#faf8f5' },
  pathwayInner: { maxWidth: '640px' },
  pathwayLabel: { fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#7a7067', marginBottom: '1.5rem' },
  pathwayTitle: { fontSize: '1.5rem', fontWeight: 400, marginBottom: '1.5rem', lineHeight: 1.3 },
  pathwayBody: { fontSize: '0.95rem', lineHeight: 1.8, color: '#e8e4df', marginBottom: '1.25rem' },
  cta: { display: 'inline-block', marginTop: '2rem', fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase' as const, color: '#faf8f5', border: '1px solid #faf8f5', padding: '0.6rem 1.4rem', textDecoration: 'none' },
  applySection: { padding: '4rem 3rem' },
  criteria: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '2rem', marginTop: '2rem', marginBottom: '3rem' },
  criterionItem: { borderTop: '1px solid #e8e4df', paddingTop: '1rem' },
  criterionTitle: { fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.4rem', textTransform: 'uppercase' as const, letterSpacing: '0.05em', color: '#3d3830' },
  criterionBody: { fontSize: '0.82rem', lineHeight: 1.6, color: '#7a7067' },
  // Timeline styles
  timelineSection: { padding: '4rem 3rem', borderBottom: '1px solid #e8e4df', backgroundColor: '#f5f0eb' },
  timelineGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '2rem', marginTop: '2rem' },
  timelineItem: { paddingLeft: '1.25rem', borderLeft: '2px solid #dcd9d5' },
  timelineMonth: { fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' as const, color: '#3d3830', marginBottom: '0.4rem' },
  timelineBody: { fontSize: '0.85rem', lineHeight: 1.6, color: '#7a7067' },
};

export function ResidencyProgramme() {
  return (
    <div style={S.page}>
      <Nav />

      {/* Hero */}
      <section style={S.hero}>
        <p style={S.label}>Page Gallery Editions — Residency</p>
        <h1 style={S.h1}>Journal Residency<br />Programme</h1>
        <p style={S.body}>
          Each year, two to three independent literary journals are invited
          into formal residence with Page Gallery Editions. The programme
          offers editorial mentorship, design support, printing partnerships,
          and a stipend. Selection is based solely on quality.
        </p>
        <p style={S.body}>
          The residency asks nothing financial from the journal.
          Payment flows from the institution to the journal, not the reverse.
          Quality is compensated. The institution pays to be associated
          with work it believes in.
        </p>
      </section>

      {/* What the residency offers */}
      <section style={S.section}>
        <p style={S.label}>What the Residency Offers</p>
        <div style={S.offerGrid}>
          {[
            { title: 'Editorial Mentorship', body: 'Working sessions on curatorial philosophy, selection principles, structural decisions, and the long-term identity of the journal over twelve months.' },
            { title: 'Design Support', body: 'Access to the institution\u2019s design relationships. One issue per residency year produced with Page Gallery Editions design involvement.' },
            { title: 'Print Partnerships', body: 'Resident journals access the institution\u2019s network of independent print cooperatives and short-run presses at negotiated rates.' },
            { title: 'Network & Reach', body: 'Prominent placement in the Garden, promotion through London and New York networks, access to bookshops, fairs, and distribution channels.' },
            { title: 'A Stipend', body: 'A payment from Page Gallery Editions to the journal. Calibrated to what the institution can sustain. The principle: quality is compensated.' },
            { title: 'Editorial Independence', body: 'The journal continues to operate independently. Its editorial decisions remain its own. Page Gallery Editions is not a co-editor.' },
          ].map(item => (
            <div key={item.title} style={S.offerItem}>
              <p style={S.offerTitle}>{item.title}</p>
              <p style={S.offerBody}>{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline & Process */}
      <section style={S.timelineSection}>
        <p style={S.label}>The Residency Year</p>
        <h2 style={S.h2}>What twelve months looks like.</h2>
        <div style={S.timelineGrid}>
          <div style={S.timelineItem}>
            <p style={S.timelineMonth}>September</p>
            <p style={S.timelineBody}>Applications close. The editorial team reviews all submissions over four to six weeks.</p>
          </div>
          <div style={S.timelineItem}>
            <p style={S.timelineMonth}>November</p>
            <p style={S.timelineBody}>Residents announced. Introductory sessions establish goals, editorial direction, and working rhythm.</p>
          </div>
          <div style={S.timelineItem}>
            <p style={S.timelineMonth}>Dec – Mar</p>
            <p style={S.timelineBody}>Monthly mentorship sessions (60–90 min). Focus on curatorial identity, selection philosophy, and structural decisions for the next issue.</p>
          </div>
          <div style={S.timelineItem}>
            <p style={S.timelineMonth}>Apr – Jun</p>
            <p style={S.timelineBody}>Design collaboration begins. One issue produced with Page Gallery Editions design involvement. Print partnerships activated.</p>
          </div>
          <div style={S.timelineItem}>
            <p style={S.timelineMonth}>Jul – Sep</p>
            <p style={S.timelineBody}>Distribution and launch support. Placement in bookshops, fairs, and the Garden. End-of-year reflection on what comes next.</p>
          </div>
          <div style={S.timelineItem}>
            <p style={S.timelineMonth}>Stipend</p>
            <p style={S.timelineBody}>Paid in two instalments: at the start of residency and at the midpoint. The amount is calibrated to the institution\u2019s capacity \u2014 currently \u00a3500\u2013\u00a31,500 per journal.</p>
          </div>
        </div>
      </section>

      {/* Current residents */}
      <section style={S.section}>
        <p style={S.label}>Current Residents</p>
        {CURRENT_RESIDENTS.length === 0 && (
          <p style={{ fontSize: '0.9rem', color: '#7a7067' }}>The 2025\u201326 cohort will be announced shortly.</p>
        )}
        {CURRENT_RESIDENTS.map(r => (
          <div key={r.id} style={S.residentCard}>
            <p style={S.residentName}>{r.name}</p>
            <p style={S.residentMeta}>{r.location} \u00b7 Cohort {r.cohort}</p>
            {r.mentorNote && <p style={S.residentNote}>{r.mentorNote}</p>}
          </div>
        ))}
      </section>

      {/* Absorption pathway */}
      <section style={S.pathwaySection}>
        <div style={S.pathwayInner}>
          <p style={S.pathwayLabel}>The Long View</p>
          <h2 style={S.pathwayTitle}>
            The residency is the beginning<br />of a potential long-term relationship.
          </h2>
          <p style={S.pathwayBody}>
            After one year \u2014 in some cases two \u2014 the institution may invite
            a resident journal to become a Page Gallery Editions imprint.
            The journal keeps its name, its editorial identity, its voice.
          </p>
          <p style={S.pathwayBody}>
            Absorption is not dissolution. It is institutional deepening:
            shared infrastructure, grant funding that flows through the institution,
            design and distribution at scale. The journal\u2019s selectivity is guaranteed
            by the institution\u2019s own standard.
          </p>
          <p style={S.pathwayBody}>
            The journals absorbed will be few. The institution\u2019s selectivity
            is the guarantee. Being a Page Gallery Editions imprint means
            something because of how rarely it happens.
          </p>
        </div>
      </section>

      {/* Apply */}
      <section style={S.applySection}>
        <p style={S.label}>Applications</p>
        <h2 style={S.h2}>The 2025\u201326 residency is now open for applications.</h2>
        <p style={{ ...S.body, maxWidth: '540px' }}>
          Applications are reviewed by the Page Gallery Editions editorial team.
          Decisions are made on quality alone. There is no application fee.
          There is no minimum circulation or publishing history required.
          There is only the work.
        </p>
        <div style={S.criteria}>
          {[
            { title: 'Quality', body: 'Editorial standard is the only criterion. We look for a coherent vision, distinctive taste, and genuine care for the writing.' },
            { title: 'Independence', body: 'The journal must be editorially independent. We do not residency journals affiliated with institutions that would create conflicts.' },
            { title: 'At least one issue published', body: 'We need to see the work. A digital issue is acceptable. A physical one is preferable but not required.' },
            { title: 'Openness to dialogue', body: 'The residency is a genuine relationship. The journal must be willing to engage with the mentorship seriously.' },
          ].map(c => (
            <div key={c.title} style={S.criterionItem}>
              <p style={S.criterionTitle}>{c.title}</p>
              <p style={S.criterionBody}>{c.body}</p>
            </div>
          ))}
        </div>
        <Link to="/apply" style={{
          display: 'inline-block',
          fontSize: '0.85rem',
          letterSpacing: '0.05em',
          textTransform: 'uppercase' as const,
          color: '#faf8f5',
          backgroundColor: '#1a1714',
          padding: '0.75rem 1.75rem',
          textDecoration: 'none',
        }}>
          Apply for Residency
        </Link>
      </section>
    </div>
  );
}
