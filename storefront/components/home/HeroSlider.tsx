'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Slide {
  id: number;
  image: string;
  headline: string;
  subheadline: string;
  cta: string;
  ctaHref: string;
}

const slides: Slide[] = [
  {
    id: 1,
    image: 'https://placehold.co/1920x800/111111/ffffff?text=STREET+WEAR+COLLECTION',
    headline: 'DEFINE YOUR STREET',
    subheadline: 'Premium streetwear crafted for those who lead, not follow.',
    cta: 'SHOP STREET WEAR',
    ctaHref: '/street-wear',
  },
  {
    id: 2,
    image: 'https://placehold.co/1920x800/1a1a1a/c9a84c?text=SPORTS+PERFORMANCE+GEAR',
    headline: 'BUILT FOR CHAMPIONS',
    subheadline: 'High-performance sports uniforms engineered for elite athletes.',
    cta: 'SHOP SPORTS WEAR',
    ctaHref: '/sports-wear',
  },
  {
    id: 3,
    image: 'https://placehold.co/1920x800/0d0d0d/ffffff?text=LEATHER+GARMENTS',
    headline: 'RAW. REFINED. REAL.',
    subheadline: 'Handcrafted leather garments for the bold and unapologetic.',
    cta: 'SHOP LEATHER',
    ctaHref: '/leather-garment',
  },
];

const AUTOPLAY_INTERVAL = 5000;

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrent((index + slides.length) % slides.length);
      setTimeout(() => setIsTransitioning(false), 600);
    },
    [isTransitioning]
  );

  const goNext = useCallback(() => {
    goTo(current + 1);
  }, [current, goTo]);

  const goPrev = useCallback(() => {
    goTo(current - 1);
  }, [current, goTo]);

  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setTimeout(goNext, AUTOPLAY_INTERVAL);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [current, isPaused, goNext]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev]);

  return (
    <section
      className="relative w-full overflow-hidden bg-black"
      style={{ height: '100vh', minHeight: '560px' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Hero Image Slider"
    >
      {/* Slides */}
      {slides.map((slide, idx) => (
        <div
          key={slide.id}
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            opacity: idx === current ? 1 : 0,
            pointerEvents: idx === current ? 'auto' : 'none',
          }}
          aria-hidden={idx !== current}
        >
          {/* Background Image */}
          <img
            src={slide.image}
            alt={slide.headline}
            className="w-full h-full object-cover transition-transform duration-[6000ms] ease-out"
            style={{ transform: idx === current ? 'scale(1)' : 'scale(1.04)' }}
            loading={idx === 0 ? 'eager' : 'lazy'}
          />

          {/* Dark Gradient Overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(135deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.65) 100%)',
            }}
          />

          {/* Content */}
          <div className="absolute inset-0 flex items-center justify-center text-center px-6">
            <div
              className="max-w-3xl transition-all duration-700 ease-out"
              style={{
                opacity: idx === current ? 1 : 0,
                transform: idx === current ? 'translateY(0)' : 'translateY(28px)',
                transitionDelay: idx === current ? '300ms' : '0ms',
              }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-4"
                style={{ color: '#c9a84c', letterSpacing: '0.35em' }}
              >
                NEW COLLECTION 2024
              </p>

              <h1
                className="font-black uppercase text-white mb-5 leading-none"
                style={{
                  fontFamily: "'Oswald', 'Bebas Neue', sans-serif",
                  fontSize: 'clamp(3rem, 9vw, 7.5rem)',
                  letterSpacing: '0.02em',
                }}
              >
                {slide.headline}
              </h1>

              <p
                className="mb-9 mx-auto font-light"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 'clamp(0.95rem, 2vw, 1.2rem)',
                  color: 'rgba(255,255,255,0.78)',
                  maxWidth: '520px',
                  lineHeight: '1.6',
                }}
              >
                {slide.subheadline}
              </p>

              <Link
                href={slide.ctaHref}
                className="hero-cta-btn inline-block bg-white text-black font-bold uppercase text-sm border-2 border-white"
                style={{
                  letterSpacing: '0.18em',
                  padding: '1rem 2.8rem',
                  clipPath: 'polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)',
                  transition: 'background 0.3s ease, color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {slide.cta}
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Left Arrow */}
      <button
        className="absolute left-6 top-1/2 -translate-y-1/2 z-10 hero-arrow-btn flex items-center justify-center"
        onClick={goPrev}
        aria-label="Previous slide"
        style={{
          width: '52px',
          height: '52px',
          background: 'rgba(0,0,0,0.45)',
          border: '1px solid rgba(255,255,255,0.2)',
          color: '#fff',
          backdropFilter: 'blur(6px)',
          transition: 'background 0.3s ease, border-color 0.3s ease',
        }}
      >
        <ChevronLeft size={28} strokeWidth={2.5} />
      </button>

      {/* Right Arrow */}
      <button
        className="absolute right-6 top-1/2 -translate-y-1/2 z-10 hero-arrow-btn flex items-center justify-center"
        onClick={goNext}
        aria-label="Next slide"
        style={{
          width: '52px',
          height: '52px',
          background: 'rgba(0,0,0,0.45)',
          border: '1px solid rgba(255,255,255,0.2)',
          color: '#fff',
          backdropFilter: 'blur(6px)',
          transition: 'background 0.3s ease, border-color 0.3s ease',
        }}
      >
        <ChevronRight size={28} strokeWidth={2.5} />
      </button>

      {/* Navigation Dots */}
      <div
        className="absolute z-10 flex gap-2.5 items-center"
        style={{ bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)' }}
        role="tablist"
        aria-label="Slide indicators"
      >
        {slides.map((slide, idx) => (
          <button
            key={slide.id}
            className="hero-dot-btn p-0 cursor-pointer"
            onClick={() => goTo(idx)}
            role="tab"
            aria-selected={idx === current}
            aria-label={`Go to slide ${idx + 1}`}
            style={{
              height: '8px',
              width: idx === current ? '28px' : '8px',
              borderRadius: idx === current ? '4px' : '50%',
              background: idx === current ? '#c9a84c' : 'rgba(255,255,255,0.35)',
              border: `1px solid ${idx === current ? '#c9a84c' : 'rgba(255,255,255,0.5)'}`,
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10"
        style={{ height: '3px', background: 'rgba(255,255,255,0.1)' }}
      >
        <div
          key={current}
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, #c9a84c, #ffffff)',
            animation: !isPaused ? `heroProgress ${AUTOPLAY_INTERVAL}ms linear forwards` : 'none',
          }}
        />
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          section {
            height: 75vh !important;
            min-height: 480px !important;
          }
        }
        @media (max-width: 640px) {
          .hero-arrow-btn {
            width: 40px !important;
            height: 40px !important;
          }
        }
        .hero-cta-btn:hover {
          background: transparent !important;
          color: #ffffff !important;
          box-shadow: 0 0 32px rgba(201, 168, 76, 0.25);
          transform: translateY(-2px);
        }
        .hero-arrow-btn:hover {
          background: rgba(201, 168, 76, 0.2) !important;
          border-color: #c9a84c !important;
        }
        @keyframes heroProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </section>
  );
}
