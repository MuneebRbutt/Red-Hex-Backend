import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_API_URL, ADMIN_SESSION_COOKIE, ADMIN_TOKEN_COOKIE } from '@/lib/admin/constants';

export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
  const session = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const body = await req.json();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (session) headers.Cookie = session;

  const upstream = await fetch(ADMIN_API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
