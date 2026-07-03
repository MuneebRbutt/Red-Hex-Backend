'use client';

import { useEffect } from 'react';

type ToastProps = {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
  duration?: number;
};

export default function Toast({ message, type = 'success', onClose, duration = 4500 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: '1.25rem',
        right: '1.25rem',
        zIndex: 9999,
        minWidth: '280px',
        maxWidth: '420px',
        padding: '1rem 1.25rem',
        backgroundColor: type === 'success' ? '#0f1a0f' : '#1a0f0f',
        border: `1px solid ${type === 'success' ? '#2e7d32' : '#cc0000'}`,
        borderLeft: `4px solid ${type === 'success' ? '#4caf50' : '#cc0000'}`,
        color: '#ffffff',
        fontFamily: "'Inter', sans-serif",
        fontSize: '0.9rem',
        lineHeight: 1.5,
        boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
        animation: 'toast-in 0.35s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>
          {type === 'success' ? '✓' : '!'}
        </span>
        <p style={{ margin: 0, flex: 1 }}>{message}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss"
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            fontSize: '1.1rem',
            lineHeight: 1,
            padding: 0,
          }}
        >
          ×
        </button>
      </div>
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateX(24px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
