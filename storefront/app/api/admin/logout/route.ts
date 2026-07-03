import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, ADMIN_TOKEN_COOKIE } from '@/lib/admin/constants';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(ADMIN_TOKEN_COOKIE);
  response.cookies.delete(ADMIN_SESSION_COOKIE);
  return response;
}
