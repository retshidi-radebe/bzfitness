import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; entryId: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { entryId } = await params
    const { getFreshDb } = await import('@/lib/fresh-db')
    const db = getFreshDb()

    await db.weightEntry.delete({ where: { id: entryId } })

    await db.$disconnect()
    return NextResponse.json({ message: 'Weight entry deleted' })
  } catch (error) {
    console.error('Error deleting weight entry:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
