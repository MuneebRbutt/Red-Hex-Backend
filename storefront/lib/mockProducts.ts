export interface MockProduct {
  slug: string;
  name: string;
  price: number;
  shortDescription: string;
  description: string;
  category: string;
  images: string[]; // URLs relative to public folder
  subcategory?: string;
  sizes: string[];
}

export const mockProducts: MockProduct[] = [
  {
    slug: 'red-hex-sport-jersey',
    name: 'Red Hex Sport Jersey',
    price: 79.99,
    shortDescription: 'High‑performance jersey for sports enthusiasts.',
    description: `<p>Our Red Hex Sport Jersey combines breathable fabric with a sleek fit, perfect for soccer, basketball, or any active pursuit. The vibrant red hexagonal pattern stands out on the field.</p><ul><li>100% polyester, moisture‑wicking</li><li>Available in multiple sizes</li><li>Machine washable</li></ul>`,
    category: 'sportswear',
    subcategory: 'sportswear',
    images: [
      '/images/mock/sport-jersey-1.jpg',
      '/images/mock/sport-jersey-2.jpg',
      '/images/mock/sport-jersey-3.jpg',
      '/images/mock/sport-jersey-4.jpg',
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    slug: 'red-hex-casual-hoodie',
    name: 'Red Hex Casual Hoodie',
    price: 59.99,
    shortDescription: 'Cozy, soft‑fleece hoodie perfect for everyday wear.',
    description: `<p>Stay warm during cooler evenings with our heavyweight Red Hex Hoodie. Made from premium cotton‑blend, it offers comfort without sacrificing style.</p><ul><li>50% cotton, 50% polyester</li><li>Brushed interior</li><li>Adjustable drawstring hood</li></ul>`,
    category: 'casual-wear',
    subcategory: 'casual-wear',
    images: [
      '/images/mock/hoodie-1.jpg',
      '/images/mock/hoodie-2.jpg',
      '/images/mock/hoodie-3.jpg',
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    slug: 'red-hex-bomber-jacket',
    name: 'Red Hex Bomber Jacket',
    price: 129.99,
    shortDescription: 'Sleek bomber with embroidered hex pattern.',
    description: `<p>The Red Hex Bomber Jacket blends classic silhouette with modern detailing. Perfect for street‑wear looks.</p><ul><li>Polyester shell</li><li>Ribbed cuffs and hem</li><li>Full‑zip front</li></ul>`,
    category: 'jacket-collections',
    subcategory: 'jacket-collections',
    images: [
      '/images/mock/bomber-1.jpg',
      '/images/mock/bomber-2.jpg',
      '/images/mock/bomber-3.jpg',
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    slug: 'red-hex-gym-shorts',
    name: 'Red Hex Gym Shorts',
    price: 34.99,
    shortDescription: 'Lightweight shorts for high‑intensity workouts.',
    description: `<p>Designed for mobility, the Red Hex Gym Shorts feature a breathable mesh lining and a secure elastic waistband.</p><ul><li>Quick‑dry fabric</li><li>Four‑way stretch</li><li>Inner pocket for keys</li></ul>`,
    category: 'gymwear-activewear',
    subcategory: 'gymwear-activewear',
    images: [
      '/images/mock/gym-shorts-1.jpg',
      '/images/mock/gym-shorts-2.jpg',
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  },
];

export const MOCK_PRODUCTS = mockProducts;
