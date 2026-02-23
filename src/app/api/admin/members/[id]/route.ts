import { NextRequest, NextResponse } from 'next/server'

// GET single member
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
      include: {
        attendances: {
          orderBy: { date: 'desc' },
          take: 10,
        },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!member) {
      await db.$disconnect()
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    await db.$disconnect()
    return NextResponse.json(member)
  } catch (error) {
    console.error('Error fetching member:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT update member
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Get current member to check if agreedToTerms changed
    const existingMember = await db.member.findUnique({
      where: { id },
      select: { agreedToTerms: true, agreedAt: true },
    })

    const member = await db.member.update({
      where: { id },
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
        status,
        nextPaymentDate: nextPaymentDate ? new Date(nextPaymentDate) : null,
        agreedToTerms: agreedToTerms || false,
        // Only update agreedAt if they're newly agreeing
        agreedAt: agreedToTerms && !existingMember?.agreedToTerms ? new Date() : existingMember?.agreedAt,
      },
    })

    await db.$disconnect()
    return NextResponse.json(member)
  } catch (error) {
    console.error('Error updating member:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { getFreshDb } = await import('@/lib/fresh-db')
    const db = getFreshDb()

    await db.member.delete({
      where: { id },
    })

    await db.$disconnect()
    return NextResponse.json(
      { message: 'Member deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting member:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
