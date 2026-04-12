import { Link } from 'react-router';
import { useEffect } from 'react';

export function PageGalleryHome() {
  useEffect(() => {
    document.title = 'the page gallery — font of intent';
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f1e3] font-breath text-zinc-900 overflow-hidden">
      {/* top nav — disappears on scroll, oak.is energy */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 bg-[#f8f1e3]/80 backdrop-blur-md border-b border-zinc-200">
        <div className="font-root text-2xl tracking-tight">font of intent</div>
        <div className="flex gap-8 text-sm tracking-widest font-ink">
          <Link to="/garden" className="hover:text-amber-700 transition">the garden</Link>
          <Link to="/editions" className="hover:text-amber-700 transition">editions</Link>
          <Link to="/about" className="hover:text-amber-700 transition">about</Link>
        </div>
        <Link to="/auth" className="font-ink text-sm border border-zinc-900 px-6 py-2 rounded-full hover:bg-zinc-900 hover:text-white transition">
          enter the studio
        </Link>
      </nav>

      {/* hero — the flowing ink line */}
      <div className="pt-32 pb-24 px-8 max-w-4xl mx-auto">
        <div className="space-y-6">
          <h1 className="font-root text-[4.5rem] leading-none tracking-tighter">
            a cultural company.<br />
            a publishing house.<br />
            a platform owner.
          </h1>

          <div className="max-w-md text-xl leading-tight">
            we publish. we build infrastructure.<br />
            we create opportunity. we connect writers,<br />
            artists, journals, and production.
          </div>
        </div>

        {/* the inspo line — svg path that gently animates on load */}
        <div className="my-20">
          <svg width="100%" height="180" viewBox="0 0 800 180" fill="none" className="text-amber-700">
            <path
              d="M 80 120 Q 220 40 380 110 Q 520 160 680 90"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="animate-draw"
            />
            <text x="110" y="95" className="font-ink text-2xl fill-current">daily</text>
            <text x="320" y="125" className="font-ink text-2xl fill-current">makes</text>
            <text x="510" y="75" className="font-ink text-2xl fill-current">practice</text>
            <text x="180" y="155" className="font-ink text-2xl fill-current">life long</text>
            <text x="620" y="145" className="font-ink text-2xl fill-current">habits</text>
          </svg>
        </div>

        {/* where to begin — clean cta cluster */}
        <div className="pt-12 border-t border-zinc-300">
          <p className="uppercase tracking-[0.125em] text-xs mb-6">where to begin</p>
          <div className="flex flex-col sm:flex-row gap-6">
            <Link
              to="/garden"
              className="group flex-1 border border-zinc-900 rounded-3xl p-8 hover:bg-white transition-all"
            >
              <div className="font-root text-3xl mb-3">enter the garden</div>
              <div className="text-zinc-500">write. submit. let the ink breathe.</div>
              <div className="mt-8 text-xs tracking-widest group-hover:underline">→ poets start here</div>
            </Link>

            <Link
              to="/editions"
              className="group flex-1 border border-zinc-900 rounded-3xl p-8 hover:bg-white transition-all"
            >
              <div className="font-root text-3xl mb-3">view editions</div>
              <div className="text-zinc-500">limited runs. hand-numbered. scarce by design.</div>
              <div className="mt-8 text-xs tracking-widest group-hover:underline">→ collector sweet spot</div>
            </Link>
          </div>
        </div>
      </div>

      {/* subtle footer */}
      <footer className="border-t border-zinc-200 py-12 px-8 text-xs tracking-widest text-zinc-400">
        <div className="max-w-4xl mx-auto flex justify-between">
          <div>© font of intent {new Date().getFullYear()} • making something</div>
          <div className="flex gap-6">
            <Link to="/about">contact</Link>
            <a href="https://instagram.com" target="_blank" rel="noreferrer">ig</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
