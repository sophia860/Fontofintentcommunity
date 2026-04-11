/**
 * Editions — Page Gallery Editions
 *
 * Tilth: the mark of excellence.
 * Published when the work demands it. Not before.
 * Fully illustrated. Competitive to enter. Rare by design.
 */
import { Link } from 'react-router';
import { Nav } from './Nav';

const MOCK_EDITIONS = [
  {
    id: '1',
    title: 'All the Ordinary Hours',
    author: 'Céline Marti',
    authorLocation: 'Marseille',
    illustrator: 'Rosa Schäfer',
    dateWrittenStart: 'October 2024',
    dateWrittenEnd: 'February 2025',
    published: 'April 2026',
    status: 'available',
    description:
      'Poems written across the autumn and winter of 2024, in the weeks following a bereavement and during the coverage of a large-scale humanitarian crisis. The context layer documents what the news cycle looked like from the room where the poems were written.',
    pages: 32,
    printRun: 300,
    priceChapbook: 16,
    priceGiclee: 55,
    isbn: '978-0-000000-00-0',
  },
];

const S: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', backgroundColor: '#faf8f5', fontFamily: 'Georgia, serif', color: '#1a1714' },
  hero: { padding: '5rem 3rem 4rem', borderBottom: '1px solid #e8e4df' },
  label: { fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#7a7067', marginBottom: '1rem' },
  h1: { fontSize: '2.5rem', fontWeight: 400, margin: '0 0 1.5rem', lineHeight: 1.15, maxWidth: '600px' },
  heroBody: { fontSize: '0.95rem', lineHeight: 1.75, color: '#3d3830', maxWidth: '520px', marginBottom: '1rem' },
  argument: {
    padding: '3rem',
    backgroundColor: '#f2ede8',
    margin: '0',
    borderBottom: '1px solid #e8e4df',
  },
  argumentInner: { maxWidth: '700px' },
  argumentText: { fontSize: '1rem', lineHeight: 1.8, color: '#3d3830', fontStyle: 'italic' },
  list: { padding: '0 3rem' },
  editionCard: {
    display: 'grid',
    gridTemplateColumns: '120px 1fr auto',
    gap: '2.5rem',
    padding: '3rem 0',
    borderBottom: '1px solid #e8e4df',
    alignItems: 'start',
  },
  spine: {
    width: '120px',
    height: '180px',
    backgroundColor: '#1a1714',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  spineText: {
    color: '#faf8f5',
    fontSize: '0.65rem',
    letterSpacing: '0.15em',
    textTransform: 'uppercase' as const,
    writingMode: 'vertical-rl' as const,
    textOrientation: 'mixed' as const,
    transform: 'rotate(180deg)',
  },
  editionMain: {},
  editionTitle: { fontSize: '1.4rem', fontWeight: 400, marginBottom: '0.25rem', lineHeight: 1.2 },
  editionAuthor: { fontSize: '0.85rem', color: '#7a7067', marginBottom: '1rem' },
  editionMeta: { fontSize: '0.78rem', color: '#7a7067', marginBottom: '1.25rem', lineHeight: 1.6 },
  editionDescription: { fontSize: '0.9rem', lineHeight: 1.7, color: '#3d3830', maxWidth: '520px', marginBottom: '1.5rem' },
  editionLinks: { display: 'flex', gap: '1.5rem', alignItems: 'baseline' },
  linkPrimary: { fontSize: '0.82rem', letterSpacing: '0.05em', textTransform: 'uppercase' as const, color: '#faf8f5', backgroundColor: '#1a1714', padding: '0.5rem 1.1rem', textDecoration: 'none' },
  linkSecondary: { fontSize: '0.82rem', color: '#7a7067', textDecoration: 'none', borderBottom: '1px solid #c5bdb4', paddingBottom: '1px' },
  editionSidebar: { textAlign: 'right' as const },
  priceMain: { fontSize: '1.2rem', fontWeight: 400, marginBottom: '0.25rem' },
  priceSub: { fontSize: '0.78rem', color: '#7a7067', marginBottom: '0.5rem' },
  printRunNote: { fontSize: '0.72rem', color: '#b0a89e', letterSpacing: '0.04em', textTransform: 'uppercase' as const },
  empty: { padding: '5rem 3rem', textAlign: 'center' as const },
  emptyTitle: { fontSize: '1.2rem', fontWeight: 400, marginBottom: '1rem' },
  emptyBody: { fontSize: '0.9rem', color: '#7a7067', lineHeight: 1.65, maxWidth: '420px', margin: '0 auto 2rem' },
  about: { padding: '4rem 3rem', backgroundColor: '#1a1714', color: '#faf8f5' },
  aboutInner: { maxWidth: '640px' },
  aboutLabel: { fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#7a7067', marginBottom: '1.5rem' },
  aboutBody: { fontSize: '0.95rem', lineHeight: 1.8, color: '#e8e4df', marginBottom: '1.25rem' },
  tiers: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginTop: '2rem' },
  tier: { borderTop: '1px solid #3d3830', paddingTop: '1rem' },
  tierLabel: { fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#7a7067', marginBottom: '0.5rem' },
  tierPrice: { fontSize: '1.1rem', marginBottom: '0.4rem' },
  tierNote: { fontSize: '0.78rem', color: '#7a7067', lineHeight: 1.5 },
};

export function Editions() {
  return (
    <div style={S.page}>
      <Nav />

      <div style={S.hero}>
        <p style={S.label}>Page Gallery — Tilth</p>
        <h1 style={S.h1}>Tilth</h1>
        <p style={S.heroBody}>
          Fully illustrated chapbooks, published when a piece of writing demands
          to exist as a physical object. There is no schedule. There is no list.
          There is only the rare, deliberate act of publishing something
          the institution cannot not publish.
        </p>
        <p style={S.heroBody}>
          To hold a Tilth edition is to hold a serious credential.
          The bar is the institution's only editorial statement.
        </p>
      </div>

      {/* The argument */}
      <div style={S.argument}>
        <div style={S.argumentInner}>
          <p style={S.argumentText}>
            “The proliferation of literary magazines has been, on balance, good for writers
            and bad for readers. Being in a journal no longer tells a reader very much.
            Being in Tilth does.”
          </p>
        </div>
      </div>

      {/* Editions list */}
      {MOCK_EDITIONS.length > 0 ? (
        <div style={S.list}>
          {MOCK_EDITIONS.map(e => (
            <div key={e.id} style={S.editionCard}>
              {/* Spine */}
              <div style={S.spine}>
                <span style={S.spineText}>Tilth — {e.author}</span>
              </div>

              {/* Main */}
              <div style={S.editionMain}>
                <h2 style={S.editionTitle}>{e.title}</h2>
                <p style={S.editionAuthor}>{e.author}{e.authorLocation ? ` — ${e.authorLocation}` : ''}</p>
                <p style={S.editionMeta}>
                  Written {e.dateWrittenStart}–{e.dateWrittenEnd}
                  {e.illustrator && ` · Illustrated by ${e.illustrator}`}
                  {` · ${e.pages}pp · Ed. of ${e.printRun}`}
                </p>
                <p style={S.editionDescription}>{e.description}</p>
                <div style={S.editionLinks}>
                  <Link to={`/editions/${e.id}`} style={S.linkPrimary}>Read more</Link>
                  <a href="#" style={S.linkSecondary}>Order chapbook — £{e.priceChapbook}</a>
                  {e.priceGiclee && <a href="#" style={S.linkSecondary}>Giclée print — £{e.priceGiclee}</a>}
                </div>
              </div>

              {/* Sidebar */}
              <div style={S.editionSidebar}>
                <p style={S.priceMain}>£{e.priceChapbook}</p>
                <p style={S.priceSub}>Chapbook</p>
                {e.status === 'available' && (
                  <p style={{ ...S.printRunNote, color: '#6b9e6b' }}>Available</p>
                )}
                {e.status === 'sold_out' && (
                  <p style={S.printRunNote}>Sold out</p>
                )}
                {e.status === 'forthcoming' && (
                  <p style={{ ...S.printRunNote, color: '#8b7355' }}>Forthcoming</p>
                )}
                <p style={{ ...S.printRunNote, marginTop: '0.5rem' }}>Ed. of {e.printRun}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={S.empty}>
          <p style={S.emptyTitle}>The first Tilth edition is forthcoming.</p>
          <p style={S.emptyBody}>
            Tilth publishes when the work demands it.
            The first edition will be announced when it is ready.
          </p>
          <Link to="/apply" style={{
            fontSize: '0.85rem',
            color: '#1a1714',
            borderBottom: '1px solid #1a1714',
            textDecoration: 'none',
            paddingBottom: '2px',
          }}>Submit work</Link>
        </div>
      )}

      {/* About Tilth / tiers */}
      <div style={S.about}>
        <div style={S.aboutInner}>
          <p style={S.aboutLabel}>How Tilth Works</p>
          <p style={S.aboutBody}>
            Each Tilth edition is a fully illustrated chapbook produced with a commissioned
            illustrator who responds to the writing and the documented context of its making.
            The illustration is not decoration. It is a response to a specific human moment
            — the weather of thought in which a piece was written.
          </p>
          <p style={S.aboutBody}>
            The original artwork is sold separately at three tiers.
            Across the series, the originals accumulate into an exhibition-ready archive
            of how writing actually happens: slowly, in private, under conditions no poem ever admits to.
          </p>
          <div style={S.tiers}>
            {[
              { label: 'Tier 1', price: '£12–18', note: 'Chapbook alone' },
              { label: 'Tier 2', price: '£45–65', note: 'Chapbook + signed giclée print' },
              { label: 'Tier 3', price: 'Per piece', note: 'Chapbook + original artwork (gallery commission 30–40%)' },
            ].map(t => (
              <div key={t.label} style={S.tier}>
                <p style={S.tierLabel}>{t.label}</p>
                <p style={S.tierPrice}>{t.price}</p>
                <p style={S.tierNote}>{t.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
