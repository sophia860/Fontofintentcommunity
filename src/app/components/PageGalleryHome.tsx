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
  heroEyebrow: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.75rem',
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: '#7a7067',
    marginBottom: '1.5rem',
  },
  heroHeadline: {
    fontFamily: 'Georgia, serif',
    fontSize: 'clamp(2.4rem, 5vw, 4rem)',
    fontWeight: 400,
    lineHeight: 1.1,
    letterSpacing: '-0.01em',
    color: '#1a1714',
    marginBottom: '1.5rem',
  },
  heroSubtitle: {
    fontFamily: 'Georgia, serif',
    fontSize: '1.15rem',
    fontStyle: 'italic',
    color: '#7a7067',
    marginBottom: '2rem',
    lineHeight: 1.5,
  },
  heroBody: {
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
  brandsSection: {
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
  brandGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: '1.5px',
    backgroundColor: '#e8e4df',
  },
  brandCard: {
    backgroundColor: '#faf8f5',
    padding: '2.5rem',
  },
  brandCardLinked: {
    backgroundColor: '#faf8f5',
    padding: '2.5rem',
    textDecoration: 'none',
    color: 'inherit',
    display: 'block',
    transition: 'background-color 0.15s',
  },
  brandName: {
    fontFamily: 'Georgia, serif',
    fontSize: '1.1rem',
    fontWeight: 400,
    color: '#1a1714',
    marginBottom: '0.6rem',
    letterSpacing: '0.01em',
  },
  brandDesc: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.9rem',
    color: '#7a7067',
    lineHeight: 1.5,
    fontStyle: 'italic',
  },
  brandArrow: {
    display: 'block',
    fontFamily: 'Georgia, serif',
    fontSize: '0.8rem',
    color: '#1a1714',
    marginTop: '1.2rem',
    letterSpacing: '0.04em',
  },
  ctaSection: {
    backgroundColor: '#f2ede8',
    padding: '4rem 3rem',
  },
  ctaInner: {
    maxWidth: '860px',
    margin: '0 auto',
    display: 'flex',
    gap: '2rem',
    flexWrap: 'wrap' as const,
    alignItems: 'center',
  },
  ctaLabel: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.72rem',
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: '#7a7067',
    marginBottom: '1.5rem',
    width: '100%',
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

const BRAND_BLOCKS = [
  {
    name: 'The Garden',
    desc: 'The platform. Create, publish, collaborate, earn.',
    href: '/garden',
  },
  {
    name: 'Page Gallery Editions',
    desc: 'The publishing imprint. Chapbooks, poetry, printed works.',
    href: '/editions',
  },
  {
    name: 'Programs',
    desc: 'Residencies, workshops, labs, prizes.',
    href: '/programs',
  },
];

export function PageGalleryHome() {
  return (
    <div style={S.page}>
      <Nav />

      {/* Hero */}
      <section style={S.hero}>
        <p style={S.heroEyebrow}>The Page Gallery</p>
        <h1 style={S.heroHeadline}>A cultural company.</h1>
        <p style={S.heroSubtitle}>
          A publishing house. A platform owner.
        </p>
        <p style={S.heroBody}>
          We publish. We build infrastructure. We create opportunity.
          We connect writers, artists, journals, and production.
        </p>
      </section>

      <hr style={S.divider} />

      {/* Four brand blocks */}
      <section style={S.brandsSection}>
        <p style={S.sectionLabel}>The Company</p>
        <div style={S.brandGrid}>
          {BRAND_BLOCKS.map(({ name, desc, href }) =>
            href ? (
              <Link key={name} to={href} style={S.brandCardLinked}>
                <p style={S.brandName}>{name}</p>
                <p style={S.brandDesc}>{desc}</p>
                <span style={S.brandArrow}>Explore →</span>
              </Link>
            ) : (
              <div key={name} style={S.brandCard}>
                <p style={S.brandName}>{name}</p>
                <p style={S.brandDesc}>{desc}</p>
              </div>
            )
          )}
        </div>
      </section>

      <hr style={S.divider} />

      {/* CTA row */}
      <section style={S.ctaSection}>
        <div style={S.ctaInner}>
          <p style={S.ctaLabel}>Where to begin</p>
          <Link to="/garden" style={S.ctaLink}>Enter The Garden →</Link>
          <span style={S.ctaSeparator}>·</span>
          <Link to="/apply" style={S.ctaLink}>Apply to Programs →</Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={S.footer}>
        <span style={S.footerWord}>The Page Gallery</span>
        <span style={S.footerWord}>© {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
