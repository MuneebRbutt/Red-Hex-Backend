import React from 'react';
import CollectionClient from '@/components/collections/CollectionClient';

// ─────────────────────────────────────────────────────────────────────────────
// Static parameter pre-generation definition (Server Component side)
// ─────────────────────────────────────────────────────────────────────────────
export function generateStaticParams() {
  return [
    // Main category slugs
    { slug: 'sportswear' },
    { slug: 'casual-wear' },
    { slug: 'jacket-collections' },
    { slug: 'gymwear-activewear' },
    { slug: 'safety-work-wear' },
    // Sportswear subcategories
    { slug: 'soccer-uniform' },
    { slug: 'baseball-uniform' },
    { slug: 'american-football-uniform' },
    { slug: 'basketball-uniform' },
    { slug: 'ice-hockey-uniform' },
    { slug: 'tennis-uniform' },
    // Casual Wear subcategories
    { slug: 'tracksuits' },
    { slug: 'hoodies' },
    { slug: 'sweatshirt' },
    { slug: 'sweat-pants' },
    { slug: 't-shirts' },
    // Jacket Collections subcategories
    { slug: 'bomber-jackets' },
    { slug: 'puffer-jackets' },
    { slug: 'leather-jackets' },
    { slug: 'varsity-jacket' },
    // Gymwear & Activewear subcategories
    { slug: 'tank-top' },
    { slug: 'compression-shirts' },
    { slug: 'dry-fit-t-shirts' },
    { slug: 'gym-shorts' },
    { slug: 'track-jackets' },
    { slug: 'wrist-straps' },
    { slug: 'headbands' },
    { slug: 'gym-socks' },
    // Safety & Work Wear subcategories
    { slug: 'safety-vests' },
    { slug: 'construction-suits' },
    { slug: 'safety-jackets' },
    { slug: 'denim-jacket' },
    { slug: 'windbreaker-jacket' },
  ];
}

export default function CollectionPage({ params }: { params: { slug: string } }) {
  return <CollectionClient slug={params.slug} />;
}
