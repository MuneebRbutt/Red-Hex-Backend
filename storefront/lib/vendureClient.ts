/**
 * vendureClient.ts
 *
 * Server-safe typed functions that query the Vendure Shop API directly
 * via fetch (not Apollo). This is used for:
 *   - Server Components / Route Handlers (no React hooks)
 *   - Fallback-aware data fetching with automatic mock fallback
 *
 * For client components, continue using Apollo hooks (useQuery / useMutation)
 * through the existing ApolloWrapper.
 */

import { MOCK_PRODUCTS, MockProduct } from '@/lib/mockProducts';

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────
const SHOP_API =
  process.env.NEXT_PUBLIC_VENDURE_SHOP_API ?? 'http://localhost:3000/shop-api';

// ─────────────────────────────────────────────────────────────────────────────
// Base fetch helper
// ─────────────────────────────────────────────────────────────────────────────
async function shopQuery<T = any>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T | null> {
  try {
    const res = await fetch(SHOP_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ query, variables }),
      // Cache at the fetch layer and revalidate every 60 seconds (or on-demand via tags)
      next: { revalidate: 60, tags: ['vendure'] },
    });
    if (!res.ok) {
      console.warn(`[vendureClient] HTTP ${res.status} from Shop API`);
      return null;
    }
    const json = await res.json();
    if (json.errors) {
      console.warn('[vendureClient] GraphQL errors:', JSON.stringify(json.errors));
    }
    return (json.data ?? null) as T;
  } catch (err) {
    console.warn('[vendureClient] Shop API unreachable:', (err as Error).message);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export interface VendureAsset {
  id: string;
  preview: string;
}

export interface VendureCollection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  featuredAsset?: VendureAsset;
  parent?: { id: string; name: string; slug: string };
}

export interface VendureProductVariant {
  id: string;
  name: string;
  sku?: string;
  priceWithTax: number;
  stockLevel?: string;
  product?: VendureProductSummary;
  options?: Array<{
    id: string;
    code: string;
    name: string;
    group: { id: string; code: string; name: string };
  }>;
}

export interface VendureProductSummary {
  id: string;
  name: string;
  slug: string;
  featuredAsset?: VendureAsset;
  assets?: VendureAsset[];
}

export interface VendureProduct extends VendureProductSummary {
  description?: string;
  variants: VendureProductVariant[];
  collections?: VendureCollection[];
}

export interface VendureOrderLine {
  id: string;
  quantity: number;
  unitPriceWithTax: number;
  linePriceWithTax: number;
  productVariant: {
    id: string;
    name: string;
    sku?: string;
    priceWithTax: number;
    product: VendureProductSummary;
  };
}

export interface VendureOrder {
  id: string;
  state: string;
  totalQuantity: number;
  totalWithTax: number;
  subTotalWithTax: number;
  shippingWithTax: number;
  lines: VendureOrderLine[];
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. fetchCollections — all collections
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchCollections(
  take = 50,
  skip = 0,
): Promise<VendureCollection[]> {
  const data = await shopQuery<{
    collections: { items: VendureCollection[] };
  }>(
    `query GetCollections($take: Int, $skip: Int) {
      collections(options: { take: $take, skip: $skip }) {
        items {
          id name slug description
          featuredAsset { id preview }
          parent { id name slug }
        }
      }
    }`,
    { take, skip },
  );
  const items = data?.collections?.items ?? [];
  if (items.length > 0) {
    console.log(`[vendureClient] fetchCollections → ${items.length} collections from Vendure`);
  }
  return items;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. fetchCollection — single collection with its product variants
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchCollection(
  slug: string,
  take = 100,
  skip = 0,
): Promise<{
  collection: VendureCollection | null;
  variants: VendureProductVariant[];
}> {
  const data = await shopQuery<{
    collection: VendureCollection & {
      productVariants: { totalItems: number; items: VendureProductVariant[] };
    };
  }>(
    `query GetCollection($slug: String!, $take: Int, $skip: Int) {
      collection(slug: $slug) {
        id name slug description
        featuredAsset { id preview }
        productVariants(options: { take: $take, skip: $skip }) {
          totalItems
          items {
            id name priceWithTax stockLevel
            product {
              id name slug description
              featuredAsset { id preview }
              assets { id preview }
            }
          }
        }
      }
    }`,
    { slug, take, skip },
  );

  const collection = data?.collection ?? null;
  const variants = data?.collection?.productVariants?.items ?? [];

  if (variants.length > 0) {
    console.log(`[vendureClient] fetchCollection(${slug}) → ${variants.length} variants from Vendure`);
    return { collection, variants };
  }

  // Fallback to mock products for this category/subcategory slug
  const mockVariants = MOCK_PRODUCTS.filter(
    (p) => p.category === slug || p.subcategory === slug,
  ).map(mockToVariant);

  console.log(`[vendureClient] fetchCollection(${slug}) → MOCK fallback (${mockVariants.length} items)`);
  return { collection, variants: mockVariants };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. fetchProduct — single product by slug
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchProduct(slug: string): Promise<VendureProduct | null> {
  const data = await shopQuery<{ product: VendureProduct }>(
    `query GetProduct($slug: String!) {
      product(slug: $slug) {
        id name slug description
        featuredAsset { id preview }
        assets { id preview }
        variants {
          id name sku priceWithTax stockLevel
          options {
            id code name
            group { id code name }
          }
        }
        collections { id name slug }
      }
    }`,
    { slug },
  );

  if (data?.product) {
    console.log(`[vendureClient] fetchProduct(${slug}) → from Vendure`);
    return data.product;
  }

  // Fallback to mock
  const mock = MOCK_PRODUCTS.find((p) => p.slug === slug);
  if (mock) {
    console.log(`[vendureClient] fetchProduct(${slug}) → MOCK fallback`);
    return mockToProduct(mock);
  }

  console.warn(`[vendureClient] fetchProduct(${slug}) → NOT FOUND`);
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. fetchActiveOrder — current cart/order
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchActiveOrder(): Promise<VendureOrder | null> {
  const data = await shopQuery<{ activeOrder: VendureOrder | null }>(
    `query GetActiveOrder {
      activeOrder {
        id state totalQuantity totalWithTax subTotalWithTax shippingWithTax
        lines {
          id quantity unitPriceWithTax linePriceWithTax
          productVariant {
            id name sku priceWithTax
            product {
              id name slug
              featuredAsset { id preview }
            }
          }
        }
      }
    }`,
  );
  return data?.activeOrder ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. addToOrder — add variant to active order
// ─────────────────────────────────────────────────────────────────────────────
export async function addToOrder(
  variantId: string,
  quantity: number,
): Promise<VendureOrder | { errorCode: string; message: string } | null> {
  const data = await shopQuery<{
    addItemToOrder: VendureOrder | { errorCode: string; message: string };
  }>(
    `mutation AddItemToOrder($variantId: ID!, $quantity: Int!) {
      addItemToOrder(productVariantId: $variantId, quantity: $quantity) {
        ... on Order {
          id totalQuantity totalWithTax
          lines {
            id quantity linePriceWithTax
            productVariant { id name }
          }
        }
        ... on ErrorResult {
          errorCode
          message
        }
      }
    }`,
    { variantId, quantity },
  );
  return data?.addItemToOrder ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock conversion helpers (internal)
// ─────────────────────────────────────────────────────────────────────────────
function mockToProduct(m: MockProduct): VendureProduct {
  return {
    id: m.slug,
    name: m.name,
    slug: m.slug,
    description: m.description,
    featuredAsset: m.images[0] ? { id: m.slug + '-img-0', preview: m.images[0] } : undefined,
    assets: m.images.map((img, i) => ({ id: `${m.slug}-img-${i}`, preview: img })),
    variants: m.sizes.map((size) => ({
      id: `${m.slug}-${size}`,
      name: `${m.name} ${size}`,
      sku: `${m.slug.toUpperCase()}-${size}`,
      priceWithTax: Math.round(m.price * 100),
      stockLevel: 'IN_STOCK',
    })),
  };
}

function mockToVariant(m: MockProduct): VendureProductVariant {
  return {
    id: m.slug,
    name: m.name,
    priceWithTax: Math.round(m.price * 100),
    stockLevel: 'IN_STOCK',
    product: {
      id: m.slug,
      name: m.name,
      slug: m.slug,
      featuredAsset: m.images[0] ? { id: m.slug + '-img-0', preview: m.images[0] } : undefined,
      assets: m.images.map((img, i) => ({ id: `${m.slug}-img-${i}`, preview: img })),
    },
  };
}
