import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { name, email, phone, message, inquiryType } = await request.json();
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 });
    }

    const endpoint = process.env.FORMSPREE_ENDPOINT;
    if (!endpoint) {
      return NextResponse.json(
        { error: 'Contact delivery is not configured yet. Please contact us on WhatsApp.' },
        { status: 503 },
      );
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, inquiryType, message, source: 'Tanaura website contact form' }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Unable to send your message. Please try WhatsApp.' }, { status: 502 });
    }

    return NextResponse.json({ success: true, message: 'Thank you. Your message has been sent.' });
  } catch {
    return NextResponse.json({ error: 'Failed to send your message. Please try WhatsApp.' }, { status: 500 });
  }
}
