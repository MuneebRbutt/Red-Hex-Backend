'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { adminClientFetch } from '@/lib/admin/client';

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  featuredAsset?: { preview?: string } | null;
  variants: Array<{ id: string; price?: number | null; stockOnHand?: number | null }>;
  collections?: Array<{ id: string; name: string }>;
};

const PRODUCTS_QUERY = `
query AdminProductsList {
  products(options: { take: 200, sort: { name: ASC } }) {
    items {
      id
      name
      slug
      featuredAsset { preview }
      collections { id name }
      variants { id price stockOnHand }
    }
  }
}
`;

const DELETE_PRODUCT_MUTATION = `
mutation DeleteProduct($id: ID!) {
  deleteProduct(id: $id) { result }
}
`;

export default function ProductTable() {
  const router = useRouter();
  const [items, setItems] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    try {
      setError('');
      const data = await adminClientFetch<{ products: { items: ProductRow[] } }>(PRODUCTS_QUERY);
      setItems(data.products.items);
    } catch (err) {
      const msg = (err as Error).message;
      if (msg === 'UNAUTHORIZED') router.push('/admin/login');
      else setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const rows = useMemo(
    () =>
      items.map((p) => {
        const firstVariant = p.variants?.[0];
        return {
          ...p,
          price: firstVariant?.price ?? 0,
          stockOnHand: firstVariant?.stockOnHand ?? 0,
          category: p.collections?.[0]?.name ?? '-',
        };
      }),
    [items],
  );

  async function onDelete(product: ProductRow) {
    const ok = window.confirm(`Are you sure you want to delete ${product.name}?`);
    if (!ok) return;
    try {
      await adminClientFetch(DELETE_PRODUCT_MUTATION, { id: product.id });
      setItems((prev) => prev.filter((x) => x.id !== product.id));
    } catch (err) {
      alert((err as Error).message);
    }
  }

  if (loading) return <p>Loading products...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="rounded border bg-white overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-2xl font-semibold normal-case tracking-normal">Products</h1>
        <Link href="/admin/products/new" className="rounded bg-black text-white px-3 py-2 text-sm">
          + Add New Product
        </Link>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left p-3">Image</th>
            <th className="text-left p-3">Name</th>
            <th className="text-left p-3">Category</th>
            <th className="text-left p-3">Price</th>
            <th className="text-left p-3">Stock</th>
            <th className="text-left p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((product) => (
            <tr key={product.id} className="border-t">
              <td className="p-3">
                {product.featuredAsset?.preview ? (
                  <img src={product.featuredAsset.preview} alt={product.name} className="h-10 w-10 rounded object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded bg-gray-200" />
                )}
              </td>
              <td className="p-3">{product.name}</td>
              <td className="p-3">{product.category}</td>
              <td className="p-3">{Number(product.price) / 100}</td>
              <td className="p-3">{product.stockOnHand}</td>
              <td className="p-3 space-x-2">
                <Link href={`/admin/products/${product.id}/edit`} className="text-blue-700 hover:underline">
                  Edit
                </Link>
                <button type="button" className="text-red-600 hover:underline" onClick={() => onDelete(product)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
