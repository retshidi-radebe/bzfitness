'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { AdminLayout } from '@/components/admin-layout'
import { Calendar, Plus, Edit, Trash2 } from 'lucide-react'

interface Schedule {
  id: string
  dayOfWeek: string
  timeSlot: string
  activity: string
  isActive: boolean
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function SchedulePage() {
  const { toast } = useToast()
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
  const [formData, setFormData] = useState({
    dayOfWeek: 'Monday',
    timeSlot: '6:30 AM',
    activity: '',
    isActive: true,
  })

  useEffect(() => {
    fetchSchedules()
  }, [])

  const fetchSchedules = async () => {
    try {
      const res = await fetch('/api/admin/schedule')
      if (res.ok) {
        const data = await res.json()
        setSchedules(data)
      }
    } catch (error) {
      console.error('Error fetching schedules:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast({
          title: 'Success',
          description: 'Schedule added successfully',
        })
        setIsAddModalOpen(false)
        setFormData({
          dayOfWeek: 'Monday',
          timeSlot: '6:30 AM',
          activity: '',
          isActive: true,
        })
        fetchSchedules()
      } else {
        const error = await res.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to add schedule',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error adding schedule:', error)
      toast({
        title: 'Error',
        description: 'Failed to add schedule',
        variant: 'destructive',
      })
    }
  }

  const handleEditSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSchedule) return

    try {
      const res = await fetch(`/api/admin/schedule/${editingSchedule.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast({
          title: 'Success',
          description: 'Schedule updated successfully',
        })
        setIsEditModalOpen(false)
        setEditingSchedule(null)
        setFormData({
          dayOfWeek: 'Monday',
          timeSlot: '6:30 AM',
          activity: '',
          isActive: true,
        })
        fetchSchedules()
      } else {
        const error = await res.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to update schedule',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error updating schedule:', error)
      toast({
        title: 'Error',
        description: 'Failed to update schedule',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return

    try {
      const res = await fetch(`/api/admin/schedule/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast({
          title: 'Success',
          description: 'Schedule deleted successfully',
        })
        fetchSchedules()
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete schedule',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error deleting schedule:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete schedule',
        variant: 'destructive',
      })
    }
  }

  const handleToggleActive = async (schedule: Schedule) => {
    try {
      const res = await fetch(`/api/admin/schedule/${schedule.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayOfWeek: schedule.dayOfWeek,
          timeSlot: schedule.timeSlot,
          activity: schedule.activity,
          isActive: !schedule.isActive,
        }),
      })

      if (res.ok) {
        toast({
          title: 'Success',
          description: `Schedule ${schedule.isActive ? 'disabled' : 'enabled'} successfully`,
        })
        fetchSchedules()
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update schedule',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error updating schedule:', error)
      toast({
        title: 'Error',
        description: 'Failed to update schedule',
        variant: 'destructive',
      })
    }
  }

  const openEditModal = (schedule: Schedule) => {
    setEditingSchedule(schedule)
    setFormData({
      dayOfWeek: schedule.dayOfWeek,
      timeSlot: schedule.timeSlot,
      activity: schedule.activity,
      isActive: schedule.isActive,
    })
    setIsEditModalOpen(true)
  }

  const getTimeSlotColor = (timeSlot: string) => {
    return timeSlot === '6:30 AM' ? 'bg-orange-500' : 'bg-blue-500'
  }

  // Group schedules by day
  const groupedSchedules = DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day] = schedules.filter(s => s.dayOfWeek === day)
    return acc
  }, {} as Record<string, Schedule[]>)

  return (
    <AdminLayout title="Schedule">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Schedule Management</h2>
          <p className="text-muted-foreground mt-1">
            Manage your weekly class schedule
          </p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Schedule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Schedule</DialogTitle>
              <DialogDescription>
                Add a new class to the weekly schedule
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddSchedule}>
              <div className="space-y-4 py-4">
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
                      {DAYS_OF_WEEK.map(day => (
                        <SelectItem key={day} value={day}>{day}</SelectItem>
                      ))}
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
                      <SelectItem value="6:30 AM">6:30 AM (Morning)</SelectItem>
                      <SelectItem value="5:00 PM">5:00 PM (Evening)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="activity">Activity *</Label>
                  <Input
                    id="activity"
                    value={formData.activity}
                    onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                    placeholder="e.g., Leg Day, Upper Body, Recovery"
                    required
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Add Schedule</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
        </Card>
      ) : schedules.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Schedule Yet</CardTitle>
            <CardDescription>
              Add your first schedule item to get started
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {DAYS_OF_WEEK.map(day => (
            <Card key={day} className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  {day}
                </CardTitle>
                <CardDescription>
                  {groupedSchedules[day]?.length || 0} session{groupedSchedules[day]?.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {groupedSchedules[day]?.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No sessions scheduled</p>
                ) : (
                  groupedSchedules[day]?.map((schedule) => (
                    <div
                      key={schedule.id}
                      className={`p-4 rounded-lg border ${!schedule.isActive ? 'opacity-50 bg-gray-50' : 'bg-white'}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <Badge className={getTimeSlotColor(schedule.timeSlot)}>
                          {schedule.timeSlot}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={schedule.isActive}
                            onCheckedChange={() => handleToggleActive(schedule)}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditModal(schedule)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteSchedule(schedule.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <h4 className="font-semibold">{schedule.activity}</h4>
                      {!schedule.isActive && (
                        <p className="text-xs text-muted-foreground mt-1">Currently disabled</p>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Schedule</DialogTitle>
            <DialogDescription>
              Update schedule information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSchedule}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-dayOfWeek">Day of Week *</Label>
                <Select
                  value={formData.dayOfWeek}
                  onValueChange={(value) => setFormData({ ...formData, dayOfWeek: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map(day => (
                      <SelectItem key={day} value={day}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-timeSlot">Time Slot *</Label>
                <Select
                  value={formData.timeSlot}
                  onValueChange={(value) => setFormData({ ...formData, timeSlot: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6:30 AM">6:30 AM (Morning)</SelectItem>
                    <SelectItem value="5:00 PM">5:00 PM (Evening)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-activity">Activity *</Label>
                <Input
                  id="edit-activity"
                  value={formData.activity}
                  onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                  required
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="edit-isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="edit-isActive">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Update Schedule</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
