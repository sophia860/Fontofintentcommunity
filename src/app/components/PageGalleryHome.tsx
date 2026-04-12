import { Link } from 'react-router';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { Nav } from './Nav';

export function PageGalleryHome() {
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => { setIsLoaded(true); }, []);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-black overflow-hidden">
      <Nav />

      <main className="max-w-7xl mx-auto px-6 lg:px-12 pt-20 pb-32">
        {/* Hero grid: text left, illustrations right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* Left column — text */}
          <div className="lg:col-span-7">
            <h1
              className="text-[clamp(3rem,8vw,92px)] leading-[1.05] tracking-[-2px] mb-8 font-bold"
              style={{ fontFamily: "'Fira Code', monospace" }}
            >
              Once an<br />
              ENTREPRENEUR,<br />
              always an<br />
              ENTREPRENEUR.
            </h1>

            <div className="max-w-md text-lg leading-[1.85] text-black/75" style={{ fontFamily: "'Fira Code', monospace" }}>
              <p>
                Picture two primary school girls, circa 1992, prancing from door to door of their tiny rural German village. In their hands, they are holding batches of A4 papers, each sheet filled with neatly aligned rows of the same hand-drawn motif — a different motif per page. Their product: one of a kind wrapping papers. Their objective: sell said wrapping paper to the neighbours to make the money needed to pay for a pony ride at the nearby stable.
              </p>
              <p className="mt-6">
                That was my sister and me: creative entrepreneurs since Day 1.
              </p>
            </div>

            {/* Shop CTA — revenue hook */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="mt-12 inline-block"
            >
              <Link
                to="/editions"
                className="inline-block px-10 py-4 border-2 border-black rounded-full text-lg font-medium tracking-wide hover:bg-black hover:text-white transition-all"
                style={{ fontFamily: "'Fira Code', monospace" }}
              >
                Shop Limited Editions →
              </Link>
            </motion.div>
          </div>

          {/* Right column — floating illustrations */}
          <div className="lg:col-span-5 relative h-[580px] lg:flex hidden justify-end">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 40 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute top-12 right-0"
            >
              <img
                src="/illustrations/entrepreneur-girls.png"
                alt="Two girls selling hand-drawn wrapping papers"
                className="w-72 xl:w-80 drop-shadow-xl"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isLoaded ? 0.65 : 0 }}
              transition={{ duration: 1.2, delay: 0.3 }}
              className="absolute top-80 right-28 w-36"
            >
              <img src="/illustrations/scribble.png" alt="" aria-hidden="true" />
            </motion.div>
          </div>
        </div>

        {/* Bottom anchor — "Making SOMETHING" */}
        <div className="mt-32 lg:mt-48">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
            transition={{ duration: 0.9, delay: 0.4, ease: 'easeOut' }}
            className="relative"
          >
            <div
              className="text-[clamp(2.5rem,6vw,80px)] leading-tight tracking-tight"
              style={{ fontFamily: "'Fira Code', monospace" }}
            >
              Making
            </div>
            <div
              className="text-[clamp(4rem,14vw,160px)] leading-none font-black tracking-[-4px] lg:tracking-[-8px]"
              style={{ fontFamily: "'Fira Code', monospace" }}
            >
              SOMETHING
            </div>
          </motion.div>

          {/* Little character — bottom left float */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoaded ? 1 : 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-8 -ml-2"
          >
            <img
              src="/illustrations/little-character.png"
              alt="Little entrepreneur character"
              className="w-40 lg:w-48"
            />
          </motion.div>
        </div>
      </main>

      <footer className="border-t border-black/10 py-12 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm text-black/50" style={{ fontFamily: "'Fira Code', monospace" }}>
          <span>The Page Gallery</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}
