import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_API_URL, ADMIN_SESSION_COOKIE, ADMIN_TOKEN_COOKIE } from '@/lib/admin/constants';

const LOGIN_MUTATION = `
mutation AdminLogin($username: String!, $password: String!) {
  login(username: $username, password: $password) {
    __typename
    ... on CurrentUser {
      id
      identifier
    }
    ... on ErrorResult {
      errorCode
      message
    }
  }
}
`;

function extractSessionCookie(setCookieHeader: string | null): string | null {
  if (!setCookieHeader) return null;
  const firstPart = setCookieHeader.split(',')[0];
  const pair = firstPart.split(';')[0];
  return pair.includes('=') ? pair : null;
}

export async function POST(req: NextRequest) {
  let username = '';
  let password = '';

  try {
    ({ username, password } = await req.json());
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request body' }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(ADMIN_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: LOGIN_MUTATION,
        variables: { username, password },
      }),
      cache: 'no-store',
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message:
          'Cannot reach the Vendure API. Check that the Railway backend is running and NEXT_PUBLIC_VENDURE_ADMIN_API is set correctly.',
      },
      { status: 503 },
    );
  }

  const raw = await upstream.text();
  let json: { data?: { login?: { __typename?: string; message?: string } } } | null = null;
  try {
    json = raw ? JSON.parse(raw) : null;
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: `Vendure API returned an invalid response (HTTP ${upstream.status}). The backend may still be starting — wait a few seconds and try again.`,
      },
      { status: 502 },
    );
  }

  const token = upstream.headers.get('vendure-auth-token');
  const sessionPair = extractSessionCookie(upstream.headers.get('set-cookie'));
  const result = json?.data?.login;

  if (!result || result.__typename !== 'CurrentUser') {
    const message = result?.message ?? 'Invalid credentials';
    return NextResponse.json({ success: false, message }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });

  const isProduction = process.env.NODE_ENV === 'production';

  if (token) {
    response.cookies.set(ADMIN_TOKEN_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      path: '/',
    });
  }

  if (sessionPair) {
    response.cookies.set(ADMIN_SESSION_COOKIE, sessionPair, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      path: '/',
    });
  }

  return response;
}
