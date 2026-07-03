import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Allow, Ctx, ID, Permission, Product, RequestContext } from '@vendure/core';
import { StorefrontCatalogService } from './storefront-catalog.service';

@Resolver()
export class StorefrontCatalogResolver {
    constructor(private storefrontCatalogService: StorefrontCatalogService) {}

    @Mutation()
    @Allow(Permission.UpdateCatalog)
    setProductCollections(
        @Ctx() ctx: RequestContext,
        @Args('productId') productId: ID,
        @Args('collectionIds') collectionIds: ID[],
    ): Promise<Product> {
        return this.storefrontCatalogService.setProductCollections(ctx, productId, collectionIds);
    }
}
