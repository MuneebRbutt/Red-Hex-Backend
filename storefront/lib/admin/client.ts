function isDatabaseLockError(message: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes('database is locked') || lower.includes('sqlite_busy');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function adminClientFetch<T = any>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const maxAttempts = 6;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const res = await fetch('/api/admin/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    });

    if (res.status === 401) {
      throw new Error('UNAUTHORIZED');
    }

    const json = await res.json();
    if (json.errors?.length) {
      const message = json.errors[0]?.message ?? 'Admin API error';
      lastError = new Error(message);
      if (isDatabaseLockError(message) && attempt < maxAttempts - 1) {
        await sleep(400 * (attempt + 1));
        continue;
      }
      throw lastError;
    }

    return json.data as T;
  }

  throw lastError ?? new Error('Admin API error');
}
