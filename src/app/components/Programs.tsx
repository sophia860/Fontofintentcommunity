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
    lineHeight: 1.5,
    maxWidth: '600px',
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #e8e4df',
    margin: '0',
  },
  programsSection: {
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
  programGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: '1.5px',
    backgroundColor: '#e8e4df',
  },
  programCard: {
    backgroundColor: '#faf8f5',
    padding: '2.5rem',
  },
  programTag: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.7rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: '#7a7067',
    marginBottom: '1rem',
  },
  programName: {
    fontFamily: 'Georgia, serif',
    fontSize: '1.1rem',
    fontWeight: 400,
    color: '#1a1714',
    marginBottom: '0.75rem',
  },
  programDesc: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.875rem',
    color: '#4a4540',
    lineHeight: 1.6,
    fontStyle: 'italic',
    marginBottom: '1.25rem',
  },
  programLink: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.8rem',
    color: '#1a1714',
    textDecoration: 'none',
    borderBottom: '1px solid #1a1714',
    paddingBottom: '1px',
    letterSpacing: '0.02em',
  },
  programPlaceholder: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.8rem',
    color: '#b0a89e',
    letterSpacing: '0.04em',
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
    marginBottom: '1.5rem',
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

const PROGRAMS = [
  {
    tag: 'Annual',
    name: 'The Garden Residency',
    desc: 'Journals selected for editorial mentorship, design support, and printing partnerships. Annual cycle.',
    href: '/residency',
    linkLabel: 'Learn more →',
  },
  {
    tag: 'Spring applications',
    name: 'Manuscript Lab',
    desc: 'Intensive editorial development for poetry collections. Applications open in spring.',
    href: null,
    linkLabel: null,
  },
  {
    tag: 'Ongoing',
    name: 'Workshops',
    desc: 'Writer workshops led by Garden members and editors.',
    href: null,
    linkLabel: null,
  },
  {
    tag: 'Annual',
    name: 'Prizes',
    desc: 'Annual prizes for work published in Garden journals.',
    href: null,
    linkLabel: null,
  },
];

export function Programs() {
  return (
    <div style={S.page}>
      <Nav />

      {/* Hero */}
      <section style={S.hero}>
        <p style={S.eyebrow}>The Page Gallery</p>
        <h1 style={S.headline}>Programs</h1>
        <p style={S.subtitle}>
          The Page Gallery creates structured opportunity for writers, journals,
          and cultural institutions.
        </p>
      </section>

      <hr style={S.divider} />

      {/* Programs */}
      <section style={S.programsSection}>
        <p style={S.sectionLabel}>Current programs</p>
        <div style={S.programGrid}>
          {PROGRAMS.map(({ tag, name, desc, href, linkLabel }) => (
            <div key={name} style={S.programCard}>
              <p style={S.programTag}>{tag}</p>
              <p style={S.programName}>{name}</p>
              <p style={S.programDesc}>{desc}</p>
              {href && linkLabel ? (
                <Link to={href} style={S.programLink}>{linkLabel}</Link>
              ) : (
                <span style={S.programPlaceholder}>Coming soon</span>
              )}
            </div>
          ))}
        </div>
      </section>

      <hr style={S.divider} />

      {/* CTA */}
      <section style={S.ctaSection}>
        <div style={S.ctaInner}>
          <p style={S.ctaLabel}>Apply</p>
          <div style={S.ctaLinks}>
            <Link to="/apply" style={S.ctaLink}>Apply to the Residency →</Link>
            <span style={S.ctaSeparator}>·</span>
            <Link to="/apply" style={S.ctaLink}>Join the waitlist →</Link>
          </div>
        </div>
      </section>

      <footer style={S.footer}>
        <span style={S.footerWord}>Programs · The Page Gallery</span>
        <span style={S.footerWord}>© {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
