import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function PUT(
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

    const body = await request.json()
    const { goalDescription, targetWeight, targetDate, fitnessLevel, notes } = body

    const goal = await db.memberGoal.upsert({
      where: { memberId: id },
      update: {
        goalDescription: goalDescription || null,
        targetWeight: targetWeight ? parseFloat(targetWeight) : null,
        targetDate: targetDate ? new Date(targetDate) : null,
        fitnessLevel: fitnessLevel || null,
        notes: notes || null,
      },
      create: {
        memberId: id,
        goalDescription: goalDescription || null,
        targetWeight: targetWeight ? parseFloat(targetWeight) : null,
        targetDate: targetDate ? new Date(targetDate) : null,
        fitnessLevel: fitnessLevel || null,
        notes: notes || null,
      },
    })

    await db.$disconnect()
    return NextResponse.json(goal)
  } catch (error) {
    console.error('Error saving goal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
