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
  shopSection: {
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
  itemGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1.5px',
    backgroundColor: '#e8e4df',
  },
  itemCard: {
    backgroundColor: '#faf8f5',
    padding: '2.5rem 2rem',
  },
  itemType: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.7rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: '#7a7067',
    marginBottom: '0.75rem',
  },
  itemTitle: {
    fontFamily: 'Georgia, serif',
    fontSize: '1rem',
    fontWeight: 400,
    color: '#1a1714',
    marginBottom: '0.4rem',
    lineHeight: 1.3,
  },
  itemWriter: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.85rem',
    color: '#7a7067',
    marginBottom: '1.25rem',
    fontStyle: 'italic',
  },
  itemPrice: {
    fontFamily: 'Georgia, serif',
    fontSize: '1rem',
    color: '#1a1714',
    marginBottom: '1.5rem',
    letterSpacing: '-0.01em',
  },
  addToCart: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.8rem',
    letterSpacing: '0.04em',
    color: '#b0a89e',
    backgroundColor: 'transparent',
    border: '1px solid #e8e4df',
    padding: '0.5rem 1rem',
    cursor: 'not-allowed',
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

const MOCK_ITEMS = [
  {
    type: 'Digital collection',
    title: 'Seventeen Rooms',
    writer: 'Mara Kelloway',
    price: '$6.00',
  },
  {
    type: 'Chapbook',
    title: 'Estuary, Estuary',
    writer: 'Theo Crane',
    price: '$12.00',
  },
  {
    type: 'Essay collection',
    title: 'On Attention & Doubt',
    writer: 'Priya Sundaram',
    price: '$9.00',
  },
];

export function WriterShop() {
  return (
    <div style={S.page}>
      <Nav />

      {/* Hero */}
      <section style={S.hero}>
        <p style={S.eyebrow}>The Garden</p>
        <h1 style={S.headline}>Writer Shop</h1>
        <p style={S.subtitle}>
          Buy directly from writers in The Garden.
        </p>
      </section>

      <hr style={S.divider} />

      {/* Item grid */}
      <section style={S.shopSection}>
        <p style={S.sectionLabel}>Available now</p>
        <div style={S.itemGrid}>
          {MOCK_ITEMS.map(({ type, title, writer, price }) => (
            <div key={title} style={S.itemCard}>
              <p style={S.itemType}>{type}</p>
              <p style={S.itemTitle}>{title}</p>
              <p style={S.itemWriter}>{writer}</p>
              <p style={S.itemPrice}>{price}</p>
              <button style={S.addToCart} disabled>Add to cart</button>
            </div>
          ))}
        </div>
      </section>

      <hr style={S.divider} />

      {/* CTA */}
      <section style={S.ctaSection}>
        <div style={S.ctaInner}>
          <p style={S.ctaLabel}>Are you a writer?</p>
          <Link to="/auth" style={S.ctaLink}>Open your shop →</Link>
        </div>
      </section>

      <footer style={S.footer}>
        <span style={S.footerWord}>Writer Shop · The Garden</span>
        <span style={S.footerWord}>© {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
