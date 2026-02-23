import { NextRequest, NextResponse } from 'next/server'

// GET all attendance records
export async function GET(request: NextRequest) {
  try {
    const { getFreshDb } = await import('@/lib/fresh-db')
    const db = getFreshDb()

    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')
    const date = searchParams.get('date')

    const where: any = {}

    if (memberId) {
      where.memberId = memberId
    }

    if (date) {
      const startDate = new Date(date)
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 1)

      where.date = {
        gte: startDate,
        lt: endDate,
      }
    }

    const attendances = await db.attendance.findMany({
      where,
      orderBy: {
        date: 'desc',
      },
      include: {
        member: true,
      },
    })

    await db.$disconnect()
    return NextResponse.json(attendances)
  } catch (error) {
    console.error('Error fetching attendances:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST create attendance record
export async function POST(request: NextRequest) {
  try {
    const { getFreshDb } = await import('@/lib/fresh-db')
    const db = getFreshDb()

    const body = await request.json()
    const { memberId, timeSlot, dayOfWeek, date } = body

    // Validate required fields
    if (!memberId || !timeSlot || !dayOfWeek) {
      await db.$disconnect()
      return NextResponse.json(
        { error: 'Member ID, time slot, and day of week are required' },
        { status: 400 }
      )
    }

    // Check if attendance already exists for this member on this date and time slot
    const attendanceDate = date ? new Date(date) : new Date()
    const startOfDay = new Date(attendanceDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(attendanceDate)
    endOfDay.setHours(23, 59, 59, 999)

    const existingAttendance = await db.attendance.findFirst({
      where: {
        memberId,
        timeSlot,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    })

    if (existingAttendance) {
      await db.$disconnect()
      return NextResponse.json(
        { error: 'Attendance already recorded for this session' },
        { status: 400 }
      )
    }

    const attendance = await db.attendance.create({
      data: {
        memberId,
        timeSlot,
        dayOfWeek,
        date: date ? new Date(date) : new Date(),
      },
      include: {
        member: true,
      },
    })

    await db.$disconnect()
    return NextResponse.json(attendance, { status: 201 })
  } catch (error) {
    console.error('Error creating attendance:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
