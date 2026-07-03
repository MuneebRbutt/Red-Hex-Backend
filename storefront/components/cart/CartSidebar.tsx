'use client';

import React from 'react';
import Link from 'next/link';
import { useCart, CartItem } from '@/lib/cartContext';
import { X, Trash2, Minus, Plus, ShoppingCart } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Cart Sidebar — slides in from right
// ─────────────────────────────────────────────────────────────────────────────
export default function CartSidebar() {
  const { items, isOpen, closeSidebar, removeItem, updateQuantity, subtotal, totalItems } = useCart();

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={closeSidebar}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 998,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* ── Sidebar Panel ── */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#0a0a0a',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: isOpen ? '-8px 0 40px rgba(0,0,0,0.6)' : 'none',
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShoppingCart size={20} color="#cc0000" />
            <span
              style={{
                fontFamily: "'Oswald',sans-serif",
                fontSize: '1rem',
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}
            >
              Your Cart
            </span>
            <span
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '0.7rem',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.4)',
              }}
            >
              ({totalItems} {totalItems === 1 ? 'item' : 'items'})
            </span>
          </div>
          <button
            onClick={closeSidebar}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.5)',
              padding: '4px',
              display: 'flex',
              transition: 'color 0.2s',
            }}
            aria-label="Close cart"
          >
            <X size={22} />
          </button>
        </div>

        {/* ── Items List ── */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem 1.5rem',
          }}
        >
          {items.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                gap: '1rem',
                color: 'rgba(255,255,255,0.3)',
                textAlign: 'center',
              }}
            >
              <ShoppingCart size={48} strokeWidth={1} />
              <p
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  margin: 0,
                }}
              >
                Your cart is empty
              </p>
              <button
                onClick={closeSidebar}
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#cc0000',
                  background: 'none',
                  border: '1px solid #cc0000',
                  padding: '0.6rem 1.4rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {items.map((item) => (
                <CartItemRow
                  key={`${item.id}-${item.size}`}
                  item={item}
                  onRemove={() => removeItem(item.id, item.size)}
                  onUpdateQty={(qty) => updateQuantity(item.id, item.size, qty)}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        {items.length > 0 && (
          <div
            style={{
              borderTop: '1px solid rgba(255,255,255,0.08)',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
            }}
          >
            {/* Subtotal */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.5)',
                }}
              >
                Subtotal
              </span>
              <span
                style={{
                  fontFamily: "'Oswald',sans-serif",
                  fontSize: '1.35rem',
                  fontWeight: 700,
                  color: '#ffffff',
                }}
              >
                ${subtotal.toFixed(2)}
              </span>
            </div>

            {/* Proceed to Enquiry */}
            <Link
              href="/cart"
              onClick={closeSidebar}
              style={{
                display: 'block',
                fontFamily: "'Oswald',sans-serif",
                fontSize: '0.9rem',
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#ffffff',
                backgroundColor: '#cc0000',
                textDecoration: 'none',
                textAlign: 'center',
                padding: '1rem',
                transition: 'background-color 0.25s ease',
                clipPath: 'polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)',
              }}
            >
              PROCEED TO ENQUIRY
            </Link>

            {/* Continue Shopping */}
            <button
              onClick={closeSidebar}
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.45)',
                background: 'none',
                border: '1px solid rgba(255,255,255,0.15)',
                padding: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                width: '100%',
              }}
            >
              CONTINUE SHOPPING
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Cart Item Row
// ─────────────────────────────────────────────────────────────────────────────
function CartItemRow({
  item,
  onRemove,
  onUpdateQty,
}: {
  item: CartItem;
  onRemove: () => void;
  onUpdateQty: (qty: number) => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '1rem',
        padding: '0.85rem',
        backgroundColor: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        transition: 'border-color 0.2s',
      }}
    >
      {/* Thumbnail */}
      <Link href={`/products/${item.slug}`} style={{ flexShrink: 0 }}>
        <img
          src={item.image}
          alt={item.name}
          style={{
            width: '72px',
            height: '90px',
            objectFit: 'cover',
            backgroundColor: '#111',
          }}
        />
      </Link>

      {/* Info */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
        <div>
          <Link
            href={`/products/${item.slug}`}
            style={{
              fontFamily: "'Oswald',sans-serif",
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#ffffff',
              textDecoration: 'none',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              display: 'block',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {item.name}
          </Link>

          {/* Size — non-editable label */}
          <span
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: '0.62rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase',
              marginTop: '0.25rem',
              display: 'inline-block',
              padding: '2px 8px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            Size: {item.size}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
          {/* Quantity controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <button
              onClick={() => onUpdateQty(item.quantity - 1)}
              disabled={item.quantity <= 1}
              style={{
                ...qtyBtnStyle,
                opacity: item.quantity <= 1 ? 0.3 : 1,
                cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
              }}
              aria-label="Decrease quantity"
            >
              <Minus size={12} />
            </button>
            <span
              style={{
                fontFamily: "'Oswald',sans-serif",
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#ffffff',
                minWidth: '32px',
                textAlign: 'center',
                padding: '0.35rem 0',
                borderLeft: '1px solid rgba(255,255,255,0.08)',
                borderRight: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQty(item.quantity + 1)}
              disabled={item.quantity >= 99}
              style={{
                ...qtyBtnStyle,
                opacity: item.quantity >= 99 ? 0.3 : 1,
                cursor: item.quantity >= 99 ? 'not-allowed' : 'pointer',
              }}
              aria-label="Increase quantity"
            >
              <Plus size={12} />
            </button>
          </div>

          {/* Price */}
          <span
            style={{
              fontFamily: "'Oswald',sans-serif",
              fontSize: '0.95rem',
              fontWeight: 700,
              color: '#ffffff',
            }}
          >
            ${(item.price * item.quantity).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Remove button */}
      <button
        onClick={onRemove}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'rgba(255,255,255,0.25)',
          padding: '4px',
          alignSelf: 'flex-start',
          transition: 'color 0.2s',
          flexShrink: 0,
        }}
        aria-label={`Remove ${item.name}`}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const qtyBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '30px',
  height: '30px',
  transition: 'background-color 0.2s',
};
