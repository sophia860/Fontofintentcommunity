/**
 * WatercolorBackground — decorative SVG watercolour splashes.
 * Positioned absolutely behind page content, pointer-events none.
 * Uses feTurbulence + feDisplacementMap + feGaussianBlur to create
 * the soft, organic look of real watercolour paint on paper.
 */

interface WatercolorBackgroundProps {
  /** Shift the blob layout for variety across different pages */
  seed?: number;
}

export function WatercolorBackground({ seed = 0 }: WatercolorBackgroundProps) {
  // Each page gets a slightly different arrangement via the seed offset
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
          {/* Large blob filter — gentle organic distortion + soft blur */}
          <filter id={`wc-lg-${seed}`} x="-70%" y="-70%" width="240%" height="240%">
            <feTurbulence type="turbulence" baseFrequency="0.022 0.038" numOctaves="3" seed={5 + s} result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="28" xChannelSelector="R" yChannelSelector="G" result="displaced" />
            <feGaussianBlur in="displaced" stdDeviation="13" />
          </filter>
          {/* Medium blob filter */}
          <filter id={`wc-md-${seed}`} x="-70%" y="-70%" width="240%" height="240%">
            <feTurbulence type="turbulence" baseFrequency="0.03 0.052" numOctaves="3" seed={11 + s} result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="20" xChannelSelector="R" yChannelSelector="G" result="displaced" />
            <feGaussianBlur in="displaced" stdDeviation="9" />
          </filter>
          {/* Small blob filter */}
          <filter id={`wc-sm-${seed}`} x="-80%" y="-80%" width="260%" height="260%">
            <feTurbulence type="turbulence" baseFrequency="0.04 0.065" numOctaves="2" seed={17 + s} result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="14" xChannelSelector="R" yChannelSelector="G" result="displaced" />
            <feGaussianBlur in="displaced" stdDeviation="7" />
          </filter>
        </defs>

        {/* ── Upper-left pink cluster ───────────────────────────────────────── */}
        {/* Primary pink splash */}
        <ellipse cx="175" cy="155" rx="118" ry="78" fill="#E8A4B8" opacity="0.36" filter={`url(#wc-lg-${seed})`} />
        {/* Secondary, slightly offset pink */}
        <ellipse cx="105" cy="220" rx="58" ry="38" fill="#DB90AC" opacity="0.28" filter={`url(#wc-md-${seed})`} />

        {/* ── Lower-left coral / red blob ───────────────────────────────────── */}
        <ellipse cx="210" cy="660" rx="95" ry="62" fill="#D4605E" opacity="0.33" filter={`url(#wc-lg-${seed})`} />

        {/* ── Centre orange ─────────────────────────────────────────────────── */}
        <ellipse cx="530" cy="445" rx="88" ry="58" fill="#E07840" opacity="0.34" filter={`url(#wc-lg-${seed})`} />

        {/* ── Centre-right yellow ───────────────────────────────────────────── */}
        <ellipse cx="590" cy="530" rx="64" ry="44" fill="#E8BA50" opacity="0.36" filter={`url(#wc-md-${seed})`} />

        {/* ── Right-side pink ───────────────────────────────────────────────── */}
        <ellipse cx="1060" cy="275" rx="84" ry="56" fill="#DC8090" opacity="0.30" filter={`url(#wc-lg-${seed})`} />

        {/* ── Lower-right soft pink ─────────────────────────────────────────── */}
        <ellipse cx="1295" cy="630" rx="52" ry="36" fill="#E8A4B8" opacity="0.28" filter={`url(#wc-md-${seed})`} />

        {/* ── Tiny accent blobs for depth ───────────────────────────────────── */}
        <ellipse cx="330" cy="380" rx="32" ry="22" fill="#D4605E" opacity="0.20" filter={`url(#wc-sm-${seed})`} />
        <ellipse cx="820" cy="720" rx="40" ry="27" fill="#E8BA50" opacity="0.22" filter={`url(#wc-sm-${seed})`} />
        <ellipse cx="1180" cy="150" rx="38" ry="25" fill="#E8A4B8" opacity="0.22" filter={`url(#wc-sm-${seed})`} />
      </svg>
    </div>
  );
}
