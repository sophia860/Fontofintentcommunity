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
        {/* Hero section */}
        <div className="max-w-4xl">
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
