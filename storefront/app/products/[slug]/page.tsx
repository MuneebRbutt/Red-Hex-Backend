'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { gql } from 'graphql-tag';
import Link from 'next/link';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/lib/cartContext';
import { MOCK_PRODUCTS, MockProduct } from '@/lib/mockProducts';

// ─────────────────────────────────────────────────────────────────────────────
// GraphQL
// ─────────────────────────────────────────────────────────────────────────────
const GET_PRODUCT = gql`
  query GetProduct($slug: String!) {
    product(slug: $slug) {
      id
      name
      description
      slug
      featuredAsset { preview }
      assets { preview }
      variants {
        id
        name
        sku
        priceWithTax
        stockLevel
      }
    }
  }
`;

const GET_RELATED = gql`
  query GetRelatedProducts {
    products(options: { take: 8 }) {
      items {
        id
        name
        slug
        featuredAsset { preview }
        variants { priceWithTax }
      }
    }
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function getVariantLabel(name: string) {
  const parts = name.split(' ');
  return parts[parts.length - 1];
}

// ─────────────────────────────────────────────────────────────────────────────
// Fallback images (Unsplash, always available)
// ─────────────────────────────────────────────────────────────────────────────
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=85',
  'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&q=85',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=85',
  'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=85',
];

// Convert MockProduct into same shape as GraphQL product
function mockToProduct(m: MockProduct) {
  return {
    id: m.slug,
    name: m.name,
    description: m.description,
    slug: m.slug,
    featuredAsset: { preview: m.images[0] || FALLBACK_IMAGES[0] },
    assets: m.images.map((img) => ({ preview: img })),
    variants: m.sizes.map((size, i) => ({
      id: `${m.slug}-${size}`,
      name: `${m.name} ${size}`,
      sku: `${m.slug.toUpperCase()}-${size}`,
      priceWithTax: Math.round(m.price * 100),
      stockLevel: 'IN_STOCK',
    })),
    _isMock: true,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Related product type (lightweight)
// ─────────────────────────────────────────────────────────────────────────────
interface RelatedProduct {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number; // dollars
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function ProductPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  const { data, loading, error } = useQuery(GET_PRODUCT, {
    variables: { slug },
    fetchPolicy: 'cache-first',
  });

  const { data: relatedData } = useQuery(GET_RELATED, { fetchPolicy: 'cache-first' });

  const { addItem, openSidebar } = useCart();

  // UI state
  const [activeImg, setActiveImg] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [cartStatus, setCartStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [cartMsg, setCartMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'description' | 'size-guide' | 'shipping'>('description');

  // ── Resolve product: real data first, then mock fallback ──────────────────
  const product = useMemo(() => {
    return (data as any)?.product ?? null;
  }, [data]);

  // ── Resolve images ────────────────────────────────────────────────────────
  const images: string[] = useMemo(() => {
    if (!product) return FALLBACK_IMAGES;
    const fromAssets = (product.assets || []).map((a: any) => a.preview).filter(Boolean);
    if (fromAssets.length > 0) return fromAssets;
    if (product.featuredAsset?.preview) return [product.featuredAsset.preview, ...FALLBACK_IMAGES.slice(1)];
    return FALLBACK_IMAGES;
  }, [product]);

  const variants = product?.variants || [];
  const activeVariantId = selectedVariantId || (variants[0]?.id ?? null);
  const activeVariant = variants.find((v: any) => v.id === activeVariantId) || variants[0];

  // ── Related products: GraphQL first, then mock fallback ───────────────────
  const relatedProducts: RelatedProduct[] = useMemo(() => {
    const gqlItems = ((relatedData as any)?.products?.items || []) as any[];
    return gqlItems
      .filter((p: any) => p.slug !== slug)
      .slice(0, 4)
      .map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        image: p.featuredAsset?.preview || FALLBACK_IMAGES[0],
        price: (p.variants?.[0]?.priceWithTax ?? 0) / 100,
      }));
  }, [relatedData, slug]);

  // ── Add to cart ───────────────────────────────────────────────────────────
  const handleAddToCart = () => {
    if (!activeVariant || !product) return;
    setCartStatus('idle');
    setCartMsg('');
    try {
      const sizeLabel = getVariantLabel(activeVariant.name);
      const priceInDollars = product._isMock
        ? activeVariant.priceWithTax / 100
        : activeVariant.priceWithTax / 100;
      addItem({
        id: activeVariant.id,
        name: product.name,
        price: priceInDollars,
        image: product.featuredAsset?.preview || images[0] || '',
        size: sizeLabel,
        quantity: qty,
        slug: product.slug,
      });
      setCartStatus('success');
      setCartMsg('Added to cart successfully!');
      openSidebar();
    } catch (e: any) {
      setCartStatus('error');
      setCartMsg(e?.message || 'Failed to add to cart.');
    }
    setTimeout(() => { setCartStatus('idle'); setCartMsg(''); }, 4000);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Loading State (only shown during initial query; mock loads instantly)
  // ─────────────────────────────────────────────────────────────────────────
  if (loading && !product) {
    return (
      <div style={loadingWrapStyle}>
        <div style={spinnerStyle} />
        <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '1rem', fontFamily: "'Inter',sans-serif" }}>
          Loading product…
        </p>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Not Found (GraphQL failed AND no mock match)
  // ─────────────────────────────────────────────────────────────────────────
  if (!product) {
    return (
      <div style={loadingWrapStyle}>
        <p style={{ color: '#ff4444', fontFamily: "'Inter',sans-serif" }}>
          Product not found.
        </p>
        <Link href="/" style={{ color: '#cc0000', marginTop: '1rem', display: 'block' }}>← Back to Home</Link>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ backgroundColor: '#000000', color: '#ffffff', minHeight: '100vh' }}>

      {/* ── BREADCRUMB ── */}
      <div style={{ padding: '1.25rem clamp(1.5rem,5vw,4rem)', borderBottom: '1px solid rgba(255,255,255,0.06)', maxWidth: '1400px', margin: '0 auto' }}>
        <nav style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>HOME</Link>
          <span>›</span>
          <Link href={`/collections/${product._isMock ? (MOCK_PRODUCTS.find(p => p.slug === slug)?.category || '') : ''}`} style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>
            PRODUCTS
          </Link>
          <span>›</span>
          <span style={{ color: 'rgba(255,255,255,0.65)' }}>{product.name.toUpperCase()}</span>
        </nav>
      </div>

      {/* ── PRODUCT MAIN SECTION ── */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: 'clamp(2rem,4vw,3.5rem) clamp(1.5rem,5vw,4rem)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(2rem,5vw,5rem)', alignItems: 'start' }} className="product-layout">

          {/* ─ LEFT: Gallery ─ */}
          <div>
            {/* Main Image */}
            <div style={{
              position: 'relative',
              aspectRatio: '3/4',
              backgroundColor: '#111111',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <img
                key={activeImg}
                src={images[activeImg]}
                alt={product.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center top',
                  animation: 'fadeImg 0.3s ease',
                }}
              />
              {/* Arrow overlays */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}
                    style={galleryArrowStyle('left')}
                    aria-label="Previous image"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setActiveImg(i => (i + 1) % images.length)}
                    style={galleryArrowStyle('right')}
                    aria-label="Next image"
                  >
                    ›
                  </button>
                </>
              )}
              {/* Image counter */}
              <span style={{
                position: 'absolute', bottom: '12px', right: '14px',
                fontFamily: "'Inter',sans-serif", fontSize: '0.65rem', fontWeight: 700,
                color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em',
                backgroundColor: 'rgba(0,0,0,0.55)', padding: '3px 8px', backdropFilter: 'blur(4px)',
              }}>
                {activeImg + 1} / {images.length}
              </span>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.8rem', flexWrap: 'wrap' }}>
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImg(idx)}
                    style={{
                      width: '72px',
                      height: '90px',
                      padding: 0,
                      border: `2px solid ${idx === activeImg ? '#cc0000' : 'rgba(255,255,255,0.1)'}`,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      backgroundColor: '#111111',
                      transition: 'border-color 0.2s ease',
                      flexShrink: 0,
                    }}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─ RIGHT: Product Info ─ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {/* Brand label */}
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.65rem', fontWeight: 700, color: '#cc0000', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
              RED HEX INDUSTRIES
            </span>

            {/* Product Name */}
            <h1 style={{
              fontFamily: "'Oswald',sans-serif",
              fontSize: 'clamp(1.8rem,3.5vw,2.8rem)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
              lineHeight: 1.05,
              margin: 0,
            }}>
              {product.name}
            </h1>

            {/* SKU */}
            {activeVariant?.sku && (
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', margin: 0, letterSpacing: '0.1em' }}>
                SKU: {activeVariant.sku}
              </p>
            )}

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
              <span style={{
                fontFamily: "'Oswald',sans-serif",
                fontSize: 'clamp(1.6rem,2.8vw,2.2rem)',
                fontWeight: 700,
                color: '#ffffff',
              }}>
                {activeVariant ? formatPrice(activeVariant.priceWithTax) : '—'}
              </span>
              {activeVariant?.stockLevel && (
                <span style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: activeVariant.stockLevel === 'OUT_OF_STOCK' ? '#ff4444' : '#4caf50',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}>
                  {activeVariant.stockLevel === 'OUT_OF_STOCK' ? 'Out of Stock' : 'In Stock'}
                </span>
              )}
            </div>

            {/* Divider */}
            <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.08)' }} />

            {/* Description */}
            <div>
              <p style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '0.9rem',
                color: 'rgba(255,255,255,0.58)',
                lineHeight: 1.8,
                margin: 0,
              }}>
                {product.description
                  ? (product._isMock
                    // mock descriptions can contain HTML — strip tags for the short blurb
                    ? product.description.replace(/<[^>]+>/g, ' ').trim()
                    : product.description)
                  : 'Premium quality garment crafted to the highest manufacturing standards by RED HEX INDUSTRIES. Designed for performance, built to last.'}
              </p>
            </div>

            {/* Variant / Size Selector */}
            {variants.length > 0 && (
              <div>
                <p style={selectorLabelStyle}>
                  SELECT SIZE / VARIANT:&nbsp;
                  <span style={{ color: '#cc0000' }}>{activeVariant?.name ? getVariantLabel(activeVariant.name) : ''}</span>
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.6rem' }}>
                  {variants.map((v: any) => {
                    const isActive = v.id === activeVariantId;
                    const isOOS = v.stockLevel === 'OUT_OF_STOCK';
                    return (
                      <button
                        key={v.id}
                        onClick={() => !isOOS && setSelectedVariantId(v.id)}
                        disabled={isOOS}
                        style={{
                          fontFamily: "'Inter',sans-serif",
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                          padding: '0.55rem 1.1rem',
                          border: `1.5px solid ${isActive ? '#cc0000' : 'rgba(255,255,255,0.18)'}`,
                          backgroundColor: isActive ? '#cc0000' : 'transparent',
                          color: isOOS ? 'rgba(255,255,255,0.25)' : '#ffffff',
                          cursor: isOOS ? 'not-allowed' : 'pointer',
                          textDecoration: isOOS ? 'line-through' : 'none',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {getVariantLabel(v.name)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div>
              <p style={selectorLabelStyle}>QUANTITY:</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginTop: '0.6rem', width: 'fit-content', border: '1px solid rgba(255,255,255,0.18)' }}>
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  style={{ ...qtyBtnStyle, opacity: qty <= 1 ? 0.3 : 1, cursor: qty <= 1 ? 'not-allowed' : 'pointer' }}
                  disabled={qty <= 1}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span style={{
                  fontFamily: "'Oswald',sans-serif",
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: '#ffffff',
                  minWidth: '48px',
                  textAlign: 'center',
                  padding: '0.6rem 0',
                  borderLeft: '1px solid rgba(255,255,255,0.12)',
                  borderRight: '1px solid rgba(255,255,255,0.12)',
                }}>
                  {qty}
                </span>
                <button
                  onClick={() => setQty(q => Math.min(99, q + 1))}
                  style={{ ...qtyBtnStyle, opacity: qty >= 99 ? 0.3 : 1, cursor: qty >= 99 ? 'not-allowed' : 'pointer' }}
                  disabled={qty >= 99}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={handleAddToCart}
                disabled={!activeVariantId}
                style={{
                  fontFamily: "'Oswald',sans-serif",
                  fontSize: '1rem',
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: '#ffffff',
                  backgroundColor: '#cc0000',
                  border: 'none',
                  padding: '1.1rem 2rem',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'background-color 0.25s ease, transform 0.2s ease',
                  clipPath: 'polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)',
                }}
                className="add-to-cart-btn"
              >
                🛒 ADD TO CART
              </button>

              {/* Status message */}
              {cartMsg && (
                <div style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '0.82rem',
                  padding: '0.7rem 1rem',
                  backgroundColor: cartStatus === 'success' ? 'rgba(76,175,80,0.12)' : 'rgba(255,68,68,0.12)',
                  border: `1px solid ${cartStatus === 'success' ? 'rgba(76,175,80,0.3)' : 'rgba(255,68,68,0.3)'}`,
                  color: cartStatus === 'success' ? '#4caf50' : '#ff4444',
                }}>
                  {cartMsg}
                </div>
              )}

              {/* Request a Quote */}
              <a
                href={`https://wa.me/923114903270?text=Hi%2C%20I'm%20interested%20in%20${encodeURIComponent(product.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  color: '#25d366',
                  textDecoration: 'none',
                  textAlign: 'center',
                  padding: '0.8rem',
                  border: '1px solid rgba(37,211,102,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#25d366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                CHAT ON WHATSAPP
              </a>

              <Link
                href="/contact"
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  color: 'rgba(255,255,255,0.5)',
                  textDecoration: 'none',
                  textAlign: 'center',
                  paddingTop: '0.4rem',
                }}
              >
                Need a bulk order? CONTACT US →
              </Link>
            </div>

            {/* Product Trust Strip */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3,1fr)',
              gap: '0.5rem',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              paddingTop: '1.5rem',
            }}>
              {[
                { icon: '🚀', label: 'Fast Delivery' },
                { icon: '🔒', label: 'Secure Payment' },
                { icon: '✔️', label: 'Quality Assured' },
              ].map(item => (
                <div key={item.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{item.icon}</div>
                  <span style={{
                    fontFamily: "'Inter',sans-serif",
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    color: 'rgba(255,255,255,0.45)',
                    textTransform: 'uppercase',
                  }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TABS: Description | Size Guide | Shipping ── */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 clamp(1.5rem,5vw,4rem) clamp(2rem,4vw,4rem)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Tab Headers */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '2rem' }}>
          {(['description', 'size-guide', 'shipping'] as const).map((tab) => {
            const labels: Record<string, string> = {
              description: 'Description',
              'size-guide': 'Size Guide',
              shipping: 'Shipping Info',
            };
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: activeTab === tab ? '#ffffff' : 'rgba(255,255,255,0.35)',
                  background: 'none',
                  border: 'none',
                  borderBottom: `2px solid ${activeTab === tab ? '#cc0000' : 'transparent'}`,
                  padding: '1rem 1.5rem',
                  cursor: 'pointer',
                  transition: 'color 0.2s ease, border-color 0.2s ease',
                  marginBottom: '-1px',
                }}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.9rem', color: 'rgba(255,255,255,0.58)', lineHeight: 1.9, maxWidth: '800px' }}>
          {activeTab === 'description' && (
            <div>
              {product.description
                ? (product._isMock
                    ? <div dangerouslySetInnerHTML={{ __html: product.description }} />
                    : <p>{product.description}</p>)
                : (
                  <p>
                    Premium quality garment crafted to the highest manufacturing standards by RED HEX INDUSTRIES.
                    Each piece is individually quality-checked before dispatch to ensure consistent excellence.
                    Designed for performance, built to last through rigorous use and repeated washing.
                  </p>
                )}
            </div>
          )}
          {activeTab === 'size-guide' && (
            <div>
              <p style={{ marginTop: 0 }}>All measurements are in centimetres (cm). Please refer to the chart below when selecting your size.</p>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    {['Size', 'Chest', 'Length', 'Sleeve'].map(h => (
                      <th key={h} style={{ padding: '0.65rem 1rem', textAlign: 'left', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { size: 'XS',  chest: '84–89',   length: '65', sleeve: '58' },
                    { size: 'S',   chest: '90–95',   length: '67', sleeve: '60' },
                    { size: 'M',   chest: '96–101',  length: '69', sleeve: '62' },
                    { size: 'L',   chest: '102–107', length: '71', sleeve: '64' },
                    { size: 'XL',  chest: '108–113', length: '73', sleeve: '66' },
                    { size: 'XXL', chest: '114–120', length: '75', sleeve: '68' },
                  ].map(row => (
                    <tr key={row.size} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.7rem 1rem', color: '#ffffff', fontWeight: 700 }}>{row.size}</td>
                      <td style={{ padding: '0.7rem 1rem' }}>{row.chest}</td>
                      <td style={{ padding: '0.7rem 1rem' }}>{row.length}</td>
                      <td style={{ padding: '0.7rem 1rem' }}>{row.sleeve}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {activeTab === 'shipping' && (
            <div>
              <p style={{ marginTop: 0 }}>RED HEX INDUSTRIES ships worldwide. Here are our standard shipping options:</p>
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <li><strong style={{ color: '#fff' }}>Standard Shipping</strong> – 7–14 business days (tracked)</li>
                <li><strong style={{ color: '#fff' }}>Express Shipping</strong> – 3–5 business days (tracked + priority)</li>
                <li><strong style={{ color: '#fff' }}>Bulk / B2B Orders</strong> – Contact us for dedicated freight solutions</li>
              </ul>
              <p style={{ marginTop: '1.25rem' }}>
                Custom branding and MOQ (minimum order quantity) inquiries can be submitted via our{' '}
                <Link href="/contact" style={{ color: '#cc0000' }}>Contact Page</Link> or through WhatsApp.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── RELATED PRODUCTS ── */}
      {relatedProducts.length > 0 && (
        <section style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: 'clamp(2rem,4vw,4rem) clamp(1.5rem,5vw,4rem)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ width: 32, height: 2, backgroundColor: '#cc0000' }} />
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.65rem', fontWeight: 700, color: '#cc0000', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
                You May Also Like
              </span>
            </div>
            <h2 style={{ fontFamily: "'Oswald',sans-serif", fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 700, textTransform: 'uppercase', margin: 0, letterSpacing: '0.04em' }}>
              RELATED PRODUCTS
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.5rem' }} className="related-grid">
            {relatedProducts.map((rp) => (
              <article key={rp.id} style={relatedCardStyle} className="related-card-hover">
                <Link href={`/products/${rp.slug}`} style={{ display: 'block', overflow: 'hidden', aspectRatio: '3/4', position: 'relative' }}>
                  <img
                    src={rp.image}
                    alt={rp.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                    className="related-card-img"
                  />
                </Link>
                <div style={{ padding: '1rem' }}>
                  <Link href={`/products/${rp.slug}`} style={{ textDecoration: 'none' }}>
                    <h3 style={{ fontFamily: "'Oswald',sans-serif", fontSize: '0.95rem', fontWeight: 600, color: '#ffffff', textTransform: 'uppercase', margin: '0 0 0.4rem', lineHeight: 1.2 }}>
                      {rp.name}
                    </h3>
                  </Link>
                  <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
                    ${rp.price.toFixed(2)}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* FOOTER */}
      <Footer />

      {/* Global styles */}
      <style>{`
        @keyframes fadeImg {
          from { opacity: 0.6; transform: scale(1.01); }
          to   { opacity: 1;   transform: scale(1); }
        }
        @media (max-width: 900px) {
          .product-layout {
            grid-template-columns: 1fr !important;
          }
          .related-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 500px) {
          .related-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        .add-to-cart-btn:hover:not(:disabled) {
          background-color: #aa0000 !important;
          transform: translateY(-2px);
        }
        .related-card-hover:hover .related-card-img {
          transform: scale(1.04);
        }
        .related-card-hover:hover {
          border-color: rgba(204,0,0,0.4) !important;
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Style constants
// ─────────────────────────────────────────────────────────────────────────────
function galleryArrowStyle(side: 'left' | 'right'): React.CSSProperties {
  return {
    position: 'absolute',
    top: '50%',
    [side]: '12px',
    transform: 'translateY(-50%)',
    fontFamily: 'sans-serif',
    fontSize: '2rem',
    lineHeight: 1,
    color: '#ffffff',
    backgroundColor: 'rgba(0,0,0,0.45)',
    border: 'none',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    backdropFilter: 'blur(4px)',
    zIndex: 2,
    transition: 'background-color 0.2s ease',
  };
}

const selectorLabelStyle: React.CSSProperties = {
  fontFamily: "'Inter',sans-serif",
  fontSize: '0.7rem',
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.55)',
  margin: 0,
};

const qtyBtnStyle: React.CSSProperties = {
  fontFamily: "'Oswald',sans-serif",
  fontSize: '1.3rem',
  fontWeight: 600,
  color: '#ffffff',
  backgroundColor: 'transparent',
  border: 'none',
  width: '44px',
  height: '44px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background-color 0.2s ease',
};

const loadingWrapStyle: React.CSSProperties = {
  backgroundColor: '#000000',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
};

const spinnerStyle: React.CSSProperties = {
  width: '40px',
  height: '40px',
  border: '3px solid rgba(255,255,255,0.1)',
  borderTop: '3px solid #cc0000',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
};

const relatedCardStyle: React.CSSProperties = {
  backgroundColor: '#111111',
  border: '1px solid rgba(255,255,255,0.06)',
  display: 'flex',
  flexDirection: 'column',
  transition: 'border-color 0.3s ease',
};
