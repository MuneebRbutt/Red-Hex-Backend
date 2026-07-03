'use client';

import { useEffect, useRef, useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Stats data
// ─────────────────────────────────────────────────────────────────────────────
const STATS = [
  { target: 120,  suffix: '+',  label: 'WORKERS',           icon: '👷' },
  { target: 85,   suffix: '+',  label: 'MACHINES',          icon: '⚙️' },
  { target: 10,   suffix: 'K+', label: 'HAPPY CUSTOMERS',   icon: '🤝' },
  { target: 30,   suffix: '+',  label: 'CONSULTANTS',       icon: '💼' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Easing — ease-out cubic
// ─────────────────────────────────────────────────────────────────────────────
function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

// ─────────────────────────────────────────────────────────────────────────────
// Single animated counter
// ─────────────────────────────────────────────────────────────────────────────
function Counter({
  target,
  suffix,
  label,
  started,
  index,
}: {
  target: number;
  suffix: string;
  label: string;
  started: boolean;
  index: number;
}) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!started) return;
    const duration = 1800;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.round(easeOut(progress) * target));
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
    };

    // Stagger start per card
    const delay = index * 120;
    const timer = setTimeout(() => {
      frameRef.current = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(timer);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [started, target, index]);

  return <>{count}{suffix}</>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function StatsSection({ statsOnly = false }: { statsOnly?: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible]   = useState(false); // section fade-in
  const [counting, setCounting] = useState(false); // counter trigger

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          // slight delay before counters start so the section animates in first
          setTimeout(() => setCounting(true), 300);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="stats-heading"
      style={{
        backgroundColor: '#000000',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* ── Decorative radial glows ── */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 50% at 15% 50%, rgba(204,0,0,0.07) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 85% 50%, rgba(204,0,0,0.05) 0%, transparent 70%)',
      }} />

      {/* ── CTA / headline block ─────────────────────────────────────── */}
      {!statsOnly && (
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: 'clamp(3.5rem, 7vw, 6rem) clamp(1.5rem, 5vw, 4rem) 0',
          textAlign: 'center',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.65s ease, transform 0.65s ease',
        }}
      >
        {/* Eye-label */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{ width: 32, height: 1, backgroundColor: '#cc0000' }} />
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.62rem', fontWeight: 700,
            letterSpacing: '0.3em', textTransform: 'uppercase' as const,
            color: '#cc0000',
          }}>
            Our Family
          </span>
          <div style={{ width: 32, height: 1, backgroundColor: '#cc0000' }} />
        </div>

        {/* Main headline */}
        <h2
          id="stats-heading"
          style={{
            fontFamily: "'Oswald', 'Bebas Neue', sans-serif",
            fontSize: 'clamp(2.4rem, 6vw, 5rem)',
            fontWeight: 700,
            color: '#ffffff',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.04em',
            lineHeight: 1,
            marginBottom: '1.25rem',
          }}
        >
          BECOME A{' '}
          <span style={{
            color: 'transparent',
            WebkitTextStroke: '1px #cc0000',
            textShadow: '0 0 40px rgba(204,0,0,0.35)',
          }}>
            RED HEX
          </span>
          {' '}INDUSTRIES{' '}
          <span style={{ color: '#cc0000' }}>FAMILY</span>
        </h2>

        {/* Sub-text */}
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 'clamp(0.85rem, 1.5vw, 1rem)',
          color: 'rgba(255,255,255,0.45)',
          lineHeight: 1.75,
          maxWidth: '560px',
          margin: '0 auto 2.25rem',
        }}>
          Join thousands of brands, teams, and entrepreneurs who trust RED HEX INDUSTRIES
          for premium custom garments — crafted to order, shipped worldwide.
        </p>

        {/* ORDER NOW button */}
        <a
          href="/contact"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.76rem',
            fontWeight: 800,
            letterSpacing: '0.22em',
            textTransform: 'uppercase' as const,
            color: '#000000',
            backgroundColor: '#cc0000',
            padding: '1rem 2.8rem',
            textDecoration: 'none',
            clipPath: 'polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)',
            transition: 'background-color 0.25s ease, transform 0.25s ease',
            position: 'relative',
          }}
          className="order-now-btn"
          onMouseEnter={e => {
            (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#aa0000';
            (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#cc0000';
            (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
          }}
        >
          ORDER NOW
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>
      </div>
      )}

      {/* ── Divider ── */}
      {!statsOnly && (
      <div style={{
        maxWidth: '1400px',
        margin: '3.5rem auto 0',
        padding: '0 clamp(1.5rem, 5vw, 4rem)',
        height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(204,0,0,0.4), transparent)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.8s ease 0.3s',
      }} />
      )}

      {/* ── Stats row ─────────────────────────────────────────────────── */}
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: statsOnly
            ? 'clamp(3.5rem, 7vw, 6rem) clamp(1.5rem, 5vw, 4rem)'
            : 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 5vw, 4rem) clamp(3.5rem, 7vw, 6rem)',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '2px',
        }}
        className="stats-grid"
      >
        {STATS.map((stat, idx) => (
          <div
            key={stat.label}
            style={{
              padding: 'clamp(2rem, 3.5vw, 3rem) clamp(1rem, 2vw, 2rem)',
              textAlign: 'center',
              position: 'relative',
              backgroundColor: idx % 2 === 0 ? '#0a0a0a' : '#000000',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(20px)',
              transition: `opacity 0.55s ease ${0.35 + idx * 0.1}s, transform 0.55s ease ${0.35 + idx * 0.1}s`,
            }}
          >
            {/* Top red accent bar */}
            <div style={{
              position: 'absolute',
              top: 0, left: '20%', right: '20%',
              height: 2,
              backgroundColor: '#cc0000',
              transform: counting ? 'scaleX(1)' : 'scaleX(0)',
              transition: `transform 0.6s ease ${0.4 + idx * 0.12}s`,
              transformOrigin: 'left',
            }} />

            {/* Number */}
            <p style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: 'clamp(3rem, 6vw, 5.5rem)',
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1,
              margin: '0 0 0.5rem',
              letterSpacing: '-0.01em',
              textShadow: counting ? '0 0 60px rgba(204,0,0,0.2)' : 'none',
              transition: 'text-shadow 0.4s ease',
            }}>
              <Counter
                target={stat.target}
                suffix={stat.suffix}
                label={stat.label}
                started={counting}
                index={idx}
              />
            </p>

            {/* Divider dot */}
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              backgroundColor: '#cc0000',
              margin: '0 auto 0.75rem',
              transform: counting ? 'scale(1)' : 'scale(0)',
              transition: `transform 0.4s ease ${0.6 + idx * 0.1}s`,
            }} />

            {/* Label */}
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 'clamp(0.6rem, 1.1vw, 0.72rem)',
              fontWeight: 700,
              letterSpacing: '0.25em',
              textTransform: 'uppercase' as const,
              color: 'rgba(255,255,255,0.38)',
              margin: 0,
            }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* ── Responsive styles ── */}
      <style>{`
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 420px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </section>
  );
}
