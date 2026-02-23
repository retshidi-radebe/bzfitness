import { NextResponse } from 'next/server'

export async function GET() {
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
