'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { assignProductToCollection, assignProductToDefaultChannel } from '@/lib/admin/assignProductToCollection';
import { adminClientFetch } from '@/lib/admin/client';
import {
  type AdminCollection,
  getMainCategories,
  getSubcategories,
} from '@/lib/admin/collections';

const COLLECTIONS_QUERY = `
query AdminCollectionsForForm {
  collections(options: { take: 200, sort: { name: ASC } }) {
    items {
      id
      name
      slug
      parent { id name slug }
    }
  }
}
`;

const PRODUCT_QUERY = `
query ProductForEdit($id: ID!) {
  product(id: $id) {
    id
    name
    slug
    description
    featuredAsset { id preview }
    collections { id name parent { id name } }
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

export default function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const editing = !!productId;
  const [loading, setLoading] = useState(false);
  const [collections, setCollections] = useState<AdminCollection[]>([]);
  const [error, setError] = useState('');

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

  const mainCategories = useMemo(() => getMainCategories(collections), [collections]);
  const subcategories = useMemo(
    () => getSubcategories(collections, categoryId),
    [collections, categoryId],
  );

  useEffect(() => {
    adminClientFetch<{ collections: { items: AdminCollection[] } }>(COLLECTIONS_QUERY)
      .then((data) => setCollections(data.collections.items))
      .catch((err) => setError((err as Error).message));
  }, []);

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
        if (p.collections?.[0]?.parent?.id) {
          setCategoryId(p.collections[0].parent.id);
          setSubcategoryId(p.collections[0].id);
        } else if (p.collections?.[0]?.id) {
          setCategoryId(p.collections[0].id);
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

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const uploadedAssetId = await uploadImageIfNeeded();
      const slug = slugify(name);

      if (!editing) {
        const createRes = await adminClientFetch<{ createProduct: { id: string } }>(CREATE_PRODUCT, {
          input: {
            enabled: true,
            featuredAssetId: uploadedAssetId,
            assetIds: uploadedAssetId ? [uploadedAssetId] : [],
            translations: [{ languageCode: 'en', name, slug, description }],
          },
        });

        const newProductId = createRes.createProduct.id;
        const variantInputs = (sizes.length ? sizes : ['Default']).map((size) => ({
          productId: newProductId,
          enabled: true,
          sku: `${slug}-${size.toLowerCase()}`,
          price: Math.round(price * 100),
          stockOnHand: stock,
          featuredAssetId: uploadedAssetId,
          assetIds: uploadedAssetId ? [uploadedAssetId] : [],
          translations: [{ languageCode: 'en', name: `${name} ${size}` }],
        }));
        const variantsRes = await adminClientFetch<{ createProductVariants: { id: string }[] }>(
          CREATE_VARIANTS,
          { input: variantInputs },
        );
        const variantIds = variantsRes.createProductVariants.map((v) => v.id);

        await new Promise((r) => setTimeout(r, 300));
        await assignProductToDefaultChannel(newProductId, variantIds);
        await new Promise((r) => setTimeout(r, 500));
        if (subcategoryId) {
          await assignProductToCollection(newProductId, subcategoryId, categoryId);
        }
      } else {
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
              price: Math.round(price * 100),
              stockOnHand: stock,
              featuredAssetId: uploadedAssetId,
              assetIds: uploadedAssetId ? [uploadedAssetId] : [],
              sku: `${slug}-${(sizes[0] ?? 'default').toLowerCase()}`,
            },
          });
        }
        if (subcategoryId) {
          await assignProductToCollection(productId!, subcategoryId, categoryId);
        }
      }
      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded border bg-white p-5">
      <h1 className="text-2xl font-semibold normal-case tracking-normal">
        {editing ? 'Edit Product' : 'Add New Product'}
      </h1>
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

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
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
