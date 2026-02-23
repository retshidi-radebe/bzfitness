import { NextResponse } from 'next/server'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'

export async function GET() {
  try {
    const { getFreshDb } = await import('@/lib/fresh-db')
    const db = getFreshDb()

    const today = new Date()
    const weekAgo = subDays(today, 6)

    // Get attendance for the last 7 days
    const attendances = await db.attendance.findMany({
      where: {
        date: {
          gte: startOfDay(weekAgo),
          lte: endOfDay(today),
        }
      },
      select: {
        date: true,
        timeSlot: true,
      }
    })

    // Get payments for the last 7 days
    const payments = await db.payment.findMany({
      where: {
        paidDate: {
          gte: startOfDay(weekAgo),
          lte: endOfDay(today),
        },
        status: 'paid',
      },
      select: {
        paidDate: true,
        amount: true,
      }
    })

    await db.$disconnect()

    // Aggregate by day
    const weeklyData = []
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i)
      const dateStr = format(date, 'yyyy-MM-dd')
      const dayLabel = format(date, 'EEE')

      const dayAttendances = attendances.filter(a =>
        format(new Date(a.date), 'yyyy-MM-dd') === dateStr
      )
      const morningCount = dayAttendances.filter(a => a.timeSlot === 'morning').length
      const eveningCount = dayAttendances.filter(a => a.timeSlot === 'evening').length

      const dayPayments = payments.filter(p =>
        p.paidDate && format(new Date(p.paidDate), 'yyyy-MM-dd') === dateStr
      )
      const revenue = dayPayments.reduce((sum, p) => sum + p.amount, 0)

      weeklyData.push({
        day: dayLabel,
        date: dateStr,
        morning: morningCount,
        evening: eveningCount,
        total: morningCount + eveningCount,
        revenue,
      })
    }

    return NextResponse.json(weeklyData)
  } catch (error) {
    console.error('Error fetching weekly stats:', error)
    return NextResponse.json({ error: 'Failed to fetch weekly stats' }, { status: 500 })
  }
}
