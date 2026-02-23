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
import { DollarSign, Calendar, Plus, CheckCircle, AlertCircle, MessageCircle, Send, Download, ChevronLeft, ChevronRight, Trash2, ChevronsUpDown, Check } from 'lucide-react'
import { format } from 'date-fns'
import { exportPayments } from '@/lib/export-csv'
import { cn } from '@/lib/utils'

const ITEMS_PER_PAGE = 10

interface Member {
  id: string
  name: string
  phone?: string
}

interface Payment {
  id: string
  memberId: string
  amount: number
  package: string
  status: string
  dueDate: string
  paidDate: string | null
  createdAt: string
  member: Member
}

export default function PaymentsPage() {
  const { toast } = useToast()
  const [payments, setPayments] = useState<Payment[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [formData, setFormData] = useState({
    memberId: '',
    amount: '',
    package: 'package-1',
    dueDate: '',
    status: 'pending',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [memberComboOpen, setMemberComboOpen] = useState(false)

  useEffect(() => {
    fetchPayments()
    fetchMembers()
  }, [statusFilter])

  const fetchPayments = async () => {
    try {
      const url = statusFilter === 'all'
        ? '/api/admin/payments'
        : `/api/admin/payments?status=${statusFilter}`
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setPayments(data)
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
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

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast({
          title: 'Success',
          description: 'Payment recorded successfully',
        })
        setIsAddModalOpen(false)
        setFormData({
          memberId: '',
          amount: '',
          package: 'package-1',
          dueDate: '',
          status: 'pending',
        })
        fetchPayments()
      } else {
        const error = await res.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to record payment',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error adding payment:', error)
      toast({
        title: 'Error',
        description: 'Failed to record payment',
        variant: 'destructive',
      })
    }
  }

  const handleMarkAsPaid = async (paymentId: string) => {
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid' }),
      })

      if (res.ok) {
        toast({
          title: 'Success',
          description: 'Payment marked as paid',
        })
        fetchPayments()
      } else {
        toast({
          title: 'Error',
          description: 'Failed to mark payment as paid',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error updating payment:', error)
      toast({
        title: 'Error',
        description: 'Failed to mark payment as paid',
        variant: 'destructive',
      })
    }
  }

  const handleDeletePayment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payment?')) return

    try {
      const res = await fetch(`/api/admin/payments/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast({
          title: 'Success',
          description: 'Payment deleted successfully',
        })
        fetchPayments()
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete payment',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error deleting payment:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete payment',
        variant: 'destructive',
      })
    }
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
    switch (status) {
      case 'paid': return 'bg-green-500'
      case 'pending': return 'bg-yellow-500'
      case 'overdue': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const isOverdue = (dueDate: string, status: string) => {
    return status !== 'paid' && new Date(dueDate) < new Date()
  }

  // Generate WhatsApp reminder message
  const getWhatsAppReminderLink = (payment: Payment) => {
    const member = members.find(m => m.id === payment.memberId)
    if (!member?.phone) return null

    const dueDate = format(new Date(payment.dueDate), 'MMM dd, yyyy')
    const isLate = isOverdue(payment.dueDate, payment.status)

    const message = isLate
      ? `Hi ${payment.member.name}, this is a friendly reminder from BZ Fitness. Your payment of R${payment.amount.toFixed(0)} was due on ${dueDate}. Please make your payment at your earliest convenience to continue enjoying our services. Thank you!`
      : `Hi ${payment.member.name}, this is a friendly reminder from BZ Fitness. Your payment of R${payment.amount.toFixed(0)} is due on ${dueDate}. Please remember to make your payment. Thank you!`

    const phone = member.phone.replace(/\s/g, '').replace(/^0/, '27')
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
  }

  // Get all overdue payments with phone numbers for bulk reminder
  const overduePaymentsWithPhone = payments.filter(p =>
    (p.status === 'overdue' || isOverdue(p.dueDate, p.status)) &&
    members.find(m => m.id === p.memberId)?.phone
  )

  const stats = {
    total: payments.length,
    paid: payments.filter(p => p.status === 'paid').length,
    pending: payments.filter(p => p.status === 'pending').length,
    overdue: payments.filter(p => p.status === 'overdue' || (p.status === 'pending' && new Date(p.dueDate) < new Date())).length,
    totalAmount: payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
  }

  // Pagination logic
  const totalPages = Math.ceil(payments.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedPayments = payments.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter])

  return (
    <AdminLayout title="Payments">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Payment Tracking</h2>
          <p className="text-muted-foreground mt-1">
            Track all payments and manage billing
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 dark:text-gray-200 dark:border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => exportPayments(payments)}
            className="flex items-center gap-2 dark:text-gray-200 dark:border-gray-600"
            disabled={payments.length === 0}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Payment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Payment</DialogTitle>
                <DialogDescription>
                  Add a new payment record
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddPayment}>
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
                    <Label htmlFor="amount">Amount (R) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="package">Package *</Label>
                    <Select
                      value={formData.package}
                      onValueChange={(value) => setFormData({ ...formData, package: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="package-1">Package 1 - R50</SelectItem>
                        <SelectItem value="package-2">Package 2 - R85</SelectItem>
                        <SelectItem value="package-3">Package 3 - R125</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date *</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      required
                    />
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
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Record Payment</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Collected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">R{stats.totalAmount.toFixed(0)}</div>
            <p className="text-sm text-muted-foreground mt-1">{stats.paid} payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.overdue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Reminder Section */}
      {overduePaymentsWithPhone.length > 0 && (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-orange-900">Payment Reminders</h3>
                  <p className="text-sm text-orange-700">
                    {overduePaymentsWithPhone.length} overdue payment{overduePaymentsWithPhone.length > 1 ? 's' : ''} need{overduePaymentsWithPhone.length === 1 ? 's' : ''} attention
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {overduePaymentsWithPhone.slice(0, 3).map((payment) => {
                  const link = getWhatsAppReminderLink(payment)
                  if (!link) return null
                  return (
                    <Button
                      key={payment.id}
                      variant="outline"
                      size="sm"
                      className="border-orange-300 text-orange-700 hover:bg-orange-100"
                      asChild
                    >
                      <a href={link} target="_blank" rel="noopener noreferrer">
                        <Send className="h-4 w-4 mr-1" />
                        {payment.member.name.split(' ')[0]}
                      </a>
                    </Button>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
        </Card>
      ) : payments.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Payment Records</CardTitle>
            <CardDescription>
              No payments have been recorded yet
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
                    <TableHead>Amount</TableHead>
                    <TableHead className="hidden md:table-cell">Package</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        <div>
                          {payment.member.name}
                          {payment.paidDate && (
                            <div className="text-xs text-green-600">
                              Paid {format(new Date(payment.paidDate), 'MMM dd')}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        R{payment.amount.toFixed(0)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {getPackageLabel(payment.package)}
                      </TableCell>
                      <TableCell>
                        <span className={isOverdue(payment.dueDate, payment.status) ? 'text-red-600 font-semibold' : ''}>
                          {format(new Date(payment.dueDate), 'MMM dd, yyyy')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Badge className={getStatusColor(payment.status)}>
                            {payment.status}
                          </Badge>
                          {isOverdue(payment.dueDate, payment.status) && (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {payment.status !== 'paid' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMarkAsPaid(payment.id)}
                                title="Mark as Paid"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              {getWhatsAppReminderLink(payment) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 border-green-300 hover:bg-green-50"
                                  asChild
                                  title="Send Reminder"
                                >
                                  <a
                                    href={getWhatsAppReminderLink(payment)!}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <MessageCircle className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeletePayment(payment.id)}
                            title="Delete"
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
                Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, payments.length)} of {payments.length} payments
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
