import { Link } from 'react-router';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

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

