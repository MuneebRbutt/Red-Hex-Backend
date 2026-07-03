import { adminServerFetch } from '@/lib/admin/server';
import { getMainCategories, getSubcategories } from '@/lib/admin/collections';

type Collection = {
  id: string;
  name: string;
  slug: string;
  parent?: { id: string; name: string } | null;
};

type CollectionsData = {
  collections: { items: Collection[] };
};

const COLLECTIONS_QUERY = `
query AdminCollections {
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

export default async function CategoriesPage() {
  const data = await adminServerFetch<CollectionsData>({ query: COLLECTIONS_QUERY });
  const items = data.collections.items.filter((c) => c.slug !== '__root_collection__');
  const parents = getMainCategories(items);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold normal-case tracking-normal">Categories</h1>
      <div className="rounded border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Slug</th>
              <th className="text-left p-3">Parent</th>
            </tr>
          </thead>
          <tbody>
            {parents.flatMap((parent) => {
              const parentRow = (
                <tr key={parent.id} className="border-t font-medium">
                  <td className="p-3">{parent.name}</td>
                  <td className="p-3">{parent.slug}</td>
                  <td className="p-3">-</td>
                </tr>
              );
              const childRows = getSubcategories(items, parent.id).map((child) => (
                  <tr key={child.id} className="border-t">
                    <td className="p-3 pl-8 text-gray-700">- {child.name}</td>
                    <td className="p-3">{child.slug}</td>
                    <td className="p-3">{parent.name}</td>
                  </tr>
                ));
              return [parentRow, ...childRows];
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
