import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, message, inquiryType } = body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: 'Name, email, and message are required.' },
        { status: 400 },
      );
    }

    console.log('==================================================');
    console.log('✉️ NEW CONTACT FORM SUBMISSION (RED HEX INDUSTRIES)');
    console.log('==================================================');
    console.log(`From: ${name} <${email}>`);
    if (phone) console.log(`Phone: ${phone}`);
    if (inquiryType) console.log(`Inquiry Type: ${inquiryType}`);
    console.log('--------------------------------------------------');
    console.log(message);
    console.log('==================================================');

  // Optional: configure nodemailer or Resend here when credentials are available.

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your message has been received. We will get back to you shortly.',
    });
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      { error: 'Failed to send your message. Please try again.' },
      { status: 500 },
    );
  }
}
