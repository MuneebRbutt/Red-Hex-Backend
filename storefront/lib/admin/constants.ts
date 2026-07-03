export const ADMIN_API_URL =
  process.env.VENDURE_ADMIN_API ??
  process.env.NEXT_PUBLIC_VENDURE_ADMIN_API ??
  'http://localhost:3000/admin-api';

export const ADMIN_TOKEN_COOKIE = 'rh_admin_token';
export const ADMIN_SESSION_COOKIE = 'rh_admin_session';
