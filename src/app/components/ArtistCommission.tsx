/**
 * ArtistCommission — The Garden Commissions page.
 * Lists artists from Supabase and lets authenticated writers propose a collaboration.
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import * as Dialog from '@radix-ui/react-dialog';
import { supabase } from '../lib/supabase';
import { useGardenAuth } from '../lib/useGardenAuth';
import { Nav } from './Nav';

// ─── Types ────────────────────────────────────────────────────────────────────

type Artist = {
  id: string;
  user_id: string;
  bio: string | null;
  portfolio_url: string | null;
  specialism: string | null;
  rate_cents: number;
  is_accepting: boolean;
  display_name: string | null;
};

type ProjectType = 'cover' | 'illustration' | 'print' | 'other';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRate(cents: number): string {
  if (cents === 0) return 'Rate on request';
  const pounds = (cents / 100).toFixed(0);
  return `From £${pounds}`;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
    color: '#1a1714',
    backgroundColor: 'transparent',
    border: '1px solid #1a1714',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
  },
  emptyState: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.95rem',
    color: '#7a7067',
    fontStyle: 'italic',
    padding: '3rem 0',
  },
  ctaSection: {
    backgroundColor: '#f2ede8',
    padding: '4rem 3rem',
  },
  ctaInner: {
    maxWidth: '860px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    flexWrap: 'wrap' as const,
    gap: '1rem',
  },
  ctaLabel: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.72rem',
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: '#7a7067',
    marginBottom: '0.75rem',
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
  // Modal styles
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    backgroundColor: 'rgba(26, 23, 20, 0.45)',
    zIndex: 200,
  },
  modalContent: {
    position: 'fixed' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#faf8f5',
    padding: '3rem',
    width: '90%',
    maxWidth: '480px',
    zIndex: 201,
    outline: 'none',
  },
  modalTitle: {
    fontFamily: 'Georgia, serif',
    fontSize: '1.5rem',
    fontWeight: 400,
    color: '#1a1714',
    marginBottom: '0.5rem',
  },
  modalSubtitle: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.9rem',
    color: '#7a7067',
    fontStyle: 'italic',
    marginBottom: '2rem',
  },
  fieldGroup: {
    marginBottom: '1.5rem',
  },
  fieldLabel: {
    display: 'block' as const,
    fontFamily: 'Georgia, serif',
    fontSize: '0.75rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: '#7a7067',
    marginBottom: '0.5rem',
  },
  input: {
    width: '100%',
    fontFamily: 'Georgia, serif',
    fontSize: '0.95rem',
    color: '#1a1714',
    backgroundColor: '#f5f1ec',
    border: '1px solid #e8e4df',
    padding: '0.65rem 0.85rem',
    outline: 'none',
    boxSizing: 'border-box' as const,
  },
  selectInput: {
    width: '100%',
    fontFamily: 'Georgia, serif',
    fontSize: '0.95rem',
    color: '#1a1714',
    backgroundColor: '#f5f1ec',
    border: '1px solid #e8e4df',
    padding: '0.65rem 0.85rem',
    outline: 'none',
    appearance: 'none' as const,
    boxSizing: 'border-box' as const,
  },
  textarea: {
    width: '100%',
    fontFamily: 'Georgia, serif',
    fontSize: '0.95rem',
    color: '#1a1714',
    backgroundColor: '#f5f1ec',
    border: '1px solid #e8e4df',
    padding: '0.65rem 0.85rem',
    outline: 'none',
    resize: 'vertical' as const,
    minHeight: '100px',
    boxSizing: 'border-box' as const,
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    marginTop: '2rem',
  },
  btnPrimary: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.85rem',
    letterSpacing: '0.04em',
    color: '#faf8f5',
    backgroundColor: '#1a1714',
    border: 'none',
    padding: '0.65rem 1.5rem',
    cursor: 'pointer',
  },
  btnSecondary: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.85rem',
    letterSpacing: '0.04em',
    color: '#7a7067',
    backgroundColor: 'transparent',
    border: '1px solid #e8e4df',
    padding: '0.65rem 1.5rem',
    cursor: 'pointer',
  },
};

// ─── Commission Modal ─────────────────────────────────────────────────────────

function CommissionModal({
  artist,
  onClose,
}: {
  artist: Artist;
  onClose: () => void;
}) {
  const [projectType, setProjectType] = useState<ProjectType>('cover');
  const [message, setMessage] = useState('');
  const [priceCents, setPriceCents] = useState(artist.rate_cents);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('You must be signed in to request a commission.');
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from('collaborations').insert({
      writer_id: user.id,
      artist_id: artist.id,
      project_type: projectType,
      message: message.trim() || null,
      agreed_price_cents: priceCents > 0 ? priceCents : null,
      status: 'proposed',
    });

    setSubmitting(false);

    if (error) {
      toast.error('Something went wrong. Please try again.');
      console.error('[CommissionModal] insert error:', error);
      return;
    }

    toast.success(`Commission request sent to ${artist.display_name ?? 'the artist'}.`);
    onClose();
  }

  const priceInPounds = Math.floor(priceCents / 100);

  return (
    <Dialog.Root open onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay style={S.overlay} />
        <Dialog.Content style={S.modalContent} aria-describedby={undefined}>
          <Dialog.Title style={S.modalTitle}>
            Request a Commission
          </Dialog.Title>
          <p style={S.modalSubtitle}>
            with {artist.display_name ?? 'this artist'}
          </p>

          <form onSubmit={handleSubmit}>
            <div style={S.fieldGroup}>
              <label style={S.fieldLabel} htmlFor="project-type">Project type</label>
              <select
                id="project-type"
                style={S.selectInput}
                value={projectType}
                onChange={(e) => setProjectType(e.target.value as ProjectType)}
                required
              >
                <option value="cover">Cover design</option>
                <option value="illustration">Interior illustration</option>
                <option value="print">Print / broadside</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div style={S.fieldGroup}>
              <label style={S.fieldLabel} htmlFor="commission-message">Message</label>
              <textarea
                id="commission-message"
                style={S.textarea}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your project — style, timeline, any specific ideas…"
              />
            </div>

            <div style={S.fieldGroup}>
              <label style={S.fieldLabel} htmlFor="commission-price">
                Proposed budget (£)
              </label>
              <input
                id="commission-price"
                type="number"
                min={0}
                step={1}
                style={S.input}
                value={priceInPounds}
                onChange={(e) =>
                  setPriceCents(parseInt(e.target.value || '0', 10) * 100)
                }
                placeholder="0"
              />
            </div>

            <div style={S.modalActions}>
              <button
                type="button"
                style={S.btnSecondary}
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={S.btnPrimary}
                disabled={submitting}
              >
                {submitting ? 'Sending…' : 'Send request'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ArtistCommission() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const { isAuthenticated } = useGardenAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadArtists();
  }, []);

  async function loadArtists() {
    setLoading(true);
    const { data, error } = await supabase
      .from('artists')
      .select(`
        id,
        user_id,
        bio,
        portfolio_url,
        specialism,
        rate_cents,
        is_accepting,
        profiles!artists_user_id_fkey (
          display_name
        )
      `)
      .eq('is_accepting', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[ArtistCommission] fetch error:', error);
    } else if (data) {
      const mapped: Artist[] = (data as any[]).map((row) => ({
        id: row.id,
        user_id: row.user_id,
        bio: row.bio,
        portfolio_url: row.portfolio_url,
        specialism: row.specialism,
        rate_cents: row.rate_cents,
        is_accepting: row.is_accepting,
        display_name: row.profiles?.display_name ?? null,
      }));
      setArtists(mapped);
    }
    setLoading(false);
  }

  function handleRequestCommission(artist: Artist) {
    if (!isAuthenticated) {
      navigate('/auth?returnTo=/commissions');
      return;
    }
    setSelectedArtist(artist);
  }

  return (
    <div style={S.page}>
      <Nav />

      {/* Commission request modal */}
      {selectedArtist && (
        <CommissionModal
          artist={selectedArtist}
          onClose={() => setSelectedArtist(null)}
        />
      )}

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

        {loading ? (
          <p style={S.emptyState}>Loading artists…</p>
        ) : artists.length === 0 ? (
          <p style={S.emptyState}>
            No artists are currently accepting commissions. Check back soon, or{' '}
            <Link to="/artist-register" style={{ color: '#1a1714' }}>
              join as an artist
            </Link>
            .
          </p>
        ) : (
          <div style={S.artistList}>
            {artists.map((artist) => (
              <div key={artist.id} style={S.artistRow}>
                <span style={S.artistName}>
                  {artist.display_name ?? 'Artist'}
                </span>
                <span style={S.artistSpecialism}>
                  {artist.specialism ?? artist.bio ?? '—'}
                </span>
                <span style={S.artistRate}>{formatRate(artist.rate_cents)}</span>
                <button
                  style={S.commissionBtn}
                  onClick={() => handleRequestCommission(artist)}
                >
                  Request a commission
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <hr style={S.divider} />

      {/* CTA */}
      <section style={S.ctaSection}>
        <div style={S.ctaInner}>
          <div>
            <p style={S.ctaLabel}>Are you an artist?</p>
            <Link to="/artist-register" style={S.ctaLink}>
              Join The Garden →
            </Link>
          </div>
          {!isAuthenticated && (
            <div>
              <p style={S.ctaLabel}>Writers</p>
              <Link to="/auth?returnTo=/commissions" style={S.ctaLink}>
                Sign in to commission →
              </Link>
            </div>
          )}
        </div>
      </section>

      <footer style={S.footer}>
        <span style={S.footerWord}>Commissions · The Garden</span>
        <span style={S.footerWord}>© {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
