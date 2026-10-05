import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';
import { CATEGORIES } from '@/lib/categories';

export default function CategoryGrid() {
  return (
    <section
      id="categories"
      aria-labelledby="category-heading"
      className="bg-[#050505] px-4 sm:px-6 lg:px-8 py-24 sm:py-32 relative overflow-hidden scroll-mt-24 border-t border-white/5"
    >
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-gold/5 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-gold/5 blur-[160px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-gold/30 bg-brand-gold/10 text-brand-gold text-xs font-semibold uppercase tracking-[0.25em] mb-5">
            <ShieldCheck size={14} className="text-brand-gold" aria-hidden="true" />
            <span>Export Lineup &amp; Manufacturing</span>
          </div>

          <h2
            id="category-heading"
            className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white tracking-wide uppercase mb-5"
          >
            Specialized Glove Collections
          </h2>

          <p className="text-zinc-400 text-sm sm:text-base md:text-lg font-light leading-relaxed">
            Seven export-grade manufacturing categories engineered with premium leathers and high-tenacity technical fibers. Certified to international safety, abrasion, and ergonomic standards.
          </p>
        </div>

        {/* Categories Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {CATEGORIES.map((category, index) => {
            const itemNumber = (index + 1).toString().padStart(2, '0');
            const hasImage = Boolean(category.image);

            return (
              <Link
                key={category.slug}
                href={'/collections/' + category.slug}
                className="group relative flex flex-col rounded-2xl overflow-hidden bg-gradient-to-b from-[#141416] via-[#0d0d0f] to-[#08080a] border border-brand-gold/20 hover:border-brand-gold/60 transition-all duration-500 shadow-[0_15px_35px_-10px_rgba(0,0,0,0.7)] hover:shadow-[0_22px_45px_-5px_rgba(201,168,76,0.18)] hover:-translate-y-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
              >
                {/* Visual Image Showcase */}
                <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-zinc-950">
                  {hasImage ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      loading="lazy"
                      className="w-full h-full object-cover object-center group-hover:scale-108 group-hover:brightness-105 transition-all duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-600">
                      <span>No image preview</span>
                    </div>
                  )}

                  {/* Gradient Vignette over image for contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0f] via-black/20 to-black/60 pointer-events-none" />

                  {/* Top Meta Badges */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-mono tracking-widest font-semibold bg-black/70 backdrop-blur-md border border-white/10 text-brand-gold shadow-md">
                      {itemNumber} / TANAURA
                    </span>

                    {category.badge && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-sans font-medium tracking-wider bg-brand-gold/15 backdrop-blur-md border border-brand-gold/30 text-brand-gold shadow-md">
                        {category.badge}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Content Details */}
                <div className="p-6 sm:p-7 flex flex-col flex-grow relative">
                  {category.tagline && (
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold mb-2 block">
                      {category.tagline}
                    </span>
                  )}

                  <h3 className="font-heading text-2xl sm:text-3xl text-white tracking-wide uppercase group-hover:text-brand-gold transition-colors duration-300 mb-3">
                    {category.name}
                  </h3>

                  <p className="text-zinc-400 text-sm leading-relaxed mb-6 font-light line-clamp-3">
                    {category.description}
                  </p>

                  {/* Footer Action Bar */}
                  <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between text-xs uppercase tracking-widest font-semibold text-brand-gold group-hover:text-white transition-colors duration-300">
                    <span>Explore Collection</span>
                    <div className="w-8 h-8 rounded-full bg-brand-gold/10 group-hover:bg-brand-gold group-hover:text-black text-brand-gold border border-brand-gold/30 flex items-center justify-center transition-all duration-300">
                      <ArrowUpRight
                        size={16}
                        className="transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300"
                        aria-hidden="true"
                      />
                    </div>
                  </div>

                  {/* Subtle animated hover glow line at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-gold to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
