import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping Policy | Tanaura Leather & Safety Gloves',
  description: 'Shipping Policy for Tanaura Leather & Safety Gloves',
};

export default function ShippingPolicyPage() {
  return (
    <div className="bg-brand-black text-brand-white min-h-screen py-16 px-6 sm:px-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-heading font-bold mb-8 text-brand-gold uppercase tracking-widest">
          Shipping Policy
        </h1>
        <div className="prose prose-invert prose-brand max-w-none">
          <p>Last Updated: {new Date().toLocaleDateString()}</p>

          <h2>1. Processing Time</h2>
          <p>All orders are processed within 1-3 business days. Orders are not shipped or delivered on weekends or holidays. If we are experiencing a high volume of orders, shipments may be delayed by a few days.</p>

          <h2>2. Shipping Rates & Delivery Estimates</h2>
          <p>Shipping charges for your order will be calculated and displayed at checkout. Delivery delays can occasionally occur, especially during busy seasons or due to unforeseen carrier delays.</p>

          <h2>3. Shipment Confirmation & Order Tracking</h2>
          <p>You will receive a Shipment Confirmation email once your order has shipped containing your tracking number(s). The tracking number will be active within 24 hours.</p>

          <h2>4. Customs, Duties and Taxes</h2>
          <p>Tanaura Leather & Safety Gloves is not responsible for any customs and taxes applied to your order. All fees imposed during or after shipping are the responsibility of the customer (tariffs, taxes, etc.).</p>

          <h2>5. Damages</h2>
          <p>Tanaura Leather & Safety Gloves is not liable for any products damaged or lost during shipping. If you received your order damaged, please contact the shipment carrier to file a claim. Please save all packaging materials and damaged goods before filing a claim.</p>

          <h2>6. International Shipping Policy</h2>
          <p>We currently ship outside the continental US to most international locations. Standard international shipping times range from 7-21 business days.</p>
        </div>
      </div>
    </div>
  );
}
