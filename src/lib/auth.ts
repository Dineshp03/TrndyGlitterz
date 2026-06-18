import { verifyToken } from '@clerk/nextjs/server'

/**
 * Extracts and verifies a Clerk JWT from the Authorization header.
 * Returns the Clerk userId if valid, or null if missing / invalid.
 *
 * Usage in a Route Handler:
 *   const userId = await getAuthUserId(request)
 *   if (!userId) return unauthorizedResponse()
 */
export async function getAuthUserId(request: Request): Promise<string | null> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  const token = authHeader.slice(7)

  try {
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
      clockSkewInMs: 60000,
    })
    return payload.sub ?? null
  } catch (error) {
    console.error("getAuthUserId: Clerk token verification failed:", error);
    return null
  }
}

/**
 * Returns the full verified Clerk JWT payload (includes email, sub, etc.)
 * Returns null if the token is missing or invalid.
 */
export async function getAuthPayload(request: Request): Promise<Record<string, any> | null> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  const token = authHeader.slice(7)

  try {
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
      clockSkewInMs: 60000,
    })
    return payload as Record<string, any>
  } catch (error) {
    console.error("getAuthPayload: Clerk token verification failed:", error);
    return null
  }
}

/**
 * Standard 401 response — call this when getAuthUserId returns null.
 */
export function unauthorizedResponse(message = 'Unauthorized') {
  return new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * Standard 400 response for bad request / validation errors.
 */
export function badRequestResponse(message = 'Bad Request') {
  return new Response(JSON.stringify({ error: message }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * Standard 500 response for server errors.
 */
export function serverErrorResponse(message = 'Internal Server Error') {
  return new Response(JSON.stringify({ error: message }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * Standard success JSON response.
 */
export function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
