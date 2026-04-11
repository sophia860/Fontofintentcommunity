/**
 * WatercolorBackground — bold, lush watercolour washes covering the full page.
 * Positioned absolutely behind page content, pointer-events none.
 * Uses feTurbulence + feDisplacementMap + feGaussianBlur for organic soft edges.
 * Inspired by the loose, painterly feel of watercolour paper with ink on top.
 */

interface WatercolorBackgroundProps {
  /** Shift the blob layout for variety across different pages */
  seed?: number;
}

export function WatercolorBackground({ seed = 0 }: WatercolorBackgroundProps) {
  const s = seed * 37;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0,
      }}
    >
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Large loose wash — wide turbulence for big organic shapes */}
          <filter id={`wc-wash-${seed}`} x="-80%" y="-80%" width="260%" height="260%">
            <feTurbulence type="turbulence" baseFrequency="0.018 0.030" numOctaves="4" seed={3 + s} result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="45" xChannelSelector="R" yChannelSelector="G" result="displaced" />
            <feGaussianBlur in="displaced" stdDeviation="18" />
          </filter>
          {/* Medium blob — more pronounced edges */}
          <filter id={`wc-mid-${seed}`} x="-70%" y="-70%" width="240%" height="240%">
            <feTurbulence type="turbulence" baseFrequency="0.028 0.048" numOctaves="3" seed={9 + s} result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="32" xChannelSelector="R" yChannelSelector="G" result="displaced" />
            <feGaussianBlur in="displaced" stdDeviation="11" />
          </filter>
          {/* Small accent — tight, painterly drops */}
          <filter id={`wc-drop-${seed}`} x="-90%" y="-90%" width="280%" height="280%">
            <feTurbulence type="turbulence" baseFrequency="0.05 0.08" numOctaves="2" seed={15 + s} result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="18" xChannelSelector="R" yChannelSelector="G" result="displaced" />
            <feGaussianBlur in="displaced" stdDeviation="6" />
          </filter>
          {/* Splatter — tiny ink-drop feel */}
          <filter id={`wc-splat-${seed}`} x="-120%" y="-120%" width="340%" height="340%">
            <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed={21 + s} result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="10" xChannelSelector="R" yChannelSelector="G" result="displaced" />
            <feGaussianBlur in="displaced" stdDeviation="3" />
          </filter>
        </defs>

        {/* ── Full top-left rose-pink wash ───────────────────────────── */}
        <ellipse cx="200" cy="120" rx="260" ry="160" fill="#E8A0B8" opacity="0.52" filter={`url(#wc-wash-${seed})`} />
        <ellipse cx="80"  cy="200" rx="140" ry="90"  fill="#D9789E" opacity="0.38" filter={`url(#wc-mid-${seed})`} />

        {/* ── Top-right sage-blue pool ────────────────────────────────── */}
        <ellipse cx="1280" cy="90"  rx="240" ry="140" fill="#88AAB8" opacity="0.44" filter={`url(#wc-wash-${seed})`} />
        <ellipse cx="1380" cy="200" rx="110" ry="70"  fill="#6E99AC" opacity="0.32" filter={`url(#wc-mid-${seed})`} />

        {/* ── Centre-left amber-orange sweep ─────────────────────────── */}
        <ellipse cx="360" cy="480" rx="220" ry="140" fill="#E07030" opacity="0.42" filter={`url(#wc-wash-${seed})`} />
        <ellipse cx="250" cy="560" rx="100" ry="65"  fill="#C8581C" opacity="0.28" filter={`url(#wc-mid-${seed})`} />

        {/* ── Centre golden-yellow puddle ──────────────────────────────── */}
        <ellipse cx="680" cy="420" rx="190" ry="115" fill="#E8B840" opacity="0.45" filter={`url(#wc-wash-${seed})`} />
        <ellipse cx="760" cy="520" rx="90"  ry="58"  fill="#D4A020" opacity="0.30" filter={`url(#wc-mid-${seed})`} />

        {/* ── Right dusty-rose bloom ──────────────────────────────────── */}
        <ellipse cx="1100" cy="380" rx="210" ry="130" fill="#D07888" opacity="0.46" filter={`url(#wc-wash-${seed})`} />
        <ellipse cx="1220" cy="460" rx="95"  ry="60"  fill="#BC5C70" opacity="0.28" filter={`url(#wc-mid-${seed})`} />

        {/* ── Bottom-left coral wash ──────────────────────────────────── */}
        <ellipse cx="180" cy="760" rx="230" ry="145" fill="#C85048" opacity="0.40" filter={`url(#wc-wash-${seed})`} />

        {/* ── Bottom-right teal pool ──────────────────────────────────── */}
        <ellipse cx="1320" cy="780" rx="200" ry="120" fill="#5E9090" opacity="0.38" filter={`url(#wc-wash-${seed})`} />
        <ellipse cx="1400" cy="700" rx="80"  ry="52"  fill="#3E7878" opacity="0.26" filter={`url(#wc-mid-${seed})`} />

        {/* ── Scattered accent drops ──────────────────────────────────── */}
        <ellipse cx="540"  cy="200" rx="60" ry="38" fill="#E8A0B8" opacity="0.34" filter={`url(#wc-drop-${seed})`} />
        <ellipse cx="900"  cy="640" rx="70" ry="44" fill="#E8B840" opacity="0.30" filter={`url(#wc-drop-${seed})`} />
        <ellipse cx="420"  cy="300" rx="44" ry="28" fill="#88AAB8" opacity="0.28" filter={`url(#wc-drop-${seed})`} />
        <ellipse cx="980"  cy="200" rx="52" ry="32" fill="#E07030" opacity="0.26" filter={`url(#wc-drop-${seed})`} />
        <ellipse cx="660"  cy="740" rx="48" ry="30" fill="#D07888" opacity="0.30" filter={`url(#wc-drop-${seed})`} />

        {/* ── Tiny ink-splatter dots for texture ─────────────────────── */}
        <circle cx="310" cy="640" r="9"  fill="#3E7878" opacity="0.40" filter={`url(#wc-splat-${seed})`} />
        <circle cx="490" cy="580" r="6"  fill="#E8B840" opacity="0.44" filter={`url(#wc-splat-${seed})`} />
        <circle cx="820" cy="310" r="8"  fill="#D9789E" opacity="0.38" filter={`url(#wc-splat-${seed})`} />
        <circle cx="1050" cy="660" r="7" fill="#88AAB8" opacity="0.42" filter={`url(#wc-splat-${seed})`} />
        <circle cx="730" cy="130" r="5"  fill="#C85048" opacity="0.36" filter={`url(#wc-splat-${seed})`} />
        <circle cx="190" cy="430" r="10" fill="#E07030" opacity="0.34" filter={`url(#wc-splat-${seed})`} />
      </svg>
    </div>
  );
}
