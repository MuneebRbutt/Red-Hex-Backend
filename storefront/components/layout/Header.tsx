'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { gql } from 'graphql-tag';
import { Search, Heart, ShoppingCart, User, Menu, X, ChevronDown, ChevronRight } from 'lucide-react';
import { useCart } from '@/lib/cartContext';
import CartSidebar from '@/components/cart/CartSidebar';

const GET_CART_QUANTITY = gql`
  query GetCartQuantity {
    activeOrder {
      id
      totalQuantity
    }
  }
`;

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Navigation Data â€” RED HEX INDUSTRIES
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface CategoryItem {
  name: string;
  href: string;
}

interface MegaMenuCategory {
  title: string;
  columns: {
    heading: string;
    items: CategoryItem[];
  }[];
}

const MEGA_MENUS: Record<string, MegaMenuCategory> = {
  'SPORTSWEAR': {
    title: 'SPORTSWEAR',
    columns: [
      {
        heading: 'Field Sports',
        items: [
          { name: 'Soccer Uniform',            href: '/collections/soccer-uniform' },
          { name: 'Baseball Uniform',           href: '/collections/baseball-uniform' },
          { name: 'American Football Uniform',  href: '/collections/american-football-uniform' },
        ],
      },
      {
        heading: 'Court & Arena',
        items: [
          { name: 'Basketball Uniform',         href: '/collections/basketball-uniform' },
          { name: 'Ice Hockey Uniform',         href: '/collections/ice-hockey-uniform' },
          { name: 'Tennis Uniform',             href: '/collections/tennis-uniform' },
        ],
      },
    ],
  },

  'CASUAL WEAR': {
    title: 'CASUAL WEAR',
    columns: [
      {
        heading: 'Tops',
        items: [
          { name: 'Hoodies',     href: '/collections/hoodies' },
          { name: 'Sweatshirt',  href: '/collections/sweatshirt' },
          { name: 'T-Shirts',    href: '/collections/t-shirts' },
        ],
      },
      {
        heading: 'Bottoms & Sets',
        items: [
          { name: 'Tracksuits',  href: '/collections/tracksuits' },
          { name: 'Sweat Pants', href: '/collections/sweat-pants' },
        ],
      },
    ],
  },

  'JACKET COLLECTIONS': {
    title: 'JACKET COLLECTIONS',
    columns: [
      {
        heading: 'Jackets',
        items: [
          { name: 'Bomber Jackets',  href: '/collections/bomber-jackets' },
          { name: 'Puffer Jackets',  href: '/collections/puffer-jackets' },
          { name: 'Leather Jackets', href: '/collections/leather-jackets' },
          { name: 'Varsity Jacket',  href: '/collections/varsity-jacket' },
          { name: 'Denim Jacket',       href: '/collections/denim-jacket' },
          { name: 'Windbreaker Jacket', href: '/collections/windbreaker-jacket' },
        ],
      },
    ],
  },

  'GYMWEAR & ACTIVEWEAR': {
    title: 'GYMWEAR & ACTIVEWEAR',
    columns: [
      {
        heading: 'Tops & Shirts',
        items: [
          { name: 'Tank Top',            href: '/collections/tank-top' },
          { name: 'Compression Shirts',  href: '/collections/compression-shirts' },
          { name: 'Dry-Fit T-Shirts',    href: '/collections/dry-fit-t-shirts' },
          { name: 'Track Jackets',       href: '/collections/track-jackets' },
        ],
      },
      {
        heading: 'Bottoms & Gear',
        items: [
          { name: 'Gym Shorts',    href: '/collections/gym-shorts' },
          { name: 'Wrist Straps',  href: '/collections/wrist-straps' },
          { name: 'Headbands',     href: '/collections/headbands' },
          { name: 'Gym Socks',     href: '/collections/gym-socks' },
        ],
      },
    ],
  },

  'SAFETY & WORK WEAR': {
    title: 'SAFETY & WORK WEAR',
    columns: [
      {
        heading: 'Protective Gear',
        items: [
          { name: 'Safety Vests',       href: '/collections/safety-vests' },
          { name: 'Construction Suits', href: '/collections/construction-suits' },
          { name: 'Safety Jackets',     href: '/collections/safety-jackets' },
        ],
      },
    ],
  },
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Component
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function Header() {
  const { data } = useQuery(GET_CART_QUANTITY, {
    fetchPolicy: 'cache-and-network',
  });

  const { totalItems, openSidebar } = useCart();

  const [isSticky, setIsSticky]                               = useState(false);
  const [activeHoverMenu, setActiveHoverMenu]                 = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen]                       = useState(false);
  const [expandedMobileCategory, setExpandedMobileCategory]   = useState<string | null>(null);

  // Sticky scroll
  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = isDrawerOpen ? 'hidden' : 'unset';
  }, [isDrawerOpen]);

  const navLinks = [
    { name: 'Home',                href: '/' },
    { name: 'SPORTSWEAR',          href: '/collections/sportswear',         hasMega: true },
    { name: 'CASUAL WEAR',         href: '/collections/casual-wear',        hasMega: true },
    { name: 'JACKET COLLECTIONS',  href: '/collections/jacket-collections', hasMega: true },
    { name: 'GYMWEAR & ACTIVEWEAR',href: '/collections/gymwear-activewear', hasMega: true },
    { name: 'SAFETY & WORK WEAR',  href: '/collections/safety-work-wear',   hasMega: true },
    { name: 'Contact Us',          href: '/contact' },
  ];

  const handleMobileCategoryClick = (categoryName: string) => {
    setExpandedMobileCategory(prev => prev === categoryName ? null : categoryName);
  };

  return (
    <>
      {/* â”€â”€ Announcement Bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="bg-brand-black text-brand-white text-xs uppercase tracking-widest py-2.5 px-4 border-b border-zinc-900 z-[60] relative overflow-hidden select-none">
        {/* Desktop */}
        <div className="hidden md:flex justify-center items-center gap-1.5 font-semibold">
          <span>Worldwide Fast Shipping</span>
          <span className="text-brand-gold font-bold">|</span>
          <span>Daily Updates Through Videos</span>
          <span className="text-brand-gold font-bold">|</span>
          <span>Low Custom MOQ</span>
        </div>

        {/* Mobile Marquee */}
        <div className="md:hidden w-full overflow-hidden whitespace-nowrap relative flex items-center">
          <div className="animate-marquee inline-block font-semibold">
            WORLDWIDE FAST SHIPPING &nbsp;|&nbsp; DAILY UPDATES THROUGH VIDEOS &nbsp;|&nbsp; LOW CUSTOM MOQ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            WORLDWIDE FAST SHIPPING &nbsp;|&nbsp; DAILY UPDATES THROUGH VIDEOS &nbsp;|&nbsp; LOW CUSTOM MOQ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </div>
        </div>
      </div>

      {/* â”€â”€ Main Navbar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <header
        className={`w-full z-50 transition-all duration-brand ${
          isSticky
            ? 'fixed top-0 bg-brand-black/90 backdrop-blur border-b border-brand-dark shadow-lg py-3'
            : 'relative bg-brand-black border-b border-brand-dark/40 py-4'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center">

          {/* Hamburger (Mobile) */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="md:hidden text-brand-white hover:text-brand-gold transition-colors duration-brand"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* â”€â”€ Logo â”€â”€ */}
          <a href="/" className="flex items-center gap-2 leading-none select-none group">
            {/* Hexagon icon mark */}
            <svg
              width="32" height="32" viewBox="0 0 32 32"
              className="flex-shrink-0 transition-transform duration-300 group-hover:rotate-[30deg]"
              aria-hidden="true"
            >
              <polygon
                points="16,2 29,9 29,23 16,30 3,23 3,9"
                fill="#cc0000"
                stroke="#ff2222"
                strokeWidth="1"
              />
              <polygon
                points="16,7 25,12 25,20 16,25 7,20 7,12"
                fill="none"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="0.8"
              />
            </svg>

            {/* Word-mark */}
            <span className="font-heading leading-none tracking-widest">
              <span
                style={{ color: '#cc0000', fontSize: '1.15rem', fontWeight: 900, letterSpacing: '0.08em' }}
                className="group-hover:text-red-500 transition-colors duration-300"
              >
                RED HEX
              </span>
              {' '}
              <span
                style={{ color: '#ffffff', fontSize: '1.15rem', fontWeight: 700, letterSpacing: '0.06em' }}
              >
                INDUSTRIES
              </span>
            </span>
          </a>

          {/* â”€â”€ Desktop Nav â”€â”€ */}
          <nav
            className="hidden lg:flex items-center gap-6 xl:gap-8 text-[0.7rem] uppercase tracking-wider font-semibold text-zinc-400 h-full"
            onMouseLeave={() => setActiveHoverMenu(null)}
          >
            {navLinks.map((link) => (
              <div
                key={link.name}
                className="relative py-2 h-full flex items-center"
                onMouseEnter={() => {
                  if (link.hasMega) setActiveHoverMenu(link.name);
                  else setActiveHoverMenu(null);
                }}
              >
                <a
                  href={link.href}
                  className={`hover:text-brand-white transition-colors duration-brand flex items-center gap-1 whitespace-nowrap ${
                    activeHoverMenu === link.name ? 'text-brand-white' : ''
                  }`}
                >
                  {link.name}
                  {link.hasMega && (
                    <ChevronDown
                      className={`w-3 h-3 transition-transform duration-brand ${
                        activeHoverMenu === link.name ? 'rotate-180 text-brand-gold' : ''
                      }`}
                    />
                  )}
                </a>

                {/* Mega Dropdown */}
                {link.hasMega && activeHoverMenu === link.name && MEGA_MENUS[link.name] && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 min-w-[520px] z-50 animate-fadeIn">
                    <div className="bg-brand-black/98 border border-zinc-800 p-8 shadow-2xl backdrop-blur grid gap-6 text-left"
                      style={{
                        gridTemplateColumns: `repeat(${MEGA_MENUS[link.name].columns.length}, 1fr)`,
                      }}
                    >
                      {/* Red top accent bar */}
                      <div
                        className="absolute top-4 left-8 right-8 h-[2px] bg-gradient-to-r from-red-600 via-red-500 to-transparent"
                        style={{ gridColumn: `1 / -1` }}
                        aria-hidden="true"
                      />

                      {MEGA_MENUS[link.name].columns.map((column) => (
                        <div key={column.heading}>
                          <h4 className="font-heading text-brand-gold tracking-wider text-xs font-bold border-b border-zinc-800 pb-2 mb-3 uppercase">
                            {column.heading}
                          </h4>
                          <ul className="flex flex-col gap-2">
                            {column.items.map((item) => (
                              <li key={item.name}>
                                <a
                                  href={item.href}
                                  className="text-xs text-zinc-400 hover:text-brand-white transition-colors duration-brand block py-0.5 hover:pl-1"
                                  style={{ transition: 'color 0.2s ease, padding-left 0.2s ease' }}
                                >
                                  {item.name}
                                </a>
                              </li>
                            ))}
                          </ul>

                          {/* "View All" link per column group */}
                          <a
                            href={`/collections/${link.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                            className="inline-block mt-4 text-[0.6rem] font-bold tracking-widest uppercase text-red-500 hover:text-red-400 transition-colors"
                          >
                            View All â†’
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* â”€â”€ Action Icons â”€â”€ */}
          <div className="flex items-center gap-4">
            <button
              className="text-brand-white hover:text-brand-gold transition-colors duration-brand"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              className="hidden sm:inline-block text-brand-white hover:text-brand-gold transition-colors duration-brand"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); openSidebar(); }}
              className="text-brand-white hover:text-brand-gold transition-colors duration-brand relative p-1 flex items-center justify-center group"
              aria-label="Open Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#cc0000] text-white font-heading text-[8px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center border border-black shadow px-1">
                  {totalItems}
                </span>
              )}
            </button>
            <a
              href="/login"
              className="text-brand-white hover:text-brand-gold transition-colors duration-brand"
              aria-label="Account / Login"
            >
              <User className="w-5 h-5" />
            </a>
          </div>
        </div>
      </header>

      {/* â”€â”€ Mobile Drawer Backdrop â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div
        className={`fixed inset-0 bg-brand-black/80 backdrop-blur-sm z-50 transition-opacity duration-300 lg:hidden ${
          isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsDrawerOpen(false)}
      />

      {/* â”€â”€ Mobile Slide-in Drawer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div
        className={`fixed top-0 bottom-0 left-0 w-4/5 max-w-[360px] bg-[#0a0a0a] border-r border-zinc-900 z-[60] shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-in-out lg:hidden ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="overflow-y-auto flex-1 p-6">
          {/* Drawer Header */}
          <div className="flex justify-between items-center pb-6 border-b border-zinc-900">
            <a href="/" className="flex items-center gap-2 leading-none" onClick={() => setIsDrawerOpen(false)}>
              <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
                <polygon points="16,2 29,9 29,23 16,30 3,23 3,9" fill="#cc0000" stroke="#ff2222" strokeWidth="1" />
                <polygon points="16,7 25,12 25,20 16,25 7,20 7,12" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
              </svg>
              <span className="font-heading leading-none">
                <span style={{ color: '#cc0000', fontSize: '0.95rem', fontWeight: 900, letterSpacing: '0.06em' }}>RED HEX</span>
                {' '}
                <span style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.04em' }}>INDUSTRIES</span>
              </span>
            </a>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="text-zinc-400 hover:text-brand-white transition-colors duration-brand p-1"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Drawer Nav Links */}
          <nav className="mt-6 flex flex-col gap-1">
            {navLinks.map((link) => (
              <div key={link.name} className="border-b border-zinc-900/60">
                {link.hasMega ? (
                  <>
                    {/* Accordion toggle */}
                    <button
                      onClick={() => handleMobileCategoryClick(link.name)}
                      className="w-full flex justify-between items-center py-3.5 text-[0.72rem] font-bold uppercase tracking-wider text-zinc-300 hover:text-brand-white transition-colors"
                    >
                      <span>{link.name}</span>
                      <ChevronRight
                        className={`w-4 h-4 text-zinc-600 transition-transform duration-300 ${
                          expandedMobileCategory === link.name ? 'rotate-90 text-red-500' : ''
                        }`}
                      />
                    </button>

                    {/* Accordion panel */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        expandedMobileCategory === link.name ? 'max-h-[600px] pb-4 pl-3' : 'max-h-0'
                      }`}
                    >
                      <div className="flex flex-col gap-5">
                        {MEGA_MENUS[link.name].columns.map((column) => (
                          <div key={column.heading}>
                            <h5 className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-brand-gold mb-2">
                              {column.heading}
                            </h5>
                            <ul className="flex flex-col gap-1.5 pl-2">
                              {column.items.map((item) => (
                                <li key={item.name}>
                                  <a
                                    href={item.href}
                                    onClick={() => setIsDrawerOpen(false)}
                                    className="text-xs text-zinc-400 hover:text-brand-white transition-colors block py-0.5"
                                  >
                                    {item.name}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <a
                    href={link.href}
                    onClick={() => setIsDrawerOpen(false)}
                    className="block py-3.5 text-[0.72rem] font-bold uppercase tracking-wider text-zinc-300 hover:text-brand-white transition-colors"
                  >
                    {link.name}
                  </a>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Drawer Footer */}
        <div className="border-t border-zinc-900 p-6 flex flex-col gap-3">
          <a
            href="/wishlist"
            onClick={() => setIsDrawerOpen(false)}
            className="flex items-center gap-3 text-xs text-zinc-400 hover:text-brand-white uppercase font-semibold tracking-wider transition-colors"
          >
            <Heart className="w-4 h-4 text-zinc-600" />
            Wishlist
          </a>
          <a
            href="/login"
            onClick={() => setIsDrawerOpen(false)}
            className="flex items-center gap-3 text-xs text-zinc-400 hover:text-brand-white uppercase font-semibold tracking-wider transition-colors"
          >
            <User className="w-4 h-4 text-zinc-600" />
            Account / Login
          </a>
        </div>
      </div>

      {/* Spacer when navbar is sticky */}
      {isSticky && <div className="h-[65px] md:h-[73px]" />}
      <CartSidebar />
    </>
  );
}

