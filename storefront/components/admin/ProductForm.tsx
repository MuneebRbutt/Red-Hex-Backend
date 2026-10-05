'use client';

import { CATEGORIES as GLOVE_CATEGORIES } from '@/lib/categories';
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

const CATEGORIES = GLOVE_CATEGORIES.map(c => ({ ...c, id: c.slug, subcategories: [] as { id: string; name: string; slug: string }[] }));

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
  const [existingImageUrl, setExistingImageUrl] = useState<string>('');
  const [variantId, setVariantId] = useState<string>('');
  const [assetId, setAssetId] = useState<string>('');

  const mainCategories = categories;
  const selectedCategory = categories.find(c => c.id === categoryId);
  const subcategories = selectedCategory?.subcategories || [];
  const hasSubcategories = subcategories.length > 0;

  useEffect(() => {
    if (!editing) return;
    adminClientFetch<{ product: any }>(PRODUCT_QUERY, { id: productId })
      .then((data) => {
        const p = data.product;
        setName(p.name ?? '');
        
        const match = p.description?.match(/\{"_imageUrl":"([^"]+)"\}/);
        if (match) {
          setExistingImageUrl(match[1]);
        }
        
        setDescription((p.description ?? '').replace(/\{"_imageUrl":"[^"]+"\}/g, '').trim());
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

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
    formData.append('folder', 'tanaura');
    
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    );
    
    const data = await res.json();
    
    if (data.secure_url) {
      return data.secure_url;
    } else {
      throw new Error('Cloudinary upload failed: ' + JSON.stringify(data));
    }
  };

  function slugify(value: string): string {
    return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  async function assignToCollectionAndChannel(productId: string, targetSlug: string, categoryName: string) {
    const cookies = document.cookie.split('; ');
    const tokenCookie = cookies.find(c => c.startsWith('rh_admin_token='));
    const token = tokenCookie ? tokenCookie.split('=')[1] : '';

    // STEP 2 - Fetch all collections directly from backend
    const collectionsRes = await fetch('/api/admin/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        query: `{
          collections(options: { take: 100 }) {
            items { id name slug }
          }
        }`
      })
    })
    const collectionsData = await collectionsRes.json()
    const collections = collectionsData?.data?.collections?.items || []
    console.log('Collections via proxy:', collections.length, collections.map((c: any) => c.slug))

    // STEP 3 - Find collection ID
    const found = collections.find((c: any) => c.slug === targetSlug);
    const collectionId = found?.id;
    console.log('Found collection:', found, 'for slug:', targetSlug);

    let assignedToCollection = false;

    // STEP 4 - Assign product to collection using correct mutation
    if (collectionId) {
      console.log('Assigning product:', productId, 'to collection:', collectionId);
      
      // Query available filters for debugging
      try {
        const filtersRes = await fetch('https://red-hex-backend.onrender.com/admin-api', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'vendure-auth-token': token
          },
          body: JSON.stringify({
            query: `{
              collectionFilters {
                code
                args { name }
              }
            }`
          })
        });
        const filtersData = await filtersRes.json();
        console.log('Available collection filters:', JSON.stringify(filtersData, null, 2));
      } catch (e) {
        console.log('Failed to fetch collection filters:', e);
      }

      try {
        const assignRes = await fetch('/api/admin/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            query: `
              mutation {
                updateCollection(input: {
                  id: "${collectionId}"
                  filters: [{
                    code: "manually-assigned-filter"
                    arguments: [{
                      name: "productIds"
                      value: "[\\\"${productId}\\\"]"
                    }]
                  }]
                }) {
                  id
                  name
                  productVariants { totalItems }
                }
              }
            `
          })
        })
        const assignData = await assignRes.json()
        console.log('Assignment result:', JSON.stringify(assignData))
        
        if (!assignData?.errors) {
          assignedToCollection = true;
        } else {
          console.error('Collection assignment mutation errors:', assignData.errors);
          throw new Error(`Collection assignment failed: ${assignData.errors[0]?.message || JSON.stringify(assignData.errors)}`);
        }
      } catch (err) {
        console.error('Failed to assign to collection:', err);
        throw err; // Re-throw to bubble up to UI
      }
    }

    // STEP 5 - Also assign product to channel
    try {
      await fetch('https://red-hex-backend.onrender.com/admin-api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'vendure-auth-token': token
        },
        credentials: 'include',  
        body: JSON.stringify({
          query: `
            mutation {
              assignProductsToChannel(input: {
                productIds: ["${productId}"]
                channelId: "1"
              }) { id }
            }
          `
        })
      });
    } catch (err) {
      console.error('Failed to assign to channel:', err);
    }

    // STEP 6 - Update success message
    if (assignedToCollection) {
      setSuccess(`Product saved successfully and assigned to ${categoryName}!`);
    } else {
      setSuccess(`Product saved but category assignment failed. Check browser console for details.`);
    }

    setTimeout(() => {
      router.push('/admin/products');
      router.refresh();
    }, 2000);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (categoryId && hasSubcategories && !subcategoryId) {
      setError('Please select a subcategory');
      setLoading(false);
      return;
    }
    try {
      const slug = slugify(name);
      let imageUrl = existingImageUrl;
      if (imageFile) {
        imageUrl = await uploadToCloudinary(imageFile);
      }

      const descriptionWithImage = imageUrl 
        ? `${description}\n\n{"_imageUrl":"${imageUrl}"}`
        : description;

      if (!editing) {
        // STEP 2 - Create product
        const createRes = await adminClientFetch<{ createProduct: { id: string } }>(CREATE_PRODUCT, {
          input: {
            enabled: true,
            translations: [{ languageCode: 'en', name, slug, description: descriptionWithImage }],
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
          translations: [{ languageCode: 'en', name: `${name} ${size}` }],
        }));
        
        await adminClientFetch<{ createProductVariants: { id: string }[] }>(
          CREATE_VARIANTS,
          { input: variantInputs },
        );

        const targetSlug = subcategoryId || categoryId;
        const targetName = subcategoryId ? (subcategories.find(s => s.id === subcategoryId)?.name || targetSlug) : (selectedCategory?.name || targetSlug);
        await assignToCollectionAndChannel(newProductId, targetSlug, targetName);

      } else {
        // Edit flow (condensed)
        await adminClientFetch(UPDATE_PRODUCT, {
          input: {
            id: productId,
            translations: [{ languageCode: 'en', name, slug, description: descriptionWithImage }],
          },
        });
        if (variantId) {
          await adminClientFetch(UPDATE_VARIANT, {
            input: {
              id: variantId,
              price: 0,
              stockOnHand: stock,
              trackInventory: 'FALSE',
              sku: `${slug}-${(sizes[0] ?? 'default').toLowerCase()}`,
            },
          });
        }
        
        const targetSlug = subcategoryId || categoryId;
        const targetName = subcategoryId ? (subcategories.find(s => s.id === subcategoryId)?.name || targetSlug) : (selectedCategory?.name || targetSlug);
        await assignToCollectionAndChannel(productId, targetSlug, targetName);
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
        {hasSubcategories ? (
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
              Products will be added directly to the selected glove category
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
