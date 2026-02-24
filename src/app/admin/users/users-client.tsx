'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2, UserPlus } from 'lucide-react'
import { format } from 'date-fns'

interface AdminUser {
  id: string
  username: string
  name: string | null
  role: string
  createdAt: string
}

interface UsersClientProps {
  currentUserId: string
}

export function UsersClient({ currentUserId }: UsersClientProps) {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ username: '', name: '', password: '', role: 'admin' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users')
    if (res.ok) setUsers(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) {
      setForm({ username: '', name: '', password: '', role: 'admin' })
      fetchUsers()
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to create user')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this admin user?')) return
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    fetchUsers()
  }

  return (
    <AdminLayout title="User Management">
      <div className="space-y-6 max-w-3xl">
        {/* Add User Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add Admin User
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Username</Label>
                <Input
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  placeholder="e.g. johndoe"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>Display Name</Label>
                <Input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. John Doe"
                />
              </div>
              <div className="space-y-1">
                <Label>Password</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Strong password"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>Role</Label>
                <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="superadmin">Superadmin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {error && <p className="text-sm text-red-500 sm:col-span-2">{error}</p>}
              <div className="sm:col-span-2">
                <Button type="submit" disabled={saving} className="bg-green-600 hover:bg-green-700">
                  {saving ? 'Creating...' : 'Create User'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Users</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading...</p>
            ) : (
              <div className="space-y-3">
                {/* Env superadmin row */}
                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium text-sm">{process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'admin'} <span className="text-xs text-muted-foreground">(env)</span></p>
                      <Badge variant="destructive" className="text-xs mt-1">Superadmin</Badge>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" disabled title="Cannot delete env admin">
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>

                {users.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium text-sm">{user.username}{user.name ? ` — ${user.name}` : ''}</p>
                      <Badge
                        className={`text-xs mt-1 ${user.role === 'superadmin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}
                        variant="outline"
                      >
                        {user.role === 'superadmin' ? 'Superadmin' : 'Admin'}
                      </Badge>
                      <span className="text-xs text-muted-foreground ml-2">
                        Added {format(new Date(user.createdAt), 'dd MMM yyyy')}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(user.id)}
                      disabled={user.id === currentUserId}
                      title={user.id === currentUserId ? 'Cannot delete yourself' : 'Delete user'}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}

                {users.length === 0 && (
                  <p className="text-sm text-muted-foreground">No additional admin users yet.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
