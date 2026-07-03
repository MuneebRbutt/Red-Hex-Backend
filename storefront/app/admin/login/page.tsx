'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('superadmin');
  const [password, setPassword] = useState('superadmin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const raw = await res.text();
      let json: { success?: boolean; message?: string } = {};
      try {
        json = raw ? JSON.parse(raw) : {};
      } catch {
        setError('Login failed — the server returned an unexpected response. Is the Vendure backend running?');
        return;
      }
      if (!res.ok || !json.success) {
        setError(json.message ?? 'Login failed');
        return;
      }
      router.push('/admin/dashboard');
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 text-gray-900 flex items-center justify-center p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-lg border bg-white p-6 shadow-sm space-y-4"
      >
        <h1 className="text-2xl font-semibold normal-case tracking-normal">Admin Login</h1>
        <div className="space-y-1">
          <label className="text-sm font-medium">Email / Username</label>
          <input
            className="w-full rounded border px-3 py-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Password</label>
          <input
            type="password"
            className="w-full rounded border px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-black text-white py-2 disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
