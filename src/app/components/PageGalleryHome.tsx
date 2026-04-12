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
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
  useMotionTemplate,
} from 'motion/react';
import { Nav } from './Nav';

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
          maxLife: 90 + Math.random() * 160,
          size: 0.8 + Math.random() * 2.2,
          alpha: 0.25 + Math.random() * 0.35,
        });
      }
      if (particles.length > 220) particles.splice(0, particles.length - 220);
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
              fontFamily: "'Fira Code', monospace",
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
            fontFamily: "'Fira Code', monospace",
            fontSize: '0.68rem', letterSpacing: '0.32em',
            textTransform: 'uppercase', color: '#9a9085',
          }}
        >
          making
        </motion.p>

        <motion.div
          style={{
            scale, opacity, filter: filterVal, y, color: rawColor,
            fontFamily: "'Fira Code', monospace",
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
            fontFamily: "'Fira Code', monospace",
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
          fontFamily: "'Fira Code', monospace",
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
          fontFamily: "'Fira Code', monospace",
          fontSize: '0.62rem', letterSpacing: '0.28em',
          textTransform: 'uppercase', color: '#9a9085', marginBottom: '0.9rem',
        }}>
          {label}
        </p>
        <motion.h3
          animate={{ x: hov ? 8 : 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{
            fontFamily: "'Fira Code', monospace",
            fontSize: 'clamp(1.4rem,2.2vw,1.9rem)',
            fontWeight: 700, letterSpacing: '-0.025em',
            lineHeight: 1.2, color: '#2C2824', marginBottom: '1rem',
          }}
        >
          {title}
        </motion.h3>
        <p style={{
          fontFamily: "'Fira Code', monospace",
          fontSize: '0.88rem', lineHeight: 1.8,
          color: '#5a534c', maxWidth: '34ch', marginBottom: '1.5rem',
        }}>
          {body}
        </p>
        <motion.span
          animate={{ x: hov ? 5 : 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          style={{
            fontFamily: "'Fira Code', monospace",
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
          fontFamily: "'Fira Code', monospace",
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
  const canvasRef = useInkCanvas();
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroOpacity = useTransform(heroProgress, [0, 0.7], [1, 0]);
  const heroYRaw = useTransform(heroProgress, [0, 1], [0, 90]);
  const heroY = useSpring(heroYRaw, { stiffness: 85, damping: 26 });

  return (
    <div style={{ background: '#FAF7F2', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── Ink particle canvas — fixed, blend mode multiply ──────────────── */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0,
          pointerEvents: 'none', zIndex: 1,
          mixBlendMode: 'multiply',
        }}
      />

      <Nav />

      {/* ── ACT I: HERO ───────────────────────────────────────────────────── */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, y: heroY, position: 'relative', zIndex: 2 }}
      >
        <div
          style={{
            minHeight: '100vh',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            padding: 'clamp(4rem,8vh,7rem) clamp(1.5rem,4vw,3rem) 5rem',
            maxWidth: '1280px', margin: '0 auto',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: '2rem',
              alignItems: 'start',
            }}
          >
            {/* Left: headline */}
            <div>
              <motion.p
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  fontFamily: "'Fira Code', monospace",
                  fontSize: '0.67rem', letterSpacing: '0.34em',
                  textTransform: 'uppercase', color: '#9a9085',
                  marginBottom: '2.5rem',
                }}
              >
                Est 2024 · London / Digital
              </motion.p>

              <h1 style={{ margin: 0, fontWeight: 900 }}>
                <CharReveal
                  text="Once an"
                  delay={0.1}
                  style={{
                    fontFamily: "'Fira Code', monospace",
                    fontSize: 'clamp(2.2rem,4.5vw,4.5rem)',
                    letterSpacing: '-1.5px', color: '#2C2824', lineHeight: 1.05,
                  }}
                />
                <CharReveal
                  text="ENTREPRENEUR,"
                  delay={0.22}
                  style={{
                    fontFamily: "'Fira Code', monospace",
                    fontSize: 'clamp(3rem,7.5vw,7.5rem)',
                    letterSpacing: '-3px', color: '#2C2824', lineHeight: 0.96,
                    marginTop: '0.07em',
                  }}
                />
                <CharReveal
                  text="always an"
                  delay={0.52}
                  style={{
                    fontFamily: "'Fira Code', monospace",
                    fontSize: 'clamp(2.2rem,4.5vw,4.5rem)',
                    letterSpacing: '-1.5px', color: '#2C2824', lineHeight: 1.05,
                    marginTop: '0.12em',
                  }}
                />
                <CharReveal
                  text="ENTREPRENEUR."
                  delay={0.65}
                  style={{
                    fontFamily: "'Fira Code', monospace",
                    fontSize: 'clamp(3rem,7.5vw,7.5rem)',
                    letterSpacing: '-3px', color: '#2C2824', lineHeight: 0.96,
                    marginTop: '0.07em',
                  }}
                />
              </h1>
            </div>

            {/* Right: rotated stamp — desktop only (hidden on mobile via className) */}
            <div className="hidden lg:block" style={{ paddingTop: '5rem' }}>
              <ParallaxStamp />
            </div>
          </div>

          {/* Story + CTA row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))',
              gap: '3rem',
              marginTop: '5rem',
            }}
          >
            <WordReveal
              text="Picture two primary school girls, circa 1992, prancing from door to door of their tiny rural German village — hand-drawn wrapping papers in hand. Their product: one of a kind. Their objective: a pony ride. That was my sister and me: creative entrepreneurs since Day 1."
              style={{
                fontFamily: "'Fira Code', monospace",
                fontSize: '1rem', lineHeight: 1.92,
                color: '#5a534c', maxWidth: '46ch',
              }}
            />
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.15, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              >
                <MagneticCTA href="/editions">Shop Limited Editions</MagneticCTA>
              </motion.div>
            </div>
          </div>

          {/* Scroll nudge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.4, duration: 1.4 }}
            style={{
              position: 'absolute', bottom: '2.5rem', left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '0.5rem',
              pointerEvents: 'none',
            }}
          >
            <span style={{
              fontFamily: "'Fira Code', monospace",
              fontSize: '0.58rem', letterSpacing: '0.32em',
              textTransform: 'uppercase', color: '#b0a8a0',
            }}>
              scroll
            </span>
            <motion.div
              animate={{ scaleY: [1, 0.28, 1], opacity: [0.35, 1, 0.35] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: '1px', height: '34px',
                background: 'linear-gradient(to bottom, #9a9085, transparent)',
              }}
            />
          </motion.div>
        </div>
      </motion.section>

      {/* ── ACT II: MARQUEE ───────────────────────────────────────────────── */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Marquee />
      </div>

      {/* ── ACT III: SOMETHING ────────────────────────────────────────────── */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <SomethingSection />
      </div>

      {/* ── ACT IV: FEATURES ──────────────────────────────────────────────── */}
      <section
        style={{
          position: 'relative', zIndex: 2, background: '#FAF7F2',
          padding: 'clamp(4rem,8vh,6rem) clamp(1.5rem,4vw,3rem) clamp(5rem,10vh,8rem)',
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.82, ease: [0.22, 1, 0.36, 1] }}
            style={{ marginBottom: '4rem' }}
          >
            <p style={{
              fontFamily: "'Fira Code', monospace",
              fontSize: '0.67rem', letterSpacing: '0.32em',
              textTransform: 'uppercase', color: '#9a9085', marginBottom: '1rem',
            }}>
              The platform
            </p>
            <h2 style={{
              fontFamily: "'Fira Code', monospace",
              fontSize: 'clamp(2rem,4vw,3.5rem)',
              fontWeight: 900, letterSpacing: '-2px',
              lineHeight: 1.05, color: '#2C2824', margin: 0,
            }}>
              Built for the<br />long game.
            </h2>
          </motion.div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px,1fr))',
              gap: '0 3.5rem',
            }}
          >
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.href} {...f} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── ACT V: FOOTER ─────────────────────────────────────────────────── */}
      <footer
        style={{
          position: 'relative', zIndex: 2,
          background: '#2C2824', color: '#F5EDE4',
          padding: 'clamp(2.5rem,5vh,3.5rem) clamp(1.5rem,4vw,3rem)',
        }}
      >
        <div
          style={{
            maxWidth: '1100px', margin: '0 auto',
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
          }}
        >
          <span style={{
            fontFamily: "'Fira Code', monospace",
            fontSize: '0.76rem', letterSpacing: '0.22em', textTransform: 'uppercase',
          }}>
            The Page Gallery
          </span>
          <span style={{
            fontFamily: "'Fira Code', monospace",
            fontSize: '0.7rem', color: '#9A8F87', letterSpacing: '0.06em',
          }}>
            © {new Date().getFullYear()} · London / Digital
          </span>
        </div>
      </footer>

    </div>
  );
}
