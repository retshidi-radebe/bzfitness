import { NextRequest, NextResponse } from 'next/server'

// GET all members
export async function GET() {
  try {
    console.log('[MEMBERS API] Fetching members...')
    const { getFreshDb } = await import('@/lib/fresh-db')
    const db = getFreshDb()

    console.log('[MEMBERS API] DB created:', !!db)
    console.log('[MEMBERS API] DB.member:', typeof db.member)

    const members = await db.member.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: {
            attendances: true,
            payments: true,
          },
        },
      },
    })

    await db.$disconnect()
    return NextResponse.json(members)
  } catch (error) {
    console.error('Error fetching members:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST create new member
export async function POST(request: NextRequest) {
  try {
    const { getFreshDb } = await import('@/lib/fresh-db')
    const db = getFreshDb()

    const body = await request.json()
    const {
      name,
      phone,
      email,
      dateOfBirth,
      gender,
      address,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation,
      medicalConditions,
      injuries,
      packageType,
      status,
      nextPaymentDate,
      agreedToTerms,
    } = body

    // Validate required fields
    if (!name || !phone || !packageType) {
      await db.$disconnect()
      return NextResponse.json(
        { error: 'Name, phone, and package type are required' },
        { status: 400 }
      )
    }

    // Calculate next payment date based on package
    let calculatedNextPaymentDate = nextPaymentDate
    if (!calculatedNextPaymentDate) {
      const now = new Date()
      calculatedNextPaymentDate = new Date(now.setMonth(now.getMonth() + 1))
    }

    const member = await db.member.create({
      data: {
        name,
        phone,
        email: email || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender: gender || null,
        address: address || null,
        emergencyContactName: emergencyContactName || null,
        emergencyContactPhone: emergencyContactPhone || null,
        emergencyContactRelation: emergencyContactRelation || null,
        medicalConditions: medicalConditions || null,
        injuries: injuries || null,
        packageType,
        status: status || 'active',
        nextPaymentDate: calculatedNextPaymentDate ? new Date(calculatedNextPaymentDate) : null,
        agreedToTerms: agreedToTerms || false,
        agreedAt: agreedToTerms ? new Date() : null,
      },
    })

    await db.$disconnect()
    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    console.error('Error creating member:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
