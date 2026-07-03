import { Injectable } from '@nestjs/common';
import {
    Collection,
    ID,
    Product,
    ProductService,
    TransactionalConnection,
} from '@vendure/core';

@Injectable()
export class StorefrontCatalogService {
    constructor(
        private connection: TransactionalConnection,
        private productService: ProductService,
    ) {}

    async setProductCollections(
        ctx: import('@vendure/core').RequestContext,
        productId: ID,
        collectionIds: ID[],
    ): Promise<Product> {
        const product = await this.productService.findOne(ctx, productId, ['variants']);
        if (!product) {
            throw new Error(`Product ${productId} not found`);
        }

        const variantIds = (product.variants ?? []).map(variant => variant.id);
        if (variantIds.length === 0) {
            throw new Error('Product has no variants. Save at least one size/variant first.');
        }

        const uniqueCollectionIds = [...new Set(collectionIds.map(id => String(id)))];
        for (const collectionId of uniqueCollectionIds) {
            await this.connection
                .getRepository(ctx, Collection)
                .createQueryBuilder()
                .relation(Collection, 'productVariants')
                .of(collectionId)
                .add(variantIds);
        }

        return (await this.productService.findOne(ctx, productId, ['variants'])) as Product;
    }
}
