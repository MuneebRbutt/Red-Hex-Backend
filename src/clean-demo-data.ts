import {
    bootstrapWorker,
    ChannelService,
    Collection,
    CollectionService,
    ProductService,
    RequestContextService,
} from '@vendure/core';
import { getScriptConfig } from './script-config';

const PAGE_SIZE = 100;

async function createAdminContext(app: any) {
    const channelService = app.get(ChannelService);
    const requestContextService = app.get(RequestContextService);
    const defaultChannel = await channelService.getDefaultChannel();

    return requestContextService.create({
        apiType: 'admin',
        channelOrToken: defaultChannel.token,
    });
}

/**
 * Cleans the seeded demo catalog only.
 *
 * This removes products and collections while leaving users, roles, channels,
 * payment/shipping config, and other Vendure settings intact.
 */
async function cleanDemoData() {
    const worker = await bootstrapWorker(getScriptConfig());
    const app = (worker as any).app;

    try {
        const ctx = await createAdminContext(app);
        const productService = app.get(ProductService);
        const collectionService = app.get(CollectionService);

        let deletedProducts = 0;
        for (;;) {
            const products = await productService.findAll(ctx, { take: PAGE_SIZE, skip: 0 });
            if (products.items.length === 0) {
                break;
            }

            for (const product of products.items) {
                await productService.softDelete(ctx, product.id);
                deletedProducts += 1;
                console.log(`Deleted product: ${product.name}`);
            }
        }

        let deletedCollections = 0;
        deletedCollections += await deleteAllCollections(ctx, collectionService);

        console.log(`Cleanup complete. Deleted ${deletedProducts} products and ${deletedCollections} collections.`);
    } finally {
        await worker.app.close();
    }
}

async function deleteAllCollections(ctx: any, collectionService: CollectionService): Promise<number> {
    let deletedCollections = 0;

    for (;;) {
        const collections = (await getAllCollections(ctx, collectionService)).filter(
            collection => collection.slug !== '__root_collection__' && collection.slug !== 'root',
        );

        if (collections.length === 0) {
            return deletedCollections;
        }

        const collectionIds = new Set(collections.map(collection => collection.id));
        const parentIds = new Set(
            collections
                .map(collection => collection.parentId)
                .filter((parentId): parentId is NonNullable<typeof parentId> => parentId != null && collectionIds.has(parentId)),
        );
        const leaves = collections.filter(collection => !parentIds.has(collection.id));
        const target = leaves[0] ?? collections[0];

        try {
            await collectionService.delete(ctx, target.id);
            deletedCollections += 1;
            console.log(`Deleted collection: ${target.name}`);
        } catch (err: any) {
            if (err?.code === 'ENTITY_NOT_FOUND' || err?.extensions?.code === 'ENTITY_NOT_FOUND') {
                console.log(`Skipped missing collection: ${target.name}`);
                continue;
            }
            throw err;
        }
    }
}

async function getAllCollections(ctx: any, collectionService: CollectionService): Promise<Collection[]> {
    const collections: Collection[] = [];
    let skip = 0;

    for (;;) {
        const result = await collectionService.findAll(ctx, { take: PAGE_SIZE, skip });
        collections.push(...result.items);

        if (collections.length >= result.totalItems || result.items.length === 0) {
            return collections;
        }

        skip += PAGE_SIZE;
    }
}

cleanDemoData().catch(err => {
    console.error('Demo data cleanup failed:', err);
    process.exit(1);
});
