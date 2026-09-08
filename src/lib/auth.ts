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
// This default is committed to the repo, so anyone who can read the source can
// mint a valid superadmin cookie with it. It is only tolerable for local dev.
const INSECURE_DEFAULT_SECRET = 'bz-fitness-secret-key-change-in-production'
const SESSION_SECRET = process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET || INSECURE_DEFAULT_SECRET

if (process.env.NODE_ENV === 'production' && SESSION_SECRET === INSECURE_DEFAULT_SECRET) {
  throw new Error(
    'SESSION_SECRET or NEXTAUTH_SECRET must be set in production. Refusing to sign ' +
    'sessions with the public default key, which would let anyone forge a superadmin session.'
  )
}
const SESSION_MAX_AGE_MS = 60 * 60 * 24 * 1000 // 24 hours, matches the cookie maxAge

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

  // Constant-time compare so a forged signature cannot be probed byte by byte
  const sigBuf = Buffer.from(signature, 'utf-8')
  const expectedBuf = Buffer.from(expectedSig, 'utf-8')
  if (sigBuf.length !== expectedBuf.length) return null
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null

  try {
    const sessionData = JSON.parse(Buffer.from(payload, 'base64').toString('utf-8')) as AdminSession

    // The cookie maxAge only stops a well-behaved browser from sending the token.
    // A captured token stays valid forever unless we check loginTime server-side.
    if (!sessionData.isLoggedIn) return null
    if (typeof sessionData.loginTime !== 'number') return null
    if (Date.now() - sessionData.loginTime > SESSION_MAX_AGE_MS) return null

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
