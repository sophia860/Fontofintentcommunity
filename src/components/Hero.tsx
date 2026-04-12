import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="min-h-screen bg-[#F8F4EC] flex items-center pt-20">
      <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-12 gap-12 items-center">

        {/* Left — Typography */}
        <div className="md:col-span-7 space-y-8">
          <div className="inline-flex items-center gap-2 text-xs tracking-[3px] text-[#6B2A2A] font-mono">
            EST 2024 • LONDON / DIGITAL
          </div>

          <h1 className="text-7xl md:text-8xl leading-none font-serif tracking-tighter text-black">
            Once an<br />
            ENTREPRENEUR,<br />
            always an<br />
            ENTREPRENEUR.
          </h1>

          <p className="max-w-md text-lg text-neutral-700">
            Picture two primary school girls, circa 1992...{' '}
            That was my sister and me: creative entrepreneurs since Day 1.
          </p>

          <motion.a
            href="/garden"
            whileHover={{ scale: 1.02 }}
            className="inline-flex items-center gap-3 group bg-black text-white px-8 py-4 rounded-full text-sm tracking-widest hover:bg-[#6B2A2A] transition-colors"
          >
            ENTER THE GARDEN
            <ArrowRight className="group-hover:translate-x-1 transition" />
          </motion.a>
        </div>

        {/* Right — Illustration slot */}
        <div className="md:col-span-5 relative">
          <div className="aspect-square bg-[#F8F4EC] border border-neutral-200 rounded-3xl flex items-center justify-center overflow-hidden">
            {/* Placeholder for the abstract girl + particle stack */}
            <div className="text-8xl opacity-10">🌿</div>
          </div>
        </div>
      </div>
    </section>
  );
}
