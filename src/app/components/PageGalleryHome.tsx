import { Link } from 'react-router';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const headlineVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 1.1, ease: [0.23, 1, 0.32, 1] },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.23, 1, 0.32, 1] },
  },
};

const floatingMarkVariants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1, ease: [0.23, 1, 0.32, 1] },
  },
};

const makingVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const somethingVariants = {
  hidden: { opacity: 0, y: 40, rotate: -2 },
  visible: {
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 80,
      damping: 12,
      mass: 0.8,
    },
  },
};

export function PageGalleryHome() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const animate = loaded ? 'visible' : 'hidden';

  return (
    <div className="min-h-screen bg-[var(--bg-paper)] text-[var(--text-black)] overflow-hidden">
      {/* Minimal header – clean institution feel */}
      <header className="flex items-center justify-between px-8 py-8 border-b border-black/10">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-[var(--accent-red)]" />
          <span className="font-medium tracking-tight text-xl">Page Gallery</span>
        </div>
        <nav className="flex items-center gap-10 text-sm uppercase tracking-[0.5px] font-medium">
          {(['Categories', 'About', 'Contact'] as const).map((label, i) => (
            <motion.div key={label} whileHover={{ letterSpacing: '1px' }}>
              <Link
                to={i === 2 ? '/commissions' : `/${label.toLowerCase()}`}
                className="hover:underline hover:text-[var(--accent-red)] transition-colors"
              >
                {label}
              </Link>
            </motion.div>
          ))}
          <motion.div whileHover={{ scale: 1.05 }}>
            <Link
              to="/apply"
              className="px-8 py-3 border border-black rounded-full hover:bg-black hover:text-white transition-all"
            >
              Hire Me
            </Link>
          </motion.div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-8 pt-24 pb-40">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={animate}
          className="grid grid-cols-1 lg:grid-cols-12 gap-x-20 items-start"
        >
          {/* Left column – generous story block */}
          <div className="lg:col-span-7">
            <motion.h1
              variants={headlineVariants}
              className="serif-heading text-[clamp(3.5rem,8vw,108px)] leading-[0.92] mb-14"
            >
              Once an<br />
              ENTREPRENEUR,<br />
              always an<br />
              ENTREPRENEUR.
            </motion.h1>

            <motion.div
              variants={itemVariants}
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
            <motion.div variants={itemVariants} className="mt-16 inline-block">
              <motion.div whileHover={{ scale: 1.02 }}>
                <Link
                  to="/editions"
                  className="cta-button inline-flex items-center gap-4 px-12 py-5 border-2 border-black rounded-full text-lg font-medium tracking-wide hover:bg-black hover:text-white transition-all duration-300"
                >
                  Shop Limited Editions →
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Right column – floating mark (accent dot cluster) */}
          <div className="lg:col-span-5 relative h-[540px] hidden lg:flex justify-end items-start pt-8">
            <motion.div variants={floatingMarkVariants} className="relative">
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
        </motion.div>

        {/* Bottom typographic anchor – "Making SOMETHING" spring reveal */}
        <motion.div
          variants={makingVariants}
          initial="hidden"
          animate={animate}
          className="mt-40 flex flex-col items-center text-center"
        >
          <motion.p variants={itemVariants} className="handwritten text-6xl tracking-tight mb-3 text-black/90">
            Making
          </motion.p>
          <motion.h2
            variants={somethingVariants}
            className="serif-heading text-[clamp(4rem,14vw,168px)] leading-none font-bold tracking-[-8px]"
          >
            SOMETHING
          </motion.h2>
        </motion.div>
      </main>

      <footer className="border-t border-black/10 py-12 text-center text-sm text-black/60 font-light">
        © Page Gallery Editions • London / New York • Making something since 1992
      </footer>
    </div>
  );
}

