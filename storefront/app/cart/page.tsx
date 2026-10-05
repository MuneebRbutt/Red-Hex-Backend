'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart, CartItem } from '@/lib/cartContext';
import { Trash2, Minus, Plus, ShoppingCart, ArrowLeft, Send } from 'lucide-react';
import Footer from '@/components/layout/Footer';

// ─────────────────────────────────────────────────────────────────────────────
// Cart Page — full-page cart with enquiry submission
// ─────────────────────────────────────────────────────────────────────────────
export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, subtotal, totalItems } = useCart();

  // Contact form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSendEnquiry = async () => {
    if (!name.trim() || !email.trim()) {
      setStatus('error');
      setErrorMsg('Please fill in your name and email.');
      return;
    }
    if (items.length === 0) {
      setStatus('error');
      setErrorMsg('Your cart is empty.');
      return;
    }

    setStatus('sending');
    setErrorMsg('');

    try {
      const res = await fetch('/api/cart-enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: { name, email, phone, company },
          message,
          items: items.map(i => ({
            name: i.name,
            size: i.size,
            quantity: i.quantity,
            price: i.price,
            slug: i.slug,
          })),
          subtotal,
        }),
      });

      if (res.ok) {
        setStatus('success');
        clearCart();
        setName('');
        setEmail('');
        setPhone('');
        setCompany('');
        setMessage('');
      } else {
        const data = await res.json().catch(() => ({}));
        setStatus('error');
        setErrorMsg(data.error || 'Failed to send enquiry. Please try again.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Network error. Please try again.');
    }
  };

  return (
    <div style={{ backgroundColor: '#000000', color: '#ffffff', minHeight: '100vh' }}>
      {/* ── Breadcrumb ── */}
      <div style={{ padding: '1.25rem clamp(1.5rem,5vw,4rem)', borderBottom: '1px solid rgba(255,255,255,0.06)', maxWidth: '1400px', margin: '0 auto' }}>
        <nav style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>HOME</Link>
          <span>›</span>
          <span style={{ color: 'rgba(255,255,255,0.65)' }}>YOUR CART</span>
        </nav>
      </div>

      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: 'clamp(2rem,4vw,3.5rem) clamp(1.5rem,5vw,4rem)' }}>
        {/* ── Page Title ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
          <ShoppingCart size={28} color="#cc0000" />
          <h1
            style={{
              fontFamily: "'Oswald',sans-serif",
              fontSize: 'clamp(1.8rem,3.5vw,2.8rem)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              margin: 0,
            }}
          >
            Your Cart
          </h1>
          <span
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.35)',
              marginLeft: '0.25rem',
            }}
          >
            ({totalItems} {totalItems === 1 ? 'item' : 'items'})
          </span>
        </div>

        {items.length === 0 && status !== 'success' ? (
          /* ── Empty Cart ── */
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '5rem 2rem',
              gap: '1.5rem',
              textAlign: 'center',
            }}
          >
            <ShoppingCart size={64} strokeWidth={0.8} color="rgba(255,255,255,0.15)" />
            <p
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '1rem',
                color: 'rgba(255,255,255,0.35)',
                margin: 0,
              }}
            >
              Your cart is empty.
            </p>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontFamily: "'Inter',sans-serif",
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#cc0000',
                border: '1px solid #cc0000',
                padding: '0.75rem 1.5rem',
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
            >
              <ArrowLeft size={14} />
              Continue Shopping
            </Link>
          </div>
        ) : status === 'success' ? (
          /* ── Success Message ── */
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '5rem 2rem',
              gap: '1.5rem',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(76,175,80,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem',
              }}
            >
              ✓
            </div>
            <h2
              style={{
                fontFamily: "'Oswald',sans-serif",
                fontSize: '1.8rem',
                fontWeight: 700,
                color: '#4caf50',
                textTransform: 'uppercase',
                margin: 0,
              }}
            >
              Enquiry Sent Successfully!
            </h2>
            <p
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '0.9rem',
                color: 'rgba(255,255,255,0.5)',
                maxWidth: '480px',
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Thank you for your interest. Our team will review your enquiry and get back to you within 24 hours.
            </p>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontFamily: "'Inter',sans-serif",
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#cc0000',
                border: '1px solid #cc0000',
                padding: '0.75rem 1.5rem',
                textDecoration: 'none',
                transition: 'all 0.2s',
                marginTop: '0.5rem',
              }}
            >
              <ArrowLeft size={14} />
              Back to Store
            </Link>
          </div>
        ) : (
          /* ── Cart Content ── */
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 'clamp(2rem,4vw,4rem)', alignItems: 'start' }} className="cart-layout">
            {/* ── LEFT: Items ── */}
            <div>
              {/* Column Headers */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '3fr 1fr 1fr 1fr auto',
                  gap: '1rem',
                  padding: '0 0 0.75rem',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  alignItems: 'center',
                }}
                className="cart-header-row"
              >
                {['Product', 'Size', 'Qty', 'Total', ''].map((h) => (
                  <span
                    key={h}
                    style={{
                      fontFamily: "'Inter',sans-serif",
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.3)',
                    }}
                  >
                    {h}
                  </span>
                ))}
              </div>

              {/* Item Rows */}
              {items.map((item) => (
                <div
                  key={`${item.id}-${item.size}`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '3fr 1fr 1fr 1fr auto',
                    gap: '1rem',
                    padding: '1.25rem 0',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    alignItems: 'center',
                  }}
                  className="cart-item-row"
                >
                  {/* Product */}
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Link href={`/products/${item.slug}`} style={{ flexShrink: 0 }}>
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{
                          width: '72px',
                          height: '90px',
                          objectFit: 'contain',
                          objectPosition: 'center',
                          backgroundColor: '#111',
                          border: '1px solid rgba(255,255,255,0.06)',
                        }}
                      />
                    </Link>
                    <div>
                      <Link
                        href={`/products/${item.slug}`}
                        style={{
                          fontFamily: "'Oswald',sans-serif",
                          fontSize: '0.95rem',
                          fontWeight: 600,
                          color: '#ffffff',
                          textDecoration: 'none',
                          textTransform: 'uppercase',
                          letterSpacing: '0.03em',
                          display: 'block',
                        }}
                      >
                        {item.name}
                      </Link>
                    </div>
                  </div>

                  {/* Size (non-editable) */}
                  <span
                    style={{
                      fontFamily: "'Inter',sans-serif",
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      color: 'rgba(255,255,255,0.5)',
                      textTransform: 'uppercase',
                      padding: '4px 10px',
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      display: 'inline-block',
                      width: 'fit-content',
                    }}
                  >
                    {item.size}
                  </span>

                  {/* Quantity */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      border: '1px solid rgba(255,255,255,0.12)',
                      width: 'fit-content',
                    }}
                  >
                    <button
                      onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      style={{
                        ...smallQtyBtn,
                        opacity: item.quantity <= 1 ? 0.3 : 1,
                        cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
                      }}
                      aria-label="Decrease"
                    >
                      <Minus size={12} />
                    </button>
                    <span
                      style={{
                        fontFamily: "'Oswald',sans-serif",
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: '#fff',
                        minWidth: '34px',
                        textAlign: 'center',
                        padding: '0.35rem 0',
                        borderLeft: '1px solid rgba(255,255,255,0.08)',
                        borderRight: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                      disabled={item.quantity >= 99}
                      style={{
                        ...smallQtyBtn,
                        opacity: item.quantity >= 99 ? 0.3 : 1,
                        cursor: item.quantity >= 99 ? 'not-allowed' : 'pointer',
                      }}
                      aria-label="Increase"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* Removed Total Price */}

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.id, item.size)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'rgba(255,255,255,0.25)',
                      padding: '6px',
                      transition: 'color 0.2s',
                    }}
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              {/* Back to Shopping */}
              <Link
                href="/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.4)',
                  textDecoration: 'none',
                  marginTop: '1.5rem',
                  transition: 'color 0.2s',
                }}
              >
                <ArrowLeft size={14} />
                Continue Shopping
              </Link>
            </div>

            {/* ── RIGHT: Order Summary + Enquiry Form ── */}
            <div
              style={{
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '1.75rem',
                position: 'sticky',
                top: '100px',
              }}
            >
              <h2
                style={{
                  fontFamily: "'Oswald',sans-serif",
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  marginBottom: '1.5rem',
                  paddingBottom: '0.75rem',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  margin: '0 0 1.5rem',
                }}
              >
                Order Summary
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={summaryLabel}>Items ({totalItems})</span>
                </div>
              </div>

              {/* ── Contact Form ── */}
              <div
                style={{
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  paddingTop: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Inter',sans-serif",
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: '#cc0000',
                    margin: '0 0 0.25rem',
                  }}
                >
                  Your Contact Details
                </h3>

                <input
                  type="text"
                  placeholder="Full Name *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={inputStyle}
                />
                <input
                  type="email"
                  placeholder="Email Address *"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={inputStyle}
                />
                <input
                  type="text"
                  placeholder="Company Name"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  style={inputStyle}
                />
                <textarea
                  placeholder="Additional Notes (optional)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: '60px' }}
                />

                {/* Error */}
                {status === 'error' && errorMsg && (
                  <div
                    style={{
                      fontFamily: "'Inter',sans-serif",
                      fontSize: '0.75rem',
                      padding: '0.6rem 0.8rem',
                      backgroundColor: 'rgba(255,68,68,0.1)',
                      border: '1px solid rgba(255,68,68,0.25)',
                      color: '#ff4444',
                    }}
                  >
                    {errorMsg}
                  </div>
                )}

                {/* Send Enquiry Button */}
                <button
                  onClick={handleSendEnquiry}
                  disabled={status === 'sending'}
                  style={{
                    fontFamily: "'Oswald',sans-serif",
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: '#ffffff',
                    backgroundColor: status === 'sending' ? '#881111' : '#cc0000',
                    border: 'none',
                    padding: '1rem',
                    cursor: status === 'sending' ? 'wait' : 'pointer',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'background-color 0.25s ease',
                    clipPath: 'polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)',
                    marginTop: '0.25rem',
                  }}
                >
                  <Send size={16} />
                  {status === 'sending' ? 'SENDING…' : 'SEND ENQUIRY'}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      <Footer />

      <style>{`
        @media (max-width: 900px) {
          .cart-layout {
            grid-template-columns: 1fr !important;
          }
          .cart-header-row {
            display: none !important;
          }
          .cart-item-row {
            grid-template-columns: 1fr !important;
            gap: 0.75rem !important;
          }
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  fontFamily: "'Inter',sans-serif",
  fontSize: '0.82rem',
  color: '#ffffff',
  backgroundColor: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.12)',
  padding: '0.7rem 0.9rem',
  outline: 'none',
  transition: 'border-color 0.2s',
  width: '100%',
  boxSizing: 'border-box',
};

const summaryLabel: React.CSSProperties = {
  fontFamily: "'Inter',sans-serif",
  fontSize: '0.78rem',
  color: 'rgba(255,255,255,0.45)',
};

const summaryValue: React.CSSProperties = {
  fontFamily: "'Oswald',sans-serif",
  fontSize: '0.95rem',
  fontWeight: 600,
  color: '#ffffff',
};

const smallQtyBtn: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '30px',
  height: '30px',
  transition: 'background-color 0.2s',
};
