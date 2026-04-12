import { useEffect, useRef } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { useDocumentHead } from './lib/useDocumentHead';
import { isSupabaseConfigured } from './lib/supabase';

/**
 * Fixed, full-viewport paper grain overlay.
 * Sits above page content but never intercepts pointer events.
 */
const GRAIN_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='paper'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paper)' opacity='0.06'/%3E%3C/svg%3E\")";

function PaperGrainOverlay() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9998,
        backgroundImage: GRAIN_URI,
        backgroundRepeat: 'repeat',
        backgroundSize: '300px 300px',
        mixBlendMode: 'multiply',
        opacity: 1,
      }}
    />
  );
}

/**
 * Custom cursor — tiny ink dot + lagging ring.
 * Only activates on non-touch pointer devices.
 * Ring expands when hovering interactive elements.
 */
function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot  = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const isTouch = window.matchMedia('(hover: none)').matches;
    if (isTouch) return;

    let rx = 0, ry = 0;
    let rafId = 0;

    /** Controls how quickly the ring lags behind the dot. Lower = more lag. */
    const CURSOR_LAG_FACTOR = 0.12;

    const onMove = (e: MouseEvent) => {
      dot.style.left = `${e.clientX}px`;
      dot.style.top  = `${e.clientY}px`;
      rx += (e.clientX - rx) * CURSOR_LAG_FACTOR;
      ry += (e.clientY - ry) * CURSOR_LAG_FACTOR;
    };

    const tick = () => {
      ring.style.left = `${rx}px`;
      ring.style.top  = `${ry}px`;
      rafId = requestAnimationFrame(tick);
    };
    tick();

    const onEnter = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('a, button, [role="button"], input, textarea, select')) {
        ring.classList.add('hovering');
        dot.style.opacity = '0';
      }
    };
    const onLeave = () => {
      ring.classList.remove('hovering');
      dot.style.opacity = '1';
    };

    window.addEventListener('mousemove', onMove,  { passive: true });
    window.addEventListener('mouseover', onEnter, { passive: true });
    window.addEventListener('mouseout',  onLeave, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onEnter);
      window.removeEventListener('mouseout',  onLeave);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <div ref={dotRef}  className="cursor-dot"  aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
    </>
  );
}

function ConfigurationWarning() {
  if (isSupabaseConfigured) return null;
  return (
    <div
      role="alert"
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 10000,
        padding: '0.65rem 1rem',
        background: '#6B2A2A',
        color: '#fff',
        fontSize: '0.85rem',
        textAlign: 'center',
      }}
    >
      Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable auth and data features.
    </div>
  );
}

export default function App() {
  useDocumentHead();
  return (
    <>
      <ConfigurationWarning />
      <PaperGrainOverlay />
      <CustomCursor />
      <RouterProvider router={router} />
    </>
  );
}
