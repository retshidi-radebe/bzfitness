import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const apiKey = process.env['GEMINI_API_KEY']

    if (!apiKey || apiKey === 'your_key_here') {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 })
    }

    const { getFreshDb } = await import('@/lib/fresh-db')
    const db = getFreshDb()

    const [member, goal, weightEntries, personalRecords] = await Promise.all([
      db.member.findUnique({
        where: { id },
        select: {
          name: true,
          gender: true,
          dateOfBirth: true,
          packageType: true,
          medicalConditions: true,
          injuries: true,
        },
      }),
      db.memberGoal.findUnique({ where: { memberId: id } }),
      db.weightEntry.findMany({
        where: { memberId: id },
        orderBy: { date: 'desc' },
        take: 1,
      }),
      db.personalRecord.findMany({
        where: { memberId: id },
        orderBy: { date: 'desc' },
      }),
    ])

    await db.$disconnect()

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Calculate age
    let age: number | null = null
    if (member.dateOfBirth) {
      const today = new Date()
      const dob = new Date(member.dateOfBirth)
      age = today.getFullYear() - dob.getFullYear()
      const m = today.getMonth() - dob.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--
    }

    // Package → sessions per week
    const packageSessions: Record<string, string> = {
      'package-1': '1 session per week (R50)',
      'package-2': '2 sessions per week (R85)',
      'package-3': '3 sessions per week (R125)',
    }

    const currentWeight = weightEntries[0]?.weight ?? null
    const prs = personalRecords.map(r => `${r.exercise}: ${r.value}`).join(', ')

    const prompt = `You are an experienced fitness trainer at BZ Fitness and Wellness gym. Generate a personalized weekly workout plan for the following gym member.

MEMBER PROFILE:
- Name: ${member.name}
- Gender: ${member.gender || 'Not specified'}
- Age: ${age ? `${age} years old` : 'Not specified'}
- Gym Package: ${packageSessions[member.packageType] || member.packageType}
- Fitness Level: ${goal?.fitnessLevel || 'Not specified'}
- Goal: ${goal?.goalDescription || 'General fitness'}
- Current Weight: ${currentWeight ? `${currentWeight} kg` : 'Not recorded'}
- Target Weight: ${goal?.targetWeight ? `${goal.targetWeight} kg` : 'Not set'}
- Medical Conditions: ${member.medicalConditions || 'None reported'}
- Injuries / Limitations: ${member.injuries || 'None reported'}
- Personal Records: ${prs || 'None recorded yet'}
${goal?.targetDate ? `- Target Date: ${new Date(goal.targetDate).toLocaleDateString('en-ZA')}` : ''}

INSTRUCTIONS:
- Create a weekly plan that fits their number of training sessions
- Account for any medical conditions or injuries — modify or exclude exercises accordingly
- Match the intensity to their fitness level
- Focus on their stated goal
- Use exercises suitable for a small group fitness gym (no specialized equipment assumptions)
- Format the plan clearly: Day → Warm-up → Main workout (exercise, sets × reps/duration) → Cool-down
- Add a brief note at the end with 1-2 practical tips for this member specifically

Keep the plan concise and actionable.`

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const result = await model.generateContent(prompt)
    const plan = result.response.text()

    return NextResponse.json({ plan })
  } catch (error) {
    console.error('Workout plan generation error:', error)
    return NextResponse.json({ error: 'Failed to generate workout plan' }, { status: 500 })
  }
}
