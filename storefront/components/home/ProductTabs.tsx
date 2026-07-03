'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from 'graphql-tag';
import Link from 'next/link';

// ─────────────────────────────────────────────────────────────────────────────
// GraphQL
// ─────────────────────────────────────────────────────────────────────────────
const GET_COLLECTION_PRODUCTS = gql`
  query GetCollectionProducts($slug: String!) {
    collection(slug: $slug) {
      id
      name
      productVariants(options: { take: 8 }) {
        totalItems
        items {
          id
          name
          priceWithTax
          product {
            id
            name
            slug
            featuredAsset { preview }
            assets { preview }
          }
        }
      }
    }
  }
`;

const ADD_TO_CART = gql`
  mutation AddToCart($variantId: ID!, $quantity: Int!) {
    addItemToOrder(productVariantId: $variantId, quantity: $quantity) {
      __typename
      ... on Order {
        id
        totalWithTax
        lines { id quantity }
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Config — maps tabs to real Vendure collection slugs
// (update slugs once clothing collections are created)
// ─────────────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'street-wear',      label: 'STREET WEAR',      slug: 'footwear',       fallbackCount: 24 },
  { id: 'sports-wear',      label: 'SPORTS WEAR',       slug: 'sports-outdoor', fallbackCount: 32 },
  { id: 'leather-garment',  label: 'LEATHER GARMENTS',  slug: 'electronics',   fallbackCount: 34 },
  { id: 'work-wear',        label: 'WORK WEAR',         slug: 'furniture',      fallbackCount: 13 },
];

// Curated Unsplash placeholder images per tab (shown when Vendure has no asset)
const PLACEHOLDER_IMAGES = [
  [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
    'https://images.unsplash.com/photo-1556906781-9a412961a28c?w=400&q=80',
    'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&q=80',
    'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&q=80',
    'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=400&q=80',
    'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400&q=80',
    'https://images.unsplash.com/photo-1539185441755-769473a23570?w=400&q=80',
  ],
  [
    'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&q=80',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80',
    'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=80',
    'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=400&q=80',
    'https://images.unsplash.com/photo-1595078475328-1ab05d0a6a0e?w=400&q=80',
    'https://images.unsplash.com/photo-1562088287-bde35a1ea917?w=400&q=80',
    'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&q=80',
  ],
  [
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80',
    'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=400&q=80',
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80',
    'https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?w=400&q=80',
    'https://images.unsplash.com/photo-1456885284447-7dd4bb8720bf?w=400&q=80',
    'https://images.unsplash.com/photo-1594938298603-c8148c4b4fb4?w=400&q=80',
    'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=400&q=80',
    'https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=400&q=80',
  ],
  [
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80',
    'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=400&q=80',
    'https://images.unsplash.com/photo-1464863979621-258859e62245?w=400&q=80',
    'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?w=400&q=80',
    'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=400&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=400&q=80',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80',
  ],
];

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface ProductVariant {
  id: string;
  name: string;
  priceWithTax: number;
  product: {
    id: string;
    name: string;
    slug: string;
    featuredAsset?: { preview: string };
    assets: { preview: string }[];
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility
// ─────────────────────────────────────────────────────────────────────────────
function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Product Card
// ─────────────────────────────────────────────────────────────────────────────
function ProductCard({
  variant,
  fallbackImage,
  fallbackImage2,
  tabIdx,
}: {
  variant: ProductVariant;
  fallbackImage: string;
  fallbackImage2: string;
  tabIdx: number;
}) {
  const [hovered, setHovered]     = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [adding, setAdding]       = useState(false);
  const [added, setAdded]         = useState(false);

  const image1 = variant.product.featuredAsset?.preview ?? fallbackImage;
  const image2 = variant.product.assets[1]?.preview     ?? fallbackImage2;

  const [addToCart] = useMutation(ADD_TO_CART);

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      await addToCart({ variables: { variantId: variant.id, quantity: 1 } });
      setAdded(true);
      setTimeout(() => setAdded(false), 2200);
    } catch {
      // silently ignore – no live cart yet
    } finally {
      setAdding(false);
    }
  };

  return (
    <article
      className="product-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: '#111111',
        border: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'border-color 0.3s ease, transform 0.3s ease',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        borderColor: hovered ? 'rgba(201,168,76,0.35)' : 'rgba(255,255,255,0.07)',
      }}
    >
      {/* ── Image area ── */}
      <Link
        href={`/products/${variant.product.slug}`}
        style={{ position: 'relative', display: 'block', overflow: 'hidden', aspectRatio: '3/4', flexShrink: 0 }}
        tabIndex={-1}
      >
        {/* Primary image */}
        <img
          src={image1}
          alt={variant.product.name}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center',
            opacity: hovered ? 0 : 1,
            transition: 'opacity 0.45s ease, transform 0.6s ease',
            transform: hovered ? 'scale(1.05)' : 'scale(1)',
          }}
          loading="lazy"
        />
        {/* Secondary image (swap on hover) */}
        <img
          src={image2}
          alt={`${variant.product.name} – alternate view`}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.45s ease, transform 0.6s ease',
            transform: hovered ? 'scale(1)' : 'scale(1.05)',
          }}
          loading="lazy"
        />

        {/* Wishlist button */}
        <button
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={(e) => { e.preventDefault(); setWishlisted(w => !w); }}
          style={{
            position: 'absolute', top: 10, right: 10,
            width: 34, height: 34, borderRadius: '50%',
            backgroundColor: 'rgba(0,0,0,0.6)',
            border: `1px solid ${wishlisted ? '#c9a84c' : 'rgba(255,255,255,0.2)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', zIndex: 2,
            opacity: hovered || wishlisted ? 1 : 0,
            transform: hovered || wishlisted ? 'scale(1)' : 'scale(0.8)',
            transition: 'opacity 0.3s ease, transform 0.3s ease, border-color 0.3s ease',
            backdropFilter: 'blur(4px)',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24"
            fill={wishlisted ? '#c9a84c' : 'none'}
            stroke={wishlisted ? '#c9a84c' : '#ffffff'}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>

        {/* NEW badge */}
        <div style={{
          position: 'absolute', top: 10, left: 10,
          backgroundColor: '#c9a84c', color: '#000000',
          fontFamily: "'Inter', sans-serif", fontSize: '0.6rem',
          fontWeight: 800, letterSpacing: '0.15em',
          padding: '3px 8px', textTransform: 'uppercase',
        }}>NEW</div>
      </Link>

      {/* ── Info area ── */}
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flexGrow: 1 }}>
        <p style={{
          fontFamily: "'Inter', sans-serif", fontSize: '0.65rem', fontWeight: 600,
          letterSpacing: '0.2em', color: '#c9a84c', textTransform: 'uppercase', margin: 0,
        }}>
          {TABS[tabIdx]?.label ?? 'COLLECTION'}
        </p>

        <Link href={`/products/${variant.product.slug}`} style={{ textDecoration: 'none' }}>
          <h3 style={{
            fontFamily: "'Oswald', sans-serif", fontSize: '1rem', fontWeight: 600,
            color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.04em',
            lineHeight: 1.2, margin: 0,
            transition: 'color 0.2s ease',
          }}
            className="product-name-link"
          >
            {variant.product.name}
          </h3>
        </Link>

        <p style={{
          fontFamily: "'Inter', sans-serif", fontSize: '0.75rem',
          color: 'rgba(255,255,255,0.45)', margin: 0,
        }}>
          {variant.name !== variant.product.name ? variant.name : 'Standard'}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.75rem' }}>
          <span style={{
            fontFamily: "'Oswald', sans-serif", fontSize: '1.15rem', fontWeight: 700,
            color: '#ffffff', letterSpacing: '0.03em',
          }}>
            {formatPrice(variant.priceWithTax)}
          </span>

          <button
            onClick={handleAddToCart}
            disabled={adding}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.62rem', fontWeight: 700,
              letterSpacing: '0.16em', textTransform: 'uppercase',
              color: added ? '#000000' : '#ffffff',
              backgroundColor: added ? '#c9a84c' : 'transparent',
              border: `1px solid ${added ? '#c9a84c' : 'rgba(255,255,255,0.3)'}`,
              padding: '0.45rem 0.9rem',
              cursor: adding ? 'wait' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              transition: 'all 0.3s ease',
              clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)',
              whiteSpace: 'nowrap',
            }}
            className="add-to-cart-btn"
          >
            {adding ? (
              <>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" style={{ animation: 'spin 0.7s linear infinite' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Adding…
              </>
            ) : added ? (
              <>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Added!
              </>
            ) : (
              <>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton Card
// ─────────────────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
      <div style={{ aspectRatio: '3/4', backgroundColor: '#1a1a1a', position: 'relative', overflow: 'hidden' }}>
        <div className="skeleton-shine" style={{ position: 'absolute', inset: 0 }} />
      </div>
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <div className="skeleton-shine" style={{ height: 8, width: '40%', borderRadius: 4 }} />
        <div className="skeleton-shine" style={{ height: 14, width: '80%', borderRadius: 4 }} />
        <div className="skeleton-shine" style={{ height: 10, width: '60%', borderRadius: 4 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
          <div className="skeleton-shine" style={{ height: 20, width: '30%', borderRadius: 4 }} />
          <div className="skeleton-shine" style={{ height: 28, width: '38%', borderRadius: 4 }} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab Product Grid
// ─────────────────────────────────────────────────────────────────────────────
function TabContent({ tabIdx }: { tabIdx: number }) {
  const tab = TABS[tabIdx];
  const { data, loading } = useQuery(GET_COLLECTION_PRODUCTS, {
    variables: { slug: tab.slug },
    fetchPolicy: 'cache-first',
  });

  const variants: ProductVariant[] = (data as any)?.collection?.productVariants?.items ?? [];
  const placeholders = PLACEHOLDER_IMAGES[tabIdx] ?? PLACEHOLDER_IMAGES[0];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1px',
        backgroundColor: 'rgba(255,255,255,0.06)',
      }}
      className="product-grid-responsive"
    >
      {loading
        ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
        : variants.length > 0
          ? variants.map((v, i) => (
              <ProductCard
                key={v.id}
                variant={v}
                fallbackImage={placeholders[i % placeholders.length]}
                fallbackImage2={placeholders[(i + 4) % placeholders.length]}
                tabIdx={tabIdx}
              />
            ))
          : placeholders.map((img, i) => (
              // Fallback when collection has no variants yet
              <article
                key={i}
                style={{
                  backgroundColor: '#111111',
                  border: '1px solid rgba(255,255,255,0.07)',
                  display: 'flex', flexDirection: 'column', overflow: 'hidden',
                }}
                className="product-card"
              >
                <div style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden' }}>
                  <img src={img} alt="Product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                  <div style={{
                    position: 'absolute', top: 10, left: 10,
                    backgroundColor: '#c9a84c', color: '#000',
                    fontFamily: "'Inter',sans-serif", fontSize: '0.6rem',
                    fontWeight: 800, letterSpacing: '0.15em', padding: '3px 8px',
                  }}>NEW</div>
                </div>
                <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.2em', color: '#c9a84c', textTransform: 'uppercase' as const, margin: 0 }}>{tab.label}</p>
                  <h3 style={{ fontFamily: "'Oswald',sans-serif", fontSize: '1rem', fontWeight: 600, color: '#fff', textTransform: 'uppercase' as const, letterSpacing: '0.04em', lineHeight: 1.2, margin: 0 }}>
                    Premium {tab.label.split(' ')[0]} Item {i + 1}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem' }}>
                    <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>$89.99</span>
                    <button style={{
                      fontFamily: "'Inter',sans-serif", fontSize: '0.62rem', fontWeight: 700,
                      letterSpacing: '0.16em', textTransform: 'uppercase' as const,
                      color: '#fff', backgroundColor: 'transparent',
                      border: '1px solid rgba(255,255,255,0.3)', padding: '0.45rem 0.9rem', cursor: 'pointer',
                      clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)',
                    }} className="add-to-cart-btn">Add to Cart</button>
                  </div>
                </div>
              </article>
            ))
      }
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function ProductTabs() {
  const [activeIdx, setActiveIdx] = useState(0);

  // Fetch product counts for all tabs upfront
  const { data: d0 } = useQuery(GET_COLLECTION_PRODUCTS, { variables: { slug: TABS[0].slug }, fetchPolicy: 'cache-first' });
  const { data: d1 } = useQuery(GET_COLLECTION_PRODUCTS, { variables: { slug: TABS[1].slug }, fetchPolicy: 'cache-first' });
  const { data: d2 } = useQuery(GET_COLLECTION_PRODUCTS, { variables: { slug: TABS[2].slug }, fetchPolicy: 'cache-first' });
  const { data: d3 } = useQuery(GET_COLLECTION_PRODUCTS, { variables: { slug: TABS[3].slug }, fetchPolicy: 'cache-first' });

  const extractCount = (d: unknown, fallback: number) => {
    if (!d || typeof d !== 'object') return fallback;
    const data = d as { collection?: { productVariants?: { totalItems?: number } } };
    return data?.collection?.productVariants?.totalItems ?? fallback;
  };

  const counts = [
    extractCount(d0, TABS[0].fallbackCount),
    extractCount(d1, TABS[1].fallbackCount),
    extractCount(d2, TABS[2].fallbackCount),
    extractCount(d3, TABS[3].fallbackCount),
  ];

  return (
    <section style={{ backgroundColor: '#000000', padding: '5rem 0 4rem' }}>
      {/* ── Section header ── */}
      <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3rem', padding: '0 1.5rem' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          fontFamily: "'Inter',sans-serif", fontSize: '0.68rem', fontWeight: 600,
          letterSpacing: '0.3em', color: '#c9a84c', textTransform: 'uppercase' as const,
          marginBottom: '1rem', padding: '0.35rem 1rem',
          border: '1px solid rgba(201,168,76,0.3)', background: 'rgba(201,168,76,0.05)',
        }}>
          <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', backgroundColor: '#c9a84c' }} />
          Latest Products
        </div>
        <h2 style={{
          fontFamily: "'Oswald','Bebas Neue',sans-serif",
          fontSize: 'clamp(2.2rem,5vw,4rem)', fontWeight: 700,
          color: '#ffffff', textTransform: 'uppercase' as const,
          letterSpacing: '0.04em', lineHeight: 1, marginBottom: '0.75rem',
        }}>
          SHOP BY CATEGORY
        </h2>
        <p style={{
          fontFamily: "'Inter',sans-serif", fontSize: '0.9rem',
          color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, margin: 0,
        }}>
          Explore our curated range of performance garments built for every lifestyle.
        </p>
      </div>

      {/* ── Tab bar ── */}
      <div style={{ padding: '0 1.5rem', maxWidth: '1400px', margin: '0 auto 2px' }}>
        <div
          role="tablist"
          aria-label="Product categories"
          style={{
            display: 'flex', gap: 0, overflowX: 'auto',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            scrollbarWidth: 'none',
          }}
          className="hide-scrollbar"
        >
          {TABS.map((tab, idx) => {
            const isActive = idx === activeIdx;
            const count = counts[idx] ?? TABS[idx].fallbackCount;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveIdx(idx)}
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.18em',
                  textTransform: 'uppercase', whiteSpace: 'nowrap',
                  color: isActive ? '#ffffff' : 'rgba(255,255,255,0.45)',
                  backgroundColor: 'transparent',
                  border: 'none', borderBottom: isActive ? '2px solid #c9a84c' : '2px solid transparent',
                  padding: '1rem 1.5rem',
                  cursor: 'pointer',
                  transition: 'color 0.25s ease, border-color 0.25s ease',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  marginBottom: '-1px',
                }}
                className={isActive ? '' : 'tab-btn-inactive'}
              >
                {tab.label}
                <span style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '0.6rem', fontWeight: 700,
                  backgroundColor: isActive ? '#c9a84c' : 'rgba(255,255,255,0.1)',
                  color: isActive ? '#000000' : 'rgba(255,255,255,0.5)',
                  padding: '2px 7px', borderRadius: '20px',
                  transition: 'all 0.25s ease',
                  letterSpacing: '0.05em',
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Product grid ── */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem' }}>
        <TabContent tabIdx={activeIdx} />
      </div>

      {/* ── View all CTA ── */}
      <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
        <Link
          href={`/collections/${TABS[activeIdx].id}`}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
            fontFamily: "'Inter',sans-serif", fontSize: '0.76rem',
            fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' as const,
            color: '#ffffff', border: '1px solid rgba(255,255,255,0.25)',
            padding: '0.85rem 2.2rem', textDecoration: 'none',
            transition: 'all 0.3s ease',
          }}
          className="view-all-products-btn"
        >
          VIEW ALL {TABS[activeIdx].label}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* ── Global scoped styles (non-layout) ── */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .tab-btn-inactive:hover { color: rgba(255,255,255,0.8) !important; }
        .add-to-cart-btn:hover  { background: rgba(255,255,255,0.08) !important; border-color: rgba(255,255,255,0.6) !important; }
        .view-all-products-btn:hover { border-color: #c9a84c !important; color: #c9a84c !important; background: rgba(201,168,76,0.05) !important; }
        .product-name-link:hover h3 { color: #c9a84c !important; }

        @media (max-width: 1024px) {
          .product-grid-responsive { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .product-grid-responsive { grid-template-columns: repeat(2, 1fr) !important; }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        .skeleton-shine {
          background: linear-gradient(90deg, #1a1a1a 25%, #252525 50%, #1a1a1a 75%);
          background-size: 200% 100%;
          animation: skeletonPulse 1.6s ease-in-out infinite;
        }
        @keyframes skeletonPulse {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
      `}</style>
    </section>
  );
}
