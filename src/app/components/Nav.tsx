/**
 * Nav — The Page Gallery
 * Structural, typographic, forensic register.
 * No hamburger menus. The identity is in the structure.
 */
import type { CSSProperties } from 'react';
import { Link, useLocation } from 'react-router';
import { useGardenAuth } from '../lib/useGardenAuth';
import { ADMIN_EMAIL } from '../lib/adminConfig';
import { pickHeadingFont } from '../lib/fontMapper';

const NAV_LINKS = [
  { href: '/garden',   label: 'The Garden' },
  { href: '/writers',  label: 'Writers'    },
  { href: '/journals', label: 'Journals'   },
  { href: '/editions', label: 'Editions'   },
  { href: '/programs', label: 'Programs'   },
  { href: '/about',    label: 'About'      },
];

const NAV_LINK_BASE: CSSProperties = {
  fontFamily: "system-ui, sans-serif",
  fontSize: '0.68rem',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  textDecoration: 'none',
  paddingBottom: '2px',
  transition: 'color 0.12s',
};

export function Nav() {
  const { pathname } = useLocation();
  const { isAuthenticated, authUser, signOut } = useGardenAuth();

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        padding: '1.5rem 3rem',
        borderBottom: '2px solid #1a1714',
        backgroundColor: '#F9F6F2',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Wordmark */}
      <Link
        to="/"
        style={{
          fontFamily: pickHeadingFont('Nav-wordmark'),
          fontSize: '1.6rem',
          fontWeight: 700,
          letterSpacing: '0.01em',
          color: '#1a1714',
          textDecoration: 'none',
        }}
      >
        The Page Gallery
      </Link>

      {/* Navigation */}
      <nav style={{ display: 'flex', gap: '2rem', alignItems: 'baseline' }}>
        {NAV_LINKS.map(({ href, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              to={href}
              style={{
                ...NAV_LINK_BASE,
                color: active ? '#B71C1C' : '#7a7067',
                fontWeight: active ? 600 : 400,
              }}
            >
              {label}
            </Link>
          );
        })}

        {/* Auth state */}
        {isAuthenticated ? (
          <>
            {authUser?.email === ADMIN_EMAIL && (
              <Link
                to="/admin"
                style={{
                  ...NAV_LINK_BASE,
                  color: '#B71C1C',
                  fontWeight: pathname.startsWith('/admin') ? 600 : 400,
                }}
              >
                Admin
              </Link>
            )}
            <Link
              to="/dashboard/writer"
              style={{
                ...NAV_LINK_BASE,
                color: pathname.startsWith('/dashboard') ? '#B71C1C' : '#7a7067',
                fontWeight: pathname.startsWith('/dashboard') ? 600 : 400,
              }}
            >
              Garden
            </Link>
            <button
              onClick={signOut}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                ...NAV_LINK_BASE,
                color: '#7a7067',
                cursor: 'pointer',
              }}
            >
              Sign out
            </button>
          </>
        ) : (
          <Link
            to="/auth"
            style={{
              ...NAV_LINK_BASE,
              color: '#7a7067',
            }}
          >
            Sign in
          </Link>
        )}

        {/* Apply CTA */}
        <Link
          to="/apply"
          style={{
            ...NAV_LINK_BASE,
            color: '#F9F6F2',
            backgroundColor: '#1a1714',
            padding: '0.35rem 0.9rem',
            letterSpacing: '0.12em',
            fontWeight: 600,
          }}
        >
          Apply
        </Link>
      </nav>
    </header>
  );
}
