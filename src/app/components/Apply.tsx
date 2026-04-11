/**
 * Apply — Page Gallery Editions
 * Three pathways: writer, journal, residency.
 * One form, clearly structured.
 */
import { useState } from 'react';
import { Nav } from './Nav';
import { WatercolorBackground } from './WatercolorBackground';
import { supabase } from '../lib/supabase';

type ApplyType = 'writer' | 'journal' | 'residency' | 'tilth';

const S: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', backgroundColor: '#F5EDE4', fontFamily: 'Georgia, serif', color: '#1a1714', position: 'relative' },
  hero: { padding: '5rem 3rem 3rem', borderBottom: '1px solid #e8e4df' },
  label: { fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#7a7067', marginBottom: '1rem' },
  h1: { fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 600, margin: '0 0 1.5rem', lineHeight: 1.1, fontFamily: "'ACFrenchToast', cursive" },
  body: { fontSize: '0.95rem', lineHeight: 1.75, color: '#3d3830', maxWidth: '520px', marginBottom: '1.5rem' },
  tabs: { display: 'flex', gap: '0', borderBottom: '1px solid #e8e4df', padding: '0 3rem', marginBottom: '0' },
  tab: { padding: '1rem 1.5rem 1rem', fontSize: '0.85rem', cursor: 'pointer', border: 'none', backgroundColor: 'transparent', fontFamily: 'Georgia, serif', color: '#7a7067', borderBottom: '2px solid transparent', marginBottom: '-1px' },
  tabActive: { padding: '1rem 1.5rem 1rem', fontSize: '0.85rem', cursor: 'pointer', border: 'none', backgroundColor: 'transparent', fontFamily: 'Georgia, serif', color: '#1a1714', borderBottom: '2px solid #1a1714', marginBottom: '-1px', fontWeight: 700 },
  form: { padding: '3rem', maxWidth: '600px' },
  fieldGroup: { marginBottom: '2rem' },
  fieldLabel: { display: 'block', fontSize: '0.8rem', letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: '#3d3830', marginBottom: '0.5rem' },
  fieldNote: { fontSize: '0.78rem', color: '#7a7067', marginBottom: '0.5rem', lineHeight: 1.5 },
  input: { width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #c5bdb4', backgroundColor: '#F5EDE4', fontFamily: 'Georgia, serif', fontSize: '0.9rem', color: '#1a1714', outline: 'none', boxSizing: 'border-box' as const },
  textarea: { width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #c5bdb4', backgroundColor: '#F5EDE4', fontFamily: 'Georgia, serif', fontSize: '0.9rem', color: '#1a1714', outline: 'none', resize: 'vertical' as const, minHeight: '120px', boxSizing: 'border-box' as const },
  submit: { fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase' as const, color: '#F5EDE4', backgroundColor: '#1a1714', padding: '0.75rem 1.75rem', border: 'none', cursor: 'pointer', fontFamily: 'Georgia, serif' },
  note: { fontSize: '0.8rem', color: '#7a7067', lineHeight: 1.6, marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e8e4df', maxWidth: '520px' },
};

function WriterForm() {
  const [form, setForm] = useState({ name: '', email: '', location: '', forms: '', bio: '', website: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault(); setLoading(true); setError('');
    const { error: err } = await supabase.from('writer_applications').insert({
      name: form.name, email: form.email, bio: form.bio, forms: form.forms, sample: form.website, statement: '', status: 'pending',
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setSubmitted(true);
  }
  if (submitted) return (
    <div style={S.form}>
      <p style={{ ...S.body, backgroundColor: '#EDE1D5', padding: '1rem 1.25rem', borderLeft: '3px solid #c5bdb4' }}>
        <strong>Application received.</strong> Thank you for entering the Garden. We read every application and will be in touch.
      </p>
    </div>
  );
  return (
    <form style={S.form} onSubmit={handleSubmit}>
      {error && <p style={{ color: '#9b2335', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}
      <div style={S.fieldGroup}><label style={S.fieldLabel}>Name</label><input style={S.input} name="name" type="text" placeholder="Your name" value={form.name} onChange={handle} required /></div>
      <div style={S.fieldGroup}><label style={S.fieldLabel}>Email</label><input style={S.input} name="email" type="email" placeholder="hello@example.com" value={form.email} onChange={handle} required /></div>
      <div style={S.fieldGroup}><label style={S.fieldLabel}>Location</label><input style={S.input} name="location" type="text" placeholder="City, Country" value={form.location} onChange={handle} /></div>
      <div style={S.fieldGroup}><label style={S.fieldLabel}>Forms you work in</label><p style={S.fieldNote}>e.g. poetry, fiction, lyric essay, hybrid, translation</p><input style={S.input} name="forms" type="text" placeholder="poetry, essay" value={form.forms} onChange={handle} /></div>
      <div style={S.fieldGroup}><label style={S.fieldLabel}>Short bio</label><p style={S.fieldNote}>Two or three sentences. Tell us what you are working on right now.</p><textarea style={S.textarea} name="bio" placeholder="I am currently working on..." value={form.bio} onChange={handle} /></div>
      <div style={S.fieldGroup}><label style={S.fieldLabel}>Website or sample work (optional)</label><input style={S.input} name="website" type="url" placeholder="https://" value={form.website} onChange={handle} /></div>
      <button style={S.submit} type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Enter the Garden'}</button>
      <p style={S.note}>The Garden is free for writers. Your profile will be visible to journals registered in the ecosystem. You can update or remove it at any time.</p>
    </form>
  );
}

function JournalForm() {
  const [form, setForm] = useState({ journal_name: '', contact_name: '', email: '', location: '', website: '', mission_statement: '', pays: '', reading_status: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault(); setLoading(true); setError('');
    const { error: err } = await supabase.from('journal_applications').insert({
      journal_name: form.journal_name, contact_name: form.contact_name, email: form.email, mission_statement: form.mission_statement, status: 'pending',
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setSubmitted(true);
  }
  if (submitted) return (
    <div style={S.form}>
      <p style={{ ...S.body, backgroundColor: '#EDE1D5', padding: '1rem 1.25rem', borderLeft: '3px solid #c5bdb4' }}>
        <strong>Registration received.</strong> Thank you for registering your journal. We will review and follow up shortly.
      </p>
    </div>
  );
  return (
    <form style={S.form} onSubmit={handleSubmit}>
      {error && <p style={{ color: '#9b2335', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}
      <div style={S.fieldGroup}><label style={S.fieldLabel}>Journal name</label><input style={S.input} name="journal_name" type="text" placeholder="Journal name" value={form.journal_name} onChange={handle} required /></div>
      <div style={S.fieldGroup}><label style={S.fieldLabel}>Primary editor / contact</label><input style={S.input} name="contact_name" type="text" placeholder="Name" value={form.contact_name} onChange={handle} required /></div>
      <div style={S.fieldGroup}><label style={S.fieldLabel}>Email</label><input style={S.input} name="email" type="email" placeholder="hello@example.com" value={form.email} onChange={handle} required /></div>
      <div style={S.fieldGroup}><label style={S.fieldLabel}>Location</label><input style={S.input} name="location" type="text" placeholder="City, Country" value={form.location} onChange={handle} /></div>
      <div style={S.fieldGroup}><label style={S.fieldLabel}>Website</label><input style={S.input} name="website" type="url" placeholder="https://" value={form.website} onChange={handle} /></div>
      <div style={S.fieldGroup}><label style={S.fieldLabel}>Mission statement</label><p style={S.fieldNote}>What does your journal publish? What is its sensibility? Be specific.</p><textarea style={S.textarea} name="mission_statement" placeholder="We publish..." value={form.mission_statement} onChange={handle} required /></div>
      <div style={S.fieldGroup}><label style={S.fieldLabel}>Do you pay contributors?</label><input style={S.input} name="pays" type="text" placeholder="Yes / No / Sometimes" value={form.pays} onChange={handle} /></div>
      <div style={S.fieldGroup}><label style={S.fieldLabel}>Current reading status</label><input style={S.input} name="reading_status" type="text" placeholder="Open / Closed / Rolling" value={form.reading_status} onChange={handle} /></div>
      <button style={S.submit} type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Register journal'}</button>
      <p style={S.note}>Journal registration is free. Registered journals appear in the Garden directory and can discover writers through the platform.</p>
    </form>
  );
}

function ResidencyForm() {
  const [form, setForm] = useState({ name: '', contact_name: '', contact_email: '', bio: '', project: '', duration: '', needs: '', statement: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault(); setLoading(true); setError('');
    const { error: err } = await supabase.from('residency_applications').insert({
      name: form.name,
      email: form.contact_email,
      bio: form.bio,
      project: form.project,
      duration: form.duration,
      needs: form.needs,
      statement: form.statement,
      status: 'pending',
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setSubmitted(true);
  }
  if (submitted) return (
    <div style={S.form}>
      <p style={{ ...S.body, backgroundColor: '#EDE1D5', padding: '1rem 1.25rem', borderLeft: '3px solid #c5bdb4' }}>
        <strong>Application received.</strong> Thank you for applying to the Residency Programme. We aim to respond within eight weeks.
      </p>
    </div>
  );
  return (
    <form style={S.form} onSubmit={handleSubmit}>
      {error && <p style={{ color: '#9b2335', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}
      <p style={{ ...S.body, backgroundColor: '#EDE1D5', padding: '1rem 1.25rem', borderLeft: '3px solid #c5bdb4' }}>The 2025-26 Residency Programme is now open for applications. Two to three journals will be selected. Selection is based solely on quality. There is no application fee.</p>
      <div style={S.fieldGroup}><label style={S.fieldLabel}>Journal name</label><input style={S.input} name="name" type="text" placeholder="Journal name" value={form.name} onChange={handle} required /></div>
      <div style={S.fieldGroup}><label style={S.fieldLabel}>Contact name</label><input style={S.input} name="contact_name" type="text" placeholder="Editor or contact name" value={form.contact_name} onChange={handle} required /></div>
      <div style={S.fieldGroup}><label style={S.fieldLabel}>Contact email</label><input style={S.input} name="contact_email" type="email" placeholder="hello@example.com" value={form.contact_email} onChange={handle} required /></div>
      <div style={S.fieldGroup}><label style={S.fieldLabel}>Link to a recent issue</label><p style={S.fieldNote}>Digital or physical. A PDF is fine.</p><input style={S.input} name="bio" type="url" placeholder="https://" value={form.bio} onChange={handle} /></div>
      <div style={S.fieldGroup}><label style={S.fieldLabel}>Mission statement</label><p style={S.fieldNote}>What is your journal for? What does it believe about writing?</p><textarea style={S.textarea} name="project" placeholder="" value={form.project} onChange={handle} required /></div>
      <div style={S.fieldGroup}><label style={S.fieldLabel}>Why now?</label><p style={S.fieldNote}>What is your journal trying to do that it does not yet have the infrastructure for?</p><textarea style={{ ...S.textarea, minHeight: '160px' }} name="statement" placeholder="" value={form.statement} onChange={handle} required /></div>
      <button style={S.submit} type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit application'}</button>
      <p style={S.note}>Applications are reviewed by the Page Gallery Editions editorial team. We aim to respond within eight weeks. All applications are read in full.</p>
    </form>
  );
}

function TilthForm() {
  const [form, setForm] = useState({ name: '', email: '', genre: '', dates: '', context: '', sample: '', why_tilth: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault(); setLoading(true); setError('');
    const { error: err } = await supabase.from('tilth_submissions').insert({
      name: form.name, email: form.email, bio: form.context, genre: form.genre, sample: form.sample, why_tilth: form.why_tilth, dates: form.dates, status: 'pending',
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setSubmitted(true);
  }
  if (submitted) return (
    <div style={S.form}>
      <p style={{ ...S.body, backgroundColor: '#EDE1D5', padding: '1rem 1.25rem', borderLeft: '3px solid #c5bdb4' }}>
        <strong>Submission received.</strong> We read everything. We respond to everything, though response times vary.
      </p>
    </div>
  );
  return (
    <form style={S.form} onSubmit={handleSubmit}>
      {error && <p style={{ color: '#9b2335', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}
      <p style={{ ...S.body, backgroundColor: '#EDE1D5', padding: '1rem 1.25rem', borderLeft: '3px solid #c5bdb4' }}>Tilth publishes when the work demands it. We do not maintain a reading queue. We accept unsolicited submissions. All work must be previously unpublished.</p>
      <div style={S.fieldGroup}><label style={S.fieldLabel}>Name</label><input style={S.input} name="name" type="text" placeholder="Your name" value={form.name} onChange={handle} required /></div>
      <div style={S.fieldGroup}><label style={S.fieldLabel}>Email</label><input style={S.input} name="email" type="email" placeholder="hello@example.com" value={form.email} onChange={handle} required /></div>
      <div style={S.fieldGroup}><label style={S.fieldLabel}>Title of the work</label><input style={S.input} name="genre" type="text" placeholder="" value={form.genre} onChange={handle} required /></div>
      <div style={S.fieldGroup}><label style={S.fieldLabel}>When was the work written?</label><p style={S.fieldNote}>Start date and finish date. All Tilth submissions must include dates.</p><input style={S.input} name="dates" type="text" placeholder="e.g. October 2024 - February 2025" value={form.dates} onChange={handle} /></div>
      <div style={S.fieldGroup}><label style={S.fieldLabel}>Context account (half a page)</label><p style={S.fieldNote}>What were you doing as you wrote this? What were the circumstances? This is a co-equal text, not a cover letter.</p><textarea style={{ ...S.textarea, minHeight: '200px' }} name="context" placeholder="" value={form.context} onChange={handle} required /></div>
      <div style={S.fieldGroup}><label style={S.fieldLabel}>The work</label><p style={S.fieldNote}>Paste the full text below, or include a link to a PDF.</p><textarea style={{ ...S.textarea, minHeight: '300px' }} name="sample" placeholder="" value={form.sample} onChange={handle} required /></div>
      <button style={S.submit} type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit to Tilth'}</button>
      <p style={S.note}>We read everything. We respond to everything, though response times vary. We pay contributors at rates informed by ALCS and established journal standards.</p>
    </form>
  );
}

const TABS: { key: ApplyType; label: string }[] = [
  { key: 'writer', label: 'Join as writer' },
  { key: 'journal', label: 'Register a journal' },
  { key: 'residency', label: 'Apply for residency' },
  { key: 'tilth', label: 'Submit to Tilth' },
];

export function Apply() {
  const [active, setActive] = useState<ApplyType>('writer');

  return (
    <div style={S.page}>
      <WatercolorBackground seed={6} />
      <Nav />

      <div style={S.hero}>
        <p style={S.label}>Page Gallery Editions</p>
        <h1 style={S.h1}>Enter the Garden.</h1>
        <p style={S.body}>
          Four pathways into the Page Gallery Editions ecosystem.
          Choose the one that fits where you are.
        </p>
      </div>

      <div style={S.tabs}>
        {TABS.map(t => (
          <button
            key={t.key}
            style={active === t.key ? S.tabActive : S.tab}
            onClick={() => setActive(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {active === 'writer' && <WriterForm />}
      {active === 'journal' && <JournalForm />}
      {active === 'residency' && <ResidencyForm />}
      {active === 'tilth' && <TilthForm />}
    </div>
  );
}
