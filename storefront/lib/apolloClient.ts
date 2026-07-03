import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from '@apollo/client';

const SHOP_API = process.env.NEXT_PUBLIC_VENDURE_SHOP_API ?? 'http://localhost:3000/shop-api';
const ADMIN_API = process.env.NEXT_PUBLIC_VENDURE_ADMIN_API ?? 'http://localhost:3000/admin-api';

const shopLink = new HttpLink({
  uri: SHOP_API,
  credentials: 'include',
});

const adminLink = new HttpLink({
  uri: ADMIN_API,
  credentials: 'include',
});

// Route requests to either Admin API or Shop API based on operation context
// e.g., useQuery(MUTATION, { context: { clientName: 'admin' } })
const directionalLink = ApolloLink.split(
  (operation) => operation.getContext().clientName === 'admin',
  adminLink,
  shopLink
);

const cache = new InMemoryCache({
  typePolicies: {
    Product: {
      keyFields: ['id'],
    },
    Collection: {
      keyFields: ['id'],
    },
    Query: {
      fields: {
        product: {
          keyArgs: ['slug', 'id'],
        },
        collection: {
          keyArgs: ['slug', 'id'],
        },
      },
    },
  },
});

export const apolloClient = new ApolloClient({
  link: directionalLink,
  cache,
  defaultOptions: {
    watchQuery: { fetchPolicy: 'cache-and-network' },
    query: { fetchPolicy: 'cache-first' },
  },
});

export default apolloClient;
