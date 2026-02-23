import { NextRequest, NextResponse } from 'next/server'

// GET all schedule items
export async function GET() {
  try {
    const { getFreshDb } = await import('@/lib/fresh-db')
    const db = getFreshDb()

    const schedules = await db.schedule.findMany({
      orderBy: [
        { dayOfWeek: 'asc' },
        { timeSlot: 'asc' },
      ],
    })

    // Order by day of week
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const sortedSchedules = schedules.sort((a, b) => {
      const dayIndexA = dayOrder.indexOf(a.dayOfWeek)
      const dayIndexB = dayOrder.indexOf(b.dayOfWeek)
      if (dayIndexA !== dayIndexB) {
        return dayIndexA - dayIndexB
      }
      // If same day, sort by time slot
      return a.timeSlot.localeCompare(b.timeSlot)
    })

    await db.$disconnect()
    return NextResponse.json(sortedSchedules)
  } catch (error) {
    console.error('Error fetching schedules:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST create schedule item
export async function POST(request: NextRequest) {
  try {
    const { getFreshDb } = await import('@/lib/fresh-db')
    const db = getFreshDb()

    const body = await request.json()
    const { dayOfWeek, timeSlot, activity, isActive } = body

    // Validate required fields
    if (!dayOfWeek || !timeSlot || !activity) {
      await db.$disconnect()
      return NextResponse.json(
        { error: 'Day of week, time slot, and activity are required' },
        { status: 400 }
      )
    }

    const schedule = await db.schedule.create({
      data: {
        dayOfWeek,
        timeSlot,
        activity,
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    await db.$disconnect()
    return NextResponse.json(schedule, { status: 201 })
  } catch (error) {
    console.error('Error creating schedule:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
