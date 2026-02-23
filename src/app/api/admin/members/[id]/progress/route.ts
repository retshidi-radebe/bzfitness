import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { getFreshDb } = await import('@/lib/fresh-db')
    const db = getFreshDb()

    const member = await db.member.findUnique({
      where: { id },
      select: { id: true, name: true, packageType: true, joinDate: true, status: true },
    })

    if (!member) {
      await db.$disconnect()
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    const [goal, weightEntries, personalRecords] = await Promise.all([
      db.memberGoal.findUnique({ where: { memberId: id } }),
      db.weightEntry.findMany({
        where: { memberId: id },
        orderBy: { date: 'desc' },
      }),
      db.personalRecord.findMany({
        where: { memberId: id },
        orderBy: { date: 'desc' },
      }),
    ])

    await db.$disconnect()
    return NextResponse.json({ member, goal, weightEntries, personalRecords })
  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
