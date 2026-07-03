'use client';

import { useEffect, useRef, useState } from 'react';
import Footer from '@/components/layout/Footer';
import StatsSection from '@/components/home/StatsSection';
import { SITE } from '@/lib/siteConfig';

const WHY_CHOOSE = [
  {
    title: 'Quality',
    icon: '◆',
    text: 'ISO-standard quality control, premium fabrics, and triple-checked stitching on every unit we produce.',
  },
  {
    title: 'Fast Delivery',
    icon: '⚡',
    text: 'Streamlined in-house production means faster turnaround — from sample approval to bulk shipment.',
  },
  {
    title: 'Custom MOQ',
    icon: '✦',
    text: 'Flexible minimum order quantities tailored to startups, teams, and enterprise brands alike.',
  },
  {
    title: 'Global Shipping',
    icon: '🌐',
    text: 'Worldwide fulfillment with trusted logistics partners. Your garments, delivered wherever you operate.',
  },
];

const PROCESS_STEPS = [
  { step: '01', title: 'Consultation', desc: 'Share your design, quantities, and timeline with our team.' },
  { step: '02', title: 'Sampling', desc: 'We produce a sample for your approval before bulk production.' },
  { step: '03', title: 'Production', desc: 'Full-scale manufacturing with in-house QC at every stage.' },
  { step: '04', title: 'Quality Check', desc: 'Final inspection, packaging, and compliance verification.' },
  { step: '05', title: 'Delivery', desc: 'Shipped worldwide with tracking and dedicated support.' },
];

export default function AboutPageClient() {
  const [visible, setVisible] = useState(false);
  const storyRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLElement>(null);
  const [timelineVisible, setTimelineVisible] = useState(false);

  useEffect(() => {
    const el = storyRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = timelineRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimelineVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ backgroundColor: '#000000', color: '#ffffff', minHeight: '100vh' }}>
      {/* Hero */}
      <section
        style={{
          position: 'relative',
          padding: 'clamp(5rem, 12vw, 9rem) 1.5rem clamp(4rem, 8vw, 6rem)',
          textAlign: 'center',
          background: 'linear-gradient(180deg, #111111 0%, #000000 70%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          overflow: 'hidden',
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(204,0,0,0.12) 0%, transparent 65%)',
            pointerEvents: 'none',
          }}
        />
        <span
          style={{
            position: 'relative',
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.62rem',
            fontWeight: 700,
            letterSpacing: '0.35em',
            color: '#cc0000',
            textTransform: 'uppercase',
          }}
        >
          Est. 2018 · Lahore, Pakistan
        </span>
        <h1
          style={{
            position: 'relative',
            fontFamily: "'Oswald', sans-serif",
            fontSize: 'clamp(2.2rem, 7vw, 4.8rem)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            margin: '1rem 0',
            lineHeight: 1.05,
          }}
        >
          About{' '}
          <span style={{ color: '#cc0000' }}>RED HEX</span>
          <br />
          Industries
        </h1>
        <p
          style={{
            position: 'relative',
            fontFamily: "'Inter', sans-serif",
            fontSize: 'clamp(0.9rem, 1.5vw, 1.05rem)',
            color: 'rgba(255,255,255,0.5)',
            maxWidth: '640px',
            margin: '0 auto',
            lineHeight: 1.75,
          }}
        >
          Premium custom garments for brands, teams, and entrepreneurs — engineered in Lahore, shipped worldwide.
        </p>
      </section>

      {/* Our Story */}
      <section
        ref={storyRef}
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: 'clamp(3rem, 6vw, 5rem) clamp(1.25rem, 4vw, 2rem)',
        }}
      >
        <div
          className="story-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'clamp(2rem, 4vw, 3.5rem)',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              position: 'relative',
              minHeight: '420px',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.08)',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateX(0)' : 'translateX(-20px)',
              transition: 'opacity 0.6s ease, transform 0.6s ease',
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=900&q=80"
              alt="RED HEX INDUSTRIES manufacturing facility"
              style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: '420px' }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 50%)',
              }}
            />
          </div>
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateX(0)' : 'translateX(20px)',
              transition: 'opacity 0.6s ease 0.15s, transform 0.6s ease 0.15s',
            }}
          >
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.62rem',
                fontWeight: 700,
                letterSpacing: '0.3em',
                color: '#cc0000',
                textTransform: 'uppercase',
              }}
            >
              Our Story
            </span>
            <h2
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
                margin: '0.75rem 0 1.25rem',
                lineHeight: 1.1,
              }}
            >
              Crafting Performance Wear Since 2018
            </h2>
            <p style={bodyText}>
              RED HEX INDUSTRIES was founded on a single conviction: that premium quality garments should be
              accessible to every brand, team, and individual — without compromise.
            </p>
            <p style={bodyText}>
              Our manufacturing facility in Lahore operates with ISO-standard quality control, end-to-end in-house
              production, and dedicated R&D for performance fabrics. Whether it&apos;s a 12-piece custom order or a
              10,000-unit wholesale run, we deliver the same unrelenting standard.
            </p>
            <p style={{ ...bodyText, marginBottom: 0 }}>
              From sportswear and gymwear to safety workwear and jacket collections — every piece we produce reflects
              our commitment to precision, durability, and design.
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section
        style={{
          backgroundColor: '#0a0a0a',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: 'clamp(3rem, 6vw, 5rem) clamp(1.25rem, 4vw, 2rem)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={eyebrow}>Why Choose Us</span>
            <h2 style={sectionTitle}>Built for Brands That Demand More</h2>
          </div>
          <div
            className="features-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1.25rem',
            }}
          >
            {WHY_CHOOSE.map((item) => (
              <div
                key={item.title}
                style={{
                  backgroundColor: '#111111',
                  border: '1px solid rgba(255,255,255,0.07)',
                  padding: '1.75rem 1.5rem',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: '1.5rem',
                    color: '#cc0000',
                    marginBottom: '0.85rem',
                  }}
                >
                  {item.icon}
                </div>
                <h3
                  style={{
                    fontFamily: "'Oswald', sans-serif",
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    margin: '0 0 0.65rem',
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.85rem',
                    color: 'rgba(255,255,255,0.55)',
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CEO / Team */}
      <section
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: 'clamp(3rem, 6vw, 5rem) clamp(1.25rem, 4vw, 2rem)',
        }}
      >
        <div
          className="ceo-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '320px 1fr',
            gap: '2.5rem',
            alignItems: 'center',
            backgroundColor: '#0d0d0d',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: 'clamp(1.5rem, 3vw, 2.5rem)',
          }}
        >
          <div style={{ overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
            <img
              src={SITE.ceo.image}
              alt={`${SITE.ceo.name} – ${SITE.ceo.title}`}
              style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover', display: 'block' }}
            />
          </div>
          <div>
            <span style={eyebrow}>Leadership</span>
            <h2
              style={{
                ...sectionTitle,
                textAlign: 'left',
                marginBottom: '0.35rem',
              }}
            >
              {SITE.ceo.name}
            </h2>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#cc0000',
                margin: '0 0 1.5rem',
              }}
            >
              {SITE.ceo.title}
            </p>
            <blockquote
              style={{
                fontFamily: "'Georgia', serif",
                fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
                fontStyle: 'italic',
                color: 'rgba(255,255,255,0.8)',
                lineHeight: 1.75,
                margin: 0,
                paddingLeft: '1.25rem',
                borderLeft: '3px solid #cc0000',
              }}
            >
              &ldquo;{SITE.ceo.quote}&rdquo;
            </blockquote>
          </div>
        </div>
      </section>

      {/* Stats */}
      <StatsSection statsOnly />

      {/* Manufacturing timeline */}
      <section
        ref={timelineRef}
        style={{
          backgroundColor: '#0a0a0a',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: 'clamp(3rem, 6vw, 5rem) clamp(1.25rem, 4vw, 2rem)',
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={eyebrow}>How We Work</span>
            <h2 style={sectionTitle}>Manufacturing Process</h2>
          </div>
          <div style={{ position: 'relative' }}>
            <div
              aria-hidden
              style={{
                position: 'absolute',
                left: '1.35rem',
                top: 0,
                bottom: 0,
                width: 2,
                background: 'linear-gradient(180deg, #cc0000, rgba(204,0,0,0.15))',
              }}
            />
            {PROCESS_STEPS.map((item, idx) => (
              <div
                key={item.step}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2.75rem 1fr',
                  gap: '1.25rem',
                  marginBottom: idx < PROCESS_STEPS.length - 1 ? '2rem' : 0,
                  opacity: timelineVisible ? 1 : 0,
                  transform: timelineVisible ? 'translateX(0)' : 'translateX(-12px)',
                  transition: `opacity 0.5s ease ${idx * 0.1}s, transform 0.5s ease ${idx * 0.1}s`,
                }}
              >
                <div
                  style={{
                    width: '2.75rem',
                    height: '2.75rem',
                    borderRadius: '50%',
                    backgroundColor: '#cc0000',
                    color: '#000000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: "'Oswald', sans-serif",
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {item.step}
                </div>
                <div style={{ paddingTop: '0.35rem' }}>
                  <h3
                    style={{
                      fontFamily: "'Oswald', sans-serif",
                      fontSize: '1.15rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      margin: '0 0 0.4rem',
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.88rem',
                      color: 'rgba(255,255,255,0.55)',
                      lineHeight: 1.7,
                      margin: 0,
                    }}
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        @media (max-width: 900px) {
          .story-grid { grid-template-columns: 1fr !important; }
          .features-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .ceo-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 520px) {
          .features-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

const eyebrow: React.CSSProperties = {
  display: 'block',
  fontFamily: "'Inter', sans-serif",
  fontSize: '0.62rem',
  fontWeight: 700,
  letterSpacing: '0.3em',
  color: '#cc0000',
  textTransform: 'uppercase',
  marginBottom: '0.65rem',
};

const sectionTitle: React.CSSProperties = {
  fontFamily: "'Oswald', sans-serif",
  fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.03em',
  margin: 0,
};

const bodyText: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '0.92rem',
  color: 'rgba(255,255,255,0.58)',
  lineHeight: 1.85,
  marginBottom: '1rem',
};
