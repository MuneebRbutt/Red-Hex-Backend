import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, ADMIN_TOKEN_COOKIE } from '@/lib/admin/constants';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/admin/login')) {
    return NextResponse.next();
  }

  const hasToken = request.cookies.has(ADMIN_TOKEN_COOKIE);
  const hasSession = request.cookies.has(ADMIN_SESSION_COOKIE);

  if (!hasToken && !hasSession) {
    const loginUrl = new URL('/admin/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
