'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { assignProductToCollection, assignProductToDefaultChannel } from '@/lib/admin/assignProductToCollection';
import { adminClientFetch } from '@/lib/admin/client';
import { type AdminCollection } from '@/lib/admin/collections';

const PRODUCT_QUERY = `
query ProductForEdit($id: ID!) {
  product(id: $id) {
    id
    name
    slug
    description
    featuredAsset { id preview }
    collections { id name slug parent { id name slug } }
    variants {
      id
      sku
      price
      stockOnHand
    }
  }
}
`;

const CREATE_PRODUCT = `
mutation CreateProduct($input: CreateProductInput!) {
  createProduct(input: $input) { id slug name }
}
`;

const UPDATE_PRODUCT = `
mutation UpdateProduct($input: UpdateProductInput!) {
  updateProduct(input: $input) { id }
}
`;

const CREATE_VARIANTS = `
mutation CreateProductVariants($input: [CreateProductVariantInput!]!) {
  createProductVariants(input: $input) { id }
}
`;

const UPDATE_VARIANT = `
mutation UpdateProductVariant($input: UpdateProductVariantInput!) {
  updateProductVariant(input: $input) { id }
}
`;

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const CATEGORIES = [
  {
    id: "sportswear",
    name: "Sportswear",
    slug: "sportswear",
    subcategories: [
      { id: "soccer-uniform", name: "Soccer Uniform", slug: "soccer-uniform" },
      { id: "baseball-uniform", name: "Baseball Uniform", slug: "baseball-uniform" },
      { id: "american-football-uniform", name: "American Football Uniform", slug: "american-football-uniform" },
      { id: "basketball-uniform", name: "Basketball Uniform", slug: "basketball-uniform" },
      { id: "ice-hockey-uniform", name: "Ice Hockey Uniform", slug: "ice-hockey-uniform" },
      { id: "tennis-uniform", name: "Tennis Uniform", slug: "tennis-uniform" }
    ]
  },
  {
    id: "casual-wear",
    name: "Casual Wear",
    slug: "casual-wear",
    subcategories: [
      { id: "tracksuits", name: "Tracksuits", slug: "tracksuits" },
      { id: "hoodies", name: "Hoodies", slug: "hoodies" },
      { id: "sweatshirt", name: "Sweatshirt", slug: "sweatshirt" },
      { id: "sweat-pants", name: "Sweat Pants", slug: "sweat-pants" },
      { id: "t-shirts", name: "T-Shirts", slug: "t-shirts" }
    ]
  },
  {
    id: "jacket-collections",
    name: "Jacket Collections",
    slug: "jacket-collections",
    subcategories: []
  },
  {
    id: "gymwear-activewear",
    name: "Gymwear & Activewear",
    slug: "gymwear-activewear",
    subcategories: [
      { id: "tank-top", name: "Tank Top", slug: "tank-top" },
      { id: "compression-shirts", name: "Compression Shirts", slug: "compression-shirts" },
      { id: "dry-fit-t-shirts", name: "Dry-Fit T-Shirts", slug: "dry-fit-t-shirts" },
      { id: "gym-shorts", name: "Gym Shorts", slug: "gym-shorts" },
      { id: "track-jackets", name: "Track Jackets", slug: "track-jackets" },
      { id: "wrist-straps", name: "Wrist Straps", slug: "wrist-straps" },
      { id: "headbands", name: "Headbands", slug: "headbands" },
      { id: "gym-socks", name: "Gym Socks", slug: "gym-socks" }
    ]
  },
  {
    id: "safety-work-wear",
    name: "Safety & Work Wear",
    slug: "safety-work-wear",
    subcategories: [
      { id: "safety-vests", name: "Safety Vests", slug: "safety-vests" },
      { id: "construction-suits", name: "Construction Suits", slug: "construction-suits" },
      { id: "safety-jackets", name: "Safety Jackets", slug: "safety-jackets" }
    ]
  }
];

export default function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const editing = !!productId;
  const [loading, setLoading] = useState(false);
  const [categories] = useState(CATEGORIES);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [sizes, setSizes] = useState<string[]>(['M']);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [variantId, setVariantId] = useState<string>('');
  const [assetId, setAssetId] = useState<string>('');

  const mainCategories = categories;
  const selectedCategory = categories.find(c => c.id === categoryId);
  const subcategories = selectedCategory?.subcategories || [];
  const isJacketCollections = selectedCategory?.id === 'jacket-collections';

  useEffect(() => {
    if (!editing) return;
    adminClientFetch<{ product: any }>(PRODUCT_QUERY, { id: productId })
      .then((data) => {
        const p = data.product;
        setName(p.name ?? '');
        setDescription(p.description ?? '');
        setPrice((p.variants?.[0]?.price ?? 0) / 100);
        setStock(p.variants?.[0]?.stockOnHand ?? 0);
        setVariantId(p.variants?.[0]?.id ?? '');
        setAssetId(p.featuredAsset?.id ?? '');
        if (p.collections?.[0]?.parent?.slug) {
          setCategoryId(p.collections[0].parent.slug);
          setSubcategoryId(p.collections[0].slug);
        } else if (p.collections?.[0]?.slug) {
          setCategoryId(p.collections[0].slug);
        }
      })
      .catch((err) => setError((err as Error).message));
  }, [editing, productId]);

  useEffect(() => {
    if (!subcategoryId) return;
    const selectedStillValid = subcategories.some((s) => s.id === subcategoryId);
    if (!selectedStillValid) setSubcategoryId('');
  }, [subcategoryId, subcategories]);

  async function uploadImageIfNeeded(): Promise<string | undefined> {
    if (!imageFile) return assetId || undefined;
    const fd = new FormData();
    fd.append('file', imageFile);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? 'Upload failed');
    return json.id as string;
  }

  function slugify(value: string): string {
    return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  async function resolveCollectionWithFallback(primarySlug: string, fallbackSlug: string): Promise<string> {
    const querySlug = `
      query GetCollection($slug: String!) {
        collection(slug: $slug) {
          id
          name
          slug
        }
      }
    `;
    
    let res = await adminClientFetch<{ collection: { id: string } }>(querySlug, { slug: primarySlug });
    if (res?.collection?.id) return res.collection.id;

    if (primarySlug !== fallbackSlug) {
      res = await adminClientFetch<{ collection: { id: string } }>(querySlug, { slug: fallbackSlug });
      if (res?.collection?.id) return res.collection.id;
    }

    const queryAll = `
      query {
        collections(options: { take: 100 }) {
          items {
            id
            name
            slug
          }
        }
      }
    `;
    const allRes = await adminClientFetch<{ collections: { items: any[] } }>(queryAll);
    const items = allRes?.collections?.items || [];
    console.log('Available collections in database:', items);

    const match = items.find((i: any) => i.slug === primarySlug || i.slug === fallbackSlug);
    if (match?.id) return match.id;

    const availableSlugs = items.map((i: any) => i.slug).join(', ');
    throw new Error(`Collection not found for slug: ${primarySlug}. Available slugs: ${availableSlugs}`);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (categoryId && !isJacketCollections && !subcategoryId) {
      setError('Please select a subcategory');
      setLoading(false);
      return;
    }
    try {
      const slug = slugify(name);
      const uploadedAssetId = await uploadImageIfNeeded();

      if (uploadedAssetId) {
        // STEP 3 - Assign asset to channel
        await adminClientFetch(`
          mutation AssignAssets($assetIds: [ID!]!) {
            assignAssetsToChannel(input: { assetIds: $assetIds, channelId: "1" }) { id }
          }
        `, { assetIds: [uploadedAssetId] });
      }

      if (!editing) {
        // STEP 2 - Create product
        const createRes = await adminClientFetch<{ createProduct: { id: string } }>(CREATE_PRODUCT, {
          input: {
            enabled: true,
            featuredAssetId: uploadedAssetId,
            assetIds: uploadedAssetId ? [uploadedAssetId] : [],
            translations: [{ languageCode: 'en', name, slug, description }],
          },
        });
        const newProductId = createRes.createProduct.id;

        // STEP 4 - Create variant
        const variantInputs = (sizes.length ? sizes : ['Default']).map((size) => ({
          productId: newProductId,
          sku: `${slug}-${size.toLowerCase()}`,
          price: 0,
          stockOnHand: stock,
          trackInventory: 'FALSE',
          featuredAssetId: uploadedAssetId,
          assetIds: uploadedAssetId ? [uploadedAssetId] : [],
          translations: [{ languageCode: 'en', name: `${name} ${size}` }],
        }));
        
        await adminClientFetch<{ createProductVariants: { id: string }[] }>(
          CREATE_VARIANTS,
          { input: variantInputs },
        );

        // STEP 6.1 - Assign product to channel
        await adminClientFetch(`
          mutation AssignToChannel($productId: ID!) {
            assignProductsToChannel(input: { productIds: [$productId], channelId: "1" }) { id }
          }
        `, { productId: newProductId });

        // STEP 5 - Find collection ID
        const targetSlug = subcategoryId || categoryId;
        const realCollectionId = await resolveCollectionWithFallback(targetSlug, categoryId);

        // STEP 6.2 - Assign product to collection via filter
        const filterValue = `["${newProductId}"]`;
        await adminClientFetch(`
          mutation AssignToCollection($collectionId: ID!, $filterValue: String!) {
            updateCollection(input: {
              id: $collectionId
              filters: [{
                code: "manually-assigned-filter"
                arguments: [{ name: "productIds", value: $filterValue }]
              }]
            }) { id }
          }
        `, { collectionId: realCollectionId, filterValue });

        // STEP 7 - Show success message
        setSuccess(`Product saved successfully! It will appear on the website within a few seconds.`);
        setTimeout(() => {
          router.push('/admin/products');
          router.refresh();
        }, 2000);

      } else {
        // Edit flow (condensed)
        await adminClientFetch(UPDATE_PRODUCT, {
          input: {
            id: productId,
            featuredAssetId: uploadedAssetId,
            assetIds: uploadedAssetId ? [uploadedAssetId] : [],
            translations: [{ languageCode: 'en', name, slug, description }],
          },
        });
        if (variantId) {
          await adminClientFetch(UPDATE_VARIANT, {
            input: {
              id: variantId,
              price: 0,
              stockOnHand: stock,
              trackInventory: 'FALSE',
              featuredAssetId: uploadedAssetId,
              assetIds: uploadedAssetId ? [uploadedAssetId] : [],
              sku: `${slug}-${(sizes[0] ?? 'default').toLowerCase()}`,
            },
          });
        }
        
        const targetSlug = subcategoryId || categoryId;
        const realCollectionId = await resolveCollectionWithFallback(targetSlug, categoryId);
        
        if (realCollectionId) {
          const filterValue = `["${productId}"]`;
          await adminClientFetch(`
            mutation AssignToCollection($collectionId: ID!, $filterValue: String!) {
              updateCollection(input: {
                id: $collectionId
                filters: [{
                  code: "manually-assigned-filter"
                  arguments: [{ name: "productIds", value: $filterValue }]
                }]
              }) { id }
            }
          `, { collectionId: realCollectionId, filterValue });
        }

        setSuccess(`Product updated successfully!`);
        setTimeout(() => {
          router.push('/admin/products');
          router.refresh();
        }, 2000);
      }
    } catch (err) {
      // STEP 8 - Exact error message in red box
      console.error(err);
      setError(err instanceof Error ? err.message : JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded border bg-white p-5">
      <h1 className="text-2xl font-semibold normal-case tracking-normal">
        {editing ? 'Edit Product' : 'Add New Product'}
      </h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
          <p className="font-semibold mb-1">Error saving product:</p>
          <pre className="text-sm whitespace-pre-wrap font-mono">{error}</pre>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded">
          <p className="font-semibold">{success}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Product Name</label>
          <input className="w-full rounded border px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Price (USD)</label>
          <input type="number" step="0.01" min="0" className="w-full rounded border px-3 py-2" value={price} onChange={(e) => setPrice(Number(e.target.value))} required />
        </div>
        <div className="space-y-1 md:col-span-2">
          <label className="text-sm font-medium">Description</label>
          <textarea className="w-full rounded border px-3 py-2" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Category</label>
          <select className="w-full rounded border px-3 py-2" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
            <option value="">Select category</option>
            {mainCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        {!isJacketCollections ? (
          <div className="space-y-1">
            <label className="text-sm font-medium">Subcategory</label>
            <select
              className="w-full rounded border px-3 py-2"
              value={subcategoryId}
              onChange={(e) => setSubcategoryId(e.target.value)}
              disabled={!categoryId}
              required
            >
              <option value="">Select subcategory</option>
              {subcategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="space-y-1">
            <label className="text-sm font-medium">Subcategory</label>
            <div className="w-full rounded border px-3 py-2 bg-gray-50 text-sm text-gray-500">
              No subcategory needed for Jacket Collections
            </div>
          </div>
        )}
        <div className="space-y-1">
          <label className="text-sm font-medium">Stock quantity</label>
          <input type="number" className="w-full rounded border px-3 py-2" value={stock} onChange={(e) => setStock(Number(e.target.value))} required />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Image upload</label>
          <input type="file" accept="image/*" className="w-full rounded border px-3 py-2" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Sizes available</label>
        <div className="flex flex-wrap gap-3">
          {SIZES.map((size) => (
            <label key={size} className="text-sm flex items-center gap-2">
              <input
                type="checkbox"
                checked={sizes.includes(size)}
                onChange={(e) =>
                  setSizes((prev) =>
                    e.target.checked
                      ? (prev.includes(size) ? prev : [...prev, size])
                      : prev.filter((x) => x !== size),
                  )
                }
              />
              {size}
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="rounded bg-black text-white px-4 py-2 disabled:opacity-60">
          {loading ? 'Saving...' : 'Save Product'}
        </button>
        <button type="button" onClick={() => router.push('/admin/products')} className="rounded border px-4 py-2">
          Cancel
        </button>
      </div>
    </form>
  );
}
