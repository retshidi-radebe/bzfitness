'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AdminLayout } from '@/components/admin-layout'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { Download, UserPlus } from 'lucide-react'
import { exportContacts } from '@/lib/export-csv'

interface ContactSubmission {
  id: string
  name: string
  phone: string
  email: string | null
  package: string
  message: string
  status: string
  createdAt: string
}

export default function ContactSubmissionsPage() {
  const { toast } = useToast()
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<ContactSubmission | null>(null)
  const [converting, setConverting] = useState(false)
  const [convertFormData, setConvertFormData] = useState({
    name: '',
    phone: '',
    email: '',
    packageType: 'package-1',
  })

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    try {
      const res = await fetch('/api/admin/contact')
      if (res.ok) {
        const data = await res.json()
        setSubmissions(data)
      }
    } catch (error) {
      console.error('Error fetching submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-green-500'
      case 'contacted':
        return 'bg-blue-500'
      case 'completed':
        return 'bg-gray-500'
      default:
        return 'bg-yellow-500'
    }
  }

  const openConvertModal = (contact: ContactSubmission) => {
    setSelectedContact(contact)
    // Map the contact's package to valid member package
    let packageType = 'package-1'
    if (contact.package === 'package-1' || contact.package === 'package-2' || contact.package === 'package-3') {
      packageType = contact.package
    }
    setConvertFormData({
      name: contact.name,
      phone: contact.phone,
      email: contact.email || '',
      packageType,
    })
    setIsConvertModalOpen(true)
  }

  const handleConvertToMember = async () => {
    if (!selectedContact) return

    setConverting(true)
    try {
      // Create the member
      const memberRes = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: convertFormData.name,
          phone: convertFormData.phone,
          email: convertFormData.email || null,
          packageType: convertFormData.packageType,
          status: 'active',
        }),
      })

      if (!memberRes.ok) {
        const error = await memberRes.json()
        throw new Error(error.error || 'Failed to create member')
      }

      // Update contact status to completed
      await fetch(`/api/admin/contact/${selectedContact.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      })

      toast({
        title: 'Success!',
        description: `${convertFormData.name} has been added as a member.`,
      })

      setIsConvertModalOpen(false)
      setSelectedContact(null)
      fetchSubmissions()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to convert contact to member',
        variant: 'destructive',
      })
    } finally {
      setConverting(false)
    }
  }

  return (
    <AdminLayout title="Contact">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Contact Form Submissions</h2>
          <p className="text-muted-foreground mt-1">
            Manage and view all contact form submissions from your website
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => exportContacts(submissions)}
          disabled={submissions.length === 0}
          className="flex items-center gap-2 dark:text-gray-200 dark:border-gray-600"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
        </Card>
      ) : submissions.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Submissions Yet</CardTitle>
            <CardDescription>
              Contact form submissions will appear here when people fill out the form.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <Card key={submission.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{submission.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {format(new Date(submission.createdAt), 'PPPp, HH:mm')}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(submission.status)}>
                    {submission.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="font-semibold">Phone:</span>{' '}
                  {submission.phone}
                </div>
                {submission.email && (
                  <div>
                    <span className="font-semibold">Email:</span>{' '}
                    {submission.email}
                  </div>
                )}
                <div>
                  <span className="font-semibold">Package:</span>{' '}
                  {submission.package === 'package-1' && 'Package 1 - R50/month (50% OFF)'}
                  {submission.package === 'package-2' && 'Package 2 - R85/month (50% OFF)'}
                  {submission.package === 'package-3' && 'Package 3 - R125/month (50% OFF)'}
                  {submission.package === 'unsure' && 'Not sure yet'}
                  {submission.package === 'other' && 'Other inquiry'}
                </div>
                <div className="pt-2 border-t">
                  <span className="font-semibold">Message:</span>
                  <p className="mt-1 text-sm">{submission.message}</p>
                </div>
                <div className="pt-4 flex flex-col sm:flex-row gap-2">
                  {submission.phone && (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      <a
                        href={`https://wa.me/${submission.phone.replace(/\s/g, '')}?text=Hi%20${encodeURIComponent(submission.name)}%2C%20thank%20you%20for%20contacting%20BZ%20Fitness`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Reply on WhatsApp
                      </a>
                    </Button>
                  )}
                  {submission.status !== 'completed' && (
                    <Button
                      size="sm"
                      className="w-full sm:w-auto flex items-center gap-2 bg-green-600 hover:bg-green-700"
                      onClick={() => openConvertModal(submission)}
                    >
                      <UserPlus className="h-4 w-4" />
                      Convert to Member
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Convert to Member Dialog */}
      <Dialog open={isConvertModalOpen} onOpenChange={setIsConvertModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convert to Member</DialogTitle>
            <DialogDescription>
              Create a new member from this contact submission. Review and edit the details below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="convert-name">Name *</Label>
              <Input
                id="convert-name"
                value={convertFormData.name}
                onChange={(e) => setConvertFormData({ ...convertFormData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="convert-phone">Phone *</Label>
              <Input
                id="convert-phone"
                value={convertFormData.phone}
                onChange={(e) => setConvertFormData({ ...convertFormData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="convert-email">Email</Label>
              <Input
                id="convert-email"
                type="email"
                value={convertFormData.email}
                onChange={(e) => setConvertFormData({ ...convertFormData, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="convert-package">Package *</Label>
              <Select
                value={convertFormData.packageType}
                onValueChange={(value) => setConvertFormData({ ...convertFormData, packageType: value })}
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConvertModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConvertToMember}
              disabled={converting || !convertFormData.name || !convertFormData.phone}
              className="bg-green-600 hover:bg-green-700"
            >
              {converting ? 'Converting...' : 'Create Member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
