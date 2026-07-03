import { PluginCommonModule, VendurePlugin } from '@vendure/core';
import { adminApiExtensions } from './api-extensions';
import { StorefrontCatalogResolver } from './storefront-catalog.resolver';
import { StorefrontCatalogService } from './storefront-catalog.service';

@VendurePlugin({
    imports: [PluginCommonModule],
    providers: [StorefrontCatalogService],
    adminApiExtensions: {
        schema: adminApiExtensions,
        resolvers: [StorefrontCatalogResolver],
    },
})
export class StorefrontCatalogPlugin {}
