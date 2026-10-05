'use client';

import { CATEGORIES } from '@/lib/categories';
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Footer from '@/components/layout/Footer';

// ─────────────────────────────────────────────────────────────────────────────
// Category configurations and subcategory mapping
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORY_MAP: Record<string, { label: string; subs: string[] }> = Object.fromEntries(CATEGORIES.map(c => [c.slug, { label: c.name, subs: [] }]));

const SUBCAT_TO_PARENT: Record<string, { parentSlug: string; parentLabel: string; label: string }> = {};

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function CollectionClient({ 
  slug, 
  initialVariants = [],
  serverCollectionName = '',
  serverCollectionDesc = ''
}: { 
  slug: string; 
  initialVariants?: any[];
  serverCollectionName?: string;
  serverCollectionDesc?: string;
}) {
  // Removed priceRange state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Determine Category vs Subcategory context
  const subcatInfo = SUBCAT_TO_PARENT[slug];
  const isSubcategory = !!subcatInfo;
  
  const parentSlug = isSubcategory ? subcatInfo.parentSlug : slug;
  const parentLabel = isSubcategory ? subcatInfo.parentLabel : (CATEGORY_MAP[slug]?.label || slug.replace(/-/g, ' ').toUpperCase());
  const currentLabel = isSubcategory ? subcatInfo.label : parentLabel;

  const collectionName = serverCollectionName || currentLabel;
  const collectionDesc = serverCollectionDesc || `Explore gloves from our ${currentLabel} collection.`;

  const variants = initialVariants;

  const filteredVariants = variants;
  const totalPages = Math.ceil(filteredVariants.length / itemsPerPage) || 1;
  const paginatedVariants = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredVariants.slice(start, start + itemsPerPage);
  }, [filteredVariants, currentPage]);

  return (
    <div style={{ backgroundColor: '#000000', color: '#ffffff', minHeight: '100vh' }}>
      
      {/* ── HERO BANNER ── */}
      <section
        style={{
          position: 'relative',
          padding: '6.5rem 1.5rem 5rem',
          textAlign: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'linear-gradient(to bottom, #0a0a0a, #000000)',
        }}
      >
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}>
          <span style={{
            fontFamily: "'Inter', sans-serif", fontSize: '0.65rem', fontWeight: 700,
            color: '#cc0000', letterSpacing: '0.35em', textTransform: 'uppercase',
          }}>
            TANAURA / COLLECTION
          </span>
          <h1 style={{
            fontFamily: "'Oswald', sans-serif", fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 700, margin: '0.5rem 0 1rem', textTransform: 'uppercase', letterSpacing: '0.03em',
          }}>
            {collectionName}
          </h1>
          <p style={{
            fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)',
            lineHeight: 1.6, margin: 0,
          }}>
            {collectionDesc}
          </p>
        </div>
      </section>

      {/* ── BREADCRUMBS ── */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '1rem 1.5rem' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>HOME</Link>
          <span>&gt;</span>
          {isSubcategory ? (
            <>
              <Link href={`/collections/${parentSlug}`} style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', textTransform: 'uppercase' }}>
                {parentLabel}
              </Link>
              <span>&gt;</span>
              <span style={{ color: '#ffffff', textTransform: 'uppercase' }}>{currentLabel}</span>
            </>
          ) : (
            <span style={{ color: '#ffffff', textTransform: 'uppercase' }}>{currentLabel}</span>
          )}
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '3rem clamp(1rem, 4vw, 3rem)' }}>
        <div className="collection-layout">
          
          {/* ─ PRODUCT GRID ─ */}
          <div style={{ width: '100%' }}>
            {paginatedVariants.length === 0 ? (
              /* Coming Soon styled message */
              <div style={comingSoonStyle}>
                <span style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📢</span>
                <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.8rem', color: '#ffffff', letterSpacing: '0.05em', margin: '0 0 0.5rem' }}>COMING SOON</h3>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.88rem', color: 'rgba(255,255,255,0.45)', margin: 0, maxWidth: '420px', lineHeight: 1.6 }}>
                  Our {currentLabel} collection is coming soon. Product details and images will be added shortly.
                </p>
              </div>
            ) : (
              <div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '1.5rem 1.2rem',
                  }}
                  className="collection-grid"
                >
                  {paginatedVariants.map((item: any) => {
                    const productAssets = item.product?.assets || [];
                    const img1 = item.product?.featuredAsset?.preview || item.mockImg || 'https://placehold.co/600x800/1a1a1a/ffffff?text=Product';
                    const img2 = productAssets[1]?.preview || productAssets[0]?.preview || null;

                    return (
                      <article
                        key={item.id}
                        style={cardStyle}
                        className="product-card-hover"
                      >
                        <Link href={`/products/${item.product.slug}`} className="block relative w-full overflow-hidden bg-white h-[280px] md:h-[320px]">
                          <img
                            src={img1}
                            alt={item.name}
                            style={{
                              width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center',
                              transition: 'transform 0.4s ease',
                            }}
                            className="product-card-img primary-img"
                          />
                          {img2 && (
                            <img
                              src={img2}
                              alt={`${item.name} alternate view`}
                              style={{
                                position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center',
                                opacity: 0, transition: 'opacity 0.4s ease',
                              }}
                              className="secondary-img"
                            />
                          )}
                          <div style={tagStyle}>NEW</div>
                        </Link>
                        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', flexGrow: 1 }}>
                          <span style={{ fontSize: '0.58rem', fontWeight: 700, color: '#cc0000', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                            {parentLabel}
                          </span>
                          <Link href={`/products/${item.product.slug}`} style={{ textDecoration: 'none' }}>
                            <h3 style={cardTitleStyle}>{item.name}</h3>
                          </Link>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 'auto', paddingTop: '0.6rem' }}>
                            <Link href={`/products/${item.product.slug}`} style={viewProductBtnStyle}>
                              VIEW PRODUCT
                            </Link>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {/* PAGINATION */}
                {totalPages > 1 && (
                  <div style={paginationWrapStyle}>
                    <button
                      onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      style={{ ...pageBtnStyle, opacity: currentPage === 1 ? 0.35 : 1 }}
                    >
                      &larr; PREV
                    </button>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {Array.from({ length: totalPages }).map((_, idx) => {
                        const pageNum = idx + 1;
                        const isActive = pageNum === currentPage;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            style={{
                              ...pageNumberStyle,
                              backgroundColor: isActive ? '#cc0000' : 'transparent',
                              borderColor: isActive ? '#cc0000' : 'rgba(255,255,255,0.2)',
                            }}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      style={{ ...pageBtnStyle, opacity: currentPage === totalPages ? 0.35 : 1 }}
                    >
                      NEXT &rarr;
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />

      {/* Styled Responsive overrides */}
      <style>{`
        @media (max-width: 1024px) {
          .collection-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        @media (max-width: 900px) {
          .collection-layout {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
          }
          .collection-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 480px) {
          .collection-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        .product-card-hover:hover .secondary-img {
          opacity: 1 !important;
        }
        .product-card-hover:hover .primary-img {
          transform: scale(1.04);
        }
        .product-card-hover:hover {
          border-color: rgba(204, 0, 0, 0.4) !important;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles objects
// ─────────────────────────────────────────────────────────────────────────────
const filterHeadingStyle: React.CSSProperties = {
  fontFamily: "'Oswald', sans-serif",
  fontSize: '0.95rem',
  fontWeight: 600,
  letterSpacing: '0.15em',
  borderBottom: '1px solid rgba(255,255,255,0.1)',
  paddingBottom: '0.6rem',
  marginBottom: '1rem',
  textTransform: 'uppercase',
};

const radioLabelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.6rem',
  fontFamily: "'Inter', sans-serif",
  fontSize: '0.82rem',
  color: 'rgba(255,255,255,0.7)',
  cursor: 'pointer',
};

const radioInputStyle: React.CSSProperties = {
  accentColor: '#cc0000',
  width: '15px',
  height: '15px',
};

const statusMessageStyle: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '1rem',
  textAlign: 'center',
  padding: '6rem 0',
  color: 'rgba(255,255,255,0.4)',
};

const comingSoonStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  padding: '6rem 1.5rem',
  backgroundColor: '#0d0d0d',
  border: '1px dashed rgba(255,255,255,0.15)',
};

const cardStyle: React.CSSProperties = {
  backgroundColor: '#111111',
  border: '1px solid rgba(255,255,255,0.06)',
  display: 'flex',
  flexDirection: 'column',
  transition: 'border-color 0.3s ease',
  height: '100%',
};

const tagStyle: React.CSSProperties = {
  position: 'absolute',
  top: '10px',
  left: '10px',
  backgroundColor: '#cc0000',
  color: '#000000',
  fontFamily: "'Inter', sans-serif",
  fontSize: '0.6rem',
  fontWeight: 850,
  letterSpacing: '0.15em',
  padding: '3px 8px',
  zIndex: 1,
};

const cardTitleStyle: React.CSSProperties = {
  fontFamily: "'Oswald', sans-serif",
  fontSize: '0.95rem',
  fontWeight: 600,
  color: '#ffffff',
  textTransform: 'uppercase',
  margin: 0,
  lineHeight: 1.25,
};

const cardPriceStyle: React.CSSProperties = {
  fontFamily: "'Oswald', sans-serif",
  fontSize: '1.05rem',
  fontWeight: 750,
  color: '#ffffff',
};

const viewProductBtnStyle: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '0.6rem',
  fontWeight: 800,
  letterSpacing: '0.08em',
  color: '#ffffff',
  backgroundColor: '#cc0000',
  border: 'none',
  padding: '6px 12px',
  cursor: 'pointer',
  textDecoration: 'none',
};

const inlineSpinnerStyle: React.CSSProperties = {
  width: '30px',
  height: '30px',
  border: '3px solid rgba(255,255,255,0.1)',
  borderTop: '3px solid #cc0000',
  borderRadius: '50%',
  display: 'inline-block',
  animation: 'spin 0.8s linear infinite',
};

const paginationWrapStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '1.5rem',
  marginTop: '4rem',
  paddingTop: '2rem',
  borderTop: '1px solid rgba(255,255,255,0.06)',
};

const pageBtnStyle: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '0.72rem',
  fontWeight: 700,
  letterSpacing: '0.15em',
  color: '#ffffff',
  backgroundColor: 'transparent',
  border: '1px solid rgba(255,255,255,0.2)',
  padding: '0.5rem 1.2rem',
  cursor: 'pointer',
};

const pageNumberStyle: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '0.75rem',
  fontWeight: 700,
  color: '#ffffff',
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid',
  cursor: 'pointer',
};
