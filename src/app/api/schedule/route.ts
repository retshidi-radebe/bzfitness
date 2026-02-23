import { NextResponse } from 'next/server'

// Public GET - only returns active schedules
export async function GET() {
  try {
    const { getFreshDb } = await import('@/lib/fresh-db')
    const db = getFreshDb()

    const schedules = await db.schedule.findMany({
      where: { isActive: true },
    })

    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const sortedSchedules = schedules.sort((a, b) => {
      const dayIndexA = dayOrder.indexOf(a.dayOfWeek)
      const dayIndexB = dayOrder.indexOf(b.dayOfWeek)
      if (dayIndexA !== dayIndexB) return dayIndexA - dayIndexB
      return a.timeSlot.localeCompare(b.timeSlot)
    })

    await db.$disconnect()
    return NextResponse.json(sortedSchedules)
  } catch (error) {
    console.error('Error fetching public schedule:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
