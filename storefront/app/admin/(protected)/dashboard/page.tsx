import { adminServerFetch } from '@/lib/admin/server';

type CountsData = {
  products: { totalItems: number };
  collections: { totalItems: number };
};

const COUNTS_QUERY = `
query AdminDashboardCounts {
  products(options: { take: 1 }) { totalItems }
  collections(options: { take: 1 }) { totalItems }
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
          <p className="text-3xl font-semibold">{data.products.totalItems}</p>
        </div>
        <div className="rounded border bg-white p-5">
          <p className="text-sm text-gray-500">Total Categories</p>
          <p className="text-3xl font-semibold">{data.collections.totalItems}</p>
        </div>
      </div>
    </section>
  );
}
