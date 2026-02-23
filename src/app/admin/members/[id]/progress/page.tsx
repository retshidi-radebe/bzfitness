'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/admin-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Target, Weight, Trophy, Trash2, Plus, Save } from 'lucide-react'
import { format } from 'date-fns'

interface Member {
  id: string
  name: string
  packageType: string
  joinDate: string
  status: string
}

interface MemberGoal {
  id: string
  goalDescription: string | null
  targetWeight: number | null
  targetDate: string | null
  fitnessLevel: string | null
  notes: string | null
}

interface WeightEntry {
  id: string
  weight: number
  bodyFat: number | null
  date: string
  notes: string | null
}

interface PersonalRecord {
  id: string
  exercise: string
  value: string
  date: string
  notes: string | null
}

const PACKAGE_LABELS: Record<string, string> = {
  'package-1': 'Package 1 - R50',
  'package-2': 'Package 2 - R85',
  'package-3': 'Package 3 - R125',
}

export default function MemberProgressPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const memberId = params.id as string

  const [loading, setLoading] = useState(true)
  const [member, setMember] = useState<Member | null>(null)
  const [goal, setGoal] = useState<MemberGoal | null>(null)
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([])
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([])

  // Goal form
  const [goalForm, setGoalForm] = useState({
    goalDescription: '',
    targetWeight: '',
    targetDate: '',
    fitnessLevel: '',
    notes: '',
  })
  const [savingGoal, setSavingGoal] = useState(false)

  // Weight form
  const [weightForm, setWeightForm] = useState({
    weight: '',
    bodyFat: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  })
  const [addingWeight, setAddingWeight] = useState(false)

  // Record form
  const [recordForm, setRecordForm] = useState({
    exercise: '',
    value: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  })
  const [addingRecord, setAddingRecord] = useState(false)

  useEffect(() => {
    fetchProgress()
  }, [memberId])

  const fetchProgress = async () => {
    try {
      const res = await fetch(`/api/admin/members/${memberId}/progress`)
      if (res.ok) {
        const data = await res.json()
        setMember(data.member)
        setGoal(data.goal)
        setWeightEntries(data.weightEntries)
        setPersonalRecords(data.personalRecords)
        if (data.goal) {
          setGoalForm({
            goalDescription: data.goal.goalDescription || '',
            targetWeight: data.goal.targetWeight?.toString() || '',
            targetDate: data.goal.targetDate ? data.goal.targetDate.split('T')[0] : '',
            fitnessLevel: data.goal.fitnessLevel || '',
            notes: data.goal.notes || '',
          })
        }
      } else {
        router.push('/admin/members')
      }
    } catch (error) {
      console.error('Error fetching progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveGoal = async () => {
    setSavingGoal(true)
    try {
      const res = await fetch(`/api/admin/members/${memberId}/goal`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goalForm),
      })
      if (res.ok) {
        const data = await res.json()
        setGoal(data)
        toast({ title: 'Success', description: 'Goals saved successfully' })
      } else {
        toast({ title: 'Error', description: 'Failed to save goals', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to save goals', variant: 'destructive' })
    } finally {
      setSavingGoal(false)
    }
  }

  const handleAddWeight = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddingWeight(true)
    try {
      const res = await fetch(`/api/admin/members/${memberId}/weight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(weightForm),
      })
      if (res.ok) {
        const entry = await res.json()
        setWeightEntries(prev => [entry, ...prev])
        setWeightForm({ weight: '', bodyFat: '', date: new Date().toISOString().split('T')[0], notes: '' })
        toast({ title: 'Success', description: 'Weight entry added' })
      } else {
        toast({ title: 'Error', description: 'Failed to add weight entry', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to add weight entry', variant: 'destructive' })
    } finally {
      setAddingWeight(false)
    }
  }

  const handleDeleteWeight = async (entryId: string) => {
    if (!confirm('Delete this weight entry?')) return
    try {
      const res = await fetch(`/api/admin/members/${memberId}/weight/${entryId}`, { method: 'DELETE' })
      if (res.ok) {
        setWeightEntries(prev => prev.filter(e => e.id !== entryId))
        toast({ title: 'Success', description: 'Weight entry deleted' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to delete entry', variant: 'destructive' })
    }
  }

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddingRecord(true)
    try {
      const res = await fetch(`/api/admin/members/${memberId}/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordForm),
      })
      if (res.ok) {
        const record = await res.json()
        setPersonalRecords(prev => [record, ...prev])
        setRecordForm({ exercise: '', value: '', date: new Date().toISOString().split('T')[0], notes: '' })
        toast({ title: 'Success', description: 'Personal record added' })
      } else {
        toast({ title: 'Error', description: 'Failed to add record', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to add record', variant: 'destructive' })
    } finally {
      setAddingRecord(false)
    }
  }

  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm('Delete this personal record?')) return
    try {
      const res = await fetch(`/api/admin/members/${memberId}/records/${recordId}`, { method: 'DELETE' })
      if (res.ok) {
        setPersonalRecords(prev => prev.filter(r => r.id !== recordId))
        toast({ title: 'Success', description: 'Record deleted' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to delete record', variant: 'destructive' })
    }
  }

  // Compute progress stats
  const latestWeight = weightEntries[0]?.weight ?? null
  const startingWeight = weightEntries[weightEntries.length - 1]?.weight ?? null
  const weightChange = latestWeight && startingWeight ? latestWeight - startingWeight : null

  if (loading) {
    return (
      <AdminLayout title="Member Progress">
        <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>
      </AdminLayout>
    )
  }

  if (!member) return null

  return (
    <AdminLayout title="Member Progress">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push('/admin/members')} className="mb-4 -ml-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Members
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div>
            <h2 className="text-3xl font-bold">{member.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={member.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}>
                {member.status}
              </Badge>
              <span className="text-muted-foreground text-sm">{PACKAGE_LABELS[member.packageType]}</span>
              <span className="text-muted-foreground text-sm">
                · Joined {format(new Date(member.joinDate), 'MMM yyyy')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Summary Cards */}
      {weightEntries.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Current Weight</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{latestWeight} kg</div>
              <div className="text-xs text-muted-foreground">
                {format(new Date(weightEntries[0].date), 'MMM dd, yyyy')}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Starting Weight</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{startingWeight} kg</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Weight Change</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${weightChange !== null && weightChange < 0 ? 'text-green-600' : weightChange !== null && weightChange > 0 ? 'text-red-600' : ''}`}>
                {weightChange !== null ? `${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} kg` : '—'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Target Weight</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {goal?.targetWeight ? `${goal.targetWeight} kg` : '—'}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Goals Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Goals & Fitness Level
            </CardTitle>
            <CardDescription>Set realistic targets for this member</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Goal Description</Label>
                <Textarea
                  placeholder="e.g. Lose 10kg and build core strength over 3 months"
                  value={goalForm.goalDescription}
                  onChange={e => setGoalForm({ ...goalForm, goalDescription: e.target.value })}
                  rows={2}
                />
              </div>
              <div>
                <Label>Fitness Level</Label>
                <Select
                  value={goalForm.fitnessLevel}
                  onValueChange={v => setGoalForm({ ...goalForm, fitnessLevel: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Target Weight (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 70"
                  value={goalForm.targetWeight}
                  onChange={e => setGoalForm({ ...goalForm, targetWeight: e.target.value })}
                />
              </div>
              <div>
                <Label>Target Date</Label>
                <Input
                  type="date"
                  value={goalForm.targetDate}
                  onChange={e => setGoalForm({ ...goalForm, targetDate: e.target.value })}
                />
              </div>
              <div>
                <Label>Additional Notes</Label>
                <Input
                  placeholder="Any other notes..."
                  value={goalForm.notes}
                  onChange={e => setGoalForm({ ...goalForm, notes: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={handleSaveGoal} disabled={savingGoal} className="mt-4">
              <Save className="h-4 w-4 mr-2" />
              {savingGoal ? 'Saving...' : 'Save Goals'}
            </Button>
          </CardContent>
        </Card>

        {/* Weight Log */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Weight className="h-5 w-5 text-orange-500" />
              Weight Log
            </CardTitle>
            <CardDescription>Track body weight and body fat over time</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Add Weight Form */}
            <form onSubmit={handleAddWeight} className="space-y-3 mb-4 p-3 bg-muted rounded-lg">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Weight (kg) *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 75.5"
                    value={weightForm.weight}
                    onChange={e => setWeightForm({ ...weightForm, weight: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Body Fat %</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 18.5"
                    value={weightForm.bodyFat}
                    onChange={e => setWeightForm({ ...weightForm, bodyFat: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={weightForm.date}
                    onChange={e => setWeightForm({ ...weightForm, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Input
                    placeholder="Optional"
                    value={weightForm.notes}
                    onChange={e => setWeightForm({ ...weightForm, notes: e.target.value })}
                  />
                </div>
              </div>
              <Button type="submit" size="sm" disabled={addingWeight}>
                <Plus className="h-4 w-4 mr-1" />
                {addingWeight ? 'Adding...' : 'Log Weight'}
              </Button>
            </form>

            {/* Weight History */}
            {weightEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No weight entries yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Body Fat</TableHead>
                    <TableHead className="text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {weightEntries.map(entry => (
                    <TableRow key={entry.id}>
                      <TableCell className="text-sm">{format(new Date(entry.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="font-medium">{entry.weight} kg</TableCell>
                      <TableCell>{entry.bodyFat ? `${entry.bodyFat}%` : '—'}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteWeight(entry.id)}
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Personal Records */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Personal Records
            </CardTitle>
            <CardDescription>Track fitness milestones and bests</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Add Record Form */}
            <form onSubmit={handleAddRecord} className="space-y-3 mb-4 p-3 bg-muted rounded-lg">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Exercise *</Label>
                  <Input
                    placeholder="e.g. Push-ups, Squat"
                    value={recordForm.exercise}
                    onChange={e => setRecordForm({ ...recordForm, exercise: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Value *</Label>
                  <Input
                    placeholder="e.g. 50 reps, 80 kg"
                    value={recordForm.value}
                    onChange={e => setRecordForm({ ...recordForm, value: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={recordForm.date}
                    onChange={e => setRecordForm({ ...recordForm, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Input
                    placeholder="Optional"
                    value={recordForm.notes}
                    onChange={e => setRecordForm({ ...recordForm, notes: e.target.value })}
                  />
                </div>
              </div>
              <Button type="submit" size="sm" disabled={addingRecord}>
                <Plus className="h-4 w-4 mr-1" />
                {addingRecord ? 'Adding...' : 'Add Record'}
              </Button>
            </form>

            {/* Records List */}
            {personalRecords.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No personal records yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exercise</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {personalRecords.map(record => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.exercise}</TableCell>
                      <TableCell>{record.value}</TableCell>
                      <TableCell className="text-sm">{format(new Date(record.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteRecord(record.id)}
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
