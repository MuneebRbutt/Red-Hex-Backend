export const CATEGORIES = [
  {
    name: 'Canadian rigger gloves',
    slug: 'canadian-rigger-gloves',
    description: 'Heavy-duty split cowhide work gloves with striped canvas back and reinforced rubberized safety cuff for rigging, logistics, and heavy material handling.',
    tagline: 'Heavy Duty & Rigging',
    badge: 'Reinforced Safety Cuff',
    image: '/categories/canadian-rigger-gloves.jpg',
  },
  {
    name: 'Welding gloves',
    slug: 'welding-gloves',
    description: 'High-temp suede and split leather welding gauntlets engineered with Kevlar stitching and extended protective cuffs for thermal resistance and metal fabrication.',
    tagline: 'Heat & Flame Resistant',
    badge: 'Thermal & Spark Guard',
    image: '/categories/welding-gloves.jpg',
  },
  {
    name: 'Mechanic gloves',
    slug: 'mechanic-gloves',
    description: 'High-dexterity tactical mechanic gloves equipped with silicone palm grip patterns, TPR knuckle impact protection, and breathable stretch mesh.',
    tagline: 'Impact Armor & High Grip',
    badge: 'TPR Impact Armor',
    image: '/categories/mechanic-gloves.jpg',
  },
  {
    name: 'Driver gloves',
    slug: 'driver-gloves',
    description: 'Supple full-grain cowhide and goatskin leather driver gloves featuring an ergonomic keystone thumb and shirred wrist for durable everyday handling.',
    tagline: 'Full-Grain Leather Comfort',
    badge: 'Keystone Ergonomic Thumb',
    image: '/categories/driver-gloves.jpg',
  },
  {
    name: 'Assembly gloves',
    slug: 'assembly-gloves',
    description: 'Ultra-thin 18-gauge seamless nylon liner gloves coated with micro-foam nitrile for precision tactile sensitivity, electronics handling, and fine assembly.',
    tagline: 'Micro-Foam Precision Grip',
    badge: 'High Tactile Dexterity',
    image: '/categories/assembly-gloves.jpg',
  },
  {
    name: 'Golf gloves',
    slug: 'golf-gloves',
    description: 'Tour-edition ultra-soft white Cabretta leather golf gloves with laser-cut finger perforations and tailored velcro tab closure for a second-skin feel.',
    tagline: 'Tour Grade Cabretta Leather',
    badge: 'AAA Tour Performance',
    image: '/categories/golf-gloves.jpg',
  },
  {
    name: 'Fashion driver gloves',
    slug: 'fashion-driver-gloves',
    description: 'Artisan handcrafted vintage perforated Italian leather driving gloves featuring classic open-knuckle cutouts and brass snap button wrist closures.',
    tagline: 'Artisan Perforated Leather',
    badge: 'Luxury Handcrafted Edition',
    image: '/categories/fashion-driver-gloves.jpg',
  },
] as const;

export function isTanauraCategory(slug: string): boolean {
  return CATEGORIES.some(category => category.slug === slug);
}

export function isTanauraProduct(product: { collections?: { slug: string }[] }): boolean {
  return product.collections?.some(collection => isTanauraCategory(collection.slug)) ?? false;
}
