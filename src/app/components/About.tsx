/**
 * About — Page Gallery Editions
 * The full argument. Not a mission statement. Not a press release.
 */
import { Link } from 'react-router';
import { Nav } from './Nav';

const FAQS = [
  {
    q: 'Who can join the Garden?',
    a: 'Any writer or journal editor. The Garden is free and open to anyone with a genuine interest in literary work. There is no application process for basic membership.'
  },
  {
    q: 'Is Page Gallery Editions a publisher?',
    a: 'Not in the conventional sense. We operate as a literary institution that connects writers, journals, and readers. Tilth editions are published selectively when work demands physical form.'
  },
  {
    q: 'How does the Residency Programme work?',
    a: 'Two to three journals are selected per annual cycle. Residents receive editorial mentorship, design support, printing partnerships, and a stipend. Applications open each autumn.'
  },
  {
    q: 'Do I need to be based in London or New York?',
    a: 'No. The institution operates between these cities, but Garden members and residency applicants can be located anywhere. Some residency activities may involve travel.'
  },
  {
    q: 'What does it cost?',
    a: 'The Garden is free. The Residency Programme is fully funded—residents receive support, not invoices. Tilth editions are sold at cost to sustain printing.'
  },
  {
    q: 'How do journals get listed in the directory?',
    a: 'Any independent literary journal can register through the Garden. We ask for a coherent editorial vision and at least one published issue. Registration is not the same as residency selection.'
  },
];

const S: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', backgroundColor: '#faf8f5', fontFamily: 'Georgia, serif', color: '#1a1714' },
  hero: { padding: '5rem 3rem 4rem', borderBottom: '1px solid #e8e4df', maxWidth: '720px' },
  label: { fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#7a7067', marginBottom: '1.5rem' },
  h1: { fontSize: '2.5rem', fontWeight: 400, margin: '0 0 2rem', lineHeight: 1.15 },
  body: { fontSize: '1.05rem', lineHeight: 1.85, color: '#3d3830', marginBottom: '1.5rem', maxWidth: '640px' },
  section: { padding: '4rem 3rem', borderBottom: '1px solid #e8e4df', maxWidth: '720px' },
  h2: { fontSize: '1.1rem', fontWeight: 400, margin: '0 0 1.5rem', letterSpacing: '0.01em', color: '#1a1714' },
  epigraph: {
    margin: '2rem 0',
    paddingLeft: '2rem',
    borderLeft: '2px solid #e8e4df',
    fontSize: '1rem',
    lineHeight: 1.8,
    color: '#3d3830',
    fontStyle: 'italic',
  },
  epigraphSource: { display: 'block', marginTop: '0.75rem', fontSize: '0.8rem', color: '#7a7067', fontStyle: 'normal', letterSpacing: '0.02em' },
  footer: { padding: '4rem 3rem', display: 'flex', gap: '3rem', flexWrap: 'wrap' as const },
  footerLink: { fontSize: '0.85rem', color: '#1a1714', borderBottom: '1px solid #c5bdb4', textDecoration: 'none', paddingBottom: '2px' },
  contact: { padding: '3rem', backgroundColor: '#f2ede8', borderTop: '1px solid #e8e4df' },
  contactInner: { maxWidth: '640px' },
  faqSection: { padding: '4rem 3rem', borderBottom: '1px solid #e8e4df', maxWidth: '720px' },
  faqItem: { marginBottom: '2rem' },
  faqQuestion: { fontSize: '1rem', fontWeight: 600, color: '#1a1714', marginBottom: '0.5rem', lineHeight: 1.4 },
  faqAnswer: { fontSize: '0.95rem', lineHeight: 1.8, color: '#3d3830', maxWidth: '640px' },
};

export function About() {
  return (
    <div style={S.page}>
      <Nav />

      <section style={S.hero}>
        <p style={S.label}>Page Gallery Editions</p>
        <h1 style={S.h1}>The full argument.</h1>
        <p style={S.body}>
          Page Gallery Editions is a literary institution operating between London and New York.
          It is not a journal. It is not a community platform. It is not a press in the conventional sense.
          It is an institution that holds a conviction about what writing is and where it lives.
        </p>
        <p style={S.body}>
          The conviction is this: the life around the poem is worth printing.
          The note that trails off, the third coffee, the friend who called just before the line came
          — literary culture has always published the poem and discarded the rest.
          Page Gallery Editions treats the rest as the substance.
        </p>
      </section>

      <section style={S.section}>
        <h2>The Garden</h2>
        <p style={S.body}>
          The Garden is the rarest thing in contemporary literary culture:
          a place that is not trying to publish you.
          Every other writing community — every workshop, every course, every residency,
          every platform — is organised, consciously or not, around the production of publishable work.
          The Garden refuses that logic.
        </p>
        <p style={S.body}>
          It is a space where writing can exist without destination.
          The draft abandoned after three pages, the poem that doesn't work yet,
          the dated journal entry that nobody will ever read — these are treated as
          the actual substance of a writing life, not as waste material on the way to something real.
        </p>
        <p style={S.body}>
          The Garden connects writers and journals. It is not a submissions portal.
          It is a community with a sensibility.
        </p>
      </section>

      <section style={S.section}>
        <h2>The Journal Ecosystem</h2>
        <p style={S.body}>
          The Page Gallery works with independent literary journals: as a partner, as a supporter,
          as a connector to printing cooperatives, design resources, and distribution networks.
          Any journal may register in the Garden. Not every journal will be invited to residency.
        </p>
        <p style={S.body}>
          The Residency Programme is the institution's most distinctive function.
          Selected journals — two to three per annual cycle — are invited into formal residence.
          They receive editorial mentorship, design support, printing partnerships, and a stipend.
          The institution pays to be associated with work it believes in.
        </p>
        <p style={S.body}>
          Some resident journals may eventually become Page Gallery Editions imprints.
          The journals absorbed will be few. The selectivity is the guarantee.
        </p>
      </section>

      <section style={S.section}>
        <h2>Tilth</h2>
        <p style={S.body}>
          Tilth is Old English: the condition of soil that has been worked.
          Cultivated earth, ready for planting. The institution tills.
          Writers work the same material again and again until it bears.
        </p>
        <p style={S.body}>
          Tilth is the mark of excellence the institution produces when it encounters
          something that cannot be ignored. Fully illustrated chapbooks, published
          when the work demands to exist as a physical object under this imprint.
          There is no schedule. There is no list. There is only the deliberate act.
        </p>
        <blockquote style={S.epigraph}>
          August 2, 1914. Germany has declared war on Russia. Went swimming in the afternoon.
          <cite style={S.epigraphSource}>— Franz Kafka, diary</cite>
        </blockquote>
        <p style={S.body}>
          The proliferation of literary magazines has been, on balance, good for writers
          and bad for readers. There are more places to publish than ever before.
          Being in a journal no longer tells a reader very much.
          Being in Tilth does — because the institution behind it has earned the right to mark,
          and because it marks rarely.
        </p>
      </section>

      <section style={S.section}>
        <h2>London / New York</h2>
        <p style={S.body}>
          The institution operates between London and New York not as a gesture
          toward internationalism but as a structural fact. The literary ecosystems
          of these two cities are the most significant English-language publishing environments
          in the world. Residency in both is not optional: it is the institution's
          basic claim on relevance.
        </p>
      </section>

      <section style={S.faqSection}>
        <h2>Frequently Asked Questions</h2>
        {FAQS.map((faq, i) => (
          <div key={i} style={S.faqItem}>
            <p style={S.faqQuestion}>{faq.q}</p>
            <p style={S.faqAnswer}>{faq.a}</p>
          </div>
        ))}
      </section>

      <div style={S.contact}>
        <div style={S.contactInner}>
          <p style={{ ...S.label, marginBottom: '1rem' }}>Contact</p>
          <p style={{ ...S.body, fontSize: '0.9rem' }}>
            For submissions, journal registration, residency applications, or press enquiries:
          </p>
          <p style={{ fontSize: '0.9rem', color: '#1a1714' }}>hello@pagegallery.co</p>
        </div>
      </div>

      <div style={S.footer}>
        <Link to="/apply" style={S.footerLink}>Apply / Register</Link>
        <Link to="/residency" style={S.footerLink}>Residency Programme</Link>
        <Link to="/editions" style={S.footerLink}>Tilth Editions</Link>
        <Link to="/journals" style={S.footerLink}>Journal Directory</Link>
      </div>
    </div>
  );
}
