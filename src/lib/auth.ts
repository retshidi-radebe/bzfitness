import { cookies } from 'next/headers'
import crypto from 'crypto'

// Simple password hash function (for demo - use bcrypt in production)
export async function hashPassword(password: string): Promise<string> {
  return crypto.createHash('sha256').update(password).digest('hex')
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

// Session management
const SESSION_COOKIE_NAME = 'admin_session'
const SESSION_SECRET = process.env.SESSION_SECRET || 'bz-fitness-secret-key-change-in-production'

export interface AdminSession {
  isLoggedIn: boolean
  loginTime: number
}

export async function createSession(): Promise<string> {
  const sessionData: AdminSession = {
    isLoggedIn: true,
    loginTime: Date.now(),
  }
  
  const sessionToken = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(JSON.stringify(sessionData))
    .digest('hex')
  
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  })
  
  return sessionToken
}

export async function getSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)
  
  if (!sessionToken) {
    return null
  }
  
  // In production, verify session token against database
  // For now, just check if it exists
  return {
    isLoggedIn: true,
    loginTime: Date.now(), // Would parse from token in production
  }
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession()
  return session !== null
}
