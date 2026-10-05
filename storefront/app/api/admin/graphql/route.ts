export async function POST(request: Request) {
  try {
    const body = await request.json()
    const cookieHeader = request.headers.get('cookie') || ''
    const token = cookieHeader
      .split('; ')
      .find(c => c.startsWith('vendure-auth-token='))
      ?.split('=')[1] || ''
    
    const response = await fetch(
      'https://red-hex-backend.onrender.com/admin-api',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'vendure-auth-token': token,
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      }
    )
    
    const data = await response.json()
    return Response.json(data)
    
  } catch (error) {
    return Response.json(
      { errors: [{ message: 'Proxy error' }] },
      { status: 500 }
    )
  }
}
