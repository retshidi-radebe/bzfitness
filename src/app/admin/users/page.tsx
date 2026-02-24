import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { UsersClient } from './users-client'

export default async function UsersPage() {
  const session = await getSession()
  if (!session || session.role !== 'superadmin') {
    redirect('/admin')
  }

  return <UsersClient currentUserId={session.userId} />
}
