import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_API_URL, ADMIN_SESSION_COOKIE, ADMIN_TOKEN_COOKIE } from './constants';

type GqlPayload = { query: string; variables?: Record<string, unknown> };

export async function adminServerFetch<T>(payload: GqlPayload): Promise<T> {
  const store = cookies();
  const token = store.get(ADMIN_TOKEN_COOKIE)?.value;
  const session = store.get(ADMIN_SESSION_COOKIE)?.value;

  if (!token && !session) {
    redirect('/admin/login');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) headers.Authorization = `Bearer ${token}`;
  if (session) headers.Cookie = session;

  const res = await fetch(ADMIN_API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  if (res.status === 401) {
    redirect('/admin/login');
  }

  const json = await res.json();
  if (json.errors?.length) {
    const message = json.errors[0]?.message ?? 'Admin API error';
    throw new Error(message);
  }

  return json.data as T;
}
