import React from 'react';
import HeroSlider from '@/components/home/HeroSlider';
import CategoryGrid from '@/components/home/CategoryGrid';
import ProductTabs from '@/components/home/ProductTabs';

import Footer from '@/components/layout/Footer';
import AboutSection from '@/components/home/AboutSection';
import StatsSection from '@/components/home/StatsSection';
import TrustBadges from '@/components/home/TrustBadges';
import ContactForm from '@/components/home/ContactForm';

export default function Home() {
  return (
    <div className="min-h-screen bg-brand-black text-brand-white font-body selection:bg-brand-gold selection:text-brand-black">

      {/* Hero Slider */}
      <HeroSlider />

      {/* Category Grid */}
      <CategoryGrid />

      {/* Product Tabs */}
      <ProductTabs />

      {/* About / CEO Section */}
      <AboutSection />

      {/* Stats Counter Section */}
      <StatsSection />

      {/* Trust Badges Bar */}
      <TrustBadges />

      {/* Contact Form Section */}
      <ContactForm />

      {/* Design Showcase Section */}
      <section className="relative min-h-[50vh] flex items-center justify-center border-b border-brand-dark px-6 py-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-brand-black to-brand-black overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30"></div>
        
        <div className="max-w-4xl text-center z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-brand-gold/30 bg-brand-gold/5 text-brand-gold text-xs uppercase tracking-widest mb-6 font-mono">
            <span className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-pulse"></span>
            Drop 01 // Industrial workwear
          </div>
          
          <h2 className="font-heading text-5xl md:text-8xl tracking-tighter uppercase font-bold text-brand-white leading-none mb-6">
            Engineered <br/>For <span className="text-brand-gold">Heavy Utility</span>
          </h2>
          
          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed font-body">
            High-performance garments crafted for durability, functionality, and industrial aesthetics. Designed with premium heavy canvas, reinforced seam lines, and gold-alloy utility fixtures.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button className="btn-solid min-w-[200px]">
              Shop Collection
            </button>
            <button className="btn-outlined min-w-[200px]">
              Explore Hardware
            </button>
          </div>
        </div>
      </section>

      {/* Feature Grid / Cards Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto border-b border-brand-dark">
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl tracking-tight mb-4">Core Specifications</h2>
          <p className="text-zinc-400 font-body">Built to endure the demands of modern fabrication environments.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-industrial group">
            <div className="font-heading text-brand-gold text-2xl mb-3">01 / HEAVY CANVAS</div>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Constructed from double-weave 12oz organic duck canvas. Fire-retardant coating and triple-needle stitched seams ensure complete security.
            </p>
          </div>
          
          <div className="card-industrial group">
            <div className="font-heading text-brand-gold text-2xl mb-3">02 / MODULAR UTILITY</div>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Equipped with detachable cargo pouches, gold-plated anodized carabiners, and steel alloy rivets at key tension areas.
            </p>
          </div>
          
          <div className="card-industrial group">
            <div className="font-heading text-brand-gold text-2xl mb-3">03 / ANATOMICAL SEAMS</div>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Designed with articulated knees and offset shoulder cuts to provide maximum range of motion during manual operations.
            </p>
          </div>
        </div>
      </section>

      {/* Product Showcase Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-4">
          <div>
            <h2 className="font-heading text-4xl tracking-tight mb-2">Featured Garments</h2>
            <p className="text-zinc-400">Premium releases engineered for daily industrial tasks.</p>
          </div>
          <a href="#" className="font-heading text-brand-gold hover:text-brand-white border-b border-brand-gold hover:border-brand-white transition-all tracking-wider text-lg pb-1 uppercase">
            View All Products &rarr;
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Product 1 */}
          <div className="border border-brand-dark bg-brand-dark/20 flex flex-col group transition-all duration-brand hover:border-zinc-700">
            {/* CSS placeholder image representing industrial gear */}
            <div className="h-96 bg-zinc-900 border-b border-brand-dark flex flex-col justify-between p-6 relative overflow-hidden">
              {/* Subtle background industrial stamp effect */}
              <span className="absolute right-0 bottom-0 text-zinc-950 font-heading text-[12rem] font-bold select-none leading-none pointer-events-none transform translate-y-12 translate-x-12">
                APX
              </span>
              
              <div className="flex justify-between items-start z-10">
                <span className="bg-brand-gold text-brand-black text-xs font-bold uppercase tracking-widest px-2 py-0.5 font-mono">
                  NEW
                </span>
                <span className="text-zinc-500 text-xs font-mono">CODE: VLNC-P01</span>
              </div>
              
              {/* Abstract garment representation inside canvas */}
              <div className="self-center z-10 w-44 h-44 border border-brand-gold/20 flex items-center justify-center bg-brand-black/55 backdrop-blur shadow-2xl relative">
                <div className="w-32 h-32 border-4 border-dashed border-zinc-800"></div>
                <div className="absolute font-mono text-zinc-600 text-[10px]">12oz DOUBLE-CANVAS</div>
              </div>
              
              <div className="flex justify-between items-end z-10">
                <span className="font-heading text-xl tracking-wide uppercase">Oversize Cargo Pants</span>
                <span className="text-brand-gold font-heading text-lg font-medium">$189.00</span>
              </div>
            </div>
            <div className="p-4">
              <button className="btn-outlined w-full">
                Add to Cart
              </button>
            </div>
          </div>

          {/* Product 2 */}
          <div className="border border-brand-dark bg-brand-dark/20 flex flex-col group transition-all duration-brand hover:border-zinc-700">
            <div className="h-96 bg-zinc-900 border-b border-brand-dark flex flex-col justify-between p-6 relative overflow-hidden">
              <span className="absolute right-0 bottom-0 text-zinc-950 font-heading text-[12rem] font-bold select-none leading-none pointer-events-none transform translate-y-12 translate-x-12">
                UTL
              </span>
              <div className="flex justify-between items-start z-10">
                <span className="bg-brand-white text-brand-black text-xs font-bold uppercase tracking-widest px-2 py-0.5 font-mono">
                  LIMITED
                </span>
                <span className="text-zinc-500 text-xs font-mono">CODE: VLNC-S04</span>
              </div>
              
              <div className="self-center z-10 w-44 h-44 border border-brand-gold/20 flex items-center justify-center bg-brand-black/55 backdrop-blur shadow-2xl relative">
                <div className="w-24 h-36 border border-zinc-800 rounded"></div>
                <div className="absolute font-mono text-zinc-600 text-[10px]">WATER-REPELLENT</div>
              </div>

              <div className="flex justify-between items-end z-10">
                <span className="font-heading text-xl tracking-wide uppercase">Tactical Heavy Shirt</span>
                <span className="text-brand-gold font-heading text-lg font-medium">$145.00</span>
              </div>
            </div>
            <div className="p-4">
              <button className="btn-outlined w-full">
                Add to Cart
              </button>
            </div>
          </div>

          {/* Product 3 */}
          <div className="border border-brand-dark bg-brand-dark/20 flex flex-col group transition-all duration-brand hover:border-zinc-700">
            <div className="h-96 bg-zinc-900 border-b border-brand-dark flex flex-col justify-between p-6 relative overflow-hidden">
              <span className="absolute right-0 bottom-0 text-zinc-950 font-heading text-[12rem] font-bold select-none leading-none pointer-events-none transform translate-y-12 translate-x-12">
                HVY
              </span>
              <div className="flex justify-between items-start z-10">
                <span className="bg-brand-gold text-brand-black text-xs font-bold uppercase tracking-widest px-2 py-0.5 font-mono">
                  NEW
                </span>
                <span className="text-zinc-500 text-xs font-mono">CODE: VLNC-A02</span>
              </div>
              
              <div className="self-center z-10 w-44 h-44 border border-brand-gold/20 flex items-center justify-center bg-brand-black/55 backdrop-blur shadow-2xl relative">
                <div className="w-32 h-32 rotate-45 border-2 border-zinc-800"></div>
                <div className="absolute font-mono text-zinc-600 text-[10px]">REINFORCED KEVLAR</div>
              </div>

              <div className="flex justify-between items-end z-10">
                <span className="font-heading text-xl tracking-wide uppercase">Gold-Edition Anorak</span>
                <span className="text-brand-gold font-heading text-lg font-medium">$295.00</span>
              </div>
            </div>
            <div className="p-4">
              <button className="btn-outlined w-full">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
