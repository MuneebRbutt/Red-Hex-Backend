import {
    bootstrapWorker,
    ChannelService,
    Collection,
    CollectionService,
    ID,
    LanguageCode,
    RequestContextService,
} from '@vendure/core';
import { getScriptConfig } from './script-config';

interface CollectionDefinition {
    name: string;
    slug: string;
    children: Array<{
        name: string;
        slug: string;
    }>;
}

const tanauraCollections: CollectionDefinition[] = [
    {
        "name": "Welding gloves",
        "slug": "welding-gloves",
        "children": []
    },
    {
        "name": "Golf gloves",
        "slug": "golf-gloves",
        "children": []
    },
    {
        "name": "Mechanic gloves",
        "slug": "mechanic-gloves",
        "children": []
    },
    {
        "name": "Driver gloves",
        "slug": "driver-gloves",
        "children": []
    },
    {
        "name": "Canadian rigger gloves",
        "slug": "canadian-rigger-gloves",
        "children": []
    },
    {
        "name": "Assembly gloves",
        "slug": "assembly-gloves",
        "children": []
    },
    {
        "name": "Fashion driver gloves",
        "slug": "fashion-driver-gloves",
        "children": []
    }
];

async function createAdminContext(app: any) {
    const channelService = app.get(ChannelService);
    const requestContextService = app.get(RequestContextService);
    const defaultChannel = await channelService.getDefaultChannel();

    return requestContextService.create({
        apiType: 'admin',
        channelOrToken: defaultChannel.token,
    });
}

async function seedCollections() {
    const worker = await bootstrapWorker(getScriptConfig());
    const app = (worker as any).app;

    try {
        const ctx = await createAdminContext(app);
        const collectionService = app.get(CollectionService);
        const existingCollections = await getCollectionSlugMap(ctx, collectionService);

        for (const parent of tanauraCollections) {
            const parentCollection = await getOrCreateCollection(
                ctx,
                collectionService,
                existingCollections,
                parent.name,
                parent.slug,
            );

            for (const child of parent.children) {
                await getOrCreateCollection(
                    ctx,
                    collectionService,
                    existingCollections,
                    child.name,
                    child.slug,
                    parentCollection.id,
                );
            }
        }

        console.log('TANAURA collections seeded successfully.');
    } finally {
        await worker.app.close();
    }
}

async function getOrCreateCollection(
    ctx: any,
    collectionService: CollectionService,
    existingCollections: Map<string, Collection>,
    name: string,
    slug: string,
    parentId?: ID,
): Promise<Collection> {
    const existing = existingCollections.get(slug);
    if (existing) {
        console.log(`Collection already exists: ${name} (${slug})`);
        return existing;
    }

    const collection = await collectionService.create(ctx, {
        translations: [
            {
                languageCode: LanguageCode.en,
                name,
                slug,
                description: name,
            },
        ],
        isPrivate: false,
        parentId,
        filters: [],
    });

    existingCollections.set(slug, collection);
    console.log(`Created collection: ${name} (${slug})`);
    return collection;
}

async function getCollectionSlugMap(ctx: any, collectionService: CollectionService): Promise<Map<string, Collection>> {
    const collectionsBySlug = new Map<string, Collection>();
    let skip = 0;

    for (;;) {
        const result = await collectionService.findAll(ctx, { take: 100, skip });
        for (const collection of result.items) {
            collectionsBySlug.set(collection.slug, collection);
        }

        if (collectionsBySlug.size >= result.totalItems || result.items.length === 0) {
            return collectionsBySlug;
        }

        skip += 100;
    }
}

seedCollections().catch(err => {
    console.error('Collection seeding failed:', err);
    process.exit(1);
});
