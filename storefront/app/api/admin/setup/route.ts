import { NextRequest, NextResponse } from 'next/server';

const VENDURE_API_URL = 'https://red-hex-backend.onrender.com/admin-api';

async function handleSetup(req: NextRequest) {
  // 1. Verify secret header
  const setupKey = req.headers.get('x-setup-key');
  if (setupKey !== 'redhex-setup-2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 2. Login to Vendure Admin API
    const loginRes = await fetch(VENDURE_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          mutation {
            login(username: "superadmin", password: "RedHex@Admin2024") {
              ... on CurrentUser { id identifier }
            }
          }
        `
      }),
      cache: 'no-store'
    });

    // Store auth token from header
    const token = loginRes.headers.get('vendure-auth-token');
    if (!token) {
      const loginBody = await loginRes.text();
      return NextResponse.json({ error: 'Failed to login, no token received', details: loginBody }, { status: 500 });
    }

    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // Helper function for admin API calls
    const callApi = async (query: string, variables = {}) => {
      const res = await fetch(VENDURE_API_URL, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ query, variables }),
        cache: 'no-store'
      });
      const data = await res.json();
      if (data.errors) {
        throw new Error(JSON.stringify(data.errors));
      }
      return data.data;
    };

    // 3. Create default tax category
    const createTaxCatData = await callApi(`
      mutation {
        createTaxCategory(input: {
          name: "Default Tax"
          isDefault: true
        }) { id name isDefault }
      }
    `);
    
    const taxCategory = createTaxCatData.createTaxCategory;

    // 4. Create tax rate using the new category ID
    const createTaxRateData = await callApi(`
      mutation CreateRate($categoryId: ID!) {
        createTaxRate(input: {
          name: "Standard Rate"
          enabled: true
          value: 0
          categoryId: $categoryId
          zoneId: "1"
        }) { id name }
      }
    `, { categoryId: taxCategory.id });

    const taxRate = createTaxRateData.createTaxRate;

    // 5. Update default channel with tax and shipping zones
    await callApi(`
      mutation {
        updateChannel(input: {
          id: "1"
          defaultTaxZoneId: "1"
          defaultShippingZoneId: "1"
          pricesIncludeTax: false
        }) { id }
      }
    `);

    // 6. Return JSON response showing what was created
    return NextResponse.json({
      success: true,
      taxCategory: { id: taxCategory.id, name: taxCategory.name },
      taxRate: { id: taxRate.id, name: taxRate.name },
      channel: "updated"
    });

  } catch (error: any) {
    return NextResponse.json({ error: 'Setup failed', details: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return handleSetup(req);
}

export async function POST(req: NextRequest) {
  return handleSetup(req);
}
