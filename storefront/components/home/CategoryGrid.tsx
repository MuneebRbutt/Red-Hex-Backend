'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { gql } from 'graphql-tag';
import Link from 'next/link';

// ── GraphQL ───────────────────────────────────────────────────────────────────
const GET_COLLECTIONS = gql`
  query GetCollections {
    collections {
      items {
        name
        slug
        featuredAsset {
          preview
        }
      }
    }
  }
`;

// ── Category config ────────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    key: 'sportswear',
    label: 'SPORTSWEAR',
    sub: 'Soccer · Baseball · Football · Basketball · Hockey · Tennis',
    href: '/collections/sportswear',
    fallback: 'https://placehold.co/800x600/1a1a1a/ffffff?text=SPORTSWEAR',
    accent: '#cc0000',
  },
  {
    key: 'casual-wear',
    label: 'CASUAL WEAR',
    sub: 'Tracksuits · Hoodies · Sweatshirts · T-Shirts',
    href: '/collections/casual-wear',
    fallback: 'https://placehold.co/800x600/1a1a1a/ffffff?text=CASUAL+WEAR',
    accent: '#ffffff',
  },
  {
    key: 'jacket-collections',
    label: 'JACKET COLLECTIONS',
    sub: 'Bomber · Puffer · Leather · Varsity',
    href: '/collections/jacket-collections',
    fallback: 'https://placehold.co/800x600/1a1a1a/ffffff?text=JACKET+COLLECTIONS',
    accent: '#c9a84c',
  },
  {
    key: 'gymwear-activewear',
    label: 'GYMWEAR & ACTIVEWEAR',
    sub: 'Tank Tops · Dry-Fit · Gym Shorts · Track Jackets',
    href: '/collections/gymwear-activewear',
    fallback: 'https://placehold.co/800x600/1a1a1a/ffffff?text=GYMWEAR',
    accent: '#cc0000',
  },
  {
    key: 'safety-work-wear',
    label: 'SAFETY & WORK WEAR',
    sub: 'Safety Vests · Construction Suits · Windbreakers',
    href: '/collections/safety-work-wear',
    fallback: 'https://placehold.co/800x600/1a1a1a/ffffff?text=SAFETY+%26+WORK+WEAR',
    accent: '#ffffff',
  },
];

interface VendureCollection {
  name: string;
  slug: string;
  featuredAsset?: { preview: string };
}

// ── Single Card ────────────────────────────────────────────────────────────────
function CategoryCard({
  label,
  sub,
  href,
  imageUrl,
  accent,
  index,
}: {
  label: string;
  sub: string;
  href: string;
  imageUrl: string;
  accent: string;
  index: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={href}
      aria-label={`Browse ${label}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        display: 'block',
        overflow: 'hidden',
        textDecoration: 'none',
        backgroundColor: '#111111',
        // Fixed heights — reliable on all browsers
        height: '420px',
      }}
    >
      {/* Background image */}
      <img
        src={imageUrl}
        alt={label}
        loading={index < 2 ? 'eager' : 'lazy'}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          transform: hovered ? 'scale(1.07)' : 'scale(1)',
          filter: hovered ? 'brightness(0.95)' : 'brightness(0.65)',
          transition: 'transform 0.6s cubic-bezier(0.4,0,0.2,1), filter 0.4s ease',
        }}
      />

      {/* Gradient overlay — always visible */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: hovered
            ? 'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.15) 100%)'
            : 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.25) 100%)',
          transition: 'background 0.4s ease',
        }}
      />

      {/* Gold corner brackets on hover */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          width: hovered ? 32 : 0,
          height: hovered ? 32 : 0,
          borderTop: `2px solid ${accent}`,
          borderLeft: `2px solid ${accent}`,
          opacity: hovered ? 1 : 0,
          transition: 'all 0.35s ease',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          width: hovered ? 32 : 0,
          height: hovered ? 32 : 0,
          borderBottom: `2px solid ${accent}`,
          borderRight: `2px solid ${accent}`,
          opacity: hovered ? 1 : 0,
          transition: 'all 0.35s ease',
        }}
      />

      {/* Text content */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          textAlign: 'center',
          padding: '2rem 1.5rem',
          zIndex: 2,
        }}
      >
        {/* Sub label */}
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.65rem',
            fontWeight: 600,
            letterSpacing: '0.28em',
            color: accent,
            textTransform: 'uppercase',
            marginBottom: '0.5rem',
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.35s ease, transform 0.35s ease',
          }}
        >
          {sub}
        </p>

        {/* Main headline */}
        <h3
          style={{
            fontFamily: "'Oswald', 'Bebas Neue', sans-serif",
            fontSize: 'clamp(1.9rem, 3.2vw, 2.8rem)',
            fontWeight: 700,
            color: '#ffffff',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            lineHeight: 1,
            marginBottom: '1.1rem',
            transform: hovered ? 'scale(1.06)' : 'scale(1)',
            transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
            textShadow: '0 2px 16px rgba(0,0,0,0.9)',
          }}
        >
          {label}
        </h3>

        {/* CTA pill */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#000000',
            backgroundColor: accent,
            padding: '0.5rem 1.5rem',
            clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)',
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.3s ease 0.05s, transform 0.3s ease 0.05s',
          }}
        >
          SHOP NOW
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div
      style={{
        height: '420px',
        backgroundColor: '#111',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, #111 0%, #1c1c1c 50%, #111 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.8s ease-in-out infinite',
        }}
      />
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
      `}</style>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function CategoryGrid() {
  const { data, loading } = useQuery<{
    collections: { items: VendureCollection[] };
  }>(GET_COLLECTIONS);

  const imageMap = new Map<string, string>();
  if (data?.collections?.items) {
    for (const col of data.collections.items) {
      if (col.featuredAsset?.preview) {
        imageMap.set(col.slug, col.featuredAsset.preview);
      }
    }
  }

  return (
    <section
      style={{ backgroundColor: '#000000', padding: '5rem 0 4rem' }}
      aria-labelledby="category-heading"
    >
      {/* ── Section header ── */}
      <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3.5rem', padding: '0 1.5rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.68rem',
            fontWeight: 600,
            letterSpacing: '0.3em',
            color: '#c9a84c',
            textTransform: 'uppercase' as const,
            marginBottom: '1rem',
            padding: '0.35rem 1rem',
            border: '1px solid rgba(201,168,76,0.3)',
            background: 'rgba(201,168,76,0.05)',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: '#c9a84c',
              animation: 'catPulse 2s infinite',
            }}
          />
          Our Products
        </div>

        <h2
          id="category-heading"
          style={{
            fontFamily: "'Oswald', 'Bebas Neue', sans-serif",
            fontSize: 'clamp(2.4rem, 6vw, 4.5rem)',
            fontWeight: 700,
            color: '#ffffff',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.04em',
            lineHeight: 1,
            marginBottom: '1rem',
          }}
        >
          WHAT WE MAKE
        </h2>

        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.5)',
            lineHeight: 1.7,
            maxWidth: '460px',
            margin: '0 auto 1.5rem',
          }}
        >
          Premium garments built to outlast trends — engineered for performance, style, and identity.
        </p>

        {/* Divider line */}
        <div
          style={{
            width: '60px',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)',
            margin: '0 auto',
          }}
        />
      </div>

      {/* ── 3+2 Grid ── */}
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          backgroundColor: 'rgba(255,255,255,0.06)',
        }}
        className="category-grid-wrapper"
      >
        {/* Top row — 3 cards */}
        <div
          style={{ display: 'grid', gap: '2px' }}
          className="category-row-top"
        >
          {loading
            ? [0, 1, 2].map((i) => <SkeletonCard key={i} />)
            : CATEGORIES.slice(0, 3).map((cat, idx) => (
                <CategoryCard
                  key={cat.key}
                  label={cat.label}
                  sub={cat.sub}
                  href={cat.href}
                  imageUrl={imageMap.get(cat.key) ?? cat.fallback}
                  accent={cat.accent}
                  index={idx}
                />
              ))}
        </div>

        {/* Bottom row — 2 cards */}
        <div
          style={{ display: 'grid', gap: '2px' }}
          className="category-row-bottom"
        >
          {loading
            ? [0, 1].map((i) => <SkeletonCard key={i} />)
            : CATEGORIES.slice(3).map((cat, idx) => (
                <CategoryCard
                  key={cat.key}
                  label={cat.label}
                  sub={cat.sub}
                  href={cat.href}
                  imageUrl={imageMap.get(cat.key) ?? cat.fallback}
                  accent={cat.accent}
                  index={idx + 3}
                />
              ))}
        </div>
      </div>

      {/* ── Footer CTA ── */}
      {!loading && (
        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <Link
            href="/collections"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.76rem',
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase' as const,
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.25)',
              padding: '0.85rem 2.2rem',
              textDecoration: 'none',
              transition: 'border-color 0.3s ease, color 0.3s ease, background 0.3s ease',
            }}
            className="view-all-btn"
          >
            VIEW ALL COLLECTIONS
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}

      {/* Global styles for this section (not layout-critical) */}
      <style>{`
        @keyframes catPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        /* Desktop: top row = 3 cols, bottom row = 2 cols */
        .category-row-top    { grid-template-columns: repeat(3, 1fr); }
        .category-row-bottom { grid-template-columns: repeat(2, 1fr); }

        /* Tablet: 2 cols each row */
        @media (max-width: 1024px) {
          .category-row-top    { grid-template-columns: repeat(2, 1fr); }
          .category-row-bottom { grid-template-columns: repeat(2, 1fr); }
        }

        /* Mobile: single column */
        @media (max-width: 640px) {
          .category-row-top    { grid-template-columns: 1fr; }
          .category-row-bottom { grid-template-columns: 1fr; }
        }

        .view-all-btn:hover {
          border-color: #cc0000 !important;
          color: #cc0000 !important;
          background: rgba(204,0,0,0.05) !important;
        }
      `}</style>
    </section>
  );
}
