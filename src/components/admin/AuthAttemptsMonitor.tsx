import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { logger } from '@/utils/logger'
import { format } from 'date-fns'
import { Download, RefreshCw } from 'lucide-react'

interface AuthAttempt {
  id: string
  ip_masked: string
  email_masked: string
  attempt_type: string
  success: boolean
  created_at: string
  user_agent_short: string
}

export function AuthAttemptsMonitor() {
  const [attempts, setAttempts] = useState<AuthAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchAttempts()
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('auth-attempts-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'auth_attempts'
        },
        () => {
          fetchAttempts()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchAttempts() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('auth_attempts_summary')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error

      setAttempts(data || [])
      logger.info('Auth attempts loaded', { count: data?.length })
    } catch (err) {
      logger.error('Error fetching auth attempts', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredAttempts = attempts.filter(attempt => {
    if (filter === 'success' && !attempt.success) return false
    if (filter === 'failed' && attempt.success) return false
    if (typeFilter !== 'all' && attempt.attempt_type !== typeFilter) return false
    if (searchTerm && !attempt.email_masked.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const exportToCSV = () => {
    const headers = ['Date', 'Email', 'Type', 'Success', 'IP', 'User Agent']
    const rows = filteredAttempts.map(a => [
      format(new Date(a.created_at), 'yyyy-MM-dd HH:mm:ss'),
      a.email_masked,
      a.attempt_type,
      a.success ? 'Yes' : 'No',
      a.ip_masked,
      a.user_agent_short
    ])
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `auth-attempts-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Authentication Attempts</CardTitle>
        <CardDescription>
          Monitor authentication activity and detect suspicious patterns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 mb-4">
          <Input
            placeholder="Search by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
          
          <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Attempts</SelectItem>
              <SelectItem value="success">Success Only</SelectItem>
              <SelectItem value="failed">Failed Only</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="login">Login</SelectItem>
              <SelectItem value="signup">Signup</SelectItem>
              <SelectItem value="password_reset">Password Reset</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={fetchAttempts} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>

          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>User Agent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : filteredAttempts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">No attempts found</TableCell>
                </TableRow>
              ) : (
                filteredAttempts.map((attempt) => (
                  <TableRow key={attempt.id}>
                    <TableCell className="font-mono text-xs">
                      {format(new Date(attempt.created_at), 'MMM dd, HH:mm:ss')}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{attempt.email_masked}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{attempt.attempt_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={attempt.success ? 'default' : 'destructive'}>
                        {attempt.success ? 'Success' : 'Failed'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{attempt.ip_masked}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                      {attempt.user_agent_short}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          Showing {filteredAttempts.length} of {attempts.length} attempts
        </div>
      </CardContent>
    </Card>
  )
}
