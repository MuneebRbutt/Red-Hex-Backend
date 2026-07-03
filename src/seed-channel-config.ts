import {
    bootstrapWorker,
    ChannelService,
    CountryService,
    LanguageCode,
    RequestContext,
    RequestContextService,
    TaxCategoryService,
    TaxRateService,
    ZoneService,
} from '@vendure/core';
import { getScriptConfig } from './script-config';

const DEFAULT_ZONE_NAME = 'Default Zone';
const DEFAULT_TAX_CATEGORY = 'Standard Tax';

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

async function findCountryByCode(countryService: CountryService, ctx: any, code: string) {
    const result = await countryService.findAll(ctx, {
        take: 1,
        filter: { code: { eq: code } },
    });
    return result.items[0];
}

async function seedChannelConfig() {
    const worker = await bootstrapWorker(getScriptConfig());
    const app = (worker as any).app;

    try {
        const { ctx, defaultChannel } = await createAdminContext(app);
        const channelService = app.get(ChannelService);
        const countryService = app.get(CountryService);
        const zoneService = app.get(ZoneService);
        const taxCategoryService = app.get(TaxCategoryService);
        const taxRateService = app.get(TaxRateService);

        if (defaultChannel.defaultTaxZone?.id && defaultChannel.defaultShippingZone?.id) {
            console.log('Default channel already has tax and shipping zones configured.');
            return;
        }

        let country = await findCountryByCode(countryService, ctx, 'US');
        if (!country) {
            country = await countryService.create(ctx, {
                code: 'US',
                enabled: true,
                translations: [{ languageCode: LanguageCode.en, name: 'United States' }],
            });
            console.log('Created country: United States (US)');
        }

        const existingZones = await zoneService.findAll(ctx, {
            take: 20,
            filter: { name: { eq: DEFAULT_ZONE_NAME } },
        });
        let zone = existingZones.items[0];
        if (!zone) {
            zone = await zoneService.create(ctx, {
                name: DEFAULT_ZONE_NAME,
                memberIds: [country.id],
            });
            console.log(`Created zone: ${DEFAULT_ZONE_NAME}`);
        } else if (!zone.members?.some((member: { id: string }) => member.id === country.id)) {
            await zoneService.addMembersToZone(ctx, {
                zoneId: zone.id,
                memberIds: [country.id],
            });
            console.log(`Added United States to zone: ${DEFAULT_ZONE_NAME}`);
        }

        const taxCategories = await taxCategoryService.findAll(ctx, { take: 20 });
        let taxCategory = taxCategories.items.find((item: { isDefault: boolean }) => item.isDefault) ?? taxCategories.items[0];
        if (!taxCategory) {
            taxCategory = await taxCategoryService.create(ctx, {
                name: DEFAULT_TAX_CATEGORY,
                isDefault: true,
            });
            console.log(`Created tax category: ${DEFAULT_TAX_CATEGORY}`);
        }

        const existingRates = await taxRateService.findAll(ctx, {
            take: 20,
            filter: {
                zoneId: { eq: zone.id },
                categoryId: { eq: taxCategory.id },
            },
        });
        if (existingRates.items.length === 0) {
            await taxRateService.create(ctx, {
                name: `${DEFAULT_TAX_CATEGORY} ${DEFAULT_ZONE_NAME}`,
                enabled: true,
                value: 0,
                zoneId: zone.id,
                categoryId: taxCategory.id,
            });
            console.log('Created 0% tax rate for default zone.');
        }

        await channelService.update(RequestContext.empty(), {
            id: defaultChannel.id,
            defaultTaxZoneId: zone.id,
            defaultShippingZoneId: zone.id,
        });
        console.log('Default channel tax and shipping zones configured successfully.');
    } finally {
        await worker.app.close();
    }
}

seedChannelConfig().catch((err) => {
    console.error('Channel config seeding failed:', err);
    process.exit(1);
});
