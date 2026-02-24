import { cookies } from 'next/headers'
import crypto from 'crypto'

export async function hashPassword(password: string): Promise<string> {
  return crypto.createHash('sha256').update(password).digest('hex')
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

const SESSION_COOKIE_NAME = 'admin_session'
const SESSION_SECRET = process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET || 'bz-fitness-secret-key-change-in-production'

export interface AdminSession {
  isLoggedIn: boolean
  loginTime: number
  userId: string
  role: 'admin' | 'superadmin'
  username: string
}

export async function createSession(data: {
  userId: string
  role: 'admin' | 'superadmin'
  username: string
}): Promise<string> {
  const sessionData: AdminSession = {
    isLoggedIn: true,
    loginTime: Date.now(),
    userId: data.userId,
    role: data.role,
    username: data.username,
  }

  const payload = Buffer.from(JSON.stringify(sessionData)).toString('base64')
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('hex')

  const token = `${payload}.${signature}`

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  })

  return token
}

export async function getSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(SESSION_COOKIE_NAME)

  if (!cookie?.value) return null

  const parts = cookie.value.split('.')
  if (parts.length !== 2) return null

  const [payload, signature] = parts

  // Verify HMAC
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('hex')

  if (signature !== expectedSig) return null

  try {
    const sessionData = JSON.parse(Buffer.from(payload, 'base64').toString('utf-8')) as AdminSession
    return sessionData
  } catch {
    return null
  }
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession()
  return session !== null && session.isLoggedIn
}
