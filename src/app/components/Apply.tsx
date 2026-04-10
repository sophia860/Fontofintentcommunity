/**
 * Apply — Page Gallery Editions
 * Three pathways: writer, journal, residency.
 * One form, clearly structured.
 */
import { useState } from 'react';
import { Nav } from './Nav';

type ApplyType = 'writer' | 'journal' | 'residency' | 'tilth';

const S: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', backgroundColor: '#faf8f5', fontFamily: 'Georgia, serif', color: '#1a1714' },
  hero: { padding: '5rem 3rem 3rem', borderBottom: '1px solid #e8e4df' },
  label: { fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#7a7067', marginBottom: '1rem' },
  h1: { fontSize: '2.5rem', fontWeight: 400, margin: '0 0 1.5rem', lineHeight: 1.15 },
  body: { fontSize: '0.95rem', lineHeight: 1.75, color: '#3d3830', maxWidth: '520px', marginBottom: '1.5rem' },
  tabs: { display: 'flex', gap: '0', borderBottom: '1px solid #e8e4df', padding: '0 3rem', marginBottom: '0' },
  tab: { padding: '1rem 1.5rem 1rem', fontSize: '0.85rem', cursor: 'pointer', border: 'none', backgroundColor: 'transparent', fontFamily: 'Georgia, serif', color: '#7a7067', borderBottom: '2px solid transparent', marginBottom: '-1px' },
  tabActive: { padding: '1rem 1.5rem 1rem', fontSize: '0.85rem', cursor: 'pointer', border: 'none', backgroundColor: 'transparent', fontFamily: 'Georgia, serif', color: '#1a1714', borderBottom: '2px solid #1a1714', marginBottom: '-1px', fontWeight: 700 },
  form: { padding: '3rem', maxWidth: '600px' },
  fieldGroup: { marginBottom: '2rem' },
  fieldLabel: { display: 'block', fontSize: '0.8rem', letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: '#3d3830', marginBottom: '0.5rem' },
  fieldNote: { fontSize: '0.78rem', color: '#7a7067', marginBottom: '0.5rem', lineHeight: 1.5 },
  input: { width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #c5bdb4', backgroundColor: '#faf8f5', fontFamily: 'Georgia, serif', fontSize: '0.9rem', color: '#1a1714', outline: 'none', boxSizing: 'border-box' as const },
  textarea: { width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #c5bdb4', backgroundColor: '#faf8f5', fontFamily: 'Georgia, serif', fontSize: '0.9rem', color: '#1a1714', outline: 'none', resize: 'vertical' as const, minHeight: '120px', boxSizing: 'border-box' as const },
  submit: { fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase' as const, color: '#faf8f5', backgroundColor: '#1a1714', padding: '0.75rem 1.75rem', border: 'none', cursor: 'pointer', fontFamily: 'Georgia, serif' },
  note: { fontSize: '0.8rem', color: '#7a7067', lineHeight: 1.6, marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e8e4df', maxWidth: '520px' },
};

function WriterForm() {
  return (
    <div style={S.form}>
      <div style={S.fieldGroup}>
        <label style={S.fieldLabel}>Name</label>
        <input style={S.input} type="text" placeholder="Your name" />
      </div>
      <div style={S.fieldGroup}>
        <label style={S.fieldLabel}>Email</label>
        <input style={S.input} type="email" placeholder="hello@example.com" />
      </div>
      <div style={S.fieldGroup}>
        <label style={S.fieldLabel}>Location</label>
        <input style={S.input} type="text" placeholder="City, Country" />
      </div>
      <div style={S.fieldGroup}>
        <label style={S.fieldLabel}>Forms you work in</label>
        <p style={S.fieldNote}>e.g. poetry, fiction, lyric essay, hybrid, translation</p>
        <input style={S.input} type="text" placeholder="poetry, essay" />
      </div>
      <div style={S.fieldGroup}>
        <label style={S.fieldLabel}>Short bio</label>
        <p style={S.fieldNote}>Two or three sentences. Tell us what you’re working on right now.</p>
        <textarea style={S.textarea} placeholder="I am currently working on..." />
      </div>
      <div style={S.fieldGroup}>
        <label style={S.fieldLabel}>Website or sample work (optional)</label>
        <input style={S.input} type="url" placeholder="https://" />
      </div>
      <button style={S.submit}>Enter the Garden</button>
      <p style={S.note}>
        The Garden is free for writers. Your profile will be visible to journals registered
        in the ecosystem. You can update or remove it at any time.
      </p>
    </div>
  );
}

function JournalForm() {
  return (
    <div style={S.form}>
      <div style={S.fieldGroup}>
        <label style={S.fieldLabel}>Journal name</label>
        <input style={S.input} type="text" placeholder="Journal name" />
      </div>
      <div style={S.fieldGroup}>
        <label style={S.fieldLabel}>Primary editor / contact</label>
        <input style={S.input} type="text" placeholder="Name" />
      </div>
      <div style={S.fieldGroup}>
        <label style={S.fieldLabel}>Email</label>
        <input style={S.input} type="email" placeholder="hello@example.com" />
      </div>
      <div style={S.fieldGroup}>
        <label style={S.fieldLabel}>Location</label>
        <input style={S.input} type="text" placeholder="City, Country" />
      </div>
      <div style={S.fieldGroup}>
        <label style={S.fieldLabel}>Website</label>
        <input style={S.input} type="url" placeholder="https://" />
      </div>
      <div style={S.fieldGroup}>
        <label style={S.fieldLabel}>Mission statement</label>
        <p style={S.fieldNote}>What does your journal publish? What is its sensibility? Be specific.</p>
        <textarea style={S.textarea} placeholder="We publish..." />
      </div>
      <div style={S.fieldGroup}>
        <label style={S.fieldLabel}>Do you pay contributors?</label>
        <input style={S.input} type="text" placeholder="Yes / No / Sometimes — and at what rate" />
      </div>
      <div style={S.fieldGroup}>
        <label style={S.fieldLabel}>Current reading status</label>
        <input style={S.input} type="text" placeholder="Open / Closed / Rolling" />
      </div>
      <button style={S.submit}>Register journal</button>
      <p style={S.note}>
        Journal registration is free. Registered journals appear in the Garden directory
        and can discover writers through the platform. Registration does not constitute
        endorsement or guarantee of residency consideration.
      </p>
    </div>
  );
}

function ResidencyForm() {
  return (
    <div style={S.form}>
      <p style={{ ...S.body, backgroundColor: '#f2ede8', padding: '1rem 1.25rem', borderLeft: '3px solid #c5bdb4' }}>
        The 2025–26 Residency Programme is now open for applications.
        Two to three journals will be selected. Selection is based solely on quality.
        There is no application fee.
      </p>
      <div style={S.fieldGroup}>
        <label style={S.fieldLabel}>Journal name</label>
        <input style={S.input} type="text" placeholder="Journal name" />
      </div>
      <div style={S.fieldGroup}>
        <label style={S.fieldLabel}>Contact name and email</label>
        <input style={S.input} type="text" placeholder="Name — email@example.com" />
      </div>
      <div style={S.fieldGroup}>
        <label style={S.fieldLabel}>Link to a recent issue</label>
        <p style={S.fieldNote}>Digital or physical. A PDF is fine.</p>
        <input style={S.input} type="url" placeholder="https://" />
      </div>
      <div style={S.fieldGroup}>
        <label style={S.fieldLabel}>Mission statement</label>
        <p style={S.fieldNote}>What is your journal for? What does it believe about writing?</p>
        <textarea style={S.textarea} placeholder="" />
      </div>
      <div style={S.fieldGroup}>
        <label style={S.fieldLabel}>Why now?</label>
        <p style={S.fieldNote}>
          What is your journal trying to do that it doesn’t yet have the infrastructure for?
          What would a year in residence with Page Gallery Editions make possible?
        </p>
        <textarea style={{ ...S.textarea, minHeight: '160px' }} placeholder="" />
      </div>
      <button style={S.submit}>Submit application</button>
      <p style={S.note}>
        Applications are reviewed by the Page Gallery Editions editorial team.
        We aim to respond within eight weeks. All applications are read in full.
      </p>
    </div>
  );
}

function TilthForm() {
  return (
    <div style={S.form}>
      <p style={{ ...S.body, backgroundColor: '#f2ede8', padding: '1rem 1.25rem', borderLeft: '3px solid #c5bdb4' }}>
        Tilth publishes when the work demands it. We do not maintain a reading queue.
        We accept unsolicited submissions and review them when we can.
        All work must be previously unpublished.
      </p>
      <div style={S.fieldGroup}>
        <label style={S.fieldLabel}>Name</label>
        <input style={S.input} type="text" placeholder="Your name" />
      </div>
      <div style={S.fieldGroup}>
        <label style={S.fieldLabel}>Email</label>
        <input style={S.input} type="email" placeholder="hello@example.com" />
      </div>
      <div style={S.fieldGroup}>
        <label style={S.fieldLabel}>Title of the work</label>
        <input style={S.input} type="text" placeholder="" />
      </div>
      <div style={S.fieldGroup}>
        <label style={S.fieldLabel}>When was the work written?</label>
        <p style={S.fieldNote}>Start date and finish date. All Tilth submissions must include dates.</p>
        <input style={S.input} type="text" placeholder="e.g. October 2024 – February 2025" />
      </div>
      <div style={S.fieldGroup}>
        <label style={S.fieldLabel}>Context account (half a page)</label>
        <p style={S.fieldNote}>
          What were you doing as you wrote this? What led you to write it?
          What was happening around you? This is a co-equal text, not a cover letter.
        </p>
        <textarea style={{ ...S.textarea, minHeight: '200px' }} placeholder="" />
      </div>
      <div style={S.fieldGroup}>
        <label style={S.fieldLabel}>The work</label>
        <p style={S.fieldNote}>Paste the full text below, or include a link to a PDF.</p>
        <textarea style={{ ...S.textarea, minHeight: '300px' }} placeholder="" />
      </div>
      <button style={S.submit}>Submit to Tilth</button>
      <p style={S.note}>
        We read everything. We respond to everything, though response times vary.
        We pay contributors at rates informed by ALCS and established journal standards.
      </p>
    </div>
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
