/**
 * Nav — Page Gallery Editions
 * Minimal, typographic, literary register.
 * No hamburger menus. The identity is in the restraint.
 */
import { Link, useLocation } from 'react-router';
import { useAuth } from '../lib/useAuth';

const NAV_LINKS = [
  { href: '/writers',   label: 'Writers'   },
  { href: '/journals',  label: 'Journals'  },
  { href: '/residency', label: 'Residency' },
  { href: '/editions',  label: 'Editions'  },
  { href: '/about',     label: 'About'     },
];

export function Nav() {
  const { pathname } = useLocation();
  const { user, loading, signOut } = useAuth();

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        padding: '2rem 3rem',
        borderBottom: '1px solid #e8e4df',
        backgroundColor: '#faf8f5',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Wordmark */}
      <Link
        to="/"
        style={{
          fontFamily: 'Georgia, serif',
          fontSize: '1rem',
          fontWeight: 400,
          letterSpacing: '0.05em',
          color: '#1a1714',
          textDecoration: 'none',
          textTransform: 'uppercase',
        }}
      >
        Page Gallery Editions
      </Link>

      {/* Navigation */}
      <nav style={{ display: 'flex', gap: '2.5rem', alignItems: 'baseline' }}>
        {NAV_LINKS.map(({ href, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              to={href}
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: '0.85rem',
                letterSpacing: '0.04em',
                color: active ? '#1a1714' : '#7a7067',
                textDecoration: 'none',
                borderBottom: active ? '1px solid #1a1714' : '1px solid transparent',
                paddingBottom: '2px',
                transition: 'color 0.15s, border-color 0.15s',
              }}
            >
              {label}
            </Link>
          );
        })}

        {/* Auth / dashboard */}
        {!loading && (
          user ? (
            <>
              <Link
                to="/dashboard/writer"
                style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: '0.85rem',
                  letterSpacing: '0.04em',
                  color: pathname.startsWith('/dashboard') ? '#1a1714' : '#7a7067',
                  textDecoration: 'none',
                  borderBottom: pathname.startsWith('/dashboard') ? '1px solid #1a1714' : '1px solid transparent',
                  paddingBottom: '2px',
                }}
              >
                Dashboard
              </Link>
              <button
                onClick={signOut}
                style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: '0.85rem',
                  letterSpacing: '0.04em',
                  color: '#7a7067',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/dashboard/writer"
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: '0.85rem',
                letterSpacing: '0.04em',
                color: '#faf8f5',
                backgroundColor: '#1a1714',
                padding: '0.3rem 0.9rem',
                textDecoration: 'none',
              }}
            >
              Sign in
            </Link>
          )
        )}

        {/* Apply CTA — only shown when not signed in, to avoid overcrowding */}
        {!loading && !user && (
          <Link
            to="/apply"
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: '0.85rem',
              letterSpacing: '0.04em',
              color: '#7a7067',
              textDecoration: 'none',
              borderBottom: '1px solid #c5bdb4',
            }}
          >
            Apply
          </Link>
        )}
      </nav>
    </header>
  );
}
