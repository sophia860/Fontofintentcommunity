/**
 * CollectorCircle — membership tiers for The Page Gallery
 * Three tiers: Garden Member / Collector Circle / Founding Editor
 */
import { Link } from 'react-router';
import { Nav } from './Nav';

interface Tier {
  id: string;
  name: string;
  price: string;
  priceNote: string;
  annualNote?: string;
  featured: boolean;
  perks: string[];
}

const TIERS: Tier[] = [
  {
    id: 'garden',
    name: 'Garden Member',
    price: '£10',
    priceNote: 'per month',
    annualNote: 'or £120/year',
    featured: false,
    perks: [
      'Access to The Garden writing workspace',
      'Public writer profile & portfolio',
      'Directory listing',
      'Early access to open calls',
      'Monthly editorial letter',
    ],
  },
  {
    id: 'circle',
    name: 'Collector Circle',
    price: '£25',
    priceNote: 'per month',
    featured: true,
    perks: [
      'Everything in Garden Member',
      '20% discount on all Editions',
      'Pre-order access before general release',
      'Annual signed giclée print',
      'Invitation to Collector Circle previews',
      'Name in colophon of each edition',
    ],
  },
  {
    id: 'founding',
    name: 'Founding Editor',
    price: '£60',
    priceNote: 'per month',
    featured: false,
    perks: [
      'Everything in Collector Circle',
      'One complimentary edition per quarter',
      'Input into open call themes',
      'Annual studio visit / live reading invitation',
      'Original artwork consideration rights',
      'Founding Editor credit in all publications',
    ],
  },
];

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
    fontSize: '1.1rem',
    fontStyle: 'italic',
    color: '#7a7067',
    lineHeight: 1.6,
    maxWidth: '560px',
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #e8e4df',
    margin: '0',
  },
  tiersSection: {
    padding: '5rem 3rem',
    maxWidth: '1080px',
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
  tierGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '1.5px',
    backgroundColor: '#e8e4df',
  },
  tierCard: {
    backgroundColor: '#faf8f5',
    padding: '2.5rem 2rem',
    position: 'relative' as const,
  },
  tierCardFeatured: {
    backgroundColor: '#F2EAE2',
    padding: '2.5rem 2rem',
    position: 'relative' as const,
    boxShadow: '0 4px 24px rgba(107,42,42,0.08)',
  },
  badge: {
    position: 'absolute' as const,
    top: '1.25rem',
    right: '1.25rem',
    backgroundColor: '#6B2A2A',
    color: '#F5EDE4',
    fontFamily: 'Georgia, serif',
    fontSize: '0.62rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    padding: '0.2rem 0.55rem',
    borderRadius: '1px',
  },
  tierName: {
    fontFamily: 'Georgia, serif',
    fontSize: '1.05rem',
    fontWeight: 400,
    color: '#1a1714',
    marginBottom: '0.6rem',
  },
  tierPrice: {
    fontFamily: 'Georgia, serif',
    fontSize: '2rem',
    fontWeight: 400,
    color: '#1a1714',
    letterSpacing: '-0.02em',
    marginBottom: '0.15rem',
  },
  tierPriceNote: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.8rem',
    color: '#7a7067',
    fontStyle: 'italic',
    marginBottom: '0.2rem',
  },
  tierAnnualNote: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.75rem',
    color: '#b0a89e',
    marginBottom: '1.75rem',
    fontStyle: 'italic',
  },
  perkList: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 2rem',
  },
  perkItem: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.88rem',
    color: '#4a4540',
    lineHeight: 1.65,
    paddingBottom: '0.45rem',
    borderBottom: '1px solid #ede9e3',
    marginBottom: '0.45rem',
    paddingLeft: '1.1rem',
    position: 'relative' as const,
  },
  ctaBtn: {
    display: 'block',
    fontFamily: 'Georgia, serif',
    fontSize: '0.85rem',
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
    color: '#F5EDE4',
    backgroundColor: '#6B2A2A',
    padding: '0.65rem 1.4rem',
    textDecoration: 'none',
    textAlign: 'center' as const,
    transition: 'opacity 0.15s',
  },
  ctaBtnSecondary: {
    display: 'block',
    fontFamily: 'Georgia, serif',
    fontSize: '0.85rem',
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
    color: '#1a1714',
    backgroundColor: 'transparent',
    border: '1px solid #c8c0b8',
    padding: '0.65rem 1.4rem',
    textDecoration: 'none',
    textAlign: 'center' as const,
  },
  noteSection: {
    backgroundColor: '#F2EBE1',
    padding: '3.5rem 3rem',
    borderTop: '1px solid #e8e4df',
  },
  noteInner: {
    maxWidth: '640px',
    margin: '0 auto',
  },
  noteLabel: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.72rem',
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: '#7a7067',
    marginBottom: '1rem',
  },
  noteBody: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.95rem',
    color: '#4a4540',
    lineHeight: 1.75,
    fontStyle: 'italic',
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

export function CollectorCircle() {
  return (
    <div style={S.page}>
      <Nav />

      <section style={S.hero}>
        <p style={S.eyebrow}>The Page Gallery</p>
        <h1 style={S.headline}>Collector Circle</h1>
        <p style={S.subtitle}>
          Support independent literary publishing. Hold the work before it sells out.
          Join the circle of collectors who make this possible.
        </p>
      </section>

      <hr style={S.divider} />

      <section style={S.tiersSection}>
        <p style={S.sectionLabel}>Membership tiers</p>
        <div style={S.tierGrid}>
          {TIERS.map(tier => (
            <div key={tier.id} style={tier.featured ? S.tierCardFeatured : S.tierCard}>
              {tier.featured && <span style={S.badge}>Most Popular</span>}
              <p style={S.tierName}>{tier.name}</p>
              <p style={S.tierPrice}>{tier.price}</p>
              <p style={S.tierPriceNote}>{tier.priceNote}</p>
              {tier.annualNote && <p style={S.tierAnnualNote}>{tier.annualNote}</p>}
              {!tier.annualNote && <div style={{ marginBottom: '1.75rem' }} />}
              <ul style={S.perkList}>
                {tier.perks.map(perk => (
                  <li key={perk} style={S.perkItem}>
                    <span style={{ position: 'absolute', left: 0, color: '#6B2A2A' }}>—</span>
                    {perk}
                  </li>
                ))}
              </ul>
              <Link
                to="/auth"
                style={tier.featured ? S.ctaBtn : S.ctaBtnSecondary}
              >
                {tier.featured ? 'Join the Circle' : 'Get started'}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <hr style={S.divider} />

      <section style={S.noteSection}>
        <div style={S.noteInner}>
          <p style={S.noteLabel}>A note on membership</p>
          <p style={S.noteBody}>
            The Page Gallery exists because people chose to support it.
            Every membership funds the next edition — the illustrator's fee,
            the typesetting, the printing of something the world didn't ask for
            and didn't know it needed. Cancellation is always available, with no fuss.
            We are grateful either way.
          </p>
        </div>
      </section>

      <footer style={S.footer}>
        <span style={S.footerWord}>The Page Gallery</span>
        <span style={S.footerWord}>© {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
