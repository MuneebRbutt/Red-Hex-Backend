/**
 * Test script: verifies Vendure Shop API connection.
 *
 * Run with:  npx ts-node --skip-project lib/test-vendure-connection.ts
 * Or simply:  node -e "fetch('http://localhost:3000/shop-api',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:'{collections(options:{take:5}){items{id name slug}}}' })}).then(r=>r.json()).then(d=>console.log(JSON.stringify(d,null,2))).catch(e=>console.error('Connection failed:',e.message))"
 */

const SHOP_API = process.env.NEXT_PUBLIC_VENDURE_SHOP_API ?? 'http://localhost:3000/shop-api';

async function testConnection() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  RED HEX INDUSTRIES — Vendure Connection Test');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Endpoint: ${SHOP_API}`);
  console.log('');

  try {
    // 1. Test: Fetch collections
    console.log('▶ Test 1: Fetching collections...');
    const collectionsRes = await fetch(SHOP_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `{
          collections(options: { take: 10 }) {
            totalItems
            items { id name slug featuredAsset { preview } }
          }
        }`,
      }),
    });
    const collectionsData = await collectionsRes.json();
    const collections = collectionsData.data?.collections?.items ?? [];
    console.log(`  ✅ ${collections.length} collections found`);
    collections.forEach((c: any) => console.log(`     - ${c.name} (/${c.slug})`));
    console.log('');

    // 2. Test: Fetch products
    console.log('▶ Test 2: Fetching products...');
    const productsRes = await fetch(SHOP_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `{
          products(options: { take: 5 }) {
            totalItems
            items {
              id name slug
              variants { id name priceWithTax }
            }
          }
        }`,
      }),
    });
    const productsData = await productsRes.json();
    const products = productsData.data?.products?.items ?? [];
    console.log(`  ✅ ${products.length} products found`);
    products.forEach((p: any) => {
      const price = p.variants?.[0]?.priceWithTax;
      console.log(`     - ${p.name} ($${price ? (price / 100).toFixed(2) : 'N/A'})`);
    });
    console.log('');

    // 3. Test: Active order (should be null for a new session)
    console.log('▶ Test 3: Checking active order...');
    const orderRes = await fetch(SHOP_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: `{ activeOrder { id totalQuantity } }` }),
    });
    const orderData = await orderRes.json();
    const order = orderData.data?.activeOrder;
    console.log(`  ✅ Active order: ${order ? `#${order.id} (${order.totalQuantity} items)` : 'None (expected for new session)'}`);
    console.log('');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  ✅ ALL TESTS PASSED — Vendure is connected!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (err: any) {
    console.error('');
    console.error('  ❌ CONNECTION FAILED');
    console.error(`  Error: ${err.message}`);
    console.error('');
    console.error('  Make sure Vendure is running:');
    console.error('    cd e:\\vendure-backend && npm run dev:server');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    process.exit(1);
  }
}

testConnection();
