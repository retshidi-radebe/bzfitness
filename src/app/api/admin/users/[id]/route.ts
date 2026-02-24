import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    // Cannot delete env-superadmin (not in DB)
    if (id === 'env-superadmin') {
      return NextResponse.json({ error: 'Cannot delete this account' }, { status: 400 })
    }

    // Cannot delete self
    if (id === session.userId) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    const { getFreshDb } = await import('@/lib/fresh-db')
    const db = getFreshDb()
    await db.adminUser.delete({ where: { id } })
    await db.$disconnect()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting admin user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
