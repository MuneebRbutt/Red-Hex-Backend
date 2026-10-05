
export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()
    
    const vendureRes = await fetch(
      'https://red-hex-backend.onrender.com/admin-api',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation Login($username: String!, $password: String!) {
              login(username: $username, password: $password) {
                ... on CurrentUser {
                  id
                  identifier
                }
                ... on InvalidCredentialsError {
                  message
                }
              }
            }
          `,
          variables: { username, password }
        })
      }
    )
    
    const data = await vendureRes.json()
    const token = vendureRes.headers.get('vendure-auth-token')
    
    const res = Response.json({ 
      success: !!token,
      data: data.data,
      errors: data.errors 
    })
    
    if (token) {
      res.headers.set(
        'Set-Cookie',
        `vendure-auth-token=${token}; Path=/; Max-Age=86400; SameSite=Lax`
      )
    }
    
    return res
    
  } catch (error) {
    return Response.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    )
  }
}
