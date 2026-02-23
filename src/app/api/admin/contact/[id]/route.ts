import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
