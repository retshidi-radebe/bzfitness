import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SESSION_COOKIE_NAME = 'admin_session'

// Fast path only: this checks that a session cookie is present, not that it is
// valid. Signature and expiry verification needs node crypto, which the edge
// middleware runtime does not give us, so it happens in getSession() inside
// each page and route handler. Treat this as a cheap early reject, never as
// the authorisation check.
function hasSessionCookie(request: NextRequest): boolean {
  const cookie = request.cookies.get(SESSION_COOKIE_NAME)
  return cookie !== undefined && cookie.value !== ''
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // These have to stay reachable without a session
  if (
    pathname === '/admin/login' ||
    pathname === '/api/admin/login' ||
    pathname === '/api/admin/logout'
  ) {
    return NextResponse.next()
  }

  // Admin API: reject with JSON, since redirecting an API caller to an HTML
  // login page just produces a confusing parse error on the client
  if (pathname.startsWith('/api/admin')) {
    if (!hasSessionCookie(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.next()
  }

  // Admin pages: redirect to login
  if (pathname.startsWith('/admin')) {
    if (!hasSessionCookie(request)) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
