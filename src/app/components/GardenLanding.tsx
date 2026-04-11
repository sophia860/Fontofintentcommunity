import { Link } from 'react-router';
import { Nav } from './Nav';

const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#faf8f5',
    fontFamily: 'Georgia, serif',
    color: '#1a1714',
  },
  hero: {
    padding: '7rem 3rem 5rem',
    maxWidth: '860px',
    margin: '0 auto',
  },
  eyebrow: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.75rem',
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: '#7a7067',
    marginBottom: '1.5rem',
  },
  headline: {
    fontFamily: 'Georgia, serif',
    fontSize: 'clamp(2.4rem, 5vw, 4rem)',
    fontWeight: 400,
    lineHeight: 1.1,
    color: '#1a1714',
    marginBottom: '1.25rem',
  },
  subtitle: {
    fontFamily: 'Georgia, serif',
    fontSize: '1.15rem',
    fontStyle: 'italic',
    color: '#7a7067',
    marginBottom: '2rem',
    lineHeight: 1.5,
    maxWidth: '600px',
  },
  body: {
    fontFamily: 'Georgia, serif',
    fontSize: '1rem',
    color: '#4a4540',
    lineHeight: 1.7,
    maxWidth: '560px',
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #e8e4df',
    margin: '0',
  },
  audienceSection: {
    padding: '5rem 3rem',
    maxWidth: '860px',
    margin: '0 auto',
  },
  sectionLabel: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.72rem',
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: '#7a7067',
    marginBottom: '3rem',
  },
  audienceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1.5px',
    backgroundColor: '#e8e4df',
  },
  audienceCard: {
    backgroundColor: '#faf8f5',
    padding: '2rem',
  },
  audienceName: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.9rem',
    fontWeight: 400,
    color: '#1a1714',
    marginBottom: '0.6rem',
    letterSpacing: '0.04em',
    textTransform: 'uppercase' as const,
  },
  audienceDesc: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.875rem',
    color: '#7a7067',
    lineHeight: 1.5,
    fontStyle: 'italic',
  },
  ctaSection: {
    backgroundColor: '#f2ede8',
    padding: '4rem 3rem',
  },
  ctaInner: {
    maxWidth: '860px',
    margin: '0 auto',
  },
  ctaLabel: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.72rem',
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: '#7a7067',
    marginBottom: '2rem',
  },
  ctaLinks: {
    display: 'flex',
    gap: '2rem',
    flexWrap: 'wrap' as const,
    alignItems: 'center',
  },
  ctaLink: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.95rem',
    color: '#1a1714',
    textDecoration: 'none',
    borderBottom: '1px solid #1a1714',
    paddingBottom: '1px',
    letterSpacing: '0.02em',
  },
  ctaSeparator: {
    color: '#c8c0b8',
    fontSize: '0.8rem',
  },
  backSection: {
    padding: '3rem',
    maxWidth: '860px',
    margin: '0 auto',
  },
  backLink: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.875rem',
    color: '#7a7067',
    textDecoration: 'none',
    borderBottom: '1px solid #e8e4df',
    paddingBottom: '1px',
  },
  footer: {
    padding: '3rem',
    borderTop: '1px solid #e8e4df',
    maxWidth: '860px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    flexWrap: 'wrap' as const,
    gap: '1rem',
  },
  footerWord: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.8rem',
    color: '#7a7067',
    letterSpacing: '0.04em',
  },
};

const AUDIENCE_CARDS = [
  {
    name: 'Writers',
    desc: 'A workspace to write, publish, and earn.',
  },
  {
    name: 'Artists',
    desc: 'A space for commissions, licensed work, and cover design.',
  },
  {
    name: 'Journals',
    desc: 'Journal OS — workflows, issue builders, submission management.',
  },
  {
    name: 'Institutions',
    desc: 'White-label setup, editorial consulting, bespoke configuration.',
  },
];

export function GardenLanding() {
  return (
    <div style={S.page}>
      <Nav />

      {/* Hero */}
      <section style={S.hero}>
        <p style={S.eyebrow}>The Page Gallery</p>
        <h1 style={S.headline}>The Garden</h1>
        <p style={S.subtitle}>
          The platform by The Page Gallery. The operating system for
          independent literature and visual culture.
        </p>
        <p style={S.body}>
          The Garden is where writing becomes visible, collaborative, and
          monetizable. It is both an editorial tool and a revenue engine —
          for writers, artists, journals, and presses.
        </p>
      </section>

      <hr style={S.divider} />

      {/* Audience cards */}
      <section style={S.audienceSection}>
        <p style={S.sectionLabel}>Who it's for</p>
        <div style={S.audienceGrid}>
          {AUDIENCE_CARDS.map(({ name, desc }) => (
            <div key={name} style={S.audienceCard}>
              <p style={S.audienceName}>{name}</p>
              <p style={S.audienceDesc}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <hr style={S.divider} />

      {/* CTAs */}
      <section style={S.ctaSection}>
        <div style={S.ctaInner}>
          <p style={S.ctaLabel}>Enter The Garden</p>
          <div style={S.ctaLinks}>
            <Link to="/auth" style={S.ctaLink}>Join as a Writer →</Link>
            <span style={S.ctaSeparator}>·</span>
            <Link to="/auth" style={S.ctaLink}>Open Journal OS →</Link>
            <span style={S.ctaSeparator}>·</span>
            <Link to="/apply" style={S.ctaLink}>Contact for Concierge →</Link>
          </div>
        </div>
      </section>

      {/* Back link */}
      <section style={S.backSection}>
        <Link to="/" style={S.backLink}>
          The Garden is part of The Page Gallery →
        </Link>
      </section>

      <footer style={S.footer}>
        <span style={S.footerWord}>The Garden · The Page Gallery</span>
        <span style={S.footerWord}>© {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
