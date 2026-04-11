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
    marginBottom: '2rem',
  },
  explainer: {
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
  artistsSection: {
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
  artistList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5px',
    backgroundColor: '#e8e4df',
  },
  artistRow: {
    backgroundColor: '#faf8f5',
    padding: '2rem 2.5rem',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr auto',
    gap: '2rem',
    alignItems: 'center',
  },
  artistName: {
    fontFamily: 'Georgia, serif',
    fontSize: '1rem',
    fontWeight: 400,
    color: '#1a1714',
  },
  artistSpecialism: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.875rem',
    color: '#7a7067',
    fontStyle: 'italic',
  },
  artistRate: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.875rem',
    color: '#4a4540',
  },
  commissionBtn: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.8rem',
    letterSpacing: '0.04em',
    color: '#b0a89e',
    backgroundColor: 'transparent',
    border: '1px solid #e8e4df',
    padding: '0.5rem 1rem',
    cursor: 'not-allowed',
    whiteSpace: 'nowrap' as const,
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
  ctaLink: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.95rem',
    color: '#1a1714',
    textDecoration: 'none',
    borderBottom: '1px solid #1a1714',
    paddingBottom: '1px',
    letterSpacing: '0.02em',
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

const MOCK_ARTISTS = [
  {
    name: 'Isla Vane',
    specialism: 'Cover design, typographic composition',
    rate: '$200–$600',
  },
  {
    name: 'Ruben Osei',
    specialism: 'Interior illustration, risograph',
    rate: '$150–$450',
  },
  {
    name: 'Daria Möller',
    specialism: 'Licensed artwork, editorial photography',
    rate: '$100–$800',
  },
];

export function ArtistCommission() {
  return (
    <div style={S.page}>
      <Nav />

      {/* Hero */}
      <section style={S.hero}>
        <p style={S.eyebrow}>The Garden</p>
        <h1 style={S.headline}>Commissions</h1>
        <p style={S.subtitle}>
          Hire artists in The Garden for cover design, illustration, and licensed work.
        </p>
        <p style={S.explainer}>
          Artists in The Garden accept commissions for cover design, interior
          illustration, and licensed artwork for journals and individual
          publications.
        </p>
      </section>

      <hr style={S.divider} />

      {/* Artist list */}
      <section style={S.artistsSection}>
        <p style={S.sectionLabel}>Artists accepting commissions</p>
        <div style={S.artistList}>
          {MOCK_ARTISTS.map(({ name, specialism, rate }) => (
            <div key={name} style={S.artistRow}>
              <span style={S.artistName}>{name}</span>
              <span style={S.artistSpecialism}>{specialism}</span>
              <span style={S.artistRate}>{rate}</span>
              <button style={S.commissionBtn} disabled>
                Request a commission
              </button>
            </div>
          ))}
        </div>
      </section>

      <hr style={S.divider} />

      {/* CTA */}
      <section style={S.ctaSection}>
        <div style={S.ctaInner}>
          <p style={S.ctaLabel}>Are you an artist?</p>
          <Link to="/auth" style={S.ctaLink}>Join The Garden →</Link>
        </div>
      </section>

      <footer style={S.footer}>
        <span style={S.footerWord}>Commissions · The Garden</span>
        <span style={S.footerWord}>© {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
