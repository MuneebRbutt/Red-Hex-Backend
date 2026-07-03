import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer, message, items, subtotal } = body;

    // Validate request
    if (!customer?.name || !customer?.email || !items || !items.length) {
      return NextResponse.json(
        { error: 'Missing required customer details or cart items.' },
        { status: 400 }
      );
    }

    // Prepare console logs as a simulated email delivery
    console.log('==================================================');
    console.log('✉️ NEW CART ENQUIRY RECEIVED (RED HEX INDUSTRIES)');
    console.log('==================================================');
    console.log(`From: ${customer.name} <${customer.email}>`);
    if (customer.phone) console.log(`Phone: ${customer.phone}`);
    if (customer.company) console.log(`Company: ${customer.company}`);
    console.log('--------------------------------------------------');
    console.log('Items Ordered:');
    items.forEach((item: any, idx: number) => {
      console.log(
        `${idx + 1}. ${item.name} | Size: ${item.size} | Qty: ${item.quantity} | Price: $${item.price.toFixed(2)} | Subtotal: $${(item.price * item.quantity).toFixed(2)}`
      );
    });
    console.log('--------------------------------------------------');
    console.log(`Total Value: $${subtotal.toFixed(2)}`);
    if (message) {
      console.log('--------------------------------------------------');
      console.log(`Customer Message:\n${message}`);
    }
    console.log('==================================================');

    // Here is where you would normally configure nodemailer or an email API like Resend / SendGrid:
    // e.g., await sendEmail({ to: 'sales@redhexindustries.com', subject: 'New Enquiry', ... })

    return NextResponse.json({ success: true, message: 'Enquiry received successfully.' });
  } catch (error: any) {
    console.error('Error processing cart enquiry:', error);
    return NextResponse.json(
      { error: error?.message || 'An error occurred while processing your enquiry.' },
      { status: 500 }
    );
  }
}
