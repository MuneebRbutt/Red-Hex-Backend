import { Readable } from 'stream';
import {
    AssetService,
    bootstrapWorker,
    ChannelService,
    Collection,
    CollectionService,
    ID,
    LanguageCode,
    ProductService,
    ProductOptionGroupService,
    ProductOptionService,
    ProductVariantService,
    RequestContextService,
    TransactionalConnection,
} from '@vendure/core';
import { CurrencyCode, GlobalFlag } from '@vendure/common/lib/generated-types';
import { getScriptConfig } from './script-config';

const PRODUCT_NAME = 'Custom Soccer Uniform';
const PRODUCT_SLUG = 'custom-soccer-uniform';
const COLLECTION_SLUG = 'soccer-uniform';
const SIZES = ['S', 'M', 'L', 'XL'];

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

async function seedTestProduct() {
    const worker = await bootstrapWorker(getScriptConfig());
    const app = (worker as any).app;

    try {
        const { ctx, defaultChannel } = await createAdminContext(app);
        const productService = app.get(ProductService);
        const collectionService = app.get(CollectionService);
        const optionGroupService = app.get(ProductOptionGroupService);
        const optionService = app.get(ProductOptionService);
        const variantService = app.get(ProductVariantService);
        const assetService = app.get(AssetService);
        const connection = app.get(TransactionalConnection);

        const existingProduct = await productService.findOneBySlug(ctx, PRODUCT_SLUG, ['variants']);
        if (existingProduct) {
            console.log(`${PRODUCT_NAME} already exists.`);
            return;
        }

        const collection = await collectionService.findOneBySlug(ctx, COLLECTION_SLUG);
        if (!collection) {
            throw new Error(`Collection not found: ${COLLECTION_SLUG}. Run npm run seed:collections first.`);
        }

        const asset = await assetService.createFromFileStream(
            Readable.from(getPlaceholderSvg()),
            'custom-soccer-uniform-placeholder.svg',
            ctx,
        );
        if (!('id' in asset)) {
            throw new Error(`Could not create placeholder asset: ${asset.message}`);
        }

        const product = await productService.create(ctx, {
            enabled: true,
            assetIds: [asset.id],
            featuredAssetId: asset.id,
            translations: [
                {
                    languageCode: LanguageCode.en,
                    name: PRODUCT_NAME,
                    slug: PRODUCT_SLUG,
                    description: 'Placeholder RED HEX INDUSTRIES test product.',
                },
            ],
        });

        const optionGroup = await optionGroupService.create(ctx, {
            code: `${PRODUCT_SLUG}-size`,
            translations: [{ languageCode: LanguageCode.en, name: 'Size' }],
        });
        await productService.addOptionGroupToProduct(ctx, product.id, optionGroup.id);

        const options = [];
        for (const size of SIZES) {
            options.push(
                await optionService.create(ctx, optionGroup.id, {
                    code: size.toLowerCase(),
                    translations: [{ languageCode: LanguageCode.en, name: size }],
                }),
            );
        }

        const currencyCode = (defaultChannel.defaultCurrencyCode || CurrencyCode.USD) as CurrencyCode;
        const variants = await variantService.create(
            ctx,
            options.map(option => ({
                productId: product.id,
                sku: `${PRODUCT_SLUG}-${option.code}`,
                enabled: true,
                optionIds: [option.id],
                assetIds: [asset.id],
                featuredAssetId: asset.id,
                stockOnHand: 100,
                trackInventory: GlobalFlag.FALSE,
                prices: [{ currencyCode, price: 0 }],
                translations: [
                    {
                        languageCode: LanguageCode.en,
                        name: `${PRODUCT_NAME} ${option.name}`,
                    },
                ],
            })),
        );

        await connection
            .getRepository(ctx, Collection)
            .createQueryBuilder()
            .relation(Collection, 'productVariants')
            .of(collection.id)
            .add(variants.map((variant: { id: ID }) => variant.id));

        console.log(`Created ${PRODUCT_NAME} with variants ${SIZES.join(', ')} in ${collection.name}.`);
    } finally {
        await worker.app.close();
    }
}

function getPlaceholderSvg(): string {
    return [
        '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">',
        '<rect width="1200" height="900" fill="#111827"/>',
        '<rect x="120" y="120" width="960" height="660" rx="32" fill="#f8fafc"/>',
        '<path d="M600 210l230 130v220L600 690 370 560V340z" fill="#b91c1c"/>',
        '<path d="M600 284l160 90v152l-160 90-160-90V374z" fill="#111827"/>',
        '<text x="600" y="435" text-anchor="middle" font-family="Arial, sans-serif" font-size="64" font-weight="700" fill="#f8fafc">RED HEX</text>',
        '<text x="600" y="520" text-anchor="middle" font-family="Arial, sans-serif" font-size="36" fill="#f8fafc">CUSTOM SOCCER UNIFORM</text>',
        '</svg>',
    ].join('');
}

seedTestProduct().catch(err => {
    console.error('Test product seeding failed:', err);
    process.exit(1);
});
