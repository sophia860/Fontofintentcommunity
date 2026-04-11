/**
 * AdminDashboard — Site Controller Panel
 * Only accessible to the account registered as ADMIN_EMAIL.
 * Tabs: Overview · Content · Payments · Users · Writings
 */
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../lib/supabase';
import { ADMIN_EMAIL } from '../lib/adminConfig';
import { Nav } from './Nav';

// ─── Shared styles ────────────────────────────────────────────────────────────

const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#faf8f5',
    fontFamily: 'Georgia, serif',
    color: '#1a1714',
  },
  inner: {
    maxWidth: 900,
    margin: '0 auto',
    padding: '2.5rem 1.5rem 4rem',
  },
  heading: {
    fontWeight: 400,
    fontSize: '2rem',
    marginBottom: '0.25rem',
  },
  sub: {
    color: '#7a7067',
    fontStyle: 'italic',
    marginBottom: '2.5rem',
    fontSize: '0.92rem',
  },
  badge: {
    display: 'inline-block',
    fontSize: '0.65rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    padding: '0.2rem 0.55rem',
    border: '1px solid #9b2335',
    color: '#9b2335',
    marginLeft: '0.75rem',
    verticalAlign: 'middle',
  },
  tabs: {
    display: 'flex',
    gap: '2rem',
    marginBottom: '2.5rem',
    borderBottom: '1px solid #e8e4df',
    flexWrap: 'wrap' as const,
  },
  tab: {
    padding: '0 0 0.75rem',
    fontSize: '0.88rem',
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    fontFamily: 'Georgia, serif',
    color: '#7a7067',
    borderBottom: '2px solid transparent',
    marginBottom: '-1px',
  },
  tabActive: {
    padding: '0 0 0.75rem',
    fontSize: '0.88rem',
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    fontFamily: 'Georgia, serif',
    color: '#1a1714',
    borderBottom: '2px solid #1a1714',
    marginBottom: '-1px',
  },
  statGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '1.25rem',
    marginBottom: '2.5rem',
  },
  statCard: {
    padding: '1.25rem',
    backgroundColor: '#f2ede8',
    borderLeft: '3px solid #c5bdb4',
  },
  statNum: {
    fontSize: '2rem',
    fontWeight: 400,
    marginBottom: '0.2rem',
    lineHeight: 1,
  },
  statLabel: {
    fontSize: '0.72rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: '#7a7067',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '0.85rem',
  },
  th: {
    textAlign: 'left' as const,
    fontSize: '0.68rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: '#7a7067',
    paddingBottom: '0.6rem',
    borderBottom: '1px solid #e8e4df',
  },
  td: {
    padding: '0.7rem 0',
    borderBottom: '1px solid #f0ece7',
    verticalAlign: 'top' as const,
    color: '#1a1714',
    lineHeight: 1.5,
  },
  input: {
    width: '100%',
    padding: '0.5rem 0.75rem',
    border: '1px solid #c5bdb4',
    backgroundColor: '#faf8f5',
    fontFamily: 'Georgia, serif',
    fontSize: '0.88rem',
    color: '#1a1714',
    outline: 'none',
    boxSizing: 'border-box' as const,
    marginBottom: '0.1rem',
  },
  textarea: {
    width: '100%',
    padding: '0.5rem 0.75rem',
    border: '1px solid #c5bdb4',
    backgroundColor: '#faf8f5',
    fontFamily: 'Georgia, serif',
    fontSize: '0.88rem',
    color: '#1a1714',
    outline: 'none',
    boxSizing: 'border-box' as const,
    minHeight: '80px',
    resize: 'vertical' as const,
  },
  fieldGroup: {
    marginBottom: '1.25rem',
  },
  fieldLabel: {
    display: 'block',
    fontSize: '0.72rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: '#3d3830',
    marginBottom: '0.35rem',
  },
  btn: {
    fontSize: '0.8rem',
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
    color: '#faf8f5',
    backgroundColor: '#1a1714',
    padding: '0.55rem 1.2rem',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'Georgia, serif',
  },
  btnSecondary: {
    fontSize: '0.8rem',
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
    color: '#1a1714',
    backgroundColor: 'transparent',
    padding: '0.5rem 1.2rem',
    border: '1px solid #c5bdb4',
    cursor: 'pointer',
    fontFamily: 'Georgia, serif',
  },
  btnDanger: {
    fontSize: '0.75rem',
    letterSpacing: '0.04em',
    color: '#9b2335',
    backgroundColor: 'transparent',
    padding: '0.3rem 0.7rem',
    border: '1px solid #9b2335',
    cursor: 'pointer',
    fontFamily: 'Georgia, serif',
  },
  success: {
    fontSize: '0.85rem',
    color: '#3d6b3d',
    padding: '0.6rem 0.9rem',
    backgroundColor: '#eef4ee',
    borderLeft: '3px solid #6B8E6B',
    marginBottom: '1rem',
  },
  error: {
    fontSize: '0.85rem',
    color: '#9b2335',
    padding: '0.6rem 0.9rem',
    backgroundColor: '#fdf0f2',
    borderLeft: '3px solid #9b2335',
    marginBottom: '1rem',
  },
  sectionHead: {
    fontSize: '1.1rem',
    fontWeight: 400,
    marginBottom: '1rem',
    marginTop: '0',
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #e8e4df',
    margin: '2rem 0',
  },
};

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'overview' | 'content' | 'payments' | 'users' | 'writings';

type Stats = {
  users: number;
  writings: number;
  submissions: number;
  journals: number;
  payments: number;
};

type UserRow = {
  id: string;
  email: string;
  created_at: string;
  display_name?: string;
};

type WritingRow = {
  id: string;
  title: string;
  state: string;
  word_count: number | null;
  author_id: string;
  created_at: string;
  display_name?: string;
};

type PaymentRow = {
  id: string;
  email: string;
  description: string;
  amount_pence: number;
  currency: string;
  status: string;
  created_at: string;
};

type ContentRow = {
  id: string;
  key: string;
  label: string;
  value: string;
};

// ─── Default site-content keys shown in the Content tab ──────────────────────
// These mirror the main copy blocks across the site.

const DEFAULT_CONTENT: Omit<ContentRow, 'id'>[] = [
  { key: 'hero_title',         label: 'Hero — Title',              value: 'The Garden is where writing lives.' },
  { key: 'hero_body',          label: 'Hero — Body',               value: 'Page Gallery Editions is a slow, private space for writers to grow work at their own pace. No metrics. No noise.' },
  { key: 'about_mission',      label: 'About — Mission statement', value: 'We publish chapbooks only when the writing is ready. The Garden is free.' },
  { key: 'residency_headline', label: 'Residency — Headline',      value: 'The Page Gallery Residency pairs emerging literary journals with experienced editorial mentors.' },
  { key: 'apply_intro',        label: 'Apply — Intro text',        value: 'Applications are reviewed on a rolling basis. We read everything.' },
  { key: 'footer_note',        label: 'Footer note',               value: 'Page Gallery Editions · London · ' + new Date().getFullYear() },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtPence(pence: number, currency = 'GBP') {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(pence / 100);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatGrid({ stats }: { stats: Stats }) {
  const items = [
    { label: 'Registered Users',  value: stats.users },
    { label: 'Writings',          value: stats.writings },
    { label: 'Submissions',       value: stats.submissions },
    { label: 'Partner Journals',  value: stats.journals },
    { label: 'Payment Records',   value: stats.payments },
  ];
  return (
    <div style={S.statGrid}>
      {items.map(({ label, value }) => (
        <div key={label} style={S.statCard}>
          <div style={S.statNum}>{value}</div>
          <div style={S.statLabel}>{label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Content tab ─────────────────────────────────────────────────────────────

function ContentTab() {
  const [rows, setRows] = useState<ContentRow[]>([]);
  const [saving, setSaving] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    supabase
      .from('site_content')
      .select('*')
      .order('key')
      .then(({ data }) => {
        if (data && data.length > 0) {
          setRows(data as ContentRow[]);
        } else {
          // Seed defaults if table is empty or doesn't exist yet
          setRows(DEFAULT_CONTENT.map((c, i) => ({ ...c, id: String(i) })));
        }
      });
  }, []);

  async function save(row: ContentRow) {
    setSaving(row.key);
    setMsg('');
    // Upsert into site_content table
    const { error } = await supabase
      .from('site_content')
      .upsert({ key: row.key, label: row.label, value: row.value }, { onConflict: 'key' });
    setSaving(null);
    setMsg(error ? `Error: ${error.message}` : 'Saved.');
    setTimeout(() => setMsg(''), 3000);
  }

  function update(key: string, value: string) {
    setRows(prev => prev.map(r => r.key === key ? { ...r, value } : r));
  }

  return (
    <div>
      <h2 style={S.sectionHead}>Front-end Content</h2>
      <p style={{ fontSize: '0.85rem', color: '#7a7067', lineHeight: 1.65, marginBottom: '1.75rem' }}>
        Edit the text blocks that appear across the public site. Changes are saved immediately to the database and will be reflected on next page load.
      </p>
      {msg && <p style={msg.startsWith('Error') ? S.error : S.success}>{msg}</p>}
      {rows.map(row => (
        <div key={row.key} style={{ ...S.fieldGroup, padding: '1.25rem', backgroundColor: '#f9f6f3', marginBottom: '1rem' }}>
          <label style={S.fieldLabel}>{row.label}</label>
          {row.value.length < 120 ? (
            <input
              style={S.input}
              value={row.value}
              onChange={e => update(row.key, e.target.value)}
            />
          ) : (
            <textarea
              style={S.textarea}
              value={row.value}
              onChange={e => update(row.key, e.target.value)}
            />
          )}
          <button
            style={{ ...S.btn, marginTop: '0.6rem', opacity: saving === row.key ? 0.5 : 1 }}
            disabled={saving === row.key}
            onClick={() => save(row)}
          >
            {saving === row.key ? 'Saving…' : 'Save'}
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Payments tab ─────────────────────────────────────────────────────────────

function PaymentsTab() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'records' | 'new'>('records');
  const [form, setForm] = useState({ email: '', description: '', amount: '', currency: 'GBP', status: 'pending' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('payments').select('*').order('created_at', { ascending: false });
    setPayments((data as PaymentRow[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function createPayment(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    const pence = Math.round(parseFloat(form.amount) * 100);
    const { error } = await supabase.from('payments').insert({
      email: form.email,
      description: form.description,
      amount_pence: pence,
      currency: form.currency,
      status: form.status,
    });
    setSaving(false);
    if (error) {
      setMsg(`Error: ${error.message}`);
    } else {
      setMsg('Payment record created.');
      setForm({ email: '', description: '', amount: '', currency: 'GBP', status: 'pending' });
      load();
    }
    setTimeout(() => setMsg(''), 4000);
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('payments').update({ status }).eq('id', id);
    setPayments(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  }

  const total = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount_pence, 0);

  return (
    <div>
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', borderBottom: '1px solid #e8e4df' }}>
        <button style={tab === 'records' ? S.tabActive : S.tab} onClick={() => setTab('records')}>
          Records {payments.length > 0 && `(${payments.length})`}
        </button>
        <button style={tab === 'new' ? S.tabActive : S.tab} onClick={() => setTab('new')}>
          New Payment Record
        </button>
      </div>

      {tab === 'records' && (
        <>
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
            <div style={S.statCard}>
              <div style={S.statNum}>{payments.length}</div>
              <div style={S.statLabel}>Total Records</div>
            </div>
            <div style={S.statCard}>
              <div style={S.statNum}>{payments.filter(p => p.status === 'paid').length}</div>
              <div style={S.statLabel}>Paid</div>
            </div>
            <div style={S.statCard}>
              <div style={S.statNum}>{fmtPence(total)}</div>
              <div style={S.statLabel}>Total Collected</div>
            </div>
            <div style={S.statCard}>
              <div style={S.statNum}>{payments.filter(p => p.status === 'pending').length}</div>
              <div style={S.statLabel}>Pending</div>
            </div>
          </div>

          {loading ? (
            <p style={{ color: '#7a7067', fontStyle: 'italic' }}>Loading…</p>
          ) : payments.length === 0 ? (
            <p style={{ color: '#aaa', fontStyle: 'italic', fontSize: '0.9rem' }}>No payment records yet.</p>
          ) : (
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>Email</th>
                  <th style={S.th}>Description</th>
                  <th style={S.th}>Amount</th>
                  <th style={S.th}>Status</th>
                  <th style={S.th}>Date</th>
                  <th style={S.th}></th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id}>
                    <td style={S.td}>{p.email}</td>
                    <td style={S.td}>{p.description}</td>
                    <td style={{ ...S.td, whiteSpace: 'nowrap' as const }}>{fmtPence(p.amount_pence, p.currency)}</td>
                    <td style={S.td}>
                      <span style={{
                        fontSize: '0.7rem',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase' as const,
                        padding: '0.15rem 0.5rem',
                        border: `1px solid ${p.status === 'paid' ? '#6B8E6B' : p.status === 'refunded' ? '#9b2335' : '#c5bdb4'}`,
                        color: p.status === 'paid' ? '#6B8E6B' : p.status === 'refunded' ? '#9b2335' : '#7a7067',
                      }}>{p.status}</span>
                    </td>
                    <td style={{ ...S.td, fontSize: '0.8rem', color: '#999' }}>{fmtDate(p.created_at)}</td>
                    <td style={S.td}>
                      {p.status === 'pending' && (
                        <button style={{ ...S.btnSecondary, fontSize: '0.72rem', padding: '0.2rem 0.6rem' }} onClick={() => updateStatus(p.id, 'paid')}>
                          Mark Paid
                        </button>
                      )}
                      {p.status === 'paid' && (
                        <button style={{ ...S.btnDanger, fontSize: '0.72rem', padding: '0.2rem 0.6rem' }} onClick={() => updateStatus(p.id, 'refunded')}>
                          Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {tab === 'new' && (
        <form onSubmit={createPayment} style={{ maxWidth: 520 }}>
          <p style={{ fontSize: '0.85rem', color: '#7a7067', lineHeight: 1.65, marginBottom: '1.5rem' }}>
            Create a payment record for a chapbook sale, subscription, or custom invoice.
          </p>
          {msg && <p style={msg.startsWith('Error') ? S.error : S.success}>{msg}</p>}

          <div style={S.fieldGroup}>
            <label style={S.fieldLabel}>Customer Email</label>
            <input style={S.input} type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="buyer@example.com" />
          </div>
          <div style={S.fieldGroup}>
            <label style={S.fieldLabel}>Description</label>
            <input style={S.input} required value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. Chapbook — A Study in Grief, ed. 1" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div style={S.fieldGroup}>
              <label style={S.fieldLabel}>Amount (£)</label>
              <input style={S.input} type="number" step="0.01" min="0" required value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="12.00" />
            </div>
            <div style={S.fieldGroup}>
              <label style={S.fieldLabel}>Currency</label>
              <select
                style={{ ...S.input, marginBottom: 0 }}
                value={form.currency}
                onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
              >
                <option value="GBP">GBP</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>
          <div style={S.fieldGroup}>
            <label style={S.fieldLabel}>Status</label>
            <select
              style={{ ...S.input, marginBottom: 0 }}
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          <button style={{ ...S.btn, opacity: saving ? 0.6 : 1 }} type="submit" disabled={saving}>
            {saving ? 'Creating…' : 'Create Record'}
          </button>
        </form>
      )}
    </div>
  );
}

// ─── Users tab ────────────────────────────────────────────────────────────────

function UsersTab() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id, email, created_at, display_name')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setUsers((data as UserRow[]) || []);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h2 style={S.sectionHead}>Registered Users</h2>
      {loading ? (
        <p style={{ color: '#7a7067', fontStyle: 'italic' }}>Loading…</p>
      ) : users.length === 0 ? (
        <p style={{ color: '#aaa', fontStyle: 'italic', fontSize: '0.9rem' }}>No users found.</p>
      ) : (
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>Display Name</th>
              <th style={S.th}>Email</th>
              <th style={S.th}>Joined</th>
              <th style={S.th}>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td style={S.td}>{u.display_name || <em style={{ color: '#aaa' }}>—</em>}</td>
                <td style={{ ...S.td, fontSize: '0.82rem' }}>{u.email}</td>
                <td style={{ ...S.td, fontSize: '0.8rem', color: '#999', whiteSpace: 'nowrap' as const }}>{fmtDate(u.created_at)}</td>
                <td style={S.td}>
                  {u.email === ADMIN_EMAIL ? (
                    <span style={{ fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase' as const, padding: '0.15rem 0.5rem', border: '1px solid #9b2335', color: '#9b2335' }}>
                      Controller
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.68rem', color: '#aaa' }}>Member</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─── Writings tab ─────────────────────────────────────────────────────────────

function WritingsTab() {
  const [writings, setWritings] = useState<WritingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'seed' | 'sprout' | 'bloom'>('all');

  useEffect(() => {
    supabase
      .from('writings')
      .select('id, title, state, word_count, author_id, created_at, profiles(display_name)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const rows: WritingRow[] = ((data as any[]) || []).map(r => ({
          id: r.id,
          title: r.title,
          state: r.state,
          word_count: r.word_count,
          author_id: r.author_id,
          created_at: r.created_at,
          display_name: r.profiles?.display_name,
        }));
        setWritings(rows);
        setLoading(false);
      });
  }, []);

  const STATE_COLOR: Record<string, string> = { seed: '#C4B5A6', sprout: '#8BA67A', bloom: '#6B8E6B' };
  const visible = filter === 'all' ? writings : writings.filter(w => w.state === filter);

  return (
    <div>
      <h2 style={S.sectionHead}>All Writings</h2>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {(['all', 'seed', 'sprout', 'bloom'] as const).map(f => (
          <button
            key={f}
            style={filter === f ? { ...S.btn, padding: '0.35rem 0.9rem' } : { ...S.btnSecondary, padding: '0.35rem 0.9rem' }}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <span style={{ fontSize: '0.82rem', color: '#999', alignSelf: 'center' }}>{visible.length} pieces</span>
      </div>

      {loading ? (
        <p style={{ color: '#7a7067', fontStyle: 'italic' }}>Loading…</p>
      ) : visible.length === 0 ? (
        <p style={{ color: '#aaa', fontStyle: 'italic', fontSize: '0.9rem' }}>No writings found.</p>
      ) : (
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>Title</th>
              <th style={S.th}>Author</th>
              <th style={S.th}>State</th>
              <th style={S.th}>Words</th>
              <th style={S.th}>Created</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(w => (
              <tr key={w.id}>
                <td style={{ ...S.td, fontStyle: 'italic' }}>{w.title || 'Untitled'}</td>
                <td style={{ ...S.td, fontSize: '0.82rem' }}>{w.display_name || <em style={{ color: '#aaa' }}>—</em>}</td>
                <td style={S.td}>
                  <span style={{ fontSize: '0.68rem', letterSpacing: '0.06em', textTransform: 'uppercase' as const, padding: '0.15rem 0.5rem', border: `1px solid ${STATE_COLOR[w.state] || '#c5bdb4'}`, color: STATE_COLOR[w.state] || '#7a7067' }}>
                    {w.state}
                  </span>
                </td>
                <td style={{ ...S.td, fontSize: '0.8rem', color: '#999' }}>{w.word_count?.toLocaleString() ?? '—'}</td>
                <td style={{ ...S.td, fontSize: '0.8rem', color: '#999', whiteSpace: 'nowrap' as const }}>{fmtDate(w.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─── Overview tab ─────────────────────────────────────────────────────────────

function OverviewTab({ stats, loading }: { stats: Stats; loading: boolean }) {
  const routes = [
    { path: '/', label: 'Home (Garden)' },
    { path: '/write', label: 'Writing Surface' },
    { path: '/writers', label: 'Writers Directory' },
    { path: '/journals', label: 'Journal Directory' },
    { path: '/residency', label: 'Residency Programme' },
    { path: '/apply', label: 'Apply' },
    { path: '/about', label: 'About' },
    { path: '/dashboard/writer', label: 'Writer Dashboard' },
    { path: '/dashboard/journal', label: 'Journal Dashboard' },
    { path: '/auth', label: 'Sign In / Sign Up' },
  ];

  return (
    <div>
      <h2 style={S.sectionHead}>Site Overview</h2>
      {loading ? (
        <p style={{ color: '#7a7067', fontStyle: 'italic' }}>Loading statistics…</p>
      ) : (
        <StatGrid stats={stats} />
      )}

      <hr style={S.divider} />

      <h3 style={{ fontWeight: 400, fontSize: '0.95rem', letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: '#7a7067', marginBottom: '1rem' }}>
        Site Routes
      </h3>
      <table style={S.table}>
        <thead>
          <tr>
            <th style={S.th}>Path</th>
            <th style={S.th}>Page</th>
            <th style={S.th}></th>
          </tr>
        </thead>
        <tbody>
          {routes.map(r => (
            <tr key={r.path}>
              <td style={{ ...S.td, fontFamily: 'monospace', fontSize: '0.82rem', color: '#7a7067' }}>{r.path}</td>
              <td style={S.td}>{r.label}</td>
              <td style={S.td}>
                <a href={r.path} target="_blank" rel="noreferrer" style={{ fontSize: '0.78rem', color: '#7a7067', textDecoration: 'underline' }}>
                  Open ↗
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main AdminDashboard export ───────────────────────────────────────────────

export function AdminDashboard() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<Stats>({ users: 0, writings: 0, submissions: 0, journals: 0, payments: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  // Auth guard: only the site controller may access this panel
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email === ADMIN_EMAIL) {
        setAuthorized(true);
        setAdminEmail(data.user.email ?? '');
        loadStats();
      } else {
        // Not the controller — redirect to sign-in
        navigate('/auth?returnTo=/admin', { replace: true });
      }
      setChecking(false);
    });
  }, [navigate]);

  async function loadStats() {
    const [usersRes, writingsRes, subsRes, journalsRes, paymentsRes] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('writings').select('id', { count: 'exact', head: true }),
      supabase.from('submissions').select('id', { count: 'exact', head: true }),
      supabase.from('journals').select('id', { count: 'exact', head: true }),
      supabase.from('payments').select('id', { count: 'exact', head: true }),
    ]);
    setStats({
      users:       usersRes.count     ?? 0,
      writings:    writingsRes.count  ?? 0,
      submissions: subsRes.count      ?? 0,
      journals:    journalsRes.count  ?? 0,
      payments:    paymentsRes.count  ?? 0,
    });
    setStatsLoading(false);
  }

  if (checking) {
    return (
      <div style={S.page}>
        <Nav />
        <div style={S.inner}>
          <p style={{ color: '#7a7067', fontStyle: 'italic' }}>Verifying access…</p>
        </div>
      </div>
    );
  }

  if (!authorized) return null;

  const TABS: { id: Tab; label: string }[] = [
    { id: 'overview',  label: 'Overview'  },
    { id: 'content',   label: 'Content'   },
    { id: 'payments',  label: 'Payments'  },
    { id: 'users',     label: 'Users'     },
    { id: 'writings',  label: 'Writings'  },
  ];

  return (
    <div style={S.page}>
      <Nav />
      <div style={S.inner}>
        <h1 style={S.heading}>
          Site Controller
          <span style={S.badge}>Admin</span>
        </h1>
        <p style={S.sub}>Signed in as {adminEmail}. You have full access to every section of this site.</p>

        <div style={S.tabs}>
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              style={tab === id ? S.tabActive : S.tab}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'overview'  && <OverviewTab stats={stats} loading={statsLoading} />}
        {tab === 'content'   && <ContentTab />}
        {tab === 'payments'  && <PaymentsTab />}
        {tab === 'users'     && <UsersTab />}
        {tab === 'writings'  && <WritingsTab />}
      </div>
    </div>
  );
}

export default AdminDashboard;
