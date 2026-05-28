'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { adminService } from '@/services/api.service'
import { getApiErrorMessage } from '@/lib/user-mapper'
import { Loading } from '@/components/ui/loading'
import { formatDate } from '@/lib/utils'

interface AdminUser {
  id: string
  email: string
  full_name: string
  role: 'learner' | 'mentor' | 'admin'
  is_active: boolean
  created_at: string
}

function getRoleBadgeVariant(role: AdminUser['role']) {
  if (role === 'admin') return 'default'
  if (role === 'mentor') return 'warning'
  return 'secondary'
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'learner' | 'mentor' | 'admin'>('learner')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const loadUsers = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await adminService.getUsers()
      setUsers(data)
    } catch {
      setError('Unable to load users. Admin access required.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setIsSubmitting(true)

    try {
      await adminService.createUser({ email, password, full_name: fullName, role })
      setFullName('')
      setEmail('')
      setPassword('')
      setRole('learner')
      setShowCreateModal(false)
      loadUsers()
    } catch (err: unknown) {
      setFormError(getApiErrorMessage(err, 'Failed to create user'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleUserStatus = async (user: AdminUser) => {
    try {
      await adminService.updateUser(user.id, { is_active: !user.is_active })
      loadUsers()
    } catch {
      setError('Failed to update user status')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loading />
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage platform users and roles</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>Create User</Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Card>
        <CardHeader>
          <CardTitle>All Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <p className="font-medium">{user.full_name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Joined {formatDate(user.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize">
                  {user.role}
                </Badge>
                <Badge variant={user.is_active ? 'success' : 'destructive'}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </Badge>
                <Button variant="outline" size="sm" onClick={() => toggleUserStatus(user)}>
                  {user.is_active ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No users found</p>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create User">
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password (min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
          <div className="flex gap-2">
            {(['learner', 'mentor', 'admin'] as const).map((option) => (
              <Button
                key={option}
                type="button"
                variant={role === option ? 'default' : 'outline'}
                className="flex-1 capitalize"
                onClick={() => setRole(option)}
              >
                {option}
              </Button>
            ))}
          </div>
          {formError && <p className="text-sm text-destructive">{formError}</p>}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
