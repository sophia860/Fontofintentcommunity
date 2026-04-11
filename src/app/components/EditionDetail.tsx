import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { Nav } from './Nav';
import { supabase } from '../lib/supabase';
import { pickHeadingFont } from '../lib/fontMapper';
import PayPalCheckout from './PayPalCheckout';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Variant {
  id: string;
  label: string;
  price_cents: number;
  currency: string;
  stock: number | null;
  sold_count: number;
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
  published: string | null;
  description: string;
  pages: number | null;
  print_run: number | null;
  isbn: string | null;
  cover_image_url: string | null;
  status: 'available' | 'sold_out' | 'forthcoming' | 'pre_order';
  edition_variants: Variant[];
}

// ─── Mock data (used when no Supabase data exists yet) ────────────────────────

const MOCK_EDITIONS: Record<string, Edition> = {
  '1': {
    id: '1',
    title: 'All the Ordinary Hours',
    author: 'Céline Marti',
    author_location: 'Marseille',
    illustrator: 'Rosa Schäfer',
    date_written_start: 'October 2024',
    date_written_end: 'February 2025',
    published: 'April 2026',
    description:
      'Poems written across the autumn and winter of 2024, in the weeks following a bereavement and during the coverage of a large-scale humanitarian crisis. The context layer documents what the news cycle looked like from the room where the poems were written.',
    pages: 32,
    print_run: 300,
    isbn: '978-0-000000-00-0',
    cover_image_url: null,
    status: 'available',
    edition_variants: [
      { id: 'v1', label: 'Chapbook', price_cents: 1600, currency: 'GBP', stock: 300, sold_count: 0, sort_order: 0 },
      { id: 'v2', label: 'Chapbook + Signed Giclée', price_cents: 5500, currency: 'GBP', stock: 50, sold_count: 0, sort_order: 1 },
    ],
  },
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const S: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', backgroundColor: '#F5EDE4', fontFamily: 'Georgia, serif', color: '#1a1714' },
  inner: { maxWidth: '780px', margin: '0 auto', padding: '4rem 2rem 6rem' },
  back: { fontSize: '0.78rem', letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: '#7a7067', textDecoration: 'none', display: 'inline-block', marginBottom: '3rem' },
  grid: { display: 'grid', gridTemplateColumns: '220px 1fr', gap: '3rem', alignItems: 'start' },
  spine: { width: '220px', backgroundColor: '#1a1714', aspectRatio: '2/3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  spineText: { color: '#F5EDE4', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, writingMode: 'vertical-rl' as const, textOrientation: 'mixed' as const, transform: 'rotate(180deg)' },
  right: {},
  label: { fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#7a7067', marginBottom: '0.75rem' },
  title: { fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 400, lineHeight: 1.1, marginBottom: '0.4rem', fontFamily: pickHeadingFont('EditionDetail-h1') },
  author: { fontSize: '0.9rem', color: '#7a7067', marginBottom: '1.5rem' },
  meta: { fontSize: '0.78rem', color: '#7a7067', lineHeight: 1.7, marginBottom: '1.5rem' },
  description: { fontSize: '0.95rem', lineHeight: 1.8, color: '#3d3830', marginBottom: '2rem' },
  divider: { border: 'none', borderTop: '1px solid #e8e4df', margin: '2rem 0' },
  shopHeading: { fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#7a7067', marginBottom: '1.25rem' },
  variantList: { listStyle: 'none', padding: 0, margin: '0 0 1.5rem', display: 'flex', flexDirection: 'column' as const, gap: '0.6rem' },
  variantBtn: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0.75rem 1rem', border: '1px solid #d8d0c8',
    backgroundColor: 'transparent', cursor: 'pointer', fontFamily: 'Georgia, serif',
    fontSize: '0.88rem', color: '#1a1714', transition: 'background 0.1s',
    width: '100%', textAlign: 'left' as const,
  },
  variantBtnSelected: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0.75rem 1rem', border: '1px solid #1a1714',
    backgroundColor: '#1a1714', cursor: 'pointer', fontFamily: 'Georgia, serif',
    fontSize: '0.88rem', color: '#F5EDE4', transition: 'background 0.1s',
    width: '100%', textAlign: 'left' as const,
  },
  stockBadge: { fontSize: '0.7rem', letterSpacing: '0.06em', color: '#8b7355', marginTop: '0.25rem', display: 'block' },
  successBox: {
    padding: '1.5rem', backgroundColor: '#eef5ee', border: '1px solid #c2d9c2',
    marginTop: '1rem',
  },
  successTitle: { fontSize: '0.9rem', fontWeight: 600, color: '#2d5a2d', marginBottom: '0.4rem' },
  successBody: { fontSize: '0.82rem', color: '#3d5a3d', lineHeight: 1.6 },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function EditionDetail() {
  const { id } = useParams<{ id: string }>();
  const [edition, setEdition] = useState<Edition | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [purchased, setPurchased] = useState<{ captureId: string | null; buyerEmail: string | null } | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchEdition() {
      setLoading(true);
      const { data, error } = await supabase
        .from('editions')
        .select('*, edition_variants(*)')
        .eq('id', id)
        .single();

      if (error || !data) {
        // Fall back to mock data for development
        setEdition(MOCK_EDITIONS[id!] ?? null);
      } else {
        setEdition(data as Edition);
      }
      setLoading(false);
    }

    fetchEdition();
  }, [id]);

  useEffect(() => {
    if (edition?.edition_variants?.length) {
      setSelectedVariantId(edition.edition_variants[0].id);
    }
  }, [edition]);

  if (loading) {
    return (
      <div style={S.page}>
        <Nav />
        <div style={S.inner}>
          <p style={{ color: '#7a7067', fontSize: '0.9rem' }}>Loading…</p>
        </div>
      </div>
    );
  }

  if (!edition) {
    return (
      <div style={S.page}>
        <Nav />
        <div style={S.inner}>
          <Link to="/editions" style={S.back}>← Editions</Link>
          <p style={{ color: '#7a7067' }}>Edition not found.</p>
        </div>
      </div>
    );
  }

  const selectedVariant = edition.edition_variants?.find(v => v.id === selectedVariantId) ?? null;
  const sortedVariants = [...(edition.edition_variants ?? [])].sort((a, b) => a.sort_order - b.sort_order);

  function stockLabel(v: Variant): string {
    if (edition!.status === 'sold_out') return 'Sold out';
    if (edition!.status === 'forthcoming') return 'Forthcoming';
    if (edition!.status === 'pre_order') return 'Pre-order';
    if (v.stock === null) return '';
    const remaining = v.stock - v.sold_count;
    if (remaining <= 0) return 'Sold out';
    if (remaining <= 10) return `Last ${remaining} available`;
    return `${remaining} of ${v.stock} remaining`;
  }

  const canBuy = edition.status === 'available' || edition.status === 'pre_order';

  return (
    <div style={S.page}>
      <Nav />
      <div style={S.inner}>
        <Link to="/editions" style={S.back}>← All Editions</Link>

        <div style={S.grid}>
          {/* Cover / spine placeholder */}
          <div>
            {edition.cover_image_url ? (
              <img
                src={edition.cover_image_url}
                alt={`Cover of ${edition.title}`}
                style={{ width: '100%', display: 'block', objectFit: 'cover' }}
              />
            ) : (
              <div style={S.spine}>
                <span style={S.spineText}>Edition — {edition.author}</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div style={S.right}>
            <p style={S.label}>Page Gallery — Edition</p>
            <h1 style={S.title}>{edition.title}</h1>
            <p style={S.author}>
              {edition.author}
              {edition.author_location ? ` — ${edition.author_location}` : ''}
            </p>

            <p style={S.meta}>
              {edition.date_written_start && edition.date_written_end && (
                <>Written {edition.date_written_start}–{edition.date_written_end}<br /></>
              )}
              {edition.illustrator && <>Illustrated by {edition.illustrator}<br /></>}
              {edition.pages && <>{edition.pages}pp · </>}
              {edition.print_run && <>Edition of {edition.print_run}<br /></>}
              {edition.isbn && <>ISBN {edition.isbn}</>}
            </p>

            <p style={S.description}>{edition.description}</p>

            <hr style={S.divider} />

            {/* Purchase */}
            {canBuy && sortedVariants.length > 0 && !purchased && (
              <>
                <p style={S.shopHeading}>
                  {edition.status === 'pre_order' ? 'Pre-order' : 'Order'}
                </p>
                <ul style={S.variantList}>
                  {sortedVariants.map(v => {
                    const label = stockLabel(v);
                    const isSoldOut = label === 'Sold out';
                    const isSelected = v.id === selectedVariantId;
                    return (
                      <li key={v.id}>
                        <button
                          style={isSelected ? S.variantBtnSelected : S.variantBtn}
                          onClick={() => !isSoldOut && setSelectedVariantId(v.id)}
                          disabled={isSoldOut}
                        >
                          <span>{v.label}</span>
                          <span>£{(v.price_cents / 100).toFixed(2)}</span>
                        </button>
                        {label && <span style={S.stockBadge}>{label}</span>}
                      </li>
                    );
                  })}
                </ul>

                {checkoutError && (
                  <p style={{ fontSize: '0.82rem', color: '#b0302a', marginBottom: '1rem' }}>
                    {checkoutError}
                  </p>
                )}

                {selectedVariant && (
                  <PayPalCheckout
                    variantId={selectedVariant.id}
                    priceCents={selectedVariant.price_cents}
                    title={`${edition.title} — ${selectedVariant.label}`}
                    onSuccess={(details) => {
                      setPurchased(details);
                      setCheckoutError(null);
                    }}
                    onError={(err) => setCheckoutError(err.message)}
                  />
                )}
              </>
            )}

            {/* Sold out / forthcoming notice */}
            {!canBuy && (
              <p style={{ fontSize: '0.85rem', color: '#7a7067', fontStyle: 'italic' }}>
                {edition.status === 'sold_out'
                  ? 'This edition is sold out.'
                  : 'This edition is forthcoming. Check back soon.'}
              </p>
            )}

            {/* Post-purchase */}
            {purchased && (
              <div style={S.successBox}>
                <p style={S.successTitle}>Order confirmed.</p>
                <p style={S.successBody}>
                  Thank you for your order of <em>{edition.title}</em>.
                  {purchased.buyerEmail && (
                    <> A confirmation will be sent to {purchased.buyerEmail}.</>
                  )}
                  {' '}We'll be in touch with shipping details shortly.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditionDetail;
