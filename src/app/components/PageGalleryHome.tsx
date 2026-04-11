import { Link } from 'react-router';
import { Nav } from './Nav';

const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#F9F6F2',
    fontFamily: 'Georgia, serif',
    color: '#1a1714',
  },
  hero: {
    padding: '7rem 3rem 5rem',
    maxWidth: '960px',
    margin: '0 auto',
    paddingLeft: '3rem',
    borderLeft: '4px solid #B71C1C',
  },
  heroEyebrow: {
    fontFamily: "system-ui, sans-serif",
    fontSize: '0.68rem',
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: '#7a7067',
    marginBottom: '1.5rem',
  },
  heroHeadline: {
    fontFamily: 'Georgia, serif',
    fontSize: 'clamp(3.5rem, 9vw, 8rem)',
    fontWeight: 700,
    lineHeight: 1.0,
    letterSpacing: '-0.02em',
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
    borderTop: '2px solid #1a1714',
    margin: '0',
  },
  brandsSection: {
    padding: '5rem 3rem',
    maxWidth: '960px',
    margin: '0 auto',
  },
  sectionLabel: {
    fontFamily: "system-ui, sans-serif",
    fontSize: '0.68rem',
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: '#7a7067',
    marginBottom: '3rem',
  },
  brandGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: '2px',
    backgroundColor: '#1a1714',
  },
  brandCard: {
    backgroundColor: '#F9F6F2',
    padding: '2.5rem',
  },
  brandCardLinked: {
    backgroundColor: '#F9F6F2',
    padding: '2.5rem',
    textDecoration: 'none',
    color: 'inherit',
    display: 'block',
    transition: 'background-color 0.12s',
  },
  brandName: {
    fontFamily: 'Georgia, serif',
    fontSize: '1.15rem',
    fontWeight: 600,
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
    fontFamily: "system-ui, sans-serif",
    fontSize: '0.72rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: '#B71C1C',
    marginTop: '1.5rem',
  },
  ctaSection: {
    backgroundColor: '#1a1714',
    padding: '4rem 3rem',
  },
  ctaInner: {
    maxWidth: '960px',
    margin: '0 auto',
    display: 'flex',
    gap: '2rem',
    flexWrap: 'wrap' as const,
    alignItems: 'center',
  },
  ctaLabel: {
    fontFamily: "system-ui, sans-serif",
    fontSize: '0.68rem',
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: '#7a7067',
    marginBottom: '1.5rem',
    width: '100%',
  },
  ctaLink: {
    fontFamily: 'Georgia, serif',
    fontSize: '1rem',
    color: '#F9F6F2',
    textDecoration: 'none',
    borderBottom: '1px solid #F9F6F2',
    paddingBottom: '1px',
    letterSpacing: '0.02em',
  },
  ctaSeparator: {
    color: '#3d3830',
    fontSize: '0.8rem',
  },
  footer: {
    padding: '3rem',
    borderTop: '2px solid #1a1714',
    maxWidth: '960px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    flexWrap: 'wrap' as const,
    gap: '1rem',
  },
  footerWord: {
    fontFamily: "system-ui, sans-serif",
    fontSize: '0.68rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: '#7a7067',
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
    name: 'Tilth',
    desc: 'The editorial property. Magazine, criticism, literary culture.',
    href: null,
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
          <Link to="/editions" style={S.ctaLink}>View Editions →</Link>
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
