import { adminClientFetch } from '@/lib/admin/client';

const SET_PRODUCT_COLLECTIONS = `
mutation SetProductCollections($productId: ID!, $collectionIds: [ID!]!) {
  setProductCollections(productId: $productId, collectionIds: $collectionIds) {
    id
  }
}
`;

const ACTIVE_CHANNEL = `
query ActiveChannel {
  activeChannel { id }
}
`;

const ASSIGN_PRODUCTS = `
mutation AssignProductsToChannel($input: AssignProductsToChannelInput!) {
  assignProductsToChannel(input: $input) { id }
}
`;

const ASSIGN_VARIANTS = `
mutation AssignVariantsToChannel($input: AssignProductVariantsToChannelInput!) {
  assignProductVariantsToChannel(input: $input) { id }
}
`;

/** Assign product variants to subcategory and parent category for website navigation. */
export async function assignProductToCollection(
  productId: string,
  subcategoryId: string,
  parentCategoryId?: string,
): Promise<void> {
  const collectionIds = [subcategoryId, parentCategoryId].filter(Boolean) as string[];
  await adminClientFetch(SET_PRODUCT_COLLECTIONS, {
    productId,
    collectionIds: Array.from(new Set(collectionIds)),
  });
}

export async function assignProductToDefaultChannel(
  productId: string,
  variantIds: string[] = [],
): Promise<void> {
  const data = await adminClientFetch<{ activeChannel: { id: string } }>(ACTIVE_CHANNEL);
  const channelId = data.activeChannel?.id;
  if (!channelId) return;

  await adminClientFetch(ASSIGN_PRODUCTS, {
    input: {
      productIds: [productId],
      channelId,
    },
  });

  if (variantIds.length > 0) {
    await adminClientFetch(ASSIGN_VARIANTS, {
      input: {
        productVariantIds: variantIds,
        channelId,
      },
    });
  }
}
