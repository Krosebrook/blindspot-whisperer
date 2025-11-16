import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Play, Pause, CheckCircle, XCircle, TrendingUp, Trophy } from 'lucide-react'
import { abTestService, ABTest } from '@/lib/abTestService'
import { botAnalyticsService, ThresholdConfig } from '@/lib/botAnalyticsService'
import { toast } from 'sonner'

export function ABTestManager() {
  const [tests, setTests] = useState<ABTest[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newTest, setNewTest] = useState({
    name: '',
    controlChallenge: 35,
    controlBlock: 60,
    variantChallenge: 40,
    variantBlock: 65,
    trafficSplit: 50,
    minSampleSize: 100,
  })

  useEffect(() => {
    loadTests()
  }, [])

  const loadTests = () => {
    setTests(abTestService.getTests())
  }

  const createTest = () => {
    if (!newTest.name) {
      toast.error('Please enter a test name')
      return
    }

    const control: ThresholdConfig = {
      challenge: newTest.controlChallenge,
      block: newTest.controlBlock,
    }

    const variant: ThresholdConfig = {
      challenge: newTest.variantChallenge,
      block: newTest.variantBlock,
    }

    abTestService.createTest(
      newTest.name,
      control,
      variant,
      newTest.trafficSplit,
      newTest.minSampleSize
    )

    toast.success('A/B test created')
    setIsCreateDialogOpen(false)
    setNewTest({
      name: '',
      controlChallenge: 35,
      controlBlock: 60,
      variantChallenge: 40,
      variantBlock: 65,
      trafficSplit: 50,
      minSampleSize: 100,
    })
    loadTests()
  }

  const toggleTestStatus = (testId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active'
    abTestService.updateTestStatus(testId, newStatus)
    toast.success(`Test ${newStatus}`)
    loadTests()
  }

  const completeTest = (testId: string) => {
    abTestService.updateTestStatus(testId, 'completed')
    toast.success('Test completed')
    loadTests()
  }

  const applyWinner = (test: ABTest, winner: 'control' | 'variant') => {
    const thresholds = test.variants[winner]
    botAnalyticsService.updateThresholds(thresholds)
    toast.success(`Applied ${winner} thresholds to production`)
  }

  const deleteTest = (testId: string) => {
    if (window.confirm('Delete this test?')) {
      abTestService.deleteTest(testId)
      toast.success('Test deleted')
      loadTests()
    }
  }

  const formatPercent = (num: number, total: number) => {
    if (total === 0) return '0%'
    return `${((num / total) * 100).toFixed(1)}%`
  }

  return (
    <div className="space-y-6">
      {/* Create Test Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">A/B Tests</h3>
          <p className="text-sm text-muted-foreground">
            Test different threshold configurations to optimize performance
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Test
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create A/B Test</DialogTitle>
              <DialogDescription>
                Test different threshold configurations to find the optimal balance
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label>Test Name</Label>
                <Input
                  placeholder="e.g., Lower thresholds test"
                  value={newTest.name}
                  onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Control (Current)</h4>
                  <div className="space-y-2">
                    <Label>Challenge: {newTest.controlChallenge}</Label>
                    <Slider
                      value={[newTest.controlChallenge]}
                      onValueChange={([value]) => setNewTest({ ...newTest, controlChallenge: value })}
                      min={0}
                      max={100}
                      step={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Block: {newTest.controlBlock}</Label>
                    <Slider
                      value={[newTest.controlBlock]}
                      onValueChange={([value]) => setNewTest({ ...newTest, controlBlock: value })}
                      min={0}
                      max={100}
                      step={5}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Variant (Testing)</h4>
                  <div className="space-y-2">
                    <Label>Challenge: {newTest.variantChallenge}</Label>
                    <Slider
                      value={[newTest.variantChallenge]}
                      onValueChange={([value]) => setNewTest({ ...newTest, variantChallenge: value })}
                      min={0}
                      max={100}
                      step={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Block: {newTest.variantBlock}</Label>
                    <Slider
                      value={[newTest.variantBlock]}
                      onValueChange={([value]) => setNewTest({ ...newTest, variantBlock: value })}
                      min={0}
                      max={100}
                      step={5}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Traffic Split: {newTest.trafficSplit}% in variant</Label>
                <Slider
                  value={[newTest.trafficSplit]}
                  onValueChange={([value]) => setNewTest({ ...newTest, trafficSplit: value })}
                  min={10}
                  max={90}
                  step={10}
                />
              </div>

              <div className="space-y-2">
                <Label>Minimum Sample Size per Variant</Label>
                <Input
                  type="number"
                  value={newTest.minSampleSize}
                  onChange={(e) => setNewTest({ ...newTest, minSampleSize: parseInt(e.target.value) || 100 })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createTest}>Create Test</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tests List */}
      {tests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No A/B tests created yet</p>
            <p className="text-sm mt-1">Create a test to compare different threshold configurations</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tests.map(test => {
            const recommendation = abTestService.getWinnerRecommendation(test)
            const fpSig = abTestService.calculateSignificance(test, 'falsePositives')

            return (
              <Card key={test.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle>{test.name}</CardTitle>
                      <Badge variant={
                        test.status === 'active' ? 'default' :
                        test.status === 'completed' ? 'secondary' : 'outline'
                      }>
                        {test.status}
                      </Badge>
                      {recommendation.winner !== 'inconclusive' && (
                        <Badge variant="default" className="gap-1">
                          <Trophy className="h-3 w-3" />
                          {recommendation.winner} wins
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {test.status !== 'completed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleTestStatus(test.id, test.status)}
                        >
                          {test.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                      )}
                      {test.status === 'active' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => completeTest(test.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTest(test.id)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    Started {new Date(test.startDate).toLocaleDateString()} • 
                    Traffic split: {test.trafficSplit}% variant
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Results Comparison */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Control */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Control</h4>
                        <Badge variant="outline">
                          Challenge: {test.variants.control.challenge}, Block: {test.variants.control.block}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Attempts:</span>
                          <span className="font-medium">{test.results.control.attempts}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Allowed:</span>
                          <span>{formatPercent(test.results.control.allowed, test.results.control.attempts)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Challenged:</span>
                          <span>{formatPercent(test.results.control.challenged, test.results.control.attempts)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Blocked:</span>
                          <span>{formatPercent(test.results.control.blocked, test.results.control.attempts)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">False Positives:</span>
                          <span className="font-medium text-red-500">
                            {formatPercent(test.results.control.falsePositives, test.results.control.attempts)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Avg Score:</span>
                          <span>{test.results.control.avgBotScore.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Variant */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Variant</h4>
                        <Badge variant="outline">
                          Challenge: {test.variants.variant.challenge}, Block: {test.variants.variant.block}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Attempts:</span>
                          <span className="font-medium">{test.results.variant.attempts}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Allowed:</span>
                          <span>{formatPercent(test.results.variant.allowed, test.results.variant.attempts)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Challenged:</span>
                          <span>{formatPercent(test.results.variant.challenged, test.results.variant.attempts)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Blocked:</span>
                          <span>{formatPercent(test.results.variant.blocked, test.results.variant.attempts)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">False Positives:</span>
                          <span className="font-medium text-red-500">
                            {formatPercent(test.results.variant.falsePositives, test.results.variant.attempts)} {fpSig.stars}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Avg Score:</span>
                          <span>{test.results.variant.avgBotScore.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recommendation */}
                  {recommendation.winner !== 'inconclusive' && (
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4" />
                        <span className="font-medium">Recommendation</span>
                        <Badge variant="secondary">{recommendation.confidence.toFixed(0)}% confidence</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{recommendation.reason}</p>
                      {test.status === 'completed' && (
                        <Button
                          size="sm"
                          onClick={() => applyWinner(test, recommendation.winner as 'control' | 'variant')}
                        >
                          Apply {recommendation.winner} to Production
                        </Button>
                      )}
                    </div>
                  )}

                  {recommendation.winner === 'inconclusive' && test.results.control.attempts < test.minSampleSize && (
                    <div className="p-4 bg-muted rounded-lg text-sm text-muted-foreground">
                      Need {test.minSampleSize - test.results.control.attempts} more control attempts and{' '}
                      {test.minSampleSize - test.results.variant.attempts} more variant attempts for conclusive results
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
