import {
    bootstrapWorker,
    ChannelService,
    RequestContextService,
    TaxCategoryService,
    TaxRateService,
} from '@vendure/core';
import { getScriptConfig } from './script-config';

async function seedTaxData() {
    console.log('Bootstrapping Vendure worker...');
    const worker = await bootstrapWorker(getScriptConfig());
    const app = (worker as any).app;

    try {
        const channelService = app.get(ChannelService);
        const requestContextService = app.get(RequestContextService);
        const defaultChannel = await channelService.getDefaultChannel();
        
        const ctx = await requestContextService.create({
            apiType: 'admin',
            channelOrToken: defaultChannel.token,
        });

        const taxCategoryService = app.get(TaxCategoryService);
        const taxRateService = app.get(TaxRateService);

        console.log('Creating Default Tax category...');
        const taxCategory = await taxCategoryService.create(ctx, {
            name: "Default Tax",
            isDefault: true,
        });
        console.log(`Created Tax Category ID: ${taxCategory.id}`);

        console.log('Creating Standard Tax Rate...');
        const taxRate = await taxRateService.create(ctx, {
            name: "Standard",
            enabled: true,
            value: 0,
            categoryId: taxCategory.id as string,
            zoneId: "1",
        });
        console.log(`Created Tax Rate ID: ${taxRate.id}`);

        console.log('Updating Default Channel...');
        await channelService.update(ctx, {
            id: defaultChannel.id,
            defaultTaxZoneId: "1",
            defaultShippingZoneId: "1",
        });
        console.log('Successfully updated channel tax and shipping zones.');
        
    } finally {
        await worker.app.close();
    }
}

seedTaxData().catch((err) => {
    console.error('Tax data seeding failed:', err);
    process.exit(1);
});
