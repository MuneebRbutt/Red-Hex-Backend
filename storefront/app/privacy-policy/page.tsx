import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Tanaura Leather & Safety Gloves',
  description: 'Privacy Policy for Tanaura Leather & Safety Gloves',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-brand-black text-brand-white min-h-screen py-16 px-6 sm:px-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-heading font-bold mb-8 text-brand-gold uppercase tracking-widest">
          Privacy Policy
        </h1>
        <div className="prose prose-invert prose-brand max-w-none">
          <p>Last Updated: {new Date().toLocaleDateString()}</p>
          
          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us when you create an account, make a purchase, or communicate with us. This may include your name, email address, shipping address, payment information, and phone number.</p>

          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to process transactions, communicate with you about your order, improve our products and services, and send promotional offers (if you have opted in).</p>

          <h2>3. Cookies and Tracking Technologies</h2>
          <p>We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</p>

          <h2>4. Information Sharing</h2>
          <p>We do not sell or rent your personal information to third parties. We may share your information with trusted service providers who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information confidential.</p>

          <h2>5. Data Security</h2>
          <p>We implement a variety of security measures to maintain the safety of your personal information when you place an order or enter, submit, or access your personal information.</p>

          <h2>6. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us through our contact page.</p>
        </div>
      </div>
    </div>
  );
}
