import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { customer, message, items, subtotal } = await request.json();
    if (!customer?.name || !customer?.email || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Add customer details and at least one product.' }, { status: 400 });
    }

    const endpoint = process.env.FORMSPREE_ENDPOINT;
    if (!endpoint) {
      return NextResponse.json(
        { error: 'Enquiry delivery is not configured yet. Please contact us on WhatsApp.' },
        { status: 503 },
      );
    }

    const productList = items
      .map((item: { name: string; size: string; quantity: number }) => `${item.name} — size ${item.size}, quantity ${item.quantity}`)
      .join('\n');
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        company: customer.company,
        products: productList,
        subtotal,
        message,
        source: 'Tanaura website product enquiry',
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Unable to send your enquiry. Please try WhatsApp.' }, { status: 502 });
    }

    return NextResponse.json({ success: true, message: 'Your enquiry has been sent.' });
  } catch {
    return NextResponse.json({ error: 'Unable to send your enquiry. Please try WhatsApp.' }, { status: 500 });
  }
}
