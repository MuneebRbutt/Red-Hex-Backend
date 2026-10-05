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

const COLLECTION_SLUG = 'welding-gloves';
const IMAGE_DIRECTORY = path.resolve(
    process.env.WELDING_GLOVE_IMAGE_DIRECTORY ?? '.tmp/welding-gloves-import',
);

const products = [
    {
        file: 'WhatsApp Image 2026-08-21 at 9.18.57 AM.jpeg',
        name: 'Black Contrast-Stitch Welding Gloves',
        slug: 'black-contrast-stitch-welding-gloves',
        description:
            'Black suede leather welding gloves finished with orange contrast stitching and a protective cuff. A professional, durable design for workshop and welding tasks.',
    },
    {
        file: 'WhatsApp Image 2026-08-21 at 9.18.58 AM.jpeg',
        name: 'Green Reinforced-Palm Welding Gloves',
        slug: 'green-reinforced-palm-welding-gloves',
        description:
            'Deep green suede leather gloves featuring a golden palm reinforcement and long cuff. Built for dependable handling, welding, and fabrication work.',
    },
    {
        file: 'WhatsApp Image 2026-08-21 at 9.18.58 AM (1).jpeg',
        name: 'Red Long-Cuff Welding Gloves',
        slug: 'red-long-cuff-welding-gloves',
        description:
            'Red suede leather welding gloves with black piping and a long cuff. A bold, comfortable option for welding, metal fabrication, and general industrial work.',
    },
    {
        file: 'WhatsApp Image 2026-08-21 at 9.18.59 AM.jpeg',
        name: 'Golden Leather Canvas-Cuff Welding Gloves',
        slug: 'golden-leather-canvas-cuff-welding-gloves',
        description:
            'Golden suede leather gloves paired with a light canvas cuff for extended wrist coverage. Suitable for welding, fabrication, and industrial handling work.',
    },
    {
        file: 'WhatsApp Image 2026-08-21 at 9.18.59 AM (1).jpeg',
        name: 'Grey Long-Cuff Welding Gloves',
        slug: 'grey-long-cuff-welding-gloves',
        description:
            'Grey suede leather welding gloves with a full-length protective cuff. A clean, durable option for welding, fabrication, and general metalwork.',
    },
    {
        file: 'WhatsApp Image 2026-08-21 at 9.18.59 AM (2).jpeg',
        name: 'Royal Blue Long-Cuff Welding Gloves',
        slug: 'royal-blue-long-cuff-welding-gloves',
        description:
            'Royal blue suede leather welding gloves with contrast stitching and a long flared cuff. A practical choice for welders who want full hand and wrist coverage.',
    },
    {
        file: 'WhatsApp Image 2026-08-21 at 9.19.00 AM.jpeg',
        name: 'Green Leather Welding Gloves',
        slug: 'green-leather-welding-gloves',
        description:
            'Green suede leather gloves with contrasting yellow trim and an extended cuff. Designed for comfortable handling during routine welding and workshop tasks.',
    },
    {
        file: 'WhatsApp Image 2026-08-21 at 9.19.00 AM (1).jpeg',
        name: 'Golden Reinforced-Palm Welding Gloves',
        slug: 'golden-reinforced-palm-welding-gloves',
        description:
            'Golden leather welding gloves with a red reinforced palm panel and extended cuff. Made for welders who need added durability around the palm and thumb.',
    },
    {
        file: 'WhatsApp Image 2026-08-21 at 9.19.01 AM.jpeg',
        name: 'Blue Reinforced-Palm Welding Gloves',
        slug: 'blue-reinforced-palm-welding-gloves',
        description:
            'Blue suede leather gloves with a golden reinforced palm and thumb panel. Extra reinforcement supports grip and durability in high-contact working areas.',
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

async function importWeldingGloves() {
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

        console.log(`Welding glove import complete: ${created} created, ${skipped} already existed.`);
    } finally {
        await worker.app.close();
    }
}

importWeldingGloves().catch(error => {
    console.error(error);
    process.exit(1);
});
