import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { getFreshDb } = await import('@/lib/fresh-db')
    const db = getFreshDb()

    const body = await request.json()
    const { exercise, value, date, notes } = body

    if (!exercise || !value) {
      await db.$disconnect()
      return NextResponse.json({ error: 'Exercise and value are required' }, { status: 400 })
    }

    const record = await db.personalRecord.create({
      data: {
        memberId: id,
        exercise,
        value,
        date: date ? new Date(date) : new Date(),
        notes: notes || null,
      },
    })

    await db.$disconnect()
    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    console.error('Error adding personal record:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
