import { NextRequest, NextResponse } from 'next/server'

// PUT update payment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { getFreshDb } = await import('@/lib/fresh-db')
    const db = getFreshDb()

    const body = await request.json()
    const { status } = body

    const payment = await db.payment.findUnique({
      where: { id },
    })

    if (!payment) {
      await db.$disconnect()
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    const updatedPayment = await db.payment.update({
      where: { id },
      data: {
        status,
        paidDate: status === 'paid' ? new Date() : null,
      },
      include: {
        member: true,
      },
    })

    // Update member's next payment date if this payment is marked as paid
    if (status === 'paid' && payment.memberId) {
      const nextPaymentDate = new Date(payment.dueDate)
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1)

      await db.member.update({
        where: { id: payment.memberId },
        data: { nextPaymentDate },
      })
    }

    await db.$disconnect()
    return NextResponse.json(updatedPayment)
  } catch (error) {
    console.error('Error updating payment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE payment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { getFreshDb } = await import('@/lib/fresh-db')
    const db = getFreshDb()

    await db.payment.delete({
      where: { id },
    })

    await db.$disconnect()
    return NextResponse.json(
      { message: 'Payment deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting payment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
