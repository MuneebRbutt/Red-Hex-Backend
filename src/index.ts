import { 
    bootstrap, 
    runMigrations,
    ChannelService,
    RequestContextService,
    TaxCategoryService,
    TaxRateService,
} from '@vendure/core';
import { config } from './vendure-config';

runMigrations(config)
    .then(() => bootstrap(config))
    .then(async (app) => {
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

            const existingCategories = await taxCategoryService.findAll(ctx);
            const hasDefault = existingCategories.items.some(t => t.isDefault);
            
            if (!hasDefault) {
                console.log('No default tax category found. Creating Default Tax category...');
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

                console.log('Updating Default Channel with tax zones...');
                await channelService.update(ctx, {
                    id: defaultChannel.id,
                    defaultTaxZoneId: "1",
                    defaultShippingZoneId: "1",
                });
                console.log('Successfully updated channel tax and shipping zones.');
            }
        } catch (setupErr) {
            console.error('Failed to run automatic tax setup on startup:', setupErr);
        }
    })
    .catch(err => {
        console.log(err);
    });
