/**
 * Editions — Page Gallery Editions
 *
 * Published when the work demands it. Not before.
 * Fully illustrated. Competitive to enter. Rare by design.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Nav } from './Nav';
import { pickHeadingFont } from '../lib/fontMapper';
import { supabase } from '../lib/supabase';

type EditionCategory = 'all' | 'physical' | 'digital' | 'special';

interface Variant {
  label: string;
  price_cents: number;
  sort_order: number;
}

interface Edition {
  id: string;
  title: string;
  author: string;
  author_location: string | null;
  illustrator: string | null;
  date_written_start: string | null;
  date_written_end: string | null;
  pages: number | null;
  print_run: number | null;
  current_stock: number | null;
  pre_order_price_cents: number | null;
  pre_order_filled: number | null;
  category: EditionCategory;
  description: string;
  status: 'available' | 'sold_out' | 'forthcoming' | 'pre_order';
  edition_variants: Variant[];
}

const MOCK_EDITIONS: Edition[] = [
  {
    id: '1',
    title: 'All the Ordinary Hours',
    author: 'Céline Marti',
    author_location: 'Marseille',
    illustrator: 'Rosa Schäfer',
    date_written_start: 'October 2024',
    date_written_end: 'February 2025',
    pages: 32,
    print_run: 100,
    current_stock: 37,
    pre_order_price_cents: null,
    pre_order_filled: null,
    category: 'physical',
    status: 'available',
    description:
      'Poems written across the autumn and winter of 2024, in the weeks following a bereavement and during the coverage of a large-scale humanitarian crisis. The context layer documents what the news cycle looked like from the room where the poems were written.',
    edition_variants: [
      { label: 'Chapbook', price_cents: 1600, sort_order: 0 },
      { label: 'Chapbook + Signed Giclée', price_cents: 5500, sort_order: 1 },
    ],
  },
  {
    id: '2',
    title: 'Mineral Light',
    author: 'James Ó Conaill',
    author_location: 'Galway',
    illustrator: null,
    date_written_start: 'January 2025',
    date_written_end: null,
    pages: 24,
    print_run: 100,
    current_stock: null,
    pre_order_price_cents: 1400,
    pre_order_filled: 63,
    category: 'physical',
    status: 'pre_order',
    description:
      'A pre-order edition of essays on light, geology, and the Irish west coast. Funds printing of the first 100 copies. Price rises as the print run fills.',
    edition_variants: [
      { label: 'Chapbook (pre-order)', price_cents: 1400, sort_order: 0 },
    ],
  },
  {
    id: '3',
    title: 'Archive: The First Year',
    author: 'Various Contributors',
    author_location: null,
    illustrator: null,
    date_written_start: null,
    date_written_end: null,
    pages: null,
    print_run: null,
    current_stock: null,
    pre_order_price_cents: null,
    pre_order_filled: null,
    category: 'digital',
    status: 'available',
    description:
      'A curated digital archive of the first year of publications — PDFs, source documents, and context layers for all pieces published in 2024.',
    edition_variants: [
      { label: 'Digital Archive', price_cents: 800, sort_order: 0 },
    ],
  },
  {
    id: '4',
    title: 'Founding Collector Portfolio',
    author: 'Page Gallery',
    author_location: null,
    illustrator: 'Rosa Schäfer',
    date_written_start: null,
    date_written_end: null,
    pages: null,
    print_run: 25,
    current_stock: 8,
    pre_order_price_cents: null,
    pre_order_filled: null,
    category: 'special',
    status: 'available',
    description:
      'A boxed set of the first three editions with original signed artwork, a hand-numbered certificate, and a letter from the founding editor. Only 25 produced.',
    edition_variants: [
      { label: 'Boxed Set', price_cents: 24000, sort_order: 0 },
    ],
  },
];

const S: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', backgroundColor: '#F5EDE4', fontFamily: 'Georgia, serif', color: '#1a1714' },
  hero: { padding: '5rem 3rem 4rem', borderBottom: '1px solid #e8e4df' },
  label: { fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#7a7067', marginBottom: '1rem' },
  h1: { fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 600, margin: '0 0 1.5rem', lineHeight: 1.1, maxWidth: '600px', fontFamily: pickHeadingFont('Editions-h1') },
  heroBody: { fontSize: '0.95rem', lineHeight: 1.75, color: '#3d3830', maxWidth: '520px', marginBottom: '1rem' },
  argument: {
    padding: '3rem',
    backgroundColor: '#EDE1D5',
    margin: '0',
    borderBottom: '1px solid #e8e4df',
  },
  argumentInner: { maxWidth: '700px' },
  argumentText: { fontSize: '1rem', lineHeight: 1.8, color: '#3d3830', fontStyle: 'italic' },
  filterBar: {
    display: 'flex',
    gap: '0',
    padding: '1.5rem 3rem',
    borderBottom: '1px solid #e8e4df',
    backgroundColor: '#F5EDE4',
  },
  filterBtn: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.78rem',
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    color: '#7a7067',
    backgroundColor: 'transparent',
    border: '1px solid #d8d4cf',
    borderRight: 'none',
    padding: '0.4rem 1rem',
    cursor: 'pointer',
    transition: 'all 0.12s',
  },
  filterBtnLast: {
    borderRight: '1px solid #d8d4cf',
  },
  filterBtnActive: {
    color: '#F5EDE4',
    backgroundColor: '#6B2A2A',
    borderColor: '#6B2A2A',
  },
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
    color: '#F5EDE4',
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
  linkPrimary: { fontSize: '0.82rem', letterSpacing: '0.05em', textTransform: 'uppercase' as const, color: '#F5EDE4', backgroundColor: '#1a1714', padding: '0.5rem 1.1rem', textDecoration: 'none' },
  linkSecondary: { fontSize: '0.82rem', color: '#7a7067', textDecoration: 'none', borderBottom: '1px solid #c5bdb4', paddingBottom: '1px' },
  editionSidebar: { textAlign: 'right' as const },
  priceMain: { fontSize: '1.2rem', fontWeight: 400, marginBottom: '0.25rem' },
  priceSub: { fontSize: '0.78rem', color: '#7a7067', marginBottom: '0.5rem' },
  printRunNote: { fontSize: '0.72rem', color: '#b0a89e', letterSpacing: '0.04em', textTransform: 'uppercase' as const },
  empty: { padding: '5rem 3rem', textAlign: 'center' as const },
  emptyTitle: { fontSize: '1.2rem', fontWeight: 400, marginBottom: '1rem' },
  emptyBody: { fontSize: '0.9rem', color: '#7a7067', lineHeight: 1.65, maxWidth: '420px', margin: '0 auto 2rem' },
  about: { padding: '4rem 3rem', backgroundColor: '#1a1714', color: '#F5EDE4' },
  aboutInner: { maxWidth: '640px' },
  aboutLabel: { fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#7a7067', marginBottom: '1.5rem' },
  aboutBody: { fontSize: '0.95rem', lineHeight: 1.8, color: '#e8e4df', marginBottom: '1.25rem' },
  tiers: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginTop: '2rem' },
  tier: { borderTop: '1px solid #3d3830', paddingTop: '1rem' },
  tierLabel: { fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#7a7067', marginBottom: '0.5rem' },
  tierPrice: { fontSize: '1.1rem', marginBottom: '0.4rem' },
  tierNote: { fontSize: '0.78rem', color: '#7a7067', lineHeight: 1.5 },
};

function statusLabel(status: Edition['status']) {
  if (status === 'available') return { text: 'Available', color: '#6b9e6b' };
  if (status === 'sold_out') return { text: 'Sold out', color: '#b0a89e' };
  if (status === 'pre_order') return { text: 'Pre-order open', color: '#8b7355' };
  return { text: 'Forthcoming', color: '#8b7355' };
}

function dynamicPrice(e: Edition): number {
  if (e.status !== 'pre_order' || !e.pre_order_price_cents || !e.pre_order_filled || !e.print_run) {
    return e.edition_variants?.[0]?.price_cents ?? 0;
  }
  const fillRatio = Math.min(e.pre_order_filled / e.print_run, 1);
  const base = e.pre_order_price_cents;
  const ceiling = Math.round(base * 1.4);
  return Math.round(base + (ceiling - base) * fillRatio);
}

const CATEGORY_LABELS: { id: EditionCategory; label: string }[] = [
  { id: 'all',      label: 'All'              },
  { id: 'physical', label: 'Physical'         },
  { id: 'digital',  label: 'Digital'          },
  { id: 'special',  label: 'Special Variants' },
];

export function Editions() {
  const [editions, setEditions] = useState<Edition[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<EditionCategory>('all');

  useEffect(() => {
    async function fetchEditions() {
      const { data, error } = await supabase
        .from('editions')
        .select('*, edition_variants(*)')
        .order('sort_order', { ascending: true });

      if (error || !data || data.length === 0) {
        setEditions(MOCK_EDITIONS);
      } else {
        setEditions(data as Edition[]);
      }
      setLoading(false);
    }
    fetchEditions();
  }, []);

  const displayEditions = loading
    ? []
    : editions.filter(e => activeCategory === 'all' || e.category === activeCategory);

  return (
    <div style={S.page}>
      <Nav />

      <div style={S.hero}>
        <p style={S.label}>Page Gallery — Editions</p>
        <h1 style={S.h1}>Editions</h1>
        <p style={S.heroBody}>
          Fully illustrated chapbooks, published when a piece of writing demands
          to exist as a physical object. There is no schedule. There is no list.
          There is only the rare, deliberate act of publishing something
          the institution cannot not publish.
        </p>
        <p style={S.heroBody}>
          To hold an edition is to hold a serious credential.
          The bar is the institution's only editorial statement.
        </p>
      </div>

      {/* The argument */}
      <div style={S.argument}>
        <div style={S.argumentInner}>
          <p style={S.argumentText}>
            "The proliferation of literary magazines has been, on balance, good for writers
            and bad for readers. Being in a journal no longer tells a reader very much.
            Being here does."
          </p>
        </div>
      </div>

      {/* Category filters */}
      <div style={S.filterBar}>
        {CATEGORY_LABELS.map(({ id, label }, idx) => (
          <button
            key={id}
            style={{
              ...S.filterBtn,
              ...(idx === CATEGORY_LABELS.length - 1 ? S.filterBtnLast : {}),
              ...(activeCategory === id ? S.filterBtnActive : {}),
            }}
            onClick={() => setActiveCategory(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Editions list */}
      {!loading && displayEditions.length > 0 ? (
        <div style={S.list}>
          {displayEditions.map(e => {
            const sortedVariants = [...(e.edition_variants ?? [])].sort((a, b) => a.sort_order - b.sort_order);
            const primaryVariant = sortedVariants[0];
            const { text: statusText, color: statusColor } = statusLabel(e.status);
            const displayPrice = dynamicPrice(e);
            const stockRemaining = e.current_stock;
            const isLowStock = stockRemaining !== null && stockRemaining <= 10;
            const isPreOrder = e.status === 'pre_order';
            const preOrderFilled = e.pre_order_filled ?? 0;
            const preOrderTotal = e.print_run ?? 100;
            const preOrderPct = Math.min((preOrderFilled / preOrderTotal) * 100, 100);

            return (
              <div key={e.id} style={S.editionCard}>
                {/* Spine */}
                <div style={{ ...S.spine, position: 'relative' }}>
                  <span style={S.spineText}>Edition — {e.author}</span>
                  {isLowStock && (
                    <span style={{
                      position: 'absolute',
                      top: '8px',
                      right: '-1px',
                      backgroundColor: '#6B2A2A',
                      color: '#F5EDE4',
                      fontSize: '0.58rem',
                      letterSpacing: '0.06em',
                      padding: '0.2rem 0.35rem',
                      textTransform: 'uppercase',
                    }}>
                      Low
                    </span>
                  )}
                </div>

                {/* Main */}
                <div style={S.editionMain}>
                  <h2 style={S.editionTitle}>{e.title}</h2>
                  <p style={S.editionAuthor}>
                    {e.author}{e.author_location ? ` — ${e.author_location}` : ''}
                  </p>
                  <p style={S.editionMeta}>
                    {e.date_written_start && e.date_written_end && (
                      <>Written {e.date_written_start}–{e.date_written_end}</>
                    )}
                    {e.illustrator && ` · Illustrated by ${e.illustrator}`}
                    {e.pages && ` · ${e.pages}pp`}
                    {e.print_run && ` · Ed. of ${e.print_run}`}
                  </p>
                  <p style={S.editionDescription}>{e.description}</p>

                  {/* Pre-order progress bar */}
                  {isPreOrder && (
                    <div style={{ marginBottom: '1.25rem' }}>
                      <p style={{
                        fontFamily: 'Georgia, serif',
                        fontSize: '0.72rem',
                        color: '#8b7355',
                        marginBottom: '0.4rem',
                        letterSpacing: '0.04em',
                      }}>
                        Pre-order now — funds printing · {preOrderFilled} of {preOrderTotal}
                      </p>
                      <div style={{
                        height: '2px',
                        backgroundColor: '#e8e4df',
                        borderRadius: '1px',
                        maxWidth: '320px',
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${preOrderPct}%`,
                          backgroundColor: '#6B2A2A',
                          borderRadius: '1px',
                          transition: 'width 0.4s',
                        }} />
                      </div>
                    </div>
                  )}

                  <div style={S.editionLinks}>
                    <Link to={`/editions/${e.id}`} style={S.linkPrimary}>Read more</Link>
                    {sortedVariants.map(v => (
                      <Link key={v.label} to={`/editions/${e.id}`} style={S.linkSecondary}>
                        {v.label} — £{(v.price_cents / 100).toFixed(0)}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Sidebar */}
                <div style={S.editionSidebar}>
                  {primaryVariant && (
                    <>
                      <p style={S.priceMain}>
                        £{(displayPrice / 100).toFixed(0)}
                        {isPreOrder && (
                          <span style={{ fontSize: '0.7rem', color: '#8b7355', marginLeft: '0.3rem' }}>
                            ↑ rising
                          </span>
                        )}
                      </p>
                      <p style={S.priceSub}>{isPreOrder ? 'Pre-order price' : primaryVariant.label}</p>
                    </>
                  )}
                  <p style={{ ...S.printRunNote, color: statusColor }}>{statusText}</p>
                  {stockRemaining !== null && (
                    <p style={{
                      ...S.printRunNote,
                      marginTop: '0.4rem',
                      color: isLowStock ? '#6B2A2A' : '#b0a89e',
                      fontWeight: isLowStock ? 600 : 400,
                    }}>
                      {isLowStock ? `Only ${stockRemaining} left` : `${stockRemaining} of ${e.print_run} remaining`}
                    </p>
                  )}
                  {e.print_run && stockRemaining === null && (
                    <p style={{ ...S.printRunNote, marginTop: '0.5rem' }}>Ed. of {e.print_run}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : !loading ? (
        <div style={S.empty}>
          <p style={S.emptyTitle}>The first edition is forthcoming.</p>
          <p style={S.emptyBody}>
            We publish when the work demands it.
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
      ) : null}

      {/* About / tiers */}
      <div style={S.about}>
        <div style={S.aboutInner}>
          <p style={S.aboutLabel}>How It Works</p>
          <p style={S.aboutBody}>
            Each edition is a fully illustrated chapbook produced with a commissioned
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
