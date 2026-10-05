'use client';
import { useState } from 'react';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';
import { MOCK_PRODUCTS } from '@/lib/mockProducts';

export default function ProductTabs() {
  const [activeIndex, setActiveIndex] = useState(0);
  const category = CATEGORIES[activeIndex];
  const productCount = MOCK_PRODUCTS.filter(product => product.category === category.slug).length;
  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <h2 className="font-heading text-4xl text-center mb-8">Our glove collections</h2>
      <div className="flex flex-wrap gap-2" aria-label="Glove categories">
        {CATEGORIES.map((item, index) => <button key={item.slug} type="button" aria-pressed={index === activeIndex} onClick={() => setActiveIndex(index)} className={'border px-4 py-3 text-sm ' + (index === activeIndex ? 'border-brand-gold text-brand-gold' : 'border-zinc-700 text-zinc-400')}>{item.name}</button>)}
      </div>
      <div className="text-center border border-zinc-800 p-12 mt-6">
        <h3 className="font-heading text-2xl mb-3">{productCount ? `${productCount} products available` : 'New products coming soon'}</h3>
        <p className="text-zinc-400 mb-6">{productCount ? `Explore our current ${category.name.toLowerCase()} catalogue.` : `We are preparing our ${category.name.toLowerCase()} collection.`}</p>
        <Link href={'/collections/' + category.slug} className="text-brand-gold">Explore {category.name.toLowerCase()} &rarr;</Link>
      </div>
    </section>
  );
}
