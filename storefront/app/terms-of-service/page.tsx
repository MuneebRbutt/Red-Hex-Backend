import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Tanaura Leather & Safety Gloves',
  description: 'Terms of Service for Tanaura Leather & Safety Gloves',
};

export default function TermsOfServicePage() {
  return (
    <div className="bg-brand-black text-brand-white min-h-screen py-16 px-6 sm:px-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-heading font-bold mb-8 text-brand-gold uppercase tracking-widest">
          Terms of Service
        </h1>
        <div className="prose prose-invert prose-brand max-w-none">
          <p>Last Updated: {new Date().toLocaleDateString()}</p>

          <h2>1. Acceptance of Terms</h2>
          <p>By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>

          <h2>2. Use of the Site</h2>
          <p>You agree to use our website only for lawful purposes. You must not use our website in any way that causes, or may cause, damage to the website or impairment of the availability or accessibility of the website.</p>

          <h2>3. Products and Pricing</h2>
          <p>All products and prices are subject to change without notice. We reserve the right to modify or discontinue any product or service without notice at any time. We shall not be liable to you or to any third-party for any modification, price change, suspension, or discontinuance of the Service.</p>

          <h2>4. Order Cancellation</h2>
          <p>We reserve the right to refuse or cancel any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household, or per order.</p>

          <h2>5. Limitation of Liability</h2>
          <p>In no event shall Tanaura Leather & Safety Gloves, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>

          <h2>6. Governing Law</h2>
          <p>These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that location.</p>
        </div>
      </div>
    </div>
  );
}
