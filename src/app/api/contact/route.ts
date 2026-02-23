import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { getFreshDb } = await import('@/lib/fresh-db')
    const db = getFreshDb()

    const body = await request.json()
    const { name, phone, email, package: pkg, message } = body

    // Validate required fields
    if (!name || !phone || !message || !pkg) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Save to database
    const submission = await db.contactSubmission.create({
      data: {
        name,
        phone,
        email: email || null,
        package: pkg,
        message,
        status: 'new',
      },
    })

    // Log the submission
    console.log('Contact form submission saved:', {
      id: submission.id,
      name,
      phone,
      email,
      package: pkg,
      timestamp: submission.createdAt.toISOString(),
    })

    // TODO: You can add additional functionality here:
    // 1. Send email notification to admin
    // 2. Send WhatsApp message using an API service
    // 3. Send confirmation SMS to the customer

    await db.$disconnect()
    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for your message! We will contact you soon.',
        submissionId: submission.id,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Contact API is working' },
    { status: 200 }
  )
}
