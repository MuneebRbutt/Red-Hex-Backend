import gql from 'graphql-tag';

export const adminApiExtensions = gql`
    extend type Mutation {
        """
        Assigns all variants of a product to the given collections immediately.
        Used by the custom storefront admin panel.
        """
        setProductCollections(productId: ID!, collectionIds: [ID!]!): Product!
    }
`;
