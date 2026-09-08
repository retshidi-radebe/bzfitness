import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { getFreshDb } = await import('@/lib/fresh-db')
    const db = getFreshDb()

    const submissions = await db.contactSubmission.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    await db.$disconnect()
    return NextResponse.json(submissions)
  } catch (error) {
    console.error('Error fetching submissions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
