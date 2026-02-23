'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { AdminLayout } from '@/components/admin-layout'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Clock, User, CheckCircle, UserCheck, Search, Download, ChevronLeft, ChevronRight, ChevronsUpDown, Check } from 'lucide-react'
import { exportAttendance } from '@/lib/export-csv'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

const ITEMS_PER_PAGE = 10

interface Member {
  id: string
  name: string
  status?: string
}

interface Attendance {
  id: string
  memberId: string
  date: string
  timeSlot: string
  dayOfWeek: string
  member: Member
}

export default function AttendancePage() {
  const { toast } = useToast()
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [quickCheckInSession, setQuickCheckInSession] = useState<'morning' | 'evening'>('morning')
  const [memberSearch, setMemberSearch] = useState('')
  const [checkingIn, setCheckingIn] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    memberId: '',
    timeSlot: 'morning',
    dayOfWeek: 'Monday',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [memberComboOpen, setMemberComboOpen] = useState(false)

  useEffect(() => {
    fetchAttendances()
    fetchMembers()
  }, [selectedDate])

  const fetchAttendances = async () => {
    try {
      const res = await fetch(`/api/admin/attendance?date=${selectedDate}`)
      if (res.ok) {
        const data = await res.json()
        setAttendances(data)
      }
    } catch (error) {
      console.error('Error fetching attendances:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/admin/members')
      if (res.ok) {
        const data = await res.json()
        setMembers(data)
      }
    } catch (error) {
      console.error('Error fetching members:', error)
    }
  }

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          date: selectedDate,
        }),
      })

      if (res.ok) {
        toast({
          title: 'Success',
          description: 'Attendance marked successfully',
        })
        setIsMarkModalOpen(false)
        setFormData({
          memberId: '',
          timeSlot: 'morning',
          dayOfWeek: 'Monday',
        })
        fetchAttendances()
      } else {
        const error = await res.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to mark attendance',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error marking attendance:', error)
      toast({
        title: 'Error',
        description: 'Failed to mark attendance',
        variant: 'destructive',
      })
    }
  }

  // Quick Check-In function
  const handleQuickCheckIn = async (memberId: string, memberName: string) => {
    setCheckingIn(memberId)
    const dayOfWeek = format(new Date(selectedDate), 'EEEE')

    try {
      const res = await fetch('/api/admin/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId,
          date: selectedDate,
          timeSlot: quickCheckInSession,
          dayOfWeek,
        }),
      })

      if (res.ok) {
        toast({
          title: 'Checked In!',
          description: `${memberName} checked in for ${quickCheckInSession === 'morning' ? '6:30 AM' : '5:00 PM'} session`,
        })
        fetchAttendances()
      } else {
        const error = await res.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to check in',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error checking in:', error)
      toast({
        title: 'Error',
        description: 'Failed to check in',
        variant: 'destructive',
      })
    } finally {
      setCheckingIn(null)
    }
  }

  // Check if member is already checked in for selected session
  const isMemberCheckedIn = (memberId: string, session: string) => {
    return attendances.some(a => a.memberId === memberId && a.timeSlot === session)
  }

  // Filter members for quick check-in
  const filteredMembersForCheckIn = members
    .filter((m: any) => m.status === 'active' || !m.status)
    .filter(m =>
      memberSearch === '' ||
      m.name.toLowerCase().includes(memberSearch.toLowerCase())
    )

  const getTimeSlotLabel = (timeSlot: string) => {
    return timeSlot === 'morning' ? '6:30 AM' : '5:00 PM'
  }

  const getTimeSlotColor = (timeSlot: string) => {
    return timeSlot === 'morning' ? 'bg-orange-500' : 'bg-blue-500'
  }

  const todayStats = {
    morning: attendances.filter(a => a.timeSlot === 'morning').length,
    evening: attendances.filter(a => a.timeSlot === 'evening').length,
    total: attendances.length,
  }

  // Pagination logic
  const totalPages = Math.ceil(attendances.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedAttendances = attendances.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  // Reset to page 1 when date changes
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedDate])

  return (
    <AdminLayout title="Attendance">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Attendance Tracking</h2>
          <p className="text-muted-foreground mt-1">
            Track member attendance for all sessions
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto dark:text-gray-200 dark:border-gray-600"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => exportAttendance(attendances)}
            disabled={attendances.length === 0}
            className="flex items-center gap-2 dark:text-gray-200 dark:border-gray-600"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Dialog open={isMarkModalOpen} onOpenChange={setIsMarkModalOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Mark Attendance
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Mark Attendance</DialogTitle>
                <DialogDescription>
                  Record attendance for {selectedDate ? format(new Date(selectedDate + 'T00:00:00'), 'PPP') : 'today'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleMarkAttendance}>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="member">Select Member *</Label>
                    <Popover open={memberComboOpen} onOpenChange={setMemberComboOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={memberComboOpen}
                          className="w-full justify-between font-normal"
                        >
                          {formData.memberId
                            ? members.find((m) => m.id === formData.memberId)?.name
                            : "Search for a member..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Type a name to search..." />
                          <CommandList>
                            <CommandEmpty>No member found.</CommandEmpty>
                            <CommandGroup>
                              {members.map((member) => (
                                <CommandItem
                                  key={member.id}
                                  value={member.name}
                                  onSelect={() => {
                                    setFormData({ ...formData, memberId: member.id })
                                    setMemberComboOpen(false)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      formData.memberId === member.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {member.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label htmlFor="dayOfWeek">Day of Week *</Label>
                    <Select
                      value={formData.dayOfWeek}
                      onValueChange={(value) => setFormData({ ...formData, dayOfWeek: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Monday">Monday</SelectItem>
                        <SelectItem value="Tuesday">Tuesday</SelectItem>
                        <SelectItem value="Wednesday">Wednesday</SelectItem>
                        <SelectItem value="Thursday">Thursday</SelectItem>
                        <SelectItem value="Friday">Friday</SelectItem>
                        <SelectItem value="Saturday">Saturday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="timeSlot">Time Slot *</Label>
                    <Select
                      value={formData.timeSlot}
                      onValueChange={(value) => setFormData({ ...formData, timeSlot: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning (6:30 AM)</SelectItem>
                        <SelectItem value="evening">Evening (5:00 PM)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Mark Attendance</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Morning Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{todayStats.morning}</div>
            <p className="text-sm text-muted-foreground mt-1">6:30 AM</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Evening Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{todayStats.evening}</div>
            <p className="text-sm text-muted-foreground mt-1">5:00 PM</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{todayStats.total}</div>
            <p className="text-sm text-muted-foreground mt-1">{format(new Date(selectedDate), 'PPP')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Check-In Section */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Quick Check-In
              </CardTitle>
              <CardDescription>
                One-click check-in for {format(new Date(selectedDate), 'PPP')}
              </CardDescription>
            </div>
            <Tabs value={quickCheckInSession} onValueChange={(v) => setQuickCheckInSession(v as 'morning' | 'evening')}>
              <TabsList>
                <TabsTrigger value="morning" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  6:30 AM
                </TabsTrigger>
                <TabsTrigger value="evening" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  5:00 PM
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              className="pl-10 dark:text-gray-200 dark:border-gray-600 dark:placeholder:text-gray-400"
            />
          </div>

          {/* Members Grid */}
          {members.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No members available</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredMembersForCheckIn.map((member) => {
                const isCheckedIn = isMemberCheckedIn(member.id, quickCheckInSession)
                const isLoading = checkingIn === member.id

                return (
                  <Button
                    key={member.id}
                    variant={isCheckedIn ? 'secondary' : 'outline'}
                    className={`h-auto py-3 px-4 flex flex-col items-center gap-1 ${
                      isCheckedIn ? 'bg-green-100 text-green-700 border-green-300' : ''
                    }`}
                    disabled={isCheckedIn || isLoading}
                    onClick={() => handleQuickCheckIn(member.id, member.name)}
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" />
                    ) : isCheckedIn ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                    <span className="text-xs font-medium truncate w-full text-center">
                      {member.name.split(' ')[0]}
                    </span>
                  </Button>
                )
              })}
            </div>
          )}

          {filteredMembersForCheckIn.length === 0 && members.length > 0 && (
            <p className="text-muted-foreground text-center py-4">No members match your search</p>
          )}
        </CardContent>
      </Card>

      {/* Attendance Records */}
      <h3 className="text-xl font-semibold mb-4">Today's Attendance Records</h3>

      {loading ? (
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
        </Card>
      ) : attendances.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Attendance Records</CardTitle>
            <CardDescription>
              No attendance has been recorded for {format(new Date(selectedDate), 'PPP')}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Day</TableHead>
                    <TableHead>Session</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAttendances.map((attendance) => (
                    <TableRow key={attendance.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-green-600" />
                          </div>
                          {attendance.member.name}
                        </div>
                      </TableCell>
                      <TableCell>{attendance.dayOfWeek}</TableCell>
                      <TableCell>
                        <Badge className={getTimeSlotColor(attendance.timeSlot)}>
                          {attendance.timeSlot === 'morning' ? 'Morning' : 'Evening'}
                        </Badge>
                      </TableCell>
                      <TableCell>{getTimeSlotLabel(attendance.timeSlot)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, attendances.length)} of {attendances.length} records
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  )
}
