/**
 * GardenDashboard — authenticated writer workspace
 * Sidebar: My Garden / Licensed Journals / Analytics
 * Main area: SubmissionKanban
 * Protected: redirects to /auth if not signed in
 */
import { useState } from 'react';
import { Link, Navigate } from 'react-router';
import { Nav } from '../../app/components/Nav';
import { SubmissionKanban } from './components/SubmissionKanban';
import { useGardenAuth } from '../../app/lib/useGardenAuth';
import { supabase } from '../../app/lib/supabase';

type SidebarTab = 'my-garden' | 'licensed-journals' | 'analytics';

const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#F8F4EC',
    fontFamily: 'Georgia, serif',
    color: '#1a1714',
  },
  layout: {
    display: 'flex',
    minHeight: 'calc(100vh - 73px)',
  },
  sidebar: {
    width: '220px',
    flexShrink: 0,
    backgroundColor: '#F2EBE1',
    borderRight: '1px solid #e8e4df',
    padding: '2rem 0',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0',
  },
  sidebarLabel: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.65rem',
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: '#b0a89e',
    padding: '0 1.5rem',
    marginBottom: '0.75rem',
  },
  sidebarItem: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.88rem',
    color: '#7a7067',
    padding: '0.55rem 1.5rem',
    cursor: 'pointer',
    borderLeft: '2px solid transparent',
    transition: 'all 0.12s',
    background: 'none',
    border: 'none',
    width: '100%',
    textAlign: 'left' as const,
    borderLeftWidth: '2px',
  },
  sidebarItemActive: {
    color: '#1a1714',
    borderLeftColor: '#6B2A2A',
    backgroundColor: 'rgba(107,42,42,0.05)',
  },
  sidebarTeaser: {
    marginTop: 'auto',
    padding: '1.5rem',
    borderTop: '1px solid #e8e4df',
  },
  teaserLabel: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.65rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: '#b0a89e',
    marginBottom: '0.5rem',
  },
  teaserText: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.78rem',
    color: '#7a7067',
    lineHeight: 1.55,
    marginBottom: '0.75rem',
  },
  teaserLink: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.75rem',
    color: '#6B2A2A',
    textDecoration: 'none',
    borderBottom: '1px solid #6B2A2A',
    paddingBottom: '1px',
  },
  main: {
    flex: 1,
    padding: '2.5rem 2.5rem',
    overflowX: 'auto' as const,
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '2rem',
  },
  pageTitle: {
    fontFamily: 'Georgia, serif',
    fontSize: '1.4rem',
    fontWeight: 400,
    color: '#1a1714',
  },
  newBtn: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.82rem',
    letterSpacing: '0.05em',
    color: '#F8F4EC',
    backgroundColor: '#6B2A2A',
    border: 'none',
    padding: '0.5rem 1.2rem',
    cursor: 'pointer',
    textTransform: 'uppercase' as const,
  },
  modal: {
    position: 'fixed' as const,
    inset: 0,
    backgroundColor: 'rgba(26,23,20,0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
  },
  modalBox: {
    backgroundColor: '#F8F4EC',
    border: '1px solid #e8e4df',
    padding: '2.5rem',
    width: '520px',
    maxWidth: '90vw',
  },
  modalTitle: {
    fontFamily: 'Georgia, serif',
    fontSize: '1.1rem',
    fontWeight: 400,
    marginBottom: '1.5rem',
    color: '#1a1714',
  },
  label: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.75rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: '#7a7067',
    display: 'block',
    marginBottom: '0.4rem',
  },
  input: {
    width: '100%',
    fontFamily: 'Georgia, serif',
    fontSize: '0.9rem',
    color: '#1a1714',
    backgroundColor: '#fff',
    border: '1px solid #d8d4cf',
    padding: '0.55rem 0.8rem',
    marginBottom: '1.2rem',
    outline: 'none',
    boxSizing: 'border-box' as const,
  },
  textarea: {
    width: '100%',
    fontFamily: 'Georgia, serif',
    fontSize: '0.9rem',
    color: '#1a1714',
    backgroundColor: '#fff',
    border: '1px solid #d8d4cf',
    padding: '0.75rem 0.8rem',
    marginBottom: '1.2rem',
    outline: 'none',
    resize: 'vertical' as const,
    minHeight: '140px',
    boxSizing: 'border-box' as const,
  },
  select: {
    width: '100%',
    fontFamily: 'Georgia, serif',
    fontSize: '0.9rem',
    color: '#1a1714',
    backgroundColor: '#fff',
    border: '1px solid #d8d4cf',
    padding: '0.55rem 0.8rem',
    marginBottom: '1.5rem',
    outline: 'none',
    boxSizing: 'border-box' as const,
  },
  modalActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.82rem',
    color: '#7a7067',
    background: 'none',
    border: '1px solid #d8d4cf',
    padding: '0.5rem 1.1rem',
    cursor: 'pointer',
  },
  submitBtn: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.82rem',
    color: '#F8F4EC',
    backgroundColor: '#6B2A2A',
    border: 'none',
    padding: '0.5rem 1.2rem',
    cursor: 'pointer',
    letterSpacing: '0.04em',
  },
  placeholder: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.9rem',
    color: '#b0a89e',
    fontStyle: 'italic',
    padding: '3rem 0',
    textAlign: 'center' as const,
  },
};

interface NewSubmission {
  title: string;
  content: string;
  type: 'poem' | 'essay' | 'visual';
}

export function GardenDashboard() {
  const { isAuthenticated, loading, gardenUser } = useGardenAuth();
  const [tab, setTab] = useState<SidebarTab>('my-garden');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<NewSubmission>({ title: '', content: '', type: 'poem' });
  const [saving, setSaving] = useState(false);

  if (loading) {
    return (
      <div style={S.page}>
        <Nav />
        <p style={{ padding: '5rem 3rem', fontFamily: 'Georgia, serif', color: '#7a7067' }}>Loading…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  async function handleNewSubmission(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await supabase
        .from('submissions')
        .insert({
          title: form.title,
          content: form.content,
          type: form.type,
          status: 'draft',
          submitter_id: gardenUser?.auth_id,
          rights_status: 'pending',
        });
    } catch {
      // silently fail — kanban uses mock data when no db row
    }
    setSaving(false);
    setForm({ title: '', content: '', type: 'poem' });
    setModalOpen(false);
  }

  return (
    <div style={S.page}>
      <Nav />
      <div style={S.layout}>
        {/* Sidebar */}
        <aside style={S.sidebar}>
          <p style={S.sidebarLabel}>Navigation</p>
          {(
            [
              { id: 'my-garden' as SidebarTab,        label: 'My Garden'        },
              { id: 'licensed-journals' as SidebarTab, label: 'Licensed Journals' },
              { id: 'analytics' as SidebarTab,         label: 'Analytics'        },
            ] as { id: SidebarTab; label: string }[]
          ).map(item => (
            <button
              key={item.id}
              style={{
                ...S.sidebarItem,
                ...(tab === item.id ? S.sidebarItemActive : {}),
              }}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}

          {/* B2B teaser */}
          <div style={S.sidebarTeaser}>
            <p style={S.teaserLabel}>For journals</p>
            <p style={S.teaserText}>
              License The Garden to your journal — submission tracking, editorial workflow, Garden partner badge.
            </p>
            <p style={S.teaserText} className="">
              <strong style={{ color: '#6B2A2A' }}>£2k/year</strong>
            </p>
            <Link to="/pricing" style={S.teaserLink}>Learn more →</Link>
          </div>
        </aside>

        {/* Main */}
        <main style={S.main}>
          <div style={S.topBar}>
            <h1 style={S.pageTitle}>
              {tab === 'my-garden' && 'My Submissions'}
              {tab === 'licensed-journals' && 'Licensed Journals'}
              {tab === 'analytics' && 'Analytics'}
            </h1>
            {tab === 'my-garden' && (
              <button style={S.newBtn} onClick={() => setModalOpen(true)}>
                + New Submission
              </button>
            )}
          </div>

          {tab === 'my-garden' && (
            <SubmissionKanban userId={gardenUser?.auth_id} />
          )}

          {tab === 'licensed-journals' && (
            <p style={S.placeholder}>
              No journals licensed yet. Partner journals will appear here once your work is accepted.
            </p>
          )}

          {tab === 'analytics' && (
            <p style={S.placeholder}>
              Analytics coming soon — view acceptance rates, read counts, and earned royalties.
            </p>
          )}
        </main>
      </div>

      {/* New Submission Modal */}
      {modalOpen && (
        <div style={S.modal} onClick={e => { if (e.target === e.currentTarget) setModalOpen(false); }}>
          <div style={S.modalBox}>
            <h2 style={S.modalTitle}>New Submission</h2>
            <form onSubmit={handleNewSubmission}>
              <label style={S.label}>Title</label>
              <input
                style={S.input}
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Working title…"
                required
              />
              <label style={S.label}>Type</label>
              <select
                style={S.select}
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value as NewSubmission['type'] }))}
              >
                <option value="poem">Poem</option>
                <option value="essay">Essay</option>
                <option value="visual">Visual</option>
              </select>
              <label style={S.label}>Content</label>
              <textarea
                style={S.textarea}
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="Paste or type your work here…"
              />
              <div style={S.modalActions}>
                <button type="button" style={S.cancelBtn} onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" style={S.submitBtn} disabled={saving}>
                  {saving ? 'Saving…' : 'Save as Draft'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
