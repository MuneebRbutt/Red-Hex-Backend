'use client';

import { FormEvent, useState } from 'react';
import Footer from '@/components/layout/Footer';
import Toast from '@/components/ui/Toast';
import { INQUIRY_TYPES, SITE } from '@/lib/siteConfig';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.85rem 1rem',
  backgroundColor: '#000000',
  border: '1px solid rgba(255,255,255,0.2)',
  color: '#ffffff',
  fontFamily: "'Inter', sans-serif",
  fontSize: '0.9rem',
  outline: 'none',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: "'Inter', sans-serif",
  fontSize: '0.7rem',
  fontWeight: 700,
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.55)',
  marginBottom: '0.45rem',
};

function SocialIcon({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
        border: '1px solid rgba(255,255,255,0.15)',
        color: '#ffffff',
        transition: 'border-color 0.2s, color 0.2s',
      }}
      className="social-icon"
    >
      {children}
    </span>
  );
}

export default function ContactPageClient() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: INQUIRY_TYPES[0],
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast({ message: data.error ?? 'Something went wrong.', type: 'error' });
        return;
      }
      setToast({
        message: data.message ?? 'Message sent successfully!',
        type: 'success',
      });
      setForm({
        name: '',
        email: '',
        phone: '',
        inquiryType: INQUIRY_TYPES[0],
        message: '',
      });
    } catch {
      setToast({ message: 'Network error. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ backgroundColor: '#000000', color: '#ffffff', minHeight: '100vh' }}>
      {toast ? (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      ) : null}

      {/* Hero */}
      <section
        style={{
          padding: 'clamp(4rem, 10vw, 7rem) 1.5rem clamp(3rem, 6vw, 4.5rem)',
          textAlign: 'center',
          background: 'linear-gradient(180deg, #0a0a0a 0%, #000000 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.62rem',
            fontWeight: 700,
            letterSpacing: '0.35em',
            color: '#cc0000',
            textTransform: 'uppercase',
          }}
        >
          RED HEX INDUSTRIES
        </span>
        <h1
          style={{
            fontFamily: "'Oswald', sans-serif",
            fontSize: 'clamp(2.5rem, 7vw, 4.5rem)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            margin: '0.75rem 0 0.75rem',
          }}
        >
          GET IN TOUCH
        </h1>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.5)',
            maxWidth: '560px',
            margin: '0 auto',
            lineHeight: 1.7,
          }}
        >
          Questions about custom orders, samples, or bulk production? Reach our team — we typically respond within 24 hours.
        </p>
      </section>

      {/* Two-column layout */}
      <section
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.25rem, 4vw, 2rem)',
        }}
      >
        <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '2.5rem' }}>
          {/* Form */}
          <div
            style={{
              backgroundColor: '#0d0d0d',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: 'clamp(1.5rem, 3vw, 2.25rem)',
            }}
          >
            <h2
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: '1.35rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '1.5rem',
              }}
            >
              Send a Message
            </h2>
            <form onSubmit={onSubmit} style={{ display: 'grid', gap: '1.1rem' }}>
              <div>
                <label style={labelStyle} htmlFor="contact-name">Name</label>
                <input
                  id="contact-name"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle} htmlFor="contact-email">Email</label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle} htmlFor="contact-phone">Phone</label>
                <input
                  id="contact-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle} htmlFor="contact-inquiry">Inquiry Type</label>
                <select
                  id="contact-inquiry"
                  value={form.inquiryType}
                  onChange={(e) => setForm((f) => ({ ...f, inquiryType: e.target.value as typeof form.inquiryType }))}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  {INQUIRY_TYPES.map((type) => (
                    <option key={type} value={type} style={{ backgroundColor: '#111' }}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle} htmlFor="contact-message">Message</label>
                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: '130px' }}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: '0.5rem',
                  padding: '1rem 2rem',
                  backgroundColor: loading ? '#881111' : '#cc0000',
                  color: '#000000',
                  border: 'none',
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  cursor: loading ? 'wait' : 'pointer',
                }}
              >
                {loading ? 'Sending…' : 'Submit'}
              </button>
            </form>
          </div>

          {/* Contact info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              {
                title: 'Phone',
                body: SITE.phone,
                href: SITE.phoneHref,
              },
              {
                title: 'Email',
                body: SITE.email,
                href: `mailto:${SITE.email}`,
              },
              {
                title: 'Address',
                body: (
                  <>
                    {SITE.address.line1}
                    <br />
                    {SITE.address.line2}
                  </>
                ),
              },
            ].map((card) => (
              <div
                key={card.title}
                style={{
                  backgroundColor: '#0d0d0d',
                  border: '1px solid rgba(255,255,255,0.08)',
                  padding: '1.35rem 1.5rem',
                }}
              >
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    color: '#cc0000',
                    margin: '0 0 0.5rem',
                  }}
                >
                  {card.title}
                </p>
                {card.href ? (
                  <a
                    href={card.href}
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.95rem',
                      color: '#ffffff',
                      textDecoration: 'none',
                      lineHeight: 1.6,
                    }}
                  >
                    {card.body}
                  </a>
                ) : (
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.95rem',
                      color: 'rgba(255,255,255,0.85)',
                      margin: 0,
                      lineHeight: 1.6,
                    }}
                  >
                    {card.body}
                  </p>
                )}
              </div>
            ))}

            <a
              href={SITE.whatsapp.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                padding: '1rem',
                backgroundColor: '#25D366',
                color: '#000000',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 800,
                fontSize: '0.78rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              WhatsApp Us
            </a>

            <div
              style={{
                backgroundColor: '#0d0d0d',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '1.35rem 1.5rem',
              }}
            >
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: '#cc0000',
                  margin: '0 0 0.85rem',
                }}
              >
                Follow Us
              </p>
              <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                <a href={SITE.social.instagram} aria-label="Instagram" className="social-link">
                  <SocialIcon>IG</SocialIcon>
                </a>
                <a href={SITE.social.facebook} aria-label="Facebook" className="social-link">
                  <SocialIcon>FB</SocialIcon>
                </a>
                <a href={SITE.social.twitter} aria-label="Twitter" className="social-link">
                  <SocialIcon>X</SocialIcon>
                </a>
                <a href={SITE.social.tiktok} aria-label="TikTok" className="social-link">
                  <SocialIcon>TT</SocialIcon>
                </a>
                <a href={SITE.social.youtube} aria-label="YouTube" className="social-link">
                  <SocialIcon>YT</SocialIcon>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        .social-link { text-decoration: none; }
        .social-link:hover .social-icon {
          border-color: #cc0000 !important;
          color: #cc0000 !important;
        }
        @media (max-width: 900px) {
          .contact-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
