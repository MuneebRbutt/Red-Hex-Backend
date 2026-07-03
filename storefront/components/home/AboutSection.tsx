'use client';

import { useState, useEffect, useRef } from 'react';

export default function AboutSection() {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Intersection observer — animate in when scrolled into view
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="about-heading"
      style={{
        backgroundColor: '#0a0a0a',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        overflow: 'hidden',
      }}
    >
      <div
        className="about-inner"
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          minHeight: '620px',
        }}
      >
        {/* ── LEFT: Image column ─────────────────────────────────────── */}
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            minHeight: '480px',
            backgroundColor: '#111111',
          }}
        >
          {/* Portrait image */}
          <img
            src="https://placehold.co/800x1000/111111/333333?text=CEO+PORTRAIT"
            alt="Zain Arif – CEO of RED HEX INDUSTRIES"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center top',
              filter: 'grayscale(20%)',
              transition: 'transform 0.8s cubic-bezier(0.4,0,0.2,1)',
              transform: visible ? 'scale(1)' : 'scale(1.06)',
            }}
          />

          {/* Dark gradient overlay — fades into right edge on desktop */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to right, rgba(10,10,10,0) 60%, rgba(10,10,10,0.85) 100%), linear-gradient(to top, rgba(10,10,10,0.7) 0%, transparent 40%)',
              zIndex: 1,
            }}
          />

          {/* Red hex badge — top left */}
          <div
            style={{
              position: 'absolute',
              top: 28,
              left: 28,
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateX(0)' : 'translateX(-16px)',
              transition: 'opacity 0.6s ease 0.3s, transform 0.6s ease 0.3s',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden="true">
              <polygon points="16,2 29,9 29,23 16,30 3,23 3,9" fill="#cc0000" stroke="#ff3333" strokeWidth="1" />
            </svg>
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.6rem',
                fontWeight: 800,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: '#ffffff',
                opacity: 0.8,
              }}
            >
              RED HEX INDUSTRIES
            </span>
          </div>

          {/* Vertical label on bottom-left */}
          <div
            style={{
              position: 'absolute',
              bottom: 32,
              left: 28,
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(12px)',
              transition: 'opacity 0.6s ease 0.5s, transform 0.6s ease 0.5s',
            }}
          >
            <div style={{ width: 36, height: 1, backgroundColor: '#cc0000' }} />
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.6rem',
                fontWeight: 600,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              EST. 2018 · LAHORE, PK
            </span>
          </div>
        </div>

        {/* ── RIGHT: Text column ─────────────────────────────────────── */}
        <div
          style={{
            padding: 'clamp(2.5rem, 6vw, 5rem) clamp(2rem, 5vw, 4.5rem)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
            backgroundColor: '#0a0a0a',
          }}
        >
          {/* Background noise texture — purely decorative */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'radial-gradient(ellipse at 80% 20%, rgba(204,0,0,0.04) 0%, transparent 60%)',
              pointerEvents: 'none',
            }}
          />

          {/* ─ Eye-label ─ */}
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(16px)',
              transition: 'opacity 0.55s ease 0.1s, transform 0.55s ease 0.1s',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
            }}
          >
            <div style={{ width: 28, height: 1, backgroundColor: '#cc0000' }} />
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.62rem',
                fontWeight: 700,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: '#cc0000',
              }}
            >
              QUALITY · THREADLINE · STITCHERY
            </span>
          </div>

          {/* ─ Heading ─ */}
          <h2
            id="about-heading"
            style={{
              fontFamily: "'Oswald', 'Bebas Neue', sans-serif",
              fontSize: 'clamp(2rem, 4vw, 3.4rem)',
              fontWeight: 700,
              color: '#ffffff',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              lineHeight: 1.05,
              marginBottom: '1.75rem',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 0.55s ease 0.2s, transform 0.55s ease 0.2s',
            }}
          >
            CHIEF EXECUTIVE
            <br />
            <span style={{ color: '#cc0000' }}>OFFICER</span>{' '}
            <span style={{ fontSize: '65%', color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}>(CEO)</span>
          </h2>

          {/* ─ Divider ─ */}
          <div
            style={{
              width: visible ? 64 : 0,
              height: 2,
              backgroundColor: '#cc0000',
              marginBottom: '1.75rem',
              transition: 'width 0.6s ease 0.35s',
            }}
          />

          {/* ─ Body paragraphs ─ */}
          {[
            'RED HEX INDUSTRIES was founded on a single conviction: that premium quality garments should be accessible to every brand, team, and individual — without compromise. From day one, we set out to master every stitch, every seam, and every fibre.',
            'Our manufacturing facility in Lahore operates with ISO-standard quality control, end-to-end in-house production, and dedicated R&D for performance fabrics. Whether it\'s a 12-piece custom order or a 10,000-unit wholesale run, we deliver the same unrelenting standard.',
            'Every collection we produce is a statement — not just of craftsmanship, but of the belief that what you wear defines how you perform.',
          ].map((para, i) => (
            <p
              key={i}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 'clamp(0.85rem, 1.4vw, 0.97rem)',
                color: 'rgba(255,255,255,0.58)',
                lineHeight: 1.85,
                marginBottom: i < 2 ? '1.1rem' : '2.2rem',
                maxWidth: '520px',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(16px)',
                transition: `opacity 0.55s ease ${0.3 + i * 0.1}s, transform 0.55s ease ${0.3 + i * 0.1}s`,
              }}
            >
              {para}
            </p>
          ))}

          {/* ─ Signature block ─ */}
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(12px)',
              transition: 'opacity 0.55s ease 0.65s, transform 0.55s ease 0.65s',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
            }}
          >
            {/* Signature scrawl — using a styled italic font */}
            <p
              style={{
                fontFamily: "'Georgia', 'Times New Roman', serif",
                fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
                fontStyle: 'italic',
                fontWeight: 400,
                color: '#ffffff',
                letterSpacing: '0.02em',
                lineHeight: 1,
                margin: 0,
              }}
            >
              Zain Arif
            </p>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: '#cc0000',
                margin: 0,
              }}
            >
              — ZAIN ARIF / Founder & CEO, RED HEX INDUSTRIES
            </p>
          </div>

          {/* ─ Stats row ─ */}
          <div
            style={{
              marginTop: '2.5rem',
              paddingTop: '2rem',
              borderTop: '1px solid rgba(255,255,255,0.07)',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1.5rem',
              opacity: visible ? 1 : 0,
              transition: 'opacity 0.6s ease 0.75s',
            }}
            className="about-stats"
          >
            {[
              { value: '6+', label: 'Years in Business' },
              { value: '50+', label: 'Active Clients' },
              { value: '100K+', label: 'Units Delivered' },
            ].map((stat) => (
              <div key={stat.label}>
                <p
                  style={{
                    fontFamily: "'Oswald', sans-serif",
                    fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)',
                    fontWeight: 700,
                    color: '#ffffff',
                    letterSpacing: '0.02em',
                    lineHeight: 1,
                    margin: '0 0 0.3rem',
                  }}
                >
                  {stat.value}
                </p>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.38)',
                    margin: 0,
                  }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Responsive styles ─────────────────────────────────────────── */}
      <style>{`
        /* Mobile: stack image on top, text below */
        @media (max-width: 768px) {
          .about-inner {
            grid-template-columns: 1fr !important;
          }
          .about-stats {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        /* Small mobile: stats in a single row still but tighten */
        @media (max-width: 420px) {
          .about-stats {
            grid-template-columns: 1fr 1fr !important;
            gap: 1.25rem !important;
          }
        }
      `}</style>
    </section>
  );
}
