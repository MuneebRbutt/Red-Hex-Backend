'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, ArrowDownRight } from 'lucide-react';

export default function ProductionVideo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isInView, setIsInView] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isNativeControls, setIsNativeControls] = useState(false);
  const [sourcesAttached, setSourcesAttached] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  // Check reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  // Helper to load lazy video sources
  const attachSources = () => {
    if (sourcesAttached || !videoRef.current) return;
    const video = videoRef.current;
    const sources = video.querySelectorAll('source[data-src]');
    sources.forEach((sourceEl) => {
      const dataSrc = sourceEl.getAttribute('data-src');
      if (dataSrc) {
        sourceEl.setAttribute('src', dataSrc);
      }
    });
    video.load();
    setSourcesAttached(true);
  };

  // Safe play handling promise rejections
  const safePlay = () => {
    if (!videoRef.current) return;
    attachSources();
    const playPromise = videoRef.current.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Autoplay blocked by browser policy
          setIsPlaying(false);
        });
    }
  };

  const safePause = () => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    setIsPlaying(false);
  };

  // IntersectionObserver: Scroll entrance + Viewport auto play/pause
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Entrance fade-and-rise trigger
          if (entry.isIntersecting) {
            setIsInView(true);
          }

          // Preload video sources when nearing viewport (rootMargin handles it or intersection >= 0.1)
          if (entry.isIntersecting && !sourcesAttached) {
            attachSources();
          }

          // Ambient Playback logic (disabled if user prefers reduced motion)
          if (isReducedMotion) {
            return;
          }

          if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
            if (!userInteracted && !videoRef.current?.controls) {
              safePlay();
            }
          } else if (!entry.isIntersecting) {
            if (!userInteracted) {
              safePause();
            }
          }
        });
      },
      {
        threshold: [0, 0.25],
        rootMargin: '100px 0px 100px 0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [sourcesAttached, isReducedMotion, userInteracted]);

  // Handle Play/Pause Toggle
  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      safePause();
    } else {
      safePlay();
    }
  };

  // Handle Unmute & Watch: Restarts at 0:00, unmutes, enables native player controls
  const handleUnmuteAndWatch = () => {
    const video = videoRef.current;
    if (!video) return;

    setUserInteracted(true);
    attachSources();

    video.muted = false;
    video.currentTime = 0;
    video.controls = true;
    setIsNativeControls(true);

    safePlay();
    video.focus();
  };

  return (
    <section
      id="production-setup"
      aria-labelledby="production-video-heading"
      className="w-full bg-black py-20 md:py-28 px-4 sm:px-6 relative overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-brand-gold/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1100px] mx-auto w-full relative z-10">
        {/* Section Heading & Subtitle */}
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-gold/30 bg-brand-gold/10 text-brand-gold text-xs font-semibold uppercase tracking-[0.25em] mb-4">
            <span>Production Process</span>
            <ArrowDownRight size={14} aria-hidden="true" />
          </div>
          <h2
            id="production-video-heading"
            className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white tracking-wide uppercase mb-4"
          >
            State-of-the-Art Manufacturing
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-light leading-relaxed">
            Take an inside look at our export-grade production floor, precision stitching lines, and certified quality inspection protocols.
          </p>
        </div>

        {/* 16:9 Video Frame with Fade-and-Rise Entrance */}
        <div
          ref={containerRef}
          className={`relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-zinc-950 border border-brand-gold/20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_30px_rgba(201,168,76,0.08)] transition-all duration-1000 ease-out ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <video
            ref={videoRef}
            preload="none"
            poster="/videos/production-poster.jpg"
            muted
            loop
            playsInline
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            aria-label="Video showing Tanaura production setup, manufacturing, and export quality control"
            className="absolute inset-0 w-full h-full object-cover block"
          >
            <source data-src="/videos/production.webm" type="video/webm" />
            <source data-src="/videos/production.mp4" type="video/mp4" />
            <track
              kind="captions"
              src="/videos/production-captions.vtt"
              srcLang="en"
              label="English"
              default
            />
            <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-zinc-300">
              Your browser does not support HTML5 video. You can{' '}
              <a href="/videos/production.mp4" download className="text-brand-gold underline ml-1">
                download the video directly
              </a>.
            </p>
          </video>

          {/* Bottom vignette gradient for contrast */}
          {!isNativeControls && (
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none z-10" />
          )}

          {/* Ambient Overlay Controls */}
          {!isNativeControls && (
            <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 flex items-center gap-3 z-20">
              {/* Play / Pause ambient control */}
              <button
                type="button"
                onClick={handleTogglePlay}
                aria-label={isPlaying ? 'Pause background video' : 'Play production video'}
                className="inline-flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800/90 text-zinc-100 border border-white/10 backdrop-blur-md text-xs sm:text-sm font-medium transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold shadow-lg"
              >
                {isPlaying ? (
                  <>
                    <Pause size={16} aria-hidden="true" className="text-brand-gold" />
                    <span className="hidden sm:inline">Pause</span>
                  </>
                ) : (
                  <>
                    <Play size={16} aria-hidden="true" className="text-brand-gold fill-brand-gold" />
                    <span className="hidden sm:inline">Play</span>
                  </>
                )}
              </button>

              {/* Unmute & Watch Full with Audio */}
              <button
                type="button"
                onClick={handleUnmuteAndWatch}
                aria-label="Unmute and watch full video with sound from beginning"
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-lg bg-brand-gold hover:bg-[#d9b85c] text-black font-semibold text-xs sm:text-sm transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white shadow-xl shadow-brand-gold/20"
              >
                <Volume2 size={16} aria-hidden="true" />
                <span>Unmute & Watch</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
