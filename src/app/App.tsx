import { RouterProvider } from 'react-router';
import { router } from './routes';
import { useDocumentHead } from './lib/useDocumentHead';

/**
 * Fixed, full-viewport paper grain overlay.
 * Sits above page content but never intercepts pointer events.
 * The SVG fractalNoise pattern gives every page the subtle paper texture
 * seen in the reference aesthetic.
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

export default function App() {
  useDocumentHead();
  return (
    <>
      <PaperGrainOverlay />
      <RouterProvider router={router} />
    </>
  );
}
