import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export default function middleware(req: NextRequest) {
  if (!process.env.CLERK_SECRET_KEY) {
    return NextResponse.next()
  }
  return clerkMiddleware()(req, null as any)
}
export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
