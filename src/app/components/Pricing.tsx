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
  plansSection: {
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
  planGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1.5px',
    backgroundColor: '#e8e4df',
  },
  planCard: {
    backgroundColor: '#faf8f5',
    padding: '2.5rem 2rem',
  },
  planCardFeatured: {
    backgroundColor: '#f2ede8',
    padding: '2.5rem 2rem',
  },
  planName: {
    fontFamily: 'Georgia, serif',
    fontSize: '1rem',
    fontWeight: 400,
    color: '#1a1714',
    marginBottom: '0.5rem',
  },
  planPrice: {
    fontFamily: 'Georgia, serif',
    fontSize: '1.6rem',
    color: '#1a1714',
    marginBottom: '0.3rem',
    letterSpacing: '-0.02em',
  },
  planPriceNote: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.8rem',
    color: '#7a7067',
    marginBottom: '1.5rem',
    fontStyle: 'italic',
  },
  planFeatures: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  planFeature: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.85rem',
    color: '#4a4540',
    lineHeight: 1.6,
    paddingLeft: '1rem',
    position: 'relative' as const,
  },
  txSection: {
    backgroundColor: '#f2ede8',
    padding: '3rem',
  },
  txInner: {
    maxWidth: '860px',
    margin: '0 auto',
  },
  txLabel: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.72rem',
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: '#7a7067',
    marginBottom: '1rem',
  },
  txBody: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.95rem',
    color: '#4a4540',
    lineHeight: 1.7,
    maxWidth: '560px',
  },
  ctaSection: {
    padding: '4rem 3rem',
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

const PLANS = [
  {
    name: 'Writer Pro',
    price: '$12',
    priceNote: 'per month',
    featured: false,
    features: [
      'Writing workspace',
      'Portfolio & public profile',
      'Garden directory listing',
    ],
  },
  {
    name: 'Artist Pro',
    price: '$15',
    priceNote: 'per month',
    featured: false,
    features: [
      'Commission pages',
      'Licensed artwork sales',
      'Portfolio',
    ],
  },
  {
    name: 'Journal OS',
    price: '$49',
    priceNote: 'per month, billed annually',
    featured: true,
    features: [
      'Issue builder',
      'Submission tracking',
      'Editorial workflow',
      'Garden partner badge',
    ],
  },
  {
    name: 'Institution / Concierge',
    price: 'Contact us',
    priceNote: 'custom pricing',
    featured: false,
    features: [
      'White-label setup',
      'Migration support',
      'Editorial consulting',
      'Custom configuration',
    ],
  },
];

export function Pricing() {
  return (
    <div style={S.page}>
      <Nav />

      {/* Hero */}
      <section style={S.hero}>
        <p style={S.eyebrow}>The Garden</p>
        <h1 style={S.headline}>Pricing</h1>
        <p style={S.subtitle}>
          Simple, layered pricing for writers, artists, journals, and institutions.
        </p>
      </section>

      <hr style={S.divider} />

      {/* Plans */}
      <section style={S.plansSection}>
        <p style={S.sectionLabel}>Plans</p>
        <div style={S.planGrid}>
          {PLANS.map(({ name, price, priceNote, featured, features }) => (
            <div key={name} style={featured ? S.planCardFeatured : S.planCard}>
              <p style={S.planName}>{name}</p>
              <p style={S.planPrice}>{price}</p>
              <p style={S.planPriceNote}>{priceNote}</p>
              <ul style={S.planFeatures}>
                {features.map(f => (
                  <li key={f} style={S.planFeature}>— {f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <hr style={S.divider} />

      {/* Transaction fee */}
      <section style={S.txSection}>
        <div style={S.txInner}>
          <p style={S.txLabel}>Marketplace commission</p>
          <p style={S.txBody}>
            The Garden takes a 10% commission on marketplace transactions —
            artist commissions, poem sales, digital collections, cover design work.
          </p>
        </div>
      </section>

      {/* Footer CTA */}
      <section style={S.ctaSection}>
        <p style={S.ctaLabel}>Not sure which plan?</p>
        <Link to="/apply" style={S.ctaLink}>Contact us →</Link>
      </section>

      <footer style={S.footer}>
        <span style={S.footerWord}>The Garden · The Page Gallery</span>
        <span style={S.footerWord}>© {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
