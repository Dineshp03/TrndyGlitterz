import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export default clerkMiddleware((auth, req) => {
  // If the secret key is missing, Vercel will crash. 
  // This bypasses the crash so the site can at least be visible.
  if (!process.env.CLERK_SECRET_KEY) {
    console.error('CRITICAL: CLERK_SECRET_KEY is missing in Vercel Environment Variables!');
    return NextResponse.next();
  }
  return NextResponse.next();
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
