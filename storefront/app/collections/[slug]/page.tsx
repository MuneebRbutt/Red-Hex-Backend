import { notFound } from 'next/navigation';
import CollectionClient from '@/components/collections/CollectionClient';
import { CATEGORIES } from '@/lib/categories';
import { MOCK_PRODUCTS } from '@/lib/mockProducts';

export function generateStaticParams() {
  return CATEGORIES.map(category => ({ slug: category.slug }));
}

export default function CollectionPage({ params }: { params: { slug: string } }) {
  const category = CATEGORIES.find(item => item.slug === params.slug);
  if (!category) notFound();

  const initialVariants = MOCK_PRODUCTS
    .filter(product => product.category === category.slug)
    .map(product => ({
      id: product.slug,
      name: product.name,
      product: {
        id: product.slug,
        name: product.name,
        slug: product.slug,
        description: product.description,
        featuredAsset: { preview: product.images[0] },
        assets: product.images.map(preview => ({ preview })),
      },
    }));

  return (
    <CollectionClient
      slug={category.slug}
      initialVariants={initialVariants}
      serverCollectionName={category.name}
      serverCollectionDesc={category.description}
    />
  );
}
