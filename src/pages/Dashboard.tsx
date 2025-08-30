import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Radar, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Zap,
  BarChart3,
  Users
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";

interface DashboardStats {
  totalScans: number;
  criticalBlindSpots: number;
  resolvedIssues: number;
  riskScore: number;
}

interface RecentScan {
  id: string;
  title: string;
  status: 'completed' | 'processing' | 'failed';
  blindSpotScore: number;
  createdAt: string;
  persona: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalScans: 0,
    criticalBlindSpots: 0,
    resolvedIssues: 0,
    riskScore: 0
  });
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading dashboard data
    setTimeout(() => {
      setStats({
        totalScans: 12,
        criticalBlindSpots: 4,
        resolvedIssues: 8,
        riskScore: 67
      });
      
      setRecentScans([
        {
          id: '1',
          title: 'E-commerce Growth Analysis',
          status: 'completed',
          blindSpotScore: 72,
          createdAt: '2 hours ago',
          persona: 'E-commerce'
        },
        {
          id: '2',
          title: 'SaaS Expansion Strategy',
          status: 'processing',
          blindSpotScore: 0,
          createdAt: '1 day ago',
          persona: 'SaaS Founder'
        },
        {
          id: '3',
          title: 'Content Creator Monetization',
          status: 'completed',
          blindSpotScore: 45,
          createdAt: '3 days ago',
          persona: 'Creator'
        }
      ]);
      
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-red-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-green-500';
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-muted rounded-lg"></div>
            <div className="h-64 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.user_metadata?.full_name || 'User'}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's your blind spot intelligence overview
          </p>
        </div>
        <Button 
          onClick={() => navigate('/scan')}
          className="gradient-primary hover-glow"
        >
          <Radar className="mr-2 h-4 w-4" />
          New Scan
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalScans}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.criticalBlindSpots}</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.resolvedIssues}</div>
            <p className="text-xs text-muted-foreground">
              Issues addressed
            </p>
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
            <TrendingUp className={`h-4 w-4 ${getRiskColor(stats.riskScore)}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getRiskColor(stats.riskScore)}`}>
              {stats.riskScore}%
            </div>
            <Progress value={stats.riskScore} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Scans */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Radar className="mr-2 h-5 w-5" />
              Recent Scans
            </CardTitle>
            <CardDescription>
              Your latest blind spot analyses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentScans.map((scan) => (
              <div key={scan.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(scan.status)}
                  <div>
                    <p className="font-medium text-sm">{scan.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {scan.persona} • {scan.createdAt}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {scan.status === 'completed' && (
                    <Badge 
                      variant={scan.blindSpotScore >= 70 ? "destructive" : scan.blindSpotScore >= 40 ? "secondary" : "default"}
                      className="text-xs"
                    >
                      {scan.blindSpotScore}% Risk
                    </Badge>
                  )}
                  {scan.status === 'processing' && (
                    <Badge variant="secondary" className="text-xs">
                      Processing...
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => navigate('/results')}
            >
              View All Results
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="mr-2 h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common tasks and tools
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full justify-start gradient-primary hover-glow" 
              onClick={() => navigate('/scan')}
            >
              <Radar className="mr-2 h-4 w-4" />
              Run New Blind Spot Scan
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start hover-glow"
              onClick={() => navigate('/probes')}
            >
              <Zap className="mr-2 h-4 w-4" />
              Setup Continuous Probes
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start hover-glow"
              onClick={() => navigate('/teams')}
            >
              <Users className="mr-2 h-4 w-4" />
              Invite Team Members
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start hover-glow"
              onClick={() => navigate('/analytics')}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              View Advanced Analytics
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}