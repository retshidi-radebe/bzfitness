import { NextRequest, NextResponse } from 'next/server'
import { getSession, hashPassword } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { getFreshDb } = await import('@/lib/fresh-db')
    const db = getFreshDb()
    const users = await db.adminUser.findMany({
      select: { id: true, username: true, role: true, name: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    })
    await db.$disconnect()
    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching admin users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { username, password, role, name } = body

    if (!username || !password || !role) {
      return NextResponse.json({ error: 'Username, password, and role are required' }, { status: 400 })
    }

    if (!['admin', 'superadmin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const passwordHash = await hashPassword(password)

    const { getFreshDb } = await import('@/lib/fresh-db')
    const db = getFreshDb()
    const user = await db.adminUser.create({
      data: { username, passwordHash, role, name: name || null },
      select: { id: true, username: true, role: true, name: true, createdAt: true },
    })
    await db.$disconnect()
    return NextResponse.json(user, { status: 201 })
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 })
    }
    console.error('Error creating admin user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
