import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_API_URL, ADMIN_SESSION_COOKIE, ADMIN_TOKEN_COOKIE } from '@/lib/admin/constants';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('vendure-auth-token')?.value || req.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
  const session = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const body = await req.json();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
    headers.Cookie = `vendure-auth-token=${token}${session ? `; ${session}` : ''}`;
  } else if (session) {
    headers.Cookie = session;
  }

  console.log('--- GRAPHQL PROXY ---');
  console.log('Token value:', token ? `${token.substring(0, 10)}...` : 'NONE');
  console.log('Request body:', JSON.stringify(body));

  const upstream = await fetch('https://red-hex-backend.onrender.com/admin-api', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  console.log('Response status:', upstream.status);

  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
