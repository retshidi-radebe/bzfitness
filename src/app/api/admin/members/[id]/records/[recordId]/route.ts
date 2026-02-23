import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; recordId: string }> }
) {
  try {
    const { recordId } = await params
    const { getFreshDb } = await import('@/lib/fresh-db')
    const db = getFreshDb()

    await db.personalRecord.delete({ where: { id: recordId } })

    await db.$disconnect()
    return NextResponse.json({ message: 'Personal record deleted' })
  } catch (error) {
    console.error('Error deleting personal record:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
