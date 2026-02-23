'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { AdminLayout } from '@/components/admin-layout'
import { Users, Plus, Edit, Trash2, Search, X, Download, ChevronLeft, ChevronRight, BarChart2 } from 'lucide-react'
import { format } from 'date-fns'
import { exportMembers } from '@/lib/export-csv'

const ITEMS_PER_PAGE = 10

interface Member {
  id: string
  name: string
  phone: string
  email: string | null
  dateOfBirth: string | null
  gender: string | null
  address: string | null
  emergencyContactName: string | null
  emergencyContactPhone: string | null
  emergencyContactRelation: string | null
  medicalConditions: string | null
  injuries: string | null
  packageType: string
  status: string
  joinDate: string
  nextPaymentDate: string | null
  agreedToTerms: boolean
  _count: {
    attendances: number
    payments: number
  }
}

export default function MembersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [packageFilter, setPackageFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    medicalConditions: '',
    injuries: '',
    packageType: 'package-1',
    status: 'active',
    nextPaymentDate: '',
    agreedToTerms: false,
  })

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/admin/members')
      if (res.ok) {
        const data = await res.json()
        setMembers(data)
      }
    } catch (error) {
      console.error('Error fetching members:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast({
          title: 'Success',
          description: 'Member added successfully',
        })
        setIsAddModalOpen(false)
        setFormData({
          name: '',
          phone: '',
          email: '',
          dateOfBirth: '',
          gender: '',
          address: '',
          emergencyContactName: '',
          emergencyContactPhone: '',
          emergencyContactRelation: '',
          medicalConditions: '',
          injuries: '',
          packageType: 'package-1',
          status: 'active',
          nextPaymentDate: '',
          agreedToTerms: false,
        })
        fetchMembers()
      } else {
        const error = await res.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to add member',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error adding member:', error)
      toast({
        title: 'Error',
        description: 'Failed to add member',
        variant: 'destructive',
      })
    }
  }

  const handleEditMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingMember) return

    try {
      const res = await fetch(`/api/admin/members/${editingMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast({
          title: 'Success',
          description: 'Member updated successfully',
        })
        setIsEditModalOpen(false)
        setEditingMember(null)
        setFormData({
          name: '',
          phone: '',
          email: '',
          dateOfBirth: '',
          gender: '',
          address: '',
          emergencyContactName: '',
          emergencyContactPhone: '',
          emergencyContactRelation: '',
          medicalConditions: '',
          injuries: '',
          packageType: 'package-1',
          status: 'active',
          nextPaymentDate: '',
          agreedToTerms: false,
        })
        fetchMembers()
      } else {
        const error = await res.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to update member',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error updating member:', error)
      toast({
        title: 'Error',
        description: 'Failed to update member',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteMember = async (id: string) => {
    if (!confirm('Are you sure you want to delete this member?')) return

    try {
      const res = await fetch(`/api/admin/members/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast({
          title: 'Success',
          description: 'Member deleted successfully',
        })
        fetchMembers()
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete member',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error deleting member:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete member',
        variant: 'destructive',
      })
    }
  }

  const openEditModal = (member: Member) => {
    setEditingMember(member)
    setFormData({
      name: member.name,
      phone: member.phone,
      email: member.email || '',
      dateOfBirth: member.dateOfBirth ? member.dateOfBirth.split('T')[0] : '',
      gender: member.gender || '',
      address: member.address || '',
      emergencyContactName: member.emergencyContactName || '',
      emergencyContactPhone: member.emergencyContactPhone || '',
      emergencyContactRelation: member.emergencyContactRelation || '',
      medicalConditions: member.medicalConditions || '',
      injuries: member.injuries || '',
      packageType: member.packageType,
      status: member.status,
      nextPaymentDate: member.nextPaymentDate ? member.nextPaymentDate.split('T')[0] : '',
      agreedToTerms: member.agreedToTerms || false,
    })
    setIsEditModalOpen(true)
  }

  const getPackageLabel = (packageType: string) => {
    switch (packageType) {
      case 'package-1': return 'Package 1 - R50'
      case 'package-2': return 'Package 2 - R85'
      case 'package-3': return 'Package 3 - R125'
      default: return packageType
    }
  }

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-500' : 'bg-gray-500'
  }

  const isPaymentOverdue = (nextPaymentDate: string | null) => {
    if (!nextPaymentDate) return false
    return new Date(nextPaymentDate) < new Date()
  }

  // Filter members based on search and filters
  const filteredMembers = members.filter(member => {
    // Search filter
    const matchesSearch = searchQuery === '' ||
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phone.includes(searchQuery) ||
      (member.email && member.email.toLowerCase().includes(searchQuery.toLowerCase()))

    // Status filter
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter

    // Package filter
    const matchesPackage = packageFilter === 'all' || member.packageType === packageFilter

    return matchesSearch && matchesStatus && matchesPackage
  })

  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setPackageFilter('all')
  }

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'all' || packageFilter !== 'all'

  // Pagination logic
  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedMembers = filteredMembers.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, packageFilter])

  return (
    <AdminLayout title="Members">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Member Management</h2>
          <p className="text-muted-foreground mt-1">
            Manage all gym members and their subscriptions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isAddModalOpen} onOpenChange={(open) => {
              if (open) {
                setFormData({
                  name: '',
                  phone: '',
                  email: '',
                  dateOfBirth: '',
                  gender: '',
                  address: '',
                  emergencyContactName: '',
                  emergencyContactPhone: '',
                  emergencyContactRelation: '',
                  medicalConditions: '',
                  injuries: '',
                  packageType: 'package-1',
                  status: 'active',
                  nextPaymentDate: '',
                  agreedToTerms: false,
                })
              }
              setIsAddModalOpen(open)
            }}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>Member Registration Form</DialogTitle>
                <DialogDescription>
                  Complete the registration form for new gym members
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddMember}>
                <ScrollArea className="h-[60vh] pr-4">
                  <Tabs defaultValue="personal" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 mb-4">
                      <TabsTrigger value="personal">Personal</TabsTrigger>
                      <TabsTrigger value="emergency">Emergency</TabsTrigger>
                      <TabsTrigger value="health">Health</TabsTrigger>
                      <TabsTrigger value="membership">Membership</TabsTrigger>
                    </TabsList>

                    {/* Personal Information */}
                    <TabsContent value="personal" className="space-y-4">
                      <h3 className="font-semibold text-lg border-b pb-2">Personal Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <Label htmlFor="name">Full Name *</Label>
                          <Input
                            id="name"
                            placeholder="Enter full name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number *</Label>
                          <Input
                            id="phone"
                            placeholder="e.g., 071 234 5678"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="email@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="dateOfBirth">Date of Birth</Label>
                          <Input
                            id="dateOfBirth"
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="gender">Gender</Label>
                          <Select
                            value={formData.gender}
                            onValueChange={(value) => setFormData({ ...formData, gender: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="address">Home Address</Label>
                          <Textarea
                            id="address"
                            placeholder="Enter residential address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            rows={2}
                          />
                        </div>
                      </div>
                    </TabsContent>

                    {/* Emergency Contact */}
                    <TabsContent value="emergency" className="space-y-4">
                      <h3 className="font-semibold text-lg border-b pb-2">Emergency Contact</h3>
                      <p className="text-sm text-muted-foreground">
                        Please provide details of someone we can contact in case of emergency.
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <Label htmlFor="emergencyContactName">Contact Name</Label>
                          <Input
                            id="emergencyContactName"
                            placeholder="Full name of emergency contact"
                            value={formData.emergencyContactName}
                            onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                          <Input
                            id="emergencyContactPhone"
                            placeholder="e.g., 071 234 5678"
                            value={formData.emergencyContactPhone}
                            onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="emergencyContactRelation">Relationship</Label>
                          <Select
                            value={formData.emergencyContactRelation}
                            onValueChange={(value) => setFormData({ ...formData, emergencyContactRelation: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select relationship" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="spouse">Spouse</SelectItem>
                              <SelectItem value="parent">Parent</SelectItem>
                              <SelectItem value="sibling">Sibling</SelectItem>
                              <SelectItem value="child">Child</SelectItem>
                              <SelectItem value="friend">Friend</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Health Information */}
                    <TabsContent value="health" className="space-y-4">
                      <h3 className="font-semibold text-lg border-b pb-2">Health Information</h3>
                      <p className="text-sm text-muted-foreground">
                        This information helps us ensure your safety during training sessions.
                      </p>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="medicalConditions">Medical Conditions</Label>
                          <Textarea
                            id="medicalConditions"
                            placeholder="List any medical conditions (e.g., asthma, diabetes, heart condition, high blood pressure)"
                            value={formData.medicalConditions}
                            onChange={(e) => setFormData({ ...formData, medicalConditions: e.target.value })}
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label htmlFor="injuries">Injuries or Physical Limitations</Label>
                          <Textarea
                            id="injuries"
                            placeholder="List any injuries or physical limitations that may affect your training (e.g., back pain, knee injury)"
                            value={formData.injuries}
                            onChange={(e) => setFormData({ ...formData, injuries: e.target.value })}
                            rows={3}
                          />
                        </div>
                      </div>
                    </TabsContent>

                    {/* Membership Details */}
                    <TabsContent value="membership" className="space-y-4">
                      <h3 className="font-semibold text-lg border-b pb-2">Membership Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="packageType">Package *</Label>
                          <Select
                            value={formData.packageType}
                            onValueChange={(value) => setFormData({ ...formData, packageType: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="package-1">Package 1 - R50/month</SelectItem>
                              <SelectItem value="package-2">Package 2 - R85/month</SelectItem>
                              <SelectItem value="package-3">Package 3 - R125/month</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="status">Status</Label>
                          <Select
                            value={formData.status}
                            onValueChange={(value) => setFormData({ ...formData, status: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="nextPaymentDate">First Payment Due Date</Label>
                          <Input
                            id="nextPaymentDate"
                            type="date"
                            value={formData.nextPaymentDate}
                            onChange={(e) => setFormData({ ...formData, nextPaymentDate: e.target.value })}
                          />
                        </div>
                      </div>

                      {/* Terms and Conditions */}
                      <div className="mt-6 p-4 bg-muted rounded-lg">
                        <h4 className="font-medium mb-2">Terms & Conditions</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          By registering, the member acknowledges that:
                        </p>
                        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 mb-4">
                          <li>They are physically fit to participate in fitness activities</li>
                          <li>They will follow all gym safety rules and trainer instructions</li>
                          <li>BZ Fitness is not liable for any injuries sustained during training</li>
                          <li>Membership fees are non-refundable</li>
                        </ul>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="agreedToTerms"
                            checked={formData.agreedToTerms}
                            onCheckedChange={(checked) => setFormData({ ...formData, agreedToTerms: checked as boolean })}
                          />
                          <label
                            htmlFor="agreedToTerms"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Member agrees to the terms and conditions *
                          </label>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </ScrollArea>
                <DialogFooter className="mt-4">
                  <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!formData.agreedToTerms}>
                    Register Member
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 dark:text-gray-200 dark:border-gray-600 dark:placeholder:text-gray-400"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40 dark:text-gray-200 dark:border-gray-600">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          {/* Package Filter */}
          <Select value={packageFilter} onValueChange={setPackageFilter}>
            <SelectTrigger className="w-full sm:w-44 dark:text-gray-200 dark:border-gray-600">
              <SelectValue placeholder="Package" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Packages</SelectItem>
              <SelectItem value="package-1">Package 1 - R50</SelectItem>
              <SelectItem value="package-2">Package 2 - R85</SelectItem>
              <SelectItem value="package-3">Package 3 - R125</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2 dark:text-gray-200 dark:border-gray-600">
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}

          {/* Export Button */}
          <Button
            variant="outline"
            onClick={() => exportMembers(filteredMembers)}
            className="flex items-center gap-2 dark:text-gray-200 dark:border-gray-600"
            disabled={filteredMembers.length === 0}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Results count */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>
            Showing {filteredMembers.length} of {members.length} members
            {hasActiveFilters && ' (filtered)'}
          </span>
        </div>
      </div>

        {loading ? (
          <Card>
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
            </CardHeader>
          </Card>
        ) : filteredMembers.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>{hasActiveFilters ? 'No Members Found' : 'No Members Yet'}</CardTitle>
              <CardDescription>
                {hasActiveFilters
                  ? 'Try adjusting your search or filters'
                  : 'Add your first member to get started'}
              </CardDescription>
            </CardHeader>
            {hasActiveFilters && (
              <CardContent>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </CardContent>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead className="hidden md:table-cell">Email</TableHead>
                      <TableHead>Package</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden lg:table-cell">Next Payment</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">
                          <div>
                            {member.name}
                            {isPaymentOverdue(member.nextPaymentDate) && (
                              <Badge variant="destructive" className="ml-2 text-xs">Overdue</Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Joined: {format(new Date(member.joinDate), 'MMM dd, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell>{member.phone}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {member.email || '-'}
                        </TableCell>
                        <TableCell>{getPackageLabel(member.packageType)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(member.status)}>
                            {member.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {member.nextPaymentDate ? (
                            <span className={isPaymentOverdue(member.nextPaymentDate) ? 'text-red-600 font-semibold' : ''}>
                              {format(new Date(member.nextPaymentDate), 'MMM dd, yyyy')}
                            </span>
                          ) : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              title="View Progress"
                              onClick={() => router.push(`/admin/members/${member.id}/progress`)}
                            >
                              <BarChart2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditModal(member)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteMember(member.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
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
                  Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredMembers.length)} of {filteredMembers.length} members
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

      {/* Edit Member Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
            <DialogDescription>
              Update member information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditMember}>
            <ScrollArea className="h-[60vh] pr-4">
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-4">
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="emergency">Emergency</TabsTrigger>
                  <TabsTrigger value="health">Health</TabsTrigger>
                  <TabsTrigger value="membership">Membership</TabsTrigger>
                </TabsList>

                {/* Personal Information */}
                <TabsContent value="personal" className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="edit-name">Full Name *</Label>
                      <Input
                        id="edit-name"
                        placeholder="Enter full name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-phone">Phone Number *</Label>
                      <Input
                        id="edit-phone"
                        placeholder="e.g., 071 234 5678"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-email">Email Address</Label>
                      <Input
                        id="edit-email"
                        type="email"
                        placeholder="email@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-dateOfBirth">Date of Birth</Label>
                      <Input
                        id="edit-dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-gender">Gender</Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) => setFormData({ ...formData, gender: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="edit-address">Home Address</Label>
                      <Textarea
                        id="edit-address"
                        placeholder="Enter residential address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        rows={2}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Emergency Contact */}
                <TabsContent value="emergency" className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Emergency Contact</h3>
                  <p className="text-sm text-muted-foreground">
                    Details of someone we can contact in case of emergency.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="edit-emergencyContactName">Contact Name</Label>
                      <Input
                        id="edit-emergencyContactName"
                        placeholder="Full name of emergency contact"
                        value={formData.emergencyContactName}
                        onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-emergencyContactPhone">Contact Phone</Label>
                      <Input
                        id="edit-emergencyContactPhone"
                        placeholder="e.g., 071 234 5678"
                        value={formData.emergencyContactPhone}
                        onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-emergencyContactRelation">Relationship</Label>
                      <Select
                        value={formData.emergencyContactRelation}
                        onValueChange={(value) => setFormData({ ...formData, emergencyContactRelation: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="spouse">Spouse</SelectItem>
                          <SelectItem value="parent">Parent</SelectItem>
                          <SelectItem value="sibling">Sibling</SelectItem>
                          <SelectItem value="child">Child</SelectItem>
                          <SelectItem value="friend">Friend</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                {/* Health Information */}
                <TabsContent value="health" className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Health Information</h3>
                  <p className="text-sm text-muted-foreground">
                    This information helps us ensure safety during training sessions.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-medicalConditions">Medical Conditions</Label>
                      <Textarea
                        id="edit-medicalConditions"
                        placeholder="List any medical conditions (e.g., asthma, diabetes, heart condition, high blood pressure)"
                        value={formData.medicalConditions}
                        onChange={(e) => setFormData({ ...formData, medicalConditions: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-injuries">Injuries or Physical Limitations</Label>
                      <Textarea
                        id="edit-injuries"
                        placeholder="List any injuries or physical limitations that may affect training (e.g., back pain, knee injury)"
                        value={formData.injuries}
                        onChange={(e) => setFormData({ ...formData, injuries: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Membership Details */}
                <TabsContent value="membership" className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Membership Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-packageType">Package *</Label>
                      <Select
                        value={formData.packageType}
                        onValueChange={(value) => setFormData({ ...formData, packageType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="package-1">Package 1 - R50/month</SelectItem>
                          <SelectItem value="package-2">Package 2 - R85/month</SelectItem>
                          <SelectItem value="package-3">Package 3 - R125/month</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="edit-nextPaymentDate">Next Payment Due Date</Label>
                      <Input
                        id="edit-nextPaymentDate"
                        type="date"
                        value={formData.nextPaymentDate}
                        onChange={(e) => setFormData({ ...formData, nextPaymentDate: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Terms Status */}
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Terms & Conditions</h4>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-agreedToTerms"
                        checked={formData.agreedToTerms}
                        onCheckedChange={(checked) => setFormData({ ...formData, agreedToTerms: checked as boolean })}
                      />
                      <label
                        htmlFor="edit-agreedToTerms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Member has agreed to terms and conditions
                      </label>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </ScrollArea>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Member</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
