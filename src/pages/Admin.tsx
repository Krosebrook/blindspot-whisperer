import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserRole } from '@/hooks/useUserRole'
import { AuthAttemptsMonitor } from '@/components/admin/AuthAttemptsMonitor'
import { RoleManager } from '@/components/admin/RoleManager'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Shield, Users, Activity } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function Admin() {
  const navigate = useNavigate()
  const { isAdmin, loading } = useUserRole()

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/')
    }
  }, [isAdmin, loading, navigate])

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-[300px]" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor security, manage users, and view system analytics
          </p>
        </div>
      </div>

      <Tabs defaultValue="security" className="space-y-6">
        <TabsList>
          <TabsTrigger value="security" className="gap-2">
            <Activity className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-2">
            <Users className="h-4 w-4" />
            User Roles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="security" className="space-y-6">
          <AuthAttemptsMonitor />
          
          <Card>
            <CardHeader>
              <CardTitle>Security Overview</CardTitle>
              <CardDescription>
                Real-time security metrics and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="border rounded-lg p-4">
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-muted-foreground">Active Threats</div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="text-2xl font-bold">100%</div>
                  <div className="text-sm text-muted-foreground">System Uptime</div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-muted-foreground">Pending Reviews</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles">
          <RoleManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}
