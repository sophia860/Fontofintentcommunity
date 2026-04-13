/**
 * TypographicScrollPage
 * —————————————————————————————————————————————————————————
 * Editorial broadsheet typographic scroll choreography.
 * Each section is a kinetic act: scale hierarchy, arc text,
 * per-word stagger, and manifesto builds.
 *
 * motion/react (Framer Motion v12) — whileInView only, no scroll hooks.
 * No new packages. Single file, inline helpers.
 */

import { motion } from 'motion/react';
import { Link } from 'react-router';
import { Nav } from './Nav';

// ─── Shared easing curve ─────────────────────────────────────────────────────
const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

// ─── Named design tokens ─────────────────────────────────────────────────────
const EDITORIAL_ACCENT_RED = '#B71C1C';

// ─── Inline helper: per-word stagger animation ───────────────────────────────
function SplitWordsIn({
  text,
  baseDelay = 0,
  delayPerWord = 0.03,
}: {
  text: string;
  baseDelay?: number;
  delayPerWord?: number;
}) {
  const words = text.split(' ');
  return (
    <>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.48,
            delay: baseDelay + i * delayPerWord,
            ease: 'easeOut',
          }}
          style={{ display: 'inline-block', marginRight: '0.3em' }}
        >
          {word}
        </motion.span>
      ))}
    </>
  );
}

// ─── Inline helper: decorative dashed organic curve ──────────────────────────
function DecorativeCurve({
  style,
}: {
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 800 120"
      style={{
        width: '100%',
        maxWidth: '600px',
        display: 'block',
        margin: '0 auto',
        ...style,
      }}
      aria-hidden="true"
    >
      <path
        d="M 100,20 C 200,80 350,10 500,60 S 700,10 750,40"
        stroke="#c5bdb4"
        strokeWidth="1.5"
        strokeDasharray="4 6"
        fill="none"
      />
    </svg>
  );
}

// ─── Inline helper: vertical squiggle for between-columns decoration ──────────
function VerticalSquiggle() {
  return (
    <svg
      viewBox="0 0 20 180"
      style={{ width: '20px', height: '180px' }}
      aria-hidden="true"
    >
      <path
        d="M 10,0 C 0,30 20,60 10,90 S 0,120 10,150 S 20,165 10,180"
        stroke="#c5bdb4"
        strokeWidth="1.5"
        strokeDasharray="4 6"
        fill="none"
      />
    </svg>
  );
}

// ─── Kinetic scale words config ───────────────────────────────────────────────
const KINETIC_WORDS: Array<{
  text: string;
  targetOpacity: number;
  style: React.CSSProperties;
}> = [
  {
    text: 'arrival.',
    targetOpacity: 0.55,
    style: {
      fontSize: '0.9rem',
      letterSpacing: '0.28em',
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontWeight: 400,
      color: '#6b6460',
    },
  },
  {
    text: 'for my',
    targetOpacity: 1,
    style: {
      fontSize: '1.6rem',
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontWeight: 400,
    },
  },
  {
    text: 'I wait',
    targetOpacity: 1,
    style: {
      fontSize: '2.8rem',
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontWeight: 400,
    },
  },
  {
    text: 'myself,',
    targetOpacity: 1,
    style: {
      fontSize: '5rem',
      fontStyle: 'italic',
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontWeight: 400,
      lineHeight: 1.05,
    },
  },
  {
    text: 'beyond',
    targetOpacity: 1,
    style: {
      fontSize: '8rem',
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontWeight: 700,
      lineHeight: 1,
    },
  },
  {
    text: 'Somewhere,',
    targetOpacity: 1,
    style: {
      fontSize: 'clamp(5rem, 18vw, 14rem)',
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontWeight: 700,
      lineHeight: 1,
    },
  },
];

// ─── Main component ───────────────────────────────────────────────────────────
export function TypographicScrollPage() {
  return (
    <div
      style={{
        backgroundColor: '#FAF7F2',
        color: '#1a1714',
        overflowX: 'hidden',
        minHeight: '100vh',
      }}
    >
      <Nav />

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 1 — Kinetic Scale Hero
          The poem emerges from nothing, word by word, growing from a whisper
          to a shout. Breathing room above, kinetic mass below.
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        style={{
          minHeight: '100vh',
          padding: '0 8vw',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* Top — vast breathing room + tiny label */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: '20vh',
            gap: '1.25rem',
          }}
        >
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 0.4, ease: 'easeOut' }}
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: '0.7rem',
              letterSpacing: '0.38em',
              textTransform: 'uppercase',
              color: '#9c9188',
              margin: 0,
            }}
          >
            a typographic journey
          </motion.p>

          {/* Subtle scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.6, delay: 0.9 }}
            style={{ color: '#b0a89e' }}
          >
            <motion.svg
              width="18"
              height="30"
              viewBox="0 0 18 30"
              fill="none"
              aria-hidden="true"
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <line x1="9" y1="0" x2="9" y2="24" stroke="#b0a89e" strokeWidth="1" />
              <polyline
                points="3,18 9,26 15,18"
                stroke="#b0a89e"
                strokeWidth="1"
                fill="none"
              />
            </motion.svg>
          </motion.div>
        </div>

        {/* Bottom — kinetic scale sequence */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            paddingBottom: '14vh',
            gap: '0.25rem',
          }}
        >
          {KINETIC_WORDS.map((item, i) => (
            <motion.div
              key={item.text}
              initial={{ opacity: 0, y: 60, scale: 0.85 }}
              whileInView={{
                opacity: item.targetOpacity,
                y: 0,
                scale: 1,
              }}
              viewport={{ once: true, margin: '-8% 0px' }}
              transition={{
                duration: 0.8,
                delay: i * 0.14,
                ease: EASE_OUT_EXPO,
              }}
              style={item.style}
            >
              {item.text}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 2 — Arc Text / Editorial Bridge
          Typography curves through space. The phrase rides an invisible arch —
          letters bowing to the weight of meaning.
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        style={{
          minHeight: '80vh',
          padding: '20vh 6vw',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3.5rem',
        }}
      >
        {/* Arc text SVG — phrase curving upward along a smooth arch */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
          style={{ width: '100%', maxWidth: '920px' }}
        >
          <svg
            viewBox="0 0 800 200"
            style={{ width: '100%', overflow: 'visible' }}
            aria-labelledby="arc-bridge-label"
          >
            <title id="arc-bridge-label">
              the life around the poem is worth printing
            </title>
            <defs>
              <path id="arc-up-path" d="M 20,160 Q 400,20 780,160" />
            </defs>
            <text fill="#3d3830" style={{ fontFamily: 'Georgia, serif', fontSize: '22px', letterSpacing: '2px' }}>
              <textPath href="#arc-up-path" startOffset="50%" textAnchor="middle">
                the life around the poem is worth printing
              </textPath>
            </text>
          </svg>
        </motion.div>

        {/* Thin editorial rule — purely decorative */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, delay: 0.2, ease: 'easeOut' }}
          style={{
            width: '1px',
            height: '60px',
            backgroundColor: '#d4cdc7',
            transformOrigin: 'top center',
          }}
        />

        {/* Decorative dashed organic curve */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.0, delay: 0.4 }}
          style={{ width: '100%' }}
        >
          <DecorativeCurve />
        </motion.div>

        {/* Small editorial stamp */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.5 }}
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: '0.72rem',
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: '#a8a09a',
            margin: 0,
          }}
        >
          Page Gallery Editions — Est. 1992
        </motion.p>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 3 — Two-Column Editorial
          Two thoughts that don't quite meet but know about each other.
          Offset vertically, connected by a thin squiggle of intent.
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        style={{
          minHeight: '100vh',
          padding: '15vh 8vw',
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '2rem',
              alignItems: 'flex-start',
            }}
          >
            {/* Block A — left */}
            <div style={{ flex: '1 1 340px', minWidth: '280px' }}>
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.85, ease: 'easeOut' }}
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontSize: 'clamp(1.6rem, 2.5vw, 2rem)',
                  fontStyle: 'italic',
                  color: EDITORIAL_ACCENT_RED,
                  fontWeight: 400,
                  marginBottom: '1.6rem',
                  lineHeight: 1.2,
                }}
              >
                Lay the groundwork
              </motion.div>
              <div
                style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: '1.05rem',
                  lineHeight: 1.88,
                  color: '#3d3830',
                  maxWidth: '44ch',
                }}
              >
                <SplitWordsIn
                  text="For your project to be a success, we need to know as much about your vision as possible. This is where we learn your goals and what you need to achieve."
                  baseDelay={0.12}
                />
              </div>
            </div>

            {/* Between — vertical organic squiggle */}
            <div
              style={{
                flex: '0 0 auto',
                display: 'flex',
                alignItems: 'center',
                paddingTop: '3rem',
                paddingLeft: '1rem',
                paddingRight: '1rem',
                opacity: 0.7,
              }}
            >
              <motion.div
                initial={{ opacity: 0, scaleY: 0 }}
                whileInView={{ opacity: 1, scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.0, delay: 0.3, ease: 'easeOut' }}
                style={{ transformOrigin: 'top center' }}
              >
                <VerticalSquiggle />
              </motion.div>
            </div>

            {/* Block B — right, offset lower */}
            <div
              style={{
                flex: '1 1 340px',
                minWidth: '280px',
                marginTop: '8rem',
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.85, delay: 0.08, ease: 'easeOut' }}
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontSize: 'clamp(1.6rem, 2.5vw, 2rem)',
                  fontStyle: 'italic',
                  color: EDITORIAL_ACCENT_RED,
                  fontWeight: 400,
                  marginBottom: '1.6rem',
                  lineHeight: 1.2,
                }}
              >
                Set a course
              </motion.div>
              <div
                style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: '1.05rem',
                  lineHeight: 1.88,
                  color: '#3d3830',
                  maxWidth: '44ch',
                }}
              >
                <SplitWordsIn
                  text="No great work was ever created without intention. Your vision is the exact same way. Based on everything we've learned about you, we chart a path forward."
                  baseDelay={0.18}
                />
              </div>
            </div>
          </div>

          {/* Below-columns dashed curve — slightly different angle */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, delay: 0.2 }}
            style={{ marginTop: '6rem' }}
          >
            <DecorativeCurve style={{ maxWidth: '800px', transform: 'scaleX(-1)' }} />
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 4 — Manifesto Stagger
          Four phrases, each arriving from the left like a train of thought
          that started somewhere else. Growing. Building. Landing.
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        style={{
          minHeight: '80vh',
          padding: '20vh 6vw',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        {/* Prelude stamp */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: '0.68rem',
            letterSpacing: '0.42em',
            textTransform: 'uppercase',
            color: '#9c9188',
            margin: '0 0 3.5rem 0',
          }}
        >
          Page Gallery Editions
        </motion.p>

        {/* Phrase 1 — medium */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.88, delay: 0.1, ease: EASE_OUT_EXPO }}
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: 'clamp(2rem, 5vw, 4rem)',
            color: '#2d2a27',
            lineHeight: 1.15,
            marginBottom: '0.3rem',
          }}
        >
          the draft
        </motion.div>

        {/* Phrase 2 — larger, italic */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.88, delay: 0.3, ease: EASE_OUT_EXPO }}
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: 'clamp(3rem, 7vw, 6rem)',
            fontStyle: 'italic',
            color: '#1a1714',
            lineHeight: 1.05,
            marginBottom: '0.3rem',
          }}
        >
          abandoned
        </motion.div>

        {/* Phrase 3 — pullback to medium */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.88, delay: 0.5, ease: EASE_OUT_EXPO }}
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: '#4a4540',
            lineHeight: 1.2,
            marginBottom: '0.5rem',
          }}
        >
          after three pages,
        </motion.div>

        {/* Phrase 4 — the landing. largest. heaviest. */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.92, delay: 0.7, ease: EASE_OUT_EXPO }}
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: 'clamp(4rem, 10vw, 8rem)',
            fontWeight: 700,
            color: '#1a1714',
            lineHeight: 1,
            marginTop: '0.4rem',
          }}
        >
          is worth keeping.
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 5 — Arc Quote + Final Word
          The poem descends through a downward arc. Then the word lands.
          One word. Everything.
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        style={{
          minHeight: '60vh',
          padding: '20vh 6vw',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '5rem',
        }}
      >
        {/* Inverted arch SVG — phrase drooping along a downward curve */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.3 }}
          style={{ width: '100%', maxWidth: '880px' }}
        >
          <svg
            viewBox="0 0 800 200"
            style={{ width: '100%', overflow: 'visible' }}
            aria-labelledby="arc-quote-label"
          >
            <title id="arc-quote-label">
              the poem and the life around it, inseparable
            </title>
            <defs>
              <path id="arc-down-path" d="M 20,40 Q 400,180 780,40" />
            </defs>
            <text
              fill="#3d3830"
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: '20px',
                fontStyle: 'italic',
                letterSpacing: '1.5px',
              }}
            >
              <textPath href="#arc-down-path" startOffset="50%" textAnchor="middle">
                the poem and the life around it, inseparable
              </textPath>
            </text>
          </svg>
        </motion.div>

        {/* The word that ends everything */}
        <motion.div
          initial={{ opacity: 0, scale: 1.15 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: EASE_OUT_EXPO }}
          className="serif-heading"
          style={{
            fontSize: 'clamp(4rem, 12vw, 9rem)',
            lineHeight: 1,
            textAlign: 'center',
            color: '#1a1714',
          }}
        >
          SOMEWHERE,
        </motion.div>

        {/* Tiny closing rule */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
          style={{
            width: '40px',
            height: '1px',
            backgroundColor: '#c5bdb4',
            transformOrigin: 'center',
          }}
        />
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FOOTER — Minimal nav anchor, nothing more
      ══════════════════════════════════════════════════════════════════════ */}
      <footer
        style={{
          padding: '6vh 8vw',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
          borderTop: '1px solid #e8e4df',
        }}
      >
        <Link
          to="/"
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: '0.88rem',
            letterSpacing: '0.08em',
            color: '#7a7067',
            textDecoration: 'none',
          }}
        >
          ← Back to Home
        </Link>
        <p
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: '0.72rem',
            color: '#b0a89e',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            margin: 0,
          }}
        >
          Page Gallery Editions
        </p>
      </footer>
    </div>
  );
}
