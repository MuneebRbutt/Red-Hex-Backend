'use client';

import { Truck, Globe, ShieldCheck, Headphones } from 'lucide-react';

const BADGES = [
  {
    icon: Truck,
    label: 'FAST DELIVERY',
    sub: 'WORLDWIDE',
  },
  {
    icon: Globe,
    label: 'INTERNATIONAL',
    sub: 'SHIPPING',
  },
  {
    icon: ShieldCheck,
    label: 'SECURE',
    sub: 'PAYMENTS',
  },
  {
    icon: Headphones,
    label: '24×7 CLIENT',
    sub: 'SUPPORT',
  },
];

export default function TrustBadges() {
  return (
    <section
      aria-label="Trust badges"
      style={{
        backgroundColor: '#0d0d0d',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
        }}
        className="trust-badges-grid"
      >
        {BADGES.map((badge, idx) => {
          const Icon = badge.icon;
          const isLast = idx === BADGES.length - 1;

          return (
            <div
              key={badge.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                padding: 'clamp(1.25rem, 3vw, 2rem) clamp(1rem, 2.5vw, 2rem)',
                borderRight: isLast ? 'none' : '1px solid rgba(255,255,255,0.06)',
                transition: 'background-color 0.3s ease',
                cursor: 'default',
              }}
              className="trust-badge-item"
            >
              {/* Icon in red hexagon */}
              <div
                style={{
                  flexShrink: 0,
                  width: 46,
                  height: 46,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(204,0,0,0.12)',
                  border: '1px solid rgba(204,0,0,0.25)',
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                  transition: 'background-color 0.3s ease, border-color 0.3s ease',
                }}
                className="trust-icon-wrap"
              >
                <Icon
                  size={20}
                  color="#cc0000"
                  strokeWidth={1.8}
                />
              </div>

              {/* Text */}
              <div>
                <p
                  style={{
                    fontFamily: "'Oswald', sans-serif",
                    fontSize: 'clamp(0.85rem, 1.5vw, 1.05rem)',
                    fontWeight: 600,
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    lineHeight: 1.1,
                    margin: '0 0 0.15rem',
                  }}
                >
                  {badge.label}
                </p>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 'clamp(0.6rem, 1vw, 0.7rem)',
                    fontWeight: 700,
                    color: '#cc0000',
                    textTransform: 'uppercase',
                    letterSpacing: '0.2em',
                    margin: 0,
                  }}
                >
                  {badge.sub}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .trust-badge-item:hover {
          background-color: rgba(204,0,0,0.04) !important;
        }
        .trust-badge-item:hover .trust-icon-wrap {
          background-color: rgba(204,0,0,0.2) !important;
          border-color: rgba(204,0,0,0.5) !important;
        }
        @media (max-width: 768px) {
          .trust-badges-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .trust-badge-item {
            border-right: none !important;
            border-bottom: 1px solid rgba(255,255,255,0.06) !important;
          }
          .trust-badge-item:nth-child(odd) {
            border-right: 1px solid rgba(255,255,255,0.06) !important;
          }
          .trust-badge-item:nth-last-child(-n+2) {
            border-bottom: none !important;
          }
        }
        @media (max-width: 480px) {
          .trust-badges-grid {
            grid-template-columns: 1fr !important;
          }
          .trust-badge-item {
            border-right: none !important;
            justify-content: flex-start !important;
            padding-left: 1.5rem !important;
          }
          .trust-badge-item:last-child {
            border-bottom: none !important;
          }
        }
      `}</style>
    </section>
  );
}
