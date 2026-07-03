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

const redHexCollections: CollectionDefinition[] = [
    {
        name: 'Sportswear',
        slug: 'sportswear',
        children: [
            { name: 'Soccer Uniform', slug: 'soccer-uniform' },
            { name: 'Baseball Uniform', slug: 'baseball-uniform' },
            { name: 'American Football Uniform', slug: 'american-football-uniform' },
            { name: 'Basketball Uniform', slug: 'basketball-uniform' },
            { name: 'Ice Hockey Uniform', slug: 'ice-hockey-uniform' },
            { name: 'Tennis Uniform', slug: 'tennis-uniform' },
        ],
    },
    {
        name: 'Casual Wear',
        slug: 'casual-wear',
        children: [
            { name: 'Tracksuits', slug: 'tracksuits' },
            { name: 'Hoodies', slug: 'hoodies' },
            { name: 'Sweatshirt', slug: 'sweatshirt' },
            { name: 'Sweat Pants', slug: 'sweat-pants' },
            { name: 'T-Shirts', slug: 't-shirts' },
        ],
    },
    {
        name: 'Jacket Collections',
        slug: 'jacket-collections',
        children: [],
    },
    {
        name: 'Gymwear & Activewear',
        slug: 'gymwear-activewear',
        children: [
            { name: 'Tank Top', slug: 'tank-top' },
            { name: 'Compression Shirts', slug: 'compression-shirts' },
            { name: 'Dry-Fit T-Shirts', slug: 'dry-fit-t-shirts' },
            { name: 'Gym Shorts', slug: 'gym-shorts' },
            { name: 'Track Jackets', slug: 'track-jackets' },
            { name: 'Wrist Straps', slug: 'wrist-straps' },
            { name: 'Headbands', slug: 'headbands' },
            { name: 'Gym Socks', slug: 'gym-socks' },
        ],
    },
    {
        name: 'Safety & Work Wear',
        slug: 'safety-work-wear',
        children: [
            { name: 'Safety Vests', slug: 'safety-vests' },
            { name: 'Construction Suits', slug: 'construction-suits' },
            { name: 'Safety Jackets', slug: 'safety-jackets' },
        ],
    },
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

        for (const parent of redHexCollections) {
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

        console.log('RED HEX INDUSTRIES collections seeded successfully.');
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
