import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { logger } from '@/utils/logger'
import { toast } from 'sonner'
import { Shield, UserPlus } from 'lucide-react'

interface UserRole {
  id: string
  user_id: string
  role: 'admin' | 'moderator' | 'user'
  created_at: string
}

export function RoleManager() {
  const [userRoles, setUserRoles] = useState<UserRole[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedRole, setSelectedRole] = useState<'admin' | 'moderator' | 'user'>('user')
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    fetchUserRoles()
  }, [])

  async function fetchUserRoles() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setUserRoles(data || [])
      logger.info('User roles loaded', { count: data?.length })
    } catch (err) {
      logger.error('Error fetching user roles', err)
      toast.error('Failed to load user roles')
    } finally {
      setLoading(false)
    }
  }

  async function assignRole() {
    if (!selectedUserId) {
      toast.error('Please enter a user ID')
      return
    }

    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: selectedUserId,
          role: selectedRole
        })

      if (error) throw error

      toast.success(`Role ${selectedRole} assigned successfully`)
      setDialogOpen(false)
      setSelectedUserId('')
      setSelectedRole('user')
      fetchUserRoles()
    } catch (err) {
      logger.error('Error assigning role', err)
      toast.error('Failed to assign role')
    }
  }

  async function removeRole(roleId: string) {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId)

      if (error) throw error

      toast.success('Role removed successfully')
      fetchUserRoles()
    } catch (err) {
      logger.error('Error removing role', err)
      toast.error('Failed to remove role')
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive'
      case 'moderator':
        return 'default'
      default:
        return 'secondary'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>User Roles</CardTitle>
            <CardDescription>
              Manage user permissions and access levels
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Assign Role
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign User Role</DialogTitle>
                <DialogDescription>
                  Grant a role to a user by their user ID
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="user-id">User ID</Label>
                  <Input
                    id="user-id"
                    placeholder="Enter user UUID"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={assignRole}>Assign Role</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Assigned</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : userRoles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">No roles assigned</TableCell>
                </TableRow>
              ) : (
                userRoles.map((userRole) => (
                  <TableRow key={userRole.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono text-xs">
                          {userRole.user_id}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      Role assigned
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(userRole.role)}>
                        {userRole.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(userRole.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRole(userRole.id)}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
