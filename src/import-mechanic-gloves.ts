import { createReadStream, existsSync } from 'fs';
import path from 'path';
import {
    AssetService,
    bootstrapWorker,
    ChannelService,
    Collection,
    CollectionService,
    CurrencyCode,
    ID,
    LanguageCode,
    ProductService,
    ProductVariantService,
    RequestContextService,
    TransactionalConnection,
} from '@vendure/core';
import { GlobalFlag } from '@vendure/common/lib/generated-types';
import { getScriptConfig } from './script-config';

const COLLECTION_SLUG = 'mechanic-gloves';
const IMAGE_DIRECTORY = path.resolve(
    process.env.MECHANIC_GLOVE_IMAGE_DIRECTORY ?? '.tmp/mechanic-gloves-import',
);

const products = [
    {
        file: 'rugged-orange-tpr-impact.jpg',
        name: 'Rugged Orange TPR Impact Mechanic Gloves',
        slug: 'rugged-orange-tpr-impact-mechanic-gloves',
        description:
            'Heavy-duty mechanic gloves featuring high-visibility orange breathable stretch fabric with black TPR impact-resistant shields across knuckles and fingers. Engineered with reinforced anti-abrasion synthetic suede palms, strategic grip padding, and a secure hook-and-loop cuff for heavy automotive, extraction, and industrial maintenance work.',
    },
    {
        file: 'high-visibility-utility.jpg',
        name: 'High-Visibility Yellow Utility Mechanic Gloves',
        slug: 'high-visibility-yellow-utility-mechanic-gloves',
        description:
            'Ergonomic utility mechanic gloves combining breathable grey textured back panels with high-visibility yellow finger fourchettes. Designed with a multi-layered padded palm, reinforced grip overlays, and an adjustable rubberized pull-tab cuff for automotive repair and precision machinery operation.',
    },
    {
        file: 'insulated-leather-palm.jpg',
        name: 'Insulated Leather-Palm Mechanic Gloves',
        slug: 'insulated-leather-palm-mechanic-gloves',
        description:
            'All-weather mechanic work gloves engineered with supple gold goatskin leather palms and a resilient black nylon shell. Outfitted with touchscreen-compatible fingertips, vibration-absorbing palm cushioning, and flexible TPR knuckle guards for cold-weather garage and equipment service.',
    },
    {
        file: 'contrast-stitch-precision.jpg',
        name: 'Contrast-Stitch Precision Mechanic Gloves',
        slug: 'contrast-stitch-precision-mechanic-gloves',
        description:
            'High-dexterity workshop gloves featuring a grey ribbed stretch knit back accented with red trim. Fitted with a synthetic suede palm, heavy-duty white reinforcement stitching, touchscreen fingertip integration, and an elasticated wrist strap for agile hand tool and engine work.',
    },
    {
        file: 'performance-mesh-padded.jpg',
        name: 'Performance Mesh Padded Mechanic Gloves',
        slug: 'performance-mesh-padded-mechanic-gloves',
        description:
            'Durable multi-purpose mechanic gloves built with breathable grey honeycomb mesh and bold yellow accent sidewalls. Features a reinforced dual-layer synthetic palm with contrast yellow stitching, vibration dampening padding, and an adjustable neoprene wrist closure.',
    },
] as const;

async function createAdminContext(app: any) {
    const channelService = app.get(ChannelService);
    const requestContextService = app.get(RequestContextService);
    const defaultChannel = await channelService.getDefaultChannel();
    return {
        ctx: await requestContextService.create({
            apiType: 'admin',
            channelOrToken: defaultChannel.token,
        }),
        defaultChannel,
    };
}

async function importMechanicGloves() {
    const worker = await bootstrapWorker(getScriptConfig());
    const app = (worker as any).app;

    try {
        const { ctx, defaultChannel } = await createAdminContext(app);
        const productService = app.get(ProductService);
        const variantService = app.get(ProductVariantService);
        const collectionService = app.get(CollectionService);
        const assetService = app.get(AssetService);
        const connection = app.get(TransactionalConnection);
        const collection = await collectionService.findOneBySlug(ctx, COLLECTION_SLUG);

        if (!collection) {
            throw new Error(`Collection not found: ${COLLECTION_SLUG}`);
        }

        let created = 0;
        let skipped = 0;
        for (const item of products) {
            if (await productService.findOneBySlug(ctx, item.slug)) {
                console.log(`Skipped existing product: ${item.name}`);
                skipped++;
                continue;
            }

            const imagePath = path.join(IMAGE_DIRECTORY, item.file);
            if (!existsSync(imagePath)) {
                throw new Error(`Missing product image: ${imagePath}`);
            }

            const asset = await assetService.createFromFileStream(createReadStream(imagePath), item.file, ctx);
            if (!('id' in asset)) {
                throw new Error(`Could not create asset for ${item.name}: ${asset.message}`);
            }

            const product = await productService.create(ctx, {
                enabled: true,
                assetIds: [asset.id],
                featuredAssetId: asset.id,
                translations: [{
                    languageCode: LanguageCode.en,
                    name: item.name,
                    slug: item.slug,
                    description: item.description,
                }],
            });

            const [variant] = await variantService.create(ctx, [{
                productId: product.id,
                sku: item.slug,
                enabled: true,
                assetIds: [asset.id],
                featuredAssetId: asset.id,
                stockOnHand: 0,
                trackInventory: GlobalFlag.FALSE,
                prices: [{
                    currencyCode: defaultChannel.defaultCurrencyCode as CurrencyCode,
                    price: 0,
                }],
                translations: [{ languageCode: LanguageCode.en, name: item.name }],
            }]);

            await connection
                .getRepository(ctx, Collection)
                .createQueryBuilder()
                .relation(Collection, 'productVariants')
                .of(collection.id)
                .add(variant.id as ID);

            created++;
            console.log(`Created: ${item.name}`);
        }

        console.log(`Mechanic glove import complete: ${created} created, ${skipped} already existed.`);
    } finally {
        await worker.app.close();
    }
}

importMechanicGloves().catch(error => {
    console.error(error);
    process.exit(1);
});
