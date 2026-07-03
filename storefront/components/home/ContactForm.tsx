"use client";

import React, { useState } from 'react';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setMsg('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMsg(data.message || 'Message sent successfully!');
        setForm({ name: '', email: '', message: '' });
      } else {
        setStatus('error');
        setMsg(data.error || 'Something went wrong.');
      }
    } catch (err) {
      setStatus('error');
      setMsg('Network error.');
    }
  };

  return (
    <section
      aria-labelledby="contact-heading"
      style={{
        backgroundColor: '#0d0d0d',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: 'clamp(3rem,6vw,5rem) 0',
      }}
    >
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '0 clamp(1.5rem,5vw,4rem)',
          textAlign: 'center',
        }}
      >
        <h2
          id="contact-heading"
          style={{
            fontFamily: "'Oswald', 'Bebas Neue', sans-serif",
            fontSize: 'clamp(2rem,5vw,3.2rem)',
            fontWeight: 700,
            color: '#ffffff',
            textTransform: 'uppercase',
            marginBottom: '1.5rem',
          }}
        >
          GET IN TOUCH
        </h2>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 'clamp(0.85rem,1.4vw,0.97rem)',
            color: 'rgba(255,255,255,0.55)',
            marginBottom: '2rem',
          }}
        >
          Have a question or need a custom quote? Send us a quick message.
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            required
            value={form.name}
            onChange={handleChange}
            style={inputStyle}
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            required
            value={form.email}
            onChange={handleChange}
            style={inputStyle}
          />
          <textarea
            name="message"
            placeholder="Your Message"
            required
            rows={4}
            value={form.message}
            onChange={handleChange}
            style={{ ...inputStyle, resize: 'vertical', minHeight: '120px' }}
          />
          <button
            type="submit"
            disabled={status === 'sending'}
            style={buttonStyle}
          >
            {status === 'sending' ? 'SENDING…' : 'SEND'}
          </button>
          <style>{`button:hover { background-color: #aa0000 !important; }`}</style>
        </form>
        {msg && (
          <p
            style={{
              marginTop: '1rem',
              color: status === 'success' ? '#4caf50' : '#ff5252',
              fontWeight: 600,
            }}
          >
            {msg}
          </p>
        )}
      </div>
    </section>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.85rem 1rem',
  backgroundColor: '#000000',
  border: '1px solid rgba(255,255,255,0.3)',
  color: '#ffffff',
  fontFamily: "'Inter', sans-serif",
  fontSize: 'clamp(0.85rem,1.2vw,0.95rem)',
  borderRadius: '4px',
  outline: 'none',
};

const buttonStyle: React.CSSProperties = {
  padding: '0.95rem 2rem',
  backgroundColor: '#cc0000',
  color: '#000000',
  fontFamily: "'Inter', sans-serif",
  fontWeight: 800,
  fontSize: 'clamp(0.9rem,1.5vw,1rem)',
  textTransform: 'uppercase',
  border: 'none',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',
};

