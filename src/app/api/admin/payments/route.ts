import { NextRequest, NextResponse } from 'next/server'

// GET all payments
export async function GET(request: NextRequest) {
  try {
    const { getFreshDb } = await import('@/lib/fresh-db')
    const db = getFreshDb()

    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')
    const status = searchParams.get('status')

    const where: any = {}

    if (memberId) {
      where.memberId = memberId
    }

    if (status) {
      where.status = status
    }

    const payments = await db.payment.findMany({
      where,
      orderBy: {
        dueDate: 'desc',
      },
      include: {
        member: true,
      },
    })

    await db.$disconnect()
    return NextResponse.json(payments)
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST create payment record
export async function POST(request: NextRequest) {
  try {
    const { getFreshDb } = await import('@/lib/fresh-db')
    const db = getFreshDb()

    const body = await request.json()
    const { memberId, amount, package: packageType, dueDate, status } = body

    // Validate required fields
    if (!memberId || !amount || !packageType || !dueDate) {
      await db.$disconnect()
      return NextResponse.json(
        { error: 'Member ID, amount, package, and due date are required' },
        { status: 400 }
      )
    }

    const payment = await db.payment.create({
      data: {
        memberId,
        amount: parseFloat(amount),
        package: packageType,
        dueDate: new Date(dueDate),
        status: status || 'pending',
        paidDate: status === 'paid' ? new Date() : null,
      },
      include: {
        member: true,
      },
    })

    // Update member's next payment date if this payment is paid
    if (status === 'paid') {
      const nextPaymentDate = new Date(dueDate)
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1)

      await db.member.update({
        where: { id: memberId },
        data: { nextPaymentDate },
      })
    }

    await db.$disconnect()
    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
