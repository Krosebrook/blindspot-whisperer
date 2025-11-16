import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Activity, AlertTriangle, CheckCircle, XCircle, TrendingUp, Settings, Database } from 'lucide-react'
import { botAnalyticsService, type BotAttempt, type ThresholdConfig } from '@/lib/botAnalyticsService'
import { toast } from 'sonner'

export default function BotAnalytics() {
  const [attempts, setAttempts] = useState<BotAttempt[]>([])
  const [thresholds, setThresholds] = useState<ThresholdConfig>(botAnalyticsService.getThresholds())
  const [stats, setStats] = useState({
    total: 0,
    allowed: 0,
    challenged: 0,
    blocked: 0,
    avgScore: 0,
    falsePositives: 0
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const allAttempts = botAnalyticsService.getAttempts()
    setAttempts(allAttempts)
    
    // Calculate stats
    const total = allAttempts.length
    const allowed = allAttempts.filter(a => a.recommendation === 'allow').length
    const challenged = allAttempts.filter(a => a.recommendation === 'challenge').length
    const blocked = allAttempts.filter(a => a.recommendation === 'block').length
    const avgScore = total > 0 ? allAttempts.reduce((sum, a) => sum + a.score, 0) / total : 0
    const falsePositives = allAttempts.filter(a => a.isFalsePositive).length

    setStats({ total, allowed, challenged, blocked, avgScore, falsePositives })
  }

  const handleThresholdChange = (key: 'challenge' | 'block', value: number[]) => {
    const newThresholds = { ...thresholds, [key]: value[0] }
    setThresholds(newThresholds)
  }

  const saveThresholds = () => {
    botAnalyticsService.updateThresholds(thresholds)
    toast.success('Thresholds updated successfully')
  }

  const resetThresholds = () => {
    const defaultThresholds = { challenge: 35, block: 60 }
    setThresholds(defaultThresholds)
    botAnalyticsService.updateThresholds(defaultThresholds)
    toast.success('Thresholds reset to defaults')
  }

  const markFalsePositive = (id: string, isFalsePositive: boolean) => {
    botAnalyticsService.markFalsePositive(id, isFalsePositive)
    loadData()
    toast.success(isFalsePositive ? 'Marked as false positive' : 'Unmarked as false positive')
  }

  const clearData = () => {
    if (window.confirm('Are you sure you want to clear all analytics data?')) {
      botAnalyticsService.clearAttempts()
      loadData()
      toast.success('All data cleared')
    }
  }

  // Prepare chart data
  const scoreDistribution = Array.from({ length: 10 }, (_, i) => {
    const min = i * 10
    const max = (i + 1) * 10
    const count = attempts.filter(a => a.score >= min && a.score < max).length
    return {
      range: `${min}-${max}`,
      count,
      falsePositives: attempts.filter(a => a.score >= min && a.score < max && a.isFalsePositive).length
    }
  })

  const timeSeriesData = attempts
    .slice(-20)
    .map((a, i) => ({
      attempt: i + 1,
      score: a.score,
      confidence: a.confidence
    }))

  const recommendationData = [
    { name: 'Allowed', value: stats.allowed, color: 'hsl(var(--chart-1))' },
    { name: 'Challenged', value: stats.challenged, color: 'hsl(var(--chart-2))' },
    { name: 'Blocked', value: stats.blocked, color: 'hsl(var(--chart-3))' }
  ]

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Bot Analytics Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Monitor bot detection performance and tune detection thresholds
            </p>
          </div>
          <Button variant="destructive" onClick={clearData}>
            <Database className="h-4 w-4 mr-2" />
            Clear Data
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader className="pb-2">
              <CardDescription>Total Attempts</CardDescription>
              <CardTitle className="text-3xl">{stats.total}</CardTitle>
            </CardHeader>
            <CardContent>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader className="pb-2">
              <CardDescription>Allowed</CardDescription>
              <CardTitle className="text-3xl text-green-500">{stats.allowed}</CardTitle>
            </CardHeader>
            <CardContent>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader className="pb-2">
              <CardDescription>Challenged</CardDescription>
              <CardTitle className="text-3xl text-yellow-500">{stats.challenged}</CardTitle>
            </CardHeader>
            <CardContent>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader className="pb-2">
              <CardDescription>Blocked</CardDescription>
              <CardTitle className="text-3xl text-red-500">{stats.blocked}</CardTitle>
            </CardHeader>
            <CardContent>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader className="pb-2">
              <CardDescription>False Positives</CardDescription>
              <CardTitle className="text-3xl text-orange-500">{stats.falsePositives}</CardTitle>
            </CardHeader>
            <CardContent>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="charts" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="charts">
              <TrendingUp className="h-4 w-4 mr-2" />
              Visualizations
            </TabsTrigger>
            <TabsTrigger value="thresholds">
              <Settings className="h-4 w-4 mr-2" />
              Threshold Tuning
            </TabsTrigger>
            <TabsTrigger value="attempts">
              <Activity className="h-4 w-4 mr-2" />
              Attempt Log
            </TabsTrigger>
          </TabsList>

          {/* Charts Tab */}
          <TabsContent value="charts" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Score Distribution */}
              <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle>Score Distribution</CardTitle>
                  <CardDescription>Bot scores across all attempts</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={scoreDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="range" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="count" fill="hsl(var(--primary))" name="Total" />
                      <Bar dataKey="falsePositives" fill="hsl(var(--destructive))" name="False Positives" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Recommendation Breakdown */}
              <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle>Recommendation Breakdown</CardTitle>
                  <CardDescription>Distribution of bot detection outcomes</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={recommendationData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value, percent }) => 
                          `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {recommendationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Time Series */}
              <Card className="border-border/50 bg-card/50 backdrop-blur lg:col-span-2">
                <CardHeader>
                  <CardTitle>Recent Attempts Timeline</CardTitle>
                  <CardDescription>Last 20 authentication attempts</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="attempt" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" name="Bot Score" />
                      <Line type="monotone" dataKey="confidence" stroke="hsl(var(--chart-2))" name="Confidence" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Threshold Tuning Tab */}
          <TabsContent value="thresholds" className="space-y-6 mt-6">
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Detection Thresholds</CardTitle>
                <CardDescription>
                  Adjust bot detection thresholds to balance security and user experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Challenge Threshold */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="challenge-threshold" className="text-base font-medium">
                      Challenge Threshold (CAPTCHA)
                    </Label>
                    <Badge variant="secondary">{thresholds.challenge}</Badge>
                  </div>
                  <Slider
                    id="challenge-threshold"
                    min={0}
                    max={100}
                    step={5}
                    value={[thresholds.challenge]}
                    onValueChange={(value) => handleThresholdChange('challenge', value)}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">
                    Scores at or above this threshold will trigger CAPTCHA verification
                  </p>
                </div>

                {/* Block Threshold */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="block-threshold" className="text-base font-medium">
                      Block Threshold
                    </Label>
                    <Badge variant="destructive">{thresholds.block}</Badge>
                  </div>
                  <Slider
                    id="block-threshold"
                    min={0}
                    max={100}
                    step={5}
                    value={[thresholds.block]}
                    onValueChange={(value) => handleThresholdChange('block', value)}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">
                    Scores at or above this threshold will be blocked immediately
                  </p>
                </div>

                {/* Recommendation Zones */}
                <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-3">Current Zones</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">0 - {thresholds.challenge - 1}</span>
                      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                        Allow
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{thresholds.challenge} - {thresholds.block - 1}</span>
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                        Challenge (CAPTCHA)
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{thresholds.block} - 100</span>
                      <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                        Block
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button onClick={saveThresholds} className="flex-1">
                    Save Thresholds
                  </Button>
                  <Button onClick={resetThresholds} variant="outline">
                    Reset to Defaults
                  </Button>
                </div>

                {/* Impact Analysis */}
                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <h4 className="font-medium">Impact with Current Settings</h4>
                  <div className="grid grid-cols-3 gap-4 mt-3">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-500">
                        {attempts.filter(a => a.score < thresholds.challenge).length}
                      </p>
                      <p className="text-xs text-muted-foreground">Would Allow</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-500">
                        {attempts.filter(a => a.score >= thresholds.challenge && a.score < thresholds.block).length}
                      </p>
                      <p className="text-xs text-muted-foreground">Would Challenge</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-500">
                        {attempts.filter(a => a.score >= thresholds.block).length}
                      </p>
                      <p className="text-xs text-muted-foreground">Would Block</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attempts Log Tab */}
          <TabsContent value="attempts" className="space-y-6 mt-6">
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Authentication Attempts</CardTitle>
                <CardDescription>
                  Detailed log of all authentication attempts with bot scores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {attempts.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No attempts recorded yet
                    </p>
                  ) : (
                    attempts.slice().reverse().map((attempt) => (
                      <div
                        key={attempt.id}
                        className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                              <Badge
                                variant={
                                  attempt.recommendation === 'allow'
                                    ? 'outline'
                                    : attempt.recommendation === 'challenge'
                                    ? 'secondary'
                                    : 'destructive'
                                }
                              >
                                {attempt.recommendation.toUpperCase()}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(attempt.timestamp).toLocaleString()}
                              </span>
                              {attempt.isFalsePositive && (
                                <Badge variant="outline" className="bg-orange-500/10 text-orange-500">
                                  False Positive
                                </Badge>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Score: </span>
                                <span className="font-medium">{attempt.score}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Confidence: </span>
                                <span className="font-medium">{attempt.confidence}%</span>
                              </div>
                            </div>

                            {attempt.triggers.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs text-muted-foreground mb-1">Triggers:</p>
                                <div className="flex flex-wrap gap-1">
                                  {attempt.triggers.map((trigger, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {trigger}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={attempt.isFalsePositive ? 'default' : 'outline'}
                              onClick={() => markFalsePositive(attempt.id, !attempt.isFalsePositive)}
                            >
                              {attempt.isFalsePositive ? 'Unmark' : 'Mark False Positive'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
