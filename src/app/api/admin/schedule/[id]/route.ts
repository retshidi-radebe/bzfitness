import { NextRequest, NextResponse } from 'next/server'

// PUT update schedule
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { getFreshDb } = await import('@/lib/fresh-db')
    const db = getFreshDb()

    const body = await request.json()
    const { dayOfWeek, timeSlot, activity, isActive } = body

    const schedule = await db.schedule.update({
      where: { id },
      data: {
        dayOfWeek,
        timeSlot,
        activity,
        isActive,
      },
    })

    await db.$disconnect()
    return NextResponse.json(schedule)
  } catch (error) {
    console.error('Error updating schedule:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE schedule
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { getFreshDb } = await import('@/lib/fresh-db')
    const db = getFreshDb()

    await db.schedule.delete({
      where: { id },
    })

    await db.$disconnect()
    return NextResponse.json(
      { message: 'Schedule deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting schedule:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
