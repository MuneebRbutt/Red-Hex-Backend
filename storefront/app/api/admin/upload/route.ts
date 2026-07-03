import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_API_URL, ADMIN_SESSION_COOKIE, ADMIN_TOKEN_COOKIE } from '@/lib/admin/constants';

const CREATE_ASSET_MUTATION = `
mutation CreateAsset($file: Upload!) {
  createAssets(input: [{ file: $file }]) {
    __typename
    ... on Asset {
      id
      preview
    }
    ... on ErrorResult {
      errorCode
      message
    }
  }
}
`;

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
  }

  const token = req.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
  const session = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  const operations = JSON.stringify({
    query: CREATE_ASSET_MUTATION,
    variables: { file: null },
  });
  const map = JSON.stringify({ '0': ['variables.file'] });

  const upstreamForm = new FormData();
  upstreamForm.append('operations', operations);
  upstreamForm.append('map', map);
  upstreamForm.append('0', file);

  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (session) headers.Cookie = session;

  const upstream = await fetch(ADMIN_API_URL, {
    method: 'POST',
    headers,
    body: upstreamForm,
    cache: 'no-store',
  });

  const json = await upstream.json();
  const result = json?.data?.createAssets?.[0];
  if (!result || result.__typename !== 'Asset') {
    const message = result?.message ?? 'Asset upload failed';
    return NextResponse.json({ message }, { status: 400 });
  }

  return NextResponse.json({ id: result.id, preview: result.preview });
}
