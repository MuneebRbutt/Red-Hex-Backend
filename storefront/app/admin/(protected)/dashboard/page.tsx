import { adminServerFetch } from '@/lib/admin/server';
import { CATEGORIES, isTanauraProduct } from '@/lib/categories';

type CountsData = {
  products: { items: Array<{ collections: Array<{ slug: string }> }> };
};

const COUNTS_QUERY = `
query AdminDashboardCounts {
  products(options: { take: 200 }) { items { collections { slug } } }
}
`;

export default async function AdminDashboardPage() {
  const data = await adminServerFetch<CountsData>({ query: COUNTS_QUERY });

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold normal-case tracking-normal">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded border bg-white p-5">
          <p className="text-sm text-gray-500">Total Products</p>
          <p className="text-3xl font-semibold">{data.products.items.filter(isTanauraProduct).length}</p>
        </div>
        <div className="rounded border bg-white p-5">
          <p className="text-sm text-gray-500">Total Categories</p>
          <p className="text-3xl font-semibold">{CATEGORIES.length}</p>
        </div>
      </div>
    </section>
  );
}
