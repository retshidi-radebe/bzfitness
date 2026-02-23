import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

// Simple auth check for middleware (doesn't use crypto)
async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('admin_session')
  return sessionToken !== undefined && sessionToken.value !== ''
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow access to login page
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  // Check if it's an admin route
  if (pathname.startsWith('/admin')) {
    const isLoggedIn = await isAuthenticated()

    if (!isLoggedIn) {
      // Redirect to login page
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
