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
    maxWidth: '580px',
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
  brandTable: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  tableHead: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.72rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: '#7a7067',
    textAlign: 'left' as const,
    padding: '0.75rem 1rem 0.75rem 0',
    borderBottom: '1px solid #e8e4df',
    fontWeight: 400,
  },
  tableRow: {
    borderBottom: '1px solid #e8e4df',
  },
  tableCell: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.9rem',
    color: '#1a1714',
    padding: '1.25rem 1rem 1.25rem 0',
    verticalAlign: 'top' as const,
    lineHeight: 1.5,
  },
  tableCellMuted: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.85rem',
    color: '#7a7067',
    padding: '1.25rem 1rem 1.25rem 0',
    verticalAlign: 'top' as const,
    lineHeight: 1.5,
    fontStyle: 'italic',
  },
  explainerSection: {
    backgroundColor: '#f2ede8',
    padding: '4rem 3rem',
  },
  explainerInner: {
    maxWidth: '860px',
    margin: '0 auto',
  },
  explainerLabel: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.72rem',
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: '#7a7067',
    marginBottom: '1.5rem',
  },
  explainerBody: {
    fontFamily: 'Georgia, serif',
    fontSize: '1rem',
    color: '#4a4540',
    lineHeight: 1.75,
    maxWidth: '600px',
  },
  linksSection: {
    padding: '4rem 3rem',
    maxWidth: '860px',
    margin: '0 auto',
  },
  linkRow: {
    display: 'flex',
    gap: '2rem',
    flexWrap: 'wrap' as const,
  },
  internalLink: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.9rem',
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

const BRAND_ROWS = [
  {
    name: 'The Page Gallery',
    type: 'Parent cultural company',
    audience: 'Public, partners, institutions',
    role: 'Umbrella brand, trust, prestige',
  },
  {
    name: 'The Garden',
    type: 'Platform product',
    audience: 'Writers, artists, journals, presses',
    role: 'Core software, marketplace, monetization',
  },
  {
    name: 'Page Gallery Editions',
    type: 'Publishing imprint',
    audience: 'Readers, authors, collectors',
    role: 'Books, chapbooks, printed works',
  },
  {
    name: 'Programs',
    type: 'Future layer',
    audience: 'Applicants, institutions, members',
    role: 'Residencies, prizes, labs, paid opportunities',
  },
];

export function BrandArchitecture() {
  return (
    <div style={S.page}>
      <Nav />

      {/* Hero */}
      <section style={S.hero}>
        <p style={S.eyebrow}>The Page Gallery</p>
        <h1 style={S.headline}>The Company</h1>
        <p style={S.subtitle}>
          How The Page Gallery is structured.
        </p>
      </section>

      <hr style={S.divider} />

      {/* Brand table */}
      <section style={S.brandsSection}>
        <p style={S.sectionLabel}>Brand architecture</p>
        <table style={S.brandTable}>
          <thead>
            <tr>
              <th style={S.tableHead}>Brand</th>
              <th style={S.tableHead}>Type</th>
              <th style={S.tableHead}>Audience</th>
              <th style={S.tableHead}>Role</th>
            </tr>
          </thead>
          <tbody>
            {BRAND_ROWS.map(row => (
              <tr key={row.name} style={S.tableRow}>
                <td style={S.tableCell}>{row.name}</td>
                <td style={S.tableCellMuted}>{row.type}</td>
                <td style={S.tableCellMuted}>{row.audience}</td>
                <td style={S.tableCellMuted}>{row.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <hr style={S.divider} />

      {/* Explainer */}
      <section style={S.explainerSection}>
        <div style={S.explainerInner}>
          <p style={S.explainerLabel}>World and product</p>
          <p style={S.explainerBody}>
            The Page Gallery is the world and the authority — the institutional
            name that confers trust, prestige, and permanence. The Garden is
            the product and the participation — the software platform through
            which writers, artists, journals, and presses engage, earn, and
            publish. They are distinct but inseparable: the authority of the
            name is what makes the platform worth joining.
          </p>
        </div>
      </section>

      {/* Links */}
      <section style={S.linksSection}>
        <p style={S.sectionLabel}>Explore</p>
        <div style={S.linkRow}>
          <Link to="/garden" style={S.internalLink}>The Garden →</Link>
          <Link to="/programs" style={S.internalLink}>Programs →</Link>
        </div>
      </section>

      <footer style={S.footer}>
        <span style={S.footerWord}>The Page Gallery</span>
        <span style={S.footerWord}>© {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
