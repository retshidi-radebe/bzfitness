import { NextRequest, NextResponse } from 'next/server'
import { verifyPassword, createSession, hashPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
    }

    const { getFreshDb } = await import('@/lib/fresh-db')
    const db = getFreshDb()

    // 1. Check AdminUser table first
    const dbUser = await db.adminUser.findUnique({ where: { username } })
    await db.$disconnect()

    if (dbUser) {
      const isValid = await verifyPassword(password, dbUser.passwordHash)
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      }
      await createSession({
        userId: dbUser.id,
        role: dbUser.role as 'admin' | 'superadmin',
        username: dbUser.username,
      })
      return NextResponse.json({ success: true, message: 'Login successful' })
    }

    // 2. Fallback: env var superadmin
    const adminUsername = process.env.ADMIN_USERNAME || 'admin'
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH || ''

    if (username !== adminUsername) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const isValidPassword = await verifyPassword(password, adminPasswordHash)
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    await createSession({
      userId: 'env-superadmin',
      role: 'superadmin',
      username: adminUsername,
    })

    return NextResponse.json({ success: true, message: 'Login successful' })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
