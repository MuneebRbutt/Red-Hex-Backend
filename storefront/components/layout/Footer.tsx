'use client';

import React, { useState } from 'react';
// Simple custom SVG components to prevent runtime errors from outdated lucide-react versions
function TwitterIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 9V2h2v7a4 4 0 1 1-2 7V9h-2z" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
    </svg>
  );
}

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Newsletter', email, message: 'Subscribe me' }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMsg(data.message || 'Subscribed!');
        setEmail('');
      } else {
        setStatus('error');
        setMsg(data.error || 'Failed');
      }
    } catch {
      setStatus('error');
      setMsg('Network error');
    }
  };

  return (
    <footer
      style={{
        backgroundColor: '#0d0d0d',
        color: '#ffffff',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        paddingTop: '4rem',
        paddingBottom: '2rem',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(3,1fr)',
          gap: '2rem',
          padding: '0 clamp(1.5rem,5vw,4rem)',
        }}
        className="footer-grid"
      >
        {/* Logo & address */}
        <div>
          <div style={{ marginBottom: '1rem' }}>
            {/* Placeholder logo */}
            <img src="/logo.svg" alt="RED HEX INDUSTRIES" style={{ height: '32px' }} />
          </div>
          <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.7)' }}>
            1234 Industrial Ave.<br />
            Lahore, PK 54000<br />
            Phone: +92 300 1234567<br />
            Email: info@zeynindustry.com
          </p>
        </div>
        {/* MENU links */}
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#ffffff' }}>MENU</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li><a href="/" style={linkStyle}>Home</a></li>
            <li><a href="/collections" style={linkStyle}>Collections</a></li>
            <li><a href="/about" style={linkStyle}>About</a></li>
            <li><a href="/contact" style={linkStyle}>Contact</a></li>
          </ul>
        </div>
        {/* POLICY links & newsletter */}
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#ffffff' }}>POLICY</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginBottom: '1.5rem' }}>
            <li><a href="/privacy" style={linkStyle}>Privacy Policy</a></li>
            <li><a href="/terms" style={linkStyle}>Terms of Service</a></li>
            <li><a href="/shipping" style={linkStyle}>Shipping</a></li>
            <li><a href="/returns" style={linkStyle}>Returns</a></li>
          </ul>
          {/* Newsletter */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
            <button
              type="submit"
              disabled={status === 'sending'}
              style={btnStyle}
            >
              {status === 'sending' ? 'SENDING…' : 'SUBSCRIBE'}
            </button>
          </form>
          {msg && (
            <p style={{ marginTop: '0.5rem', color: status === 'success' ? '#4caf50' : '#ff5252' }}>{msg}</p>
          )}
        </div>
      </div>

      {/* Social & payment row */}
      <div
        style={{
          maxWidth: '1400px',
          margin: '2rem auto 0',
          padding: '0 clamp(1.5rem,5vw,4rem)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
        }}
        className="footer-bottom"
      >
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <a href="#" aria-label="Twitter" style={iconLinkStyle}><TwitterIcon /></a>
          <a href="#" aria-label="Facebook" style={iconLinkStyle}><FacebookIcon /></a>
          <a href="#" aria-label="Instagram" style={iconLinkStyle}><InstagramIcon /></a>
          <a href="#" aria-label="Tik Tok" style={iconLinkStyle}><TikTokIcon /></a>
          <a href="#" aria-label="YouTube" style={iconLinkStyle}><YoutubeIcon /></a>
        </div>
        {/* Payments */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <img src="https://placehold.co/40x24/555555/ffffff?text=VISA" alt="VISA" />
          <img src="https://placehold.co/40x24/555555/ffffff?text=MC" alt="MasterCard" />
          <img src="https://placehold.co/40x24/555555/ffffff?text=PAYPAL" alt="PayPal" />
        </div>
        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
          © 2026 RED HEX INDUSTRIES - All Copyright reserved
        </p>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr !important; }
          .footer-grid div { text-align: center; }
          .footer-bottom { align-items: center; }
        }
      `}</style>
    </footer>
  );
}

const linkStyle: React.CSSProperties = {
  color: 'rgba(255,255,255,0.85)',
  textDecoration: 'none',
  fontSize: '0.85rem',
  display: 'block',
  marginBottom: '0.4rem',
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: '0.6rem 0.8rem',
  backgroundColor: '#000000',
  border: '1px solid rgba(255,255,255,0.3)',
  color: '#ffffff',
  fontSize: '0.85rem',
};

const btnStyle: React.CSSProperties = {
  padding: '0.6rem 1rem',
  backgroundColor: '#cc0000',
  color: '#000000',
  border: 'none',
  cursor: 'pointer',
  fontWeight: 600,
};

const iconLinkStyle: React.CSSProperties = {
  color: '#ffffff',
  transition: 'color 0.2s',
};

export { linkStyle, inputStyle, btnStyle, iconLinkStyle };
