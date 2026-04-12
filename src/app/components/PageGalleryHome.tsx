import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Nav } from './Nav';

export function PageGalleryHome() {
  return (
    <div className="min-h-screen bg-[var(--bg-paper)] text-[var(--text-black)] overflow-hidden">
      <Nav />

      <main className="max-w-7xl mx-auto px-6 lg:px-12 pt-20 pb-32">
        {/* Hero grid: text only */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* Left column — text */}
          <div className="lg:col-span-7">
            <h1 className="serif-heading text-[clamp(3rem,8vw,108px)] leading-[0.95] tracking-[-3px] mb-8">
              Once an<br />
              ENTREPRENEUR,<br />
              always an<br />
              ENTREPRENEUR.
            </h1>

            <div className="max-w-2xl text-[17px] leading-[1.85] text-black/80" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
              <p>
                Picture two primary school girls, circa 1992, prancing from door to door of their tiny rural German village. In their hands, they are holding batches of A4 papers, each sheet filled with neatly aligned rows of the same hand-drawn motif — a different motif per page. Their product: one of a kind wrapping papers. Their objective: sell said wrapping paper to the neighbours to make the money needed to pay for a pony ride at the nearby stable.
              </p>
              <p className="mt-6">
                That was my sister and me: creative entrepreneurs since Day 1.
              </p>
            </div>

            {/* Shop CTA — revenue hook */}
            <motion.div
              whileHover={{ scale: 1.015 }}
              className="mt-14 inline-block"
            >
              <Link
                to="/editions"
                className="inline-block px-12 py-5 border-2 border-black rounded-full text-lg font-medium tracking-wide hover:bg-black hover:text-white transition-all duration-300"
                style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
              >
                Shop Limited Editions →
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Bottom anchor — typographic punch */}
        <div className="mt-40 flex flex-col items-center text-center">
          <p className="handwritten text-6xl tracking-tight mb-1">Making</p>
          <h2 className="serif-heading text-[clamp(4rem,14vw,148px)] leading-none font-bold tracking-[-8px]">SOMETHING</h2>
        </div>
      </main>

      <footer className="border-t border-black/10 py-12 px-6 lg:px-12 text-center text-sm text-black/60 font-light" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        © Page Gallery Editions • London / New York • Making something since 1992
      </footer>
    </div>
  );
}
