/**
 * PageGalleryHome — The Page Gallery
 * ─────────────────────────────────────────────────────────────────────────────
 * Immersive scroll experience built on motion/react.
 * Five acts: Hero → Marquee → SOMETHING → Features → Footer.
 *
 * Technique stack:
 *  • Canvas ink-particle system (rAF loop, mouse-reactive)
 *  • Staggered char-by-char reveals (useInView + spring physics)
 *  • Scroll-pinned kinetic typography (useScroll + useTransform)
 *  • Magnetic CTA (spring-pulled toward cursor)
 *  • Editorial hover sweeps on feature cards
 *  • Parallax stamp (scroll-linked y offset)
 */
import { useRef, useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

// ── Design tokens ─────────────────────────────────────────────────────────────

/** Primary body / mono font. Repeated inline because Tailwind purges unused classes. */
const FONT_MONO = "'Fira Code', monospace";

// Typography scale used across the component
const T = {
  label:    { fontFamily: FONT_MONO, fontSize: '0.68rem', letterSpacing: '0.32em' },
  micro:    { fontFamily: FONT_MONO, fontSize: '0.62rem', letterSpacing: '0.28em' },
} as const;

// Particle system limits
const MAX_PARTICLES      = 220;
const MIN_PARTICLE_LIFE  = 90;
const PARTICLE_LIFE_RANGE = 160;  // maxLife = MIN + random * RANGE

// ── Types ─────────────────────────────────────────────────────────────────────
interface InkParticle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  size: number; alpha: number;
}

// ── Ink Particle Canvas ───────────────────────────────────────────────────────
function useInkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    const particles: InkParticle[] = [];
    let tick = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const spawn = (x: number, y: number, n = 2) => {
      for (let i = 0; i < n; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = 0.12 + Math.random() * 0.55;
        particles.push({
          x: x + (Math.random() - 0.5) * 28,
          y: y + (Math.random() - 0.5) * 28,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd - 0.35,
          life: 0,
          maxLife: MIN_PARTICLE_LIFE + Math.random() * PARTICLE_LIFE_RANGE,
          size: 0.8 + Math.random() * 2.2,
          alpha: 0.25 + Math.random() * 0.35,
        });
      }
      if (particles.length > MAX_PARTICLES) particles.splice(0, particles.length - MAX_PARTICLES);
    };

    const onMove = (e: MouseEvent) => {
      if (Math.random() < 0.1) spawn(e.clientX, e.clientY, 2);
    };
    window.addEventListener('mousemove', onMove);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      tick++;
      if (tick % 16 === 0) {
        spawn(
          60 + Math.random() * (canvas.width - 120),
          80 + Math.random() * (canvas.height * 0.65),
          1,
        );
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        if (p.life >= p.maxLife) { particles.splice(i, 1); continue; }
        const t = p.life / p.maxLife;
        const fade = t < 0.18 ? t / 0.18 : t > 0.62 ? (1 - t) / 0.38 : 1;
        p.x += p.vx; p.y += p.vy;
        p.vy += 0.005; p.vx *= 0.988;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - t * 0.35), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(44,40,36,${p.alpha * fade * 0.42})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  return canvasRef;
}

// ── Char Reveal ───────────────────────────────────────────────────────────────
function CharReveal({
  text, delay = 0, style,
}: {
  text: string; delay?: number; style?: CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-4%' });
  return (
    <span ref={ref} aria-label={text} style={{ display: 'block', ...style }}>
      {Array.from(text).map((ch, i) => (
        <motion.span
          key={i}
          style={{ display: 'inline-block', whiteSpace: ch === ' ' ? 'pre' : undefined }}
          initial={{ opacity: 0, y: 52 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: delay + i * 0.027, duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  );
}

// ── Word Reveal ───────────────────────────────────────────────────────────────
function WordReveal({ text, style }: { text: string; style?: CSSProperties }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true, margin: '-4%' });
  return (
    <p ref={ref} aria-label={text} style={{ margin: 0, ...style }}>
      {text.split(' ').map((word, i) => (
        <motion.span
          key={i}
          style={{ display: 'inline-block', marginRight: '0.3em' }}
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: i * 0.032, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {word}
        </motion.span>
      ))}
    </p>
  );
}

// ── Marquee ───────────────────────────────────────────────────────────────────
const MARQUEE =
  'THE PAGE GALLERY  ·  LONDON / DIGITAL  ·  EST 2024  ·  FOR WRITERS  ·  FOR JOURNALS  ·  FOR THE WORK  ·  ';

function Marquee() {
  return (
    <div style={{ overflow: 'hidden', padding: '0.9rem 0', background: '#2C2824' }}>
      <motion.div
        style={{ display: 'flex', whiteSpace: 'nowrap' }}
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 26, ease: 'linear', repeat: Infinity }}
      >
        {[MARQUEE, MARQUEE].map((seg, i) => (
          <span
            key={i}
            style={{
              fontFamily: FONT_MONO,
              fontSize: '0.7rem',
              letterSpacing: '0.22em',
              color: '#F5EDE4',
              paddingRight: 0,
            }}
          >
            {seg}{seg}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ── SOMETHING (scroll-pinned kinetic type) ────────────────────────────────────
function SomethingSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const rawScale  = useTransform(scrollYProgress, [0, 0.42, 1], [0.3, 1.18, 3.0]);
  const opacity   = useTransform(scrollYProgress, [0, 0.12, 0.74, 1], [0, 1, 1, 0]);
  const rawBlur   = useTransform(scrollYProgress, [0, 0.22, 0.65, 1], [14, 0, 0, 20]);
  const rawY      = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const rawColor  = useTransform(scrollYProgress, [0, 0.55, 1], ['#2C2824', '#2C2824', '#6B2A2A']);

  const scale     = useSpring(rawScale, { stiffness: 68, damping: 22 });
  const blur      = useSpring(rawBlur,  { stiffness: 52, damping: 18 });
  const y         = useSpring(rawY,     { stiffness: 80, damping: 28 });

  const filterVal = useMotionTemplate`blur(${blur}px)`;

  return (
    <div ref={containerRef} style={{ height: '270vh', position: 'relative' }}>
      <div
        style={{
          position: 'sticky', top: 0, height: '100vh',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', background: '#FAF7F2',
        }}
      >
        <motion.p
          style={{
            position: 'absolute', top: '11%', opacity,
            fontFamily: FONT_MONO,
            fontSize: '0.68rem', letterSpacing: '0.32em',
            textTransform: 'uppercase', color: '#9a9085',
          }}
        >
          making
        </motion.p>

        <motion.div
          style={{
            scale, opacity, filter: filterVal, y, color: rawColor,
            fontFamily: FONT_MONO,
            fontSize: 'clamp(4.5rem, 15vw, 168px)',
            fontWeight: 900, lineHeight: 1,
            letterSpacing: 'clamp(-4px,-0.04em,-8px)',
            userSelect: 'none', mixBlendMode: 'multiply',
            textAlign: 'center',
          }}
        >
          SOMETHING
        </motion.div>

        <motion.p
          style={{
            position: 'absolute', bottom: '11%', opacity,
            fontFamily: FONT_MONO,
            fontSize: '0.68rem', letterSpacing: '0.32em',
            textTransform: 'uppercase', color: '#9a9085',
          }}
        >
          is being made here
        </motion.p>
      </div>
    </div>
  );
}

// ── Magnetic CTA ──────────────────────────────────────────────────────────────
function MagneticCTA({ href, children }: { href: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setPos({
      x: (e.clientX - (r.left + r.width / 2)) * 0.26,
      y: (e.clientY - (r.top  + r.height / 2)) * 0.26,
    });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      animate={pos}
      transition={{ type: 'spring', stiffness: 175, damping: 18 }}
      style={{ display: 'inline-block' }}
    >
      <Link
        to={href}
        style={{
          display: 'inline-block', padding: '1rem 2.5rem',
          border: '2px solid #2C2824',
          fontFamily: FONT_MONO,
          fontSize: '0.82rem', letterSpacing: '0.18em',
          textTransform: 'uppercase', color: '#2C2824',
          textDecoration: 'none', background: 'transparent',
          transition: 'background 0.32s ease, color 0.32s ease',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLAnchorElement;
          el.style.background = '#2C2824'; el.style.color = '#F5EDE4';
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLAnchorElement;
          el.style.background = 'transparent'; el.style.color = '#2C2824';
        }}
      >
        {children} →
      </Link>
    </motion.div>
  );
}

// ── Feature Card ──────────────────────────────────────────────────────────────
function FeatureCard({
  label, title, body, href, index,
}: {
  label: string; title: string; body: string; href: string; index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-6%' });
  const [hov, setHov] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 55 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.14, duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => setHov(false)}
      style={{
        paddingTop: '2.5rem', paddingBottom: '2.5rem',
        borderTop: `1.5px solid ${hov ? '#2C2824' : '#D4C9BE'}`,
        position: 'relative', overflow: 'hidden',
        transition: 'border-color 0.3s ease',
      }}
    >
      {/* Accent sweep */}
      <motion.div
        animate={{ scaleX: hov ? 1 : 0 }}
        initial={{ scaleX: 0 }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'absolute', top: '-1px', left: 0,
          width: '100%', height: '2px', background: '#6B2A2A',
          transformOrigin: 'left',
        }}
      />
      <Link to={href} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        <p style={{
          fontFamily: FONT_MONO,
          fontSize: '0.62rem', letterSpacing: '0.28em',
          textTransform: 'uppercase', color: '#9a9085', marginBottom: '0.9rem',
        }}>
          {label}
        </p>
        <motion.h3
          animate={{ x: hov ? 8 : 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{
            fontFamily: FONT_MONO,
            fontSize: 'clamp(1.4rem,2.2vw,1.9rem)',
            fontWeight: 700, letterSpacing: '-0.025em',
            lineHeight: 1.2, color: '#2C2824', marginBottom: '1rem',
          }}
        >
          {title}
        </motion.h3>
        <p style={{
          fontFamily: FONT_MONO,
          fontSize: '0.88rem', lineHeight: 1.8,
          color: '#5a534c', maxWidth: '34ch', marginBottom: '1.5rem',
        }}>
          {body}
        </p>
        <motion.span
          animate={{ x: hov ? 5 : 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          style={{
            fontFamily: FONT_MONO,
            fontSize: '0.74rem', letterSpacing: '0.18em',
            textTransform: 'uppercase', color: '#2C2824',
            borderBottom: '1px solid currentColor', paddingBottom: '2px',
          }}
        >
          Enter →
        </motion.span>
      </Link>
    </motion.div>
  );
}

// ── Parallax Stamp ────────────────────────────────────────────────────────────
function ParallaxStamp() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const yRaw = useTransform(scrollYProgress, [0, 1], [-30, 30]);
  const y = useSpring(yRaw, { stiffness: 60, damping: 20 });

  return (
    <motion.div ref={ref} style={{ y }}>
      <motion.div
        initial={{ opacity: 0, rotate: -10, scale: 0.65 }}
        animate={{ opacity: 1, rotate: -4, scale: 1 }}
        transition={{ delay: 1.25, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: '158px', height: '158px',
          border: '2px solid #2C2824', borderRadius: '50%',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          fontFamily: FONT_MONO,
          fontSize: '0.6rem', letterSpacing: '0.2em',
          textTransform: 'uppercase', color: '#2C2824',
          lineHeight: 2, textAlign: 'center',
        }}
      >
        <span>THE</span>
        <span style={{ fontSize: '1.55rem', fontWeight: 900, letterSpacing: '-1px', lineHeight: 1, margin: '0.12em 0' }}>PAGE</span>
        <span>GALLERY</span>
        <span style={{ fontSize: '0.52rem', letterSpacing: '0.22em', marginTop: '0.25em', color: '#9a9085' }}>MCMXXIV</span>
      </motion.div>
    </motion.div>
  );
}

// ── Features data ─────────────────────────────────────────────────────────────
const FEATURES = [
  {
    label: 'Writing Community',
    title: 'The Garden',
    body: 'A curated space for writers and journal editors. Submit work, find journals, join a residency.',
    href: '/garden',
  },
  {
    label: 'Limited Editions',
    title: 'The Editions',
    body: 'Physical objects that deserve to exist. Print runs of literary work, designed to last.',
    href: '/editions',
  },
  {
    label: 'Font of Intent',
    title: 'Write a Letter',
    body: 'Capture the rhythm of your writing — not just the words, but the pauses, the bursts, the hesitations.',
    href: '/write',
  },
];

// ── Main ──────────────────────────────────────────────────────────────────────
export function PageGalleryHome() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-paper)] text-[var(--text-black)] overflow-hidden">
      {/* Minimal header – clean institution feel */}
      <header className="flex items-center justify-between px-8 py-8 border-b border-black/10">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-[var(--accent-red)]" />
          <span className="font-medium tracking-tight text-xl">Page Gallery</span>
        </div>
        <nav className="flex items-center gap-10 text-sm uppercase tracking-[0.5px] font-medium">
          <Link to="/categories" className="hover:underline">Categories</Link>
          <Link to="/about" className="hover:underline">About</Link>
          <Link to="/typographic-scroll" className="hover:underline">Editorial</Link>
          <Link to="/commissions" className="hover:underline">Contact</Link>
          <Link
            to="/apply"
            className="px-8 py-3 border border-black rounded-full hover:bg-black hover:text-white transition-colors"
          >
            Hire Me
          </Link>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-8 pt-24 pb-40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-20 items-start">
          {/* Left column – generous story block */}
          <div className="lg:col-span-7">
            <motion.h1
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 32 }}
              transition={{ duration: 0.85, ease: 'easeOut' }}
              className="serif-heading text-[clamp(3.5rem,8vw,108px)] leading-[0.92] mb-14"
            >
              Once an<br />
              ENTREPRENEUR,<br />
              always an<br />
              ENTREPRENEUR.
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 20 }}
              transition={{ duration: 0.85, delay: 0.2, ease: 'easeOut' }}
              className="max-w-prose text-[17px] leading-[1.85] text-black/75"
            >
              Picture two primary school girls, circa 1992, prancing from door to door of their tiny
              rural German village. In their hands, they are holding batches of A4 papers, each sheet
              filled with neatly aligned rows of the same hand-drawn motif — a different motif per
              page. Their product: one of a kind wrapping papers. Their objective: sell said wrapping
              paper to the neighbours to make the money needed to pay for a pony ride at the nearby
              stable.
              <br /><br />
              That was my sister and me: creative entrepreneurs since Day 1.
            </motion.div>

            {/* Direct revenue CTA – editions shop entry */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 16 }}
              transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
              className="mt-16 inline-block"
            >
              <motion.div whileHover={{ scale: 1.015 }}>
                <Link
                  to="/editions"
                  className="inline-flex items-center gap-4 px-12 py-5 border-2 border-black rounded-full text-lg font-medium tracking-wide hover:bg-black hover:text-white transition-all duration-300"
                >
                  Shop Limited Editions →
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Right column – floating mark (accent dot cluster) */}
          <div className="lg:col-span-5 relative h-[540px] hidden lg:flex justify-end items-start pt-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: loaded ? 1 : 0, scale: loaded ? 1 : 0.85 }}
              transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
              className="relative"
            >
              {/* Abstract geometric mark — circles evoking the brand dot */}
              <div className="w-64 h-64 rounded-full border-2 border-black/8 flex items-center justify-center">
                <div className="w-44 h-44 rounded-full border border-black/12 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-[var(--accent-red)] opacity-90" />
                </div>
              </div>
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-8 -right-6 w-12 h-12 rounded-full border-2 border-black/20"
              />
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute top-4 -left-10 w-7 h-7 rounded-full bg-black/10"
              />
            </motion.div>
          </div>

        {/* Bottom typographic anchor – "Making SOMETHING" energy */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 40 }}
          transition={{ duration: 0.9, delay: 0.5, ease: 'easeOut' }}
          className="mt-40 flex flex-col items-center text-center"
        >
          <p className="handwritten text-6xl tracking-tight mb-3 text-black/90">Making</p>
          <h2 className="serif-heading text-[clamp(4rem,14vw,168px)] leading-none font-bold tracking-[-8px]">
            SOMETHING
          </h2>
        </motion.div>
      </main>

      <footer className="border-t border-black/10 py-12 text-center text-sm text-black/60 font-light">
        © Page Gallery Editions • London / New York • Making something since 1992
      </footer>

    </div>
  );
}

