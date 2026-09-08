import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { getFreshDb } = await import('@/lib/fresh-db')
    const db = getFreshDb()

    const { id } = await params
    const body = await request.json()
    const { status } = body

    const contact = await db.contactSubmission.update({
      where: { id },
      data: { status },
    })

    await db.$disconnect()
    return NextResponse.json(contact)
  } catch (error) {
    console.error('Error updating contact:', error)
    return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 })
  }
}
