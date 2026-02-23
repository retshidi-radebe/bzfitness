'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AdminLayout } from '@/components/admin-layout'
import {
  Users,
  Calendar,
  DollarSign,
  AlertCircle,
  TrendingUp,
  UserPlus,
  ClipboardCheck,
  CreditCard,
  MessageSquare,
  ArrowRight
} from 'lucide-react'
import { format } from 'date-fns'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line
} from 'recharts'

interface DashboardStats {
  totalMembers: number
  activeMembers: number
  inactiveMembers: number
  todayAttendance: number
  morningAttendance: number
  eveningAttendance: number
  totalPayments: number
  paidPayments: number
  pendingPayments: number
  overduePayments: number
  totalRevenue: number
  pendingContacts: number
}

interface RecentActivity {
  type: 'member' | 'attendance' | 'payment' | 'contact'
  title: string
  description: string
  time: string
}

interface WeeklyData {
  day: string
  date: string
  morning: number
  evening: number
  total: number
  revenue: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeMembers: 0,
    inactiveMembers: 0,
    todayAttendance: 0,
    morningAttendance: 0,
    eveningAttendance: 0,
    totalPayments: 0,
    paidPayments: 0,
    pendingPayments: 0,
    overduePayments: 0,
    totalRevenue: 0,
    pendingContacts: 0,
  })
  const [recentMembers, setRecentMembers] = useState<any[]>([])
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd')

      // Fetch all data in parallel
      const [membersRes, attendanceRes, paymentsRes, contactsRes, weeklyRes] = await Promise.all([
        fetch('/api/admin/members'),
        fetch(`/api/admin/attendance?date=${today}`),
        fetch('/api/admin/payments'),
        fetch('/api/admin/contact'),
        fetch('/api/admin/stats/weekly'),
      ])

      const members = membersRes.ok ? await membersRes.json() : []
      const attendance = attendanceRes.ok ? await attendanceRes.json() : []
      const payments = paymentsRes.ok ? await paymentsRes.json() : []
      const contacts = contactsRes.ok ? await contactsRes.json() : []
      const weekly = weeklyRes.ok ? await weeklyRes.json() : []

      setWeeklyData(weekly)

      // Calculate stats
      const activeMembers = members.filter((m: any) => m.status === 'active').length
      const morningAttendance = attendance.filter((a: any) => a.timeSlot === 'morning').length
      const eveningAttendance = attendance.filter((a: any) => a.timeSlot === 'evening').length
      const paidPayments = payments.filter((p: any) => p.status === 'paid')
      const pendingPayments = payments.filter((p: any) => p.status === 'pending').length
      const overduePayments = payments.filter((p: any) =>
        p.status === 'overdue' || (p.status === 'pending' && new Date(p.dueDate) < new Date())
      ).length
      const totalRevenue = paidPayments.reduce((sum: number, p: any) => sum + p.amount, 0)
      const pendingContacts = contacts.filter((c: any) => c.status === 'pending').length

      setStats({
        totalMembers: members.length,
        activeMembers,
        inactiveMembers: members.length - activeMembers,
        todayAttendance: attendance.length,
        morningAttendance,
        eveningAttendance,
        totalPayments: payments.length,
        paidPayments: paidPayments.length,
        pendingPayments,
        overduePayments,
        totalRevenue,
        pendingContacts,
      })

      // Get recent members (last 5)
      setRecentMembers(members.slice(0, 5))
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      router.push('/admin/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const quickActions = [
    { label: 'Add Member', icon: UserPlus, href: '/admin/members', color: 'bg-blue-500' },
    { label: 'Mark Attendance', icon: ClipboardCheck, href: '/admin/attendance', color: 'bg-green-500' },
    { label: 'Record Payment', icon: CreditCard, href: '/admin/payments', color: 'bg-orange-500' },
    { label: 'View Inquiries', icon: MessageSquare, href: '/admin/contact', color: 'bg-purple-500' },
  ]

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Dashboard">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Welcome back!</h2>
          <p className="text-muted-foreground mt-1">
            Here's what's happening at BZ Fitness today, {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>

        {/* Alert for overdue payments */}
        {stats.overduePayments > 0 && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900">Attention Required</h3>
                  <p className="text-red-700">
                    You have {stats.overduePayments} overdue payment{stats.overduePayments > 1 ? 's' : ''} that need attention.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-100"
                  onClick={() => router.push('/admin/payments')}
                >
                  View Payments
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pending contact inquiries alert */}
        {stats.pendingContacts > 0 && (
          <Card className="mb-6 border-purple-200 bg-purple-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-purple-900">New Inquiries</h3>
                  <p className="text-purple-700">
                    You have {stats.pendingContacts} pending contact submission{stats.pendingContacts > 1 ? 's' : ''} to review.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-purple-300 text-purple-700 hover:bg-purple-100"
                  onClick={() => router.push('/admin/contact')}
                >
                  View Inquiries
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action) => (
            <Card
              key={action.label}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(action.href)}
            >
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className={`h-12 w-12 rounded-full ${action.color} flex items-center justify-center mb-3`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="font-medium">{action.label}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Members Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Members
              </CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalMembers}</div>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  {stats.activeMembers} active
                </Badge>
                {stats.inactiveMembers > 0 && (
                  <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                    {stats.inactiveMembers} inactive
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Today's Attendance Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today's Attendance
              </CardTitle>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.todayAttendance}</div>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                  {stats.morningAttendance} morning
                </Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {stats.eveningAttendance} evening
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">R{stats.totalRevenue.toFixed(0)}</div>
              <p className="text-sm text-muted-foreground mt-2">
                From {stats.paidPayments} payment{stats.paidPayments !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          {/* Payments Status Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Payment Status
              </CardTitle>
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalPayments}</div>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                  {stats.pendingPayments} pending
                </Badge>
                {stats.overduePayments > 0 && (
                  <Badge variant="destructive">
                    {stats.overduePayments} overdue
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Attendance Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Attendance</CardTitle>
              <CardDescription>Morning and evening session attendance for the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {weeklyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis allowDecimals={false} className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--popover)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="morning" name="Morning (6:30 AM)" fill="#f97316" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="evening" name="Evening (5:00 PM)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  No attendance data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Revenue Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Daily revenue from payments over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {weeklyData.length > 0 && weeklyData.some(d => d.revenue > 0) ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis
                      allowDecimals={false}
                      className="text-xs"
                      tickFormatter={(value) => `R${value}`}
                    />
                    <Tooltip
                      formatter={(value: number) => [`R${value}`, 'Revenue']}
                      contentStyle={{
                        backgroundColor: 'var(--popover)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={{ fill: '#22c55e', strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  No revenue data available for this period
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Members */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Members</CardTitle>
              <CardDescription>Latest members who joined BZ Fitness</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push('/admin/members')}>
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {recentMembers.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No members yet. Add your first member to get started!
              </p>
            ) : (
              <div className="space-y-4">
                {recentMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.phone}</p>
                      </div>
                    </div>
                    <Badge className={member.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}>
                      {member.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
    </AdminLayout>
  )
}
