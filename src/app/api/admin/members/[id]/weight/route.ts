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
    const { weight, bodyFat, date, notes } = body

    if (!weight) {
      await db.$disconnect()
      return NextResponse.json({ error: 'Weight is required' }, { status: 400 })
    }

    const entry = await db.weightEntry.create({
      data: {
        memberId: id,
        weight: parseFloat(weight),
        bodyFat: bodyFat ? parseFloat(bodyFat) : null,
        date: date ? new Date(date) : new Date(),
        notes: notes || null,
      },
    })

    await db.$disconnect()
    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error('Error adding weight entry:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
