import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

// DELETE attendance record - used to undo a check-in that was ticked by mistake
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const { getFreshDb } = await import('@/lib/fresh-db')
    const db = getFreshDb()

    const attendance = await db.attendance.findUnique({
      where: { id },
    })

    if (!attendance) {
      await db.$disconnect()
      return NextResponse.json(
        { error: 'Attendance record not found' },
        { status: 404 }
      )
    }

    await db.attendance.delete({
      where: { id },
    })

    await db.$disconnect()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting attendance:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
