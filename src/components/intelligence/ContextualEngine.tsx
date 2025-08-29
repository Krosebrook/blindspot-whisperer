import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, Target, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface BlindSpotAnalysis {
  id: string;
  insight: string;
  confidence: number;
  relevanceScore: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  source: string;
  action: string;
  timeframe: string;
  riskLevel: number;
  industrySpecific: boolean;
  contextFactors: string[];
}

interface ContextualAnalysis {
  totalBlindSpots: number;
  criticalCount: number;
  averageConfidence: number;
  topCategories: string[];
  contextualRelevance: number;
}

interface ContextualEngineProps {
  intent: any;
  context: any;
  deepDive: any;
  onAnalysisComplete: (analysis: BlindSpotAnalysis[]) => void;
}

export const ContextualEngine = ({ intent, context, deepDive, onAnalysisComplete }: ContextualEngineProps) => {
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('');
  const [blindSpots, setBlindSpots] = useState<BlindSpotAnalysis[]>([]);
  const [contextualAnalysis, setContextualAnalysis] = useState<ContextualAnalysis | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  // Semantic analysis weights based on best practices
  const CONTEXT_WEIGHTS = {
    industryVertical: 0.47,
    companyStage: 0.23,
    businessModel: 0.18,
    geographicMarket: 0.08,
    riskTolerance: 0.04
  };

  // Comprehensive blind spot database with contextual metadata
  const getBlindSpotDatabase = () => {
    return [
      // Startup Launch Blind Spots
      {
        id: 'market-validation-timing',
        insight: 'Many founders validate their product idea but not the timing of market entry',
        confidence: 87,
        category: 'Market Validation',
        source: 'YC Startup School Analysis',
        action: 'Conduct timing-specific market research using Google Trends, industry reports, and customer interviews focused on "when" not just "what"',
        timeframe: '2-4 weeks',
        riskLevel: 85,
        applicableStages: ['Idea Stage', 'MVP'],
        industries: ['Technology', 'SaaS', 'E-commerce'],
        personas: ['startup'],
        contextFactors: ['early-stage', 'tech-focused', 'b2b-model'],
        scenarios: ['Finding and validating the right market opportunity'],
        risks: ['Market risk - No demand for the product']
      },
      {
        id: 'technical-debt-early',
        insight: 'Technical decisions made for speed in early stages create exponential costs later',
        confidence: 92,
        category: 'Technical Strategy',
        source: 'Stack Overflow Developer Survey',
        action: 'Establish technical debt tracking system and allocate 20% of development time to refactoring from day one',
        timeframe: 'Ongoing',
        riskLevel: 78,
        applicableStages: ['MVP', 'Early Traction'],
        industries: ['Technology', 'SaaS', 'AI/ML'],
        personas: ['startup'],
        contextFactors: ['technical-product', 'rapid-scaling'],
        scenarios: ['Building an MVP that users actually want'],
        risks: ['Technical risk - Unable to build the solution']
      },
      {
        id: 'founder-equity-splits',
        insight: 'Equal equity splits among founders often ignore contribution differences and create future conflicts',
        confidence: 89,
        category: 'Legal & Equity',
        source: 'Founder Equity Analysis Study',
        action: 'Use dynamic equity splits based on contributions, with vesting schedules and clear role definitions',
        timeframe: '1-2 weeks',
        riskLevel: 82,
        applicableStages: ['Idea Stage', 'MVP'],
        industries: ['all'],
        personas: ['startup'],
        contextFactors: ['multi-founder', 'early-stage'],
        scenarios: ['Assembling the right founding team'],
        risks: ['Team risk - Co-founder conflicts or departures']
      },

      // Content Creator Blind Spots
      {
        id: 'platform-dependency-risk',
        insight: 'Creators often build their entire business on platforms they don\'t control, risking algorithm changes',
        confidence: 94,
        category: 'Platform Strategy',
        source: 'Creator Economy Report 2024',
        action: 'Diversify across 3+ platforms and build owned media channels (email list, website) from day one',
        timeframe: '1-2 months',
        riskLevel: 91,
        applicableStages: ['Planning', 'Early Stage'],
        industries: ['Content Creation', 'Influencer Marketing'],
        personas: ['creator'],
        contextFactors: ['platform-dependent', 'social-media-focus'],
        scenarios: ['Creating content that stands out in saturated markets'],
        risks: ['Platform risk - Dependence on third-party platforms']
      },
      {
        id: 'audience-monetization-mismatch',
        insight: 'Many creators build large audiences but struggle with monetization due to audience-product mismatch',
        confidence: 86,
        category: 'Monetization Strategy',
        source: 'Creator Monetization Analysis',
        action: 'Define your monetization strategy before growing your audience, then create content that attracts paying customers',
        timeframe: '2-4 weeks',
        riskLevel: 74,
        applicableStages: ['Planning', 'Early Stage'],
        industries: ['Content Creation', 'Education'],
        personas: ['creator'],
        contextFactors: ['audience-building', 'monetization-focus'],
        scenarios: ['Monetizing without alienating audience'],
        risks: ['Monetization risk - Unable to convert audience to revenue']
      },

      // Business Scaling Blind Spots
      {
        id: 'premature-scaling-operations',
        insight: 'Companies often scale operations before achieving operational excellence at current size',
        confidence: 88,
        category: 'Operations',
        source: 'Scaling Excellence Research',
        action: 'Achieve 90%+ process efficiency and customer satisfaction at current scale before expanding',
        timeframe: '3-6 months',
        riskLevel: 79,
        applicableStages: ['Growth Stage', 'Scale Stage'],
        industries: ['all'],
        personas: ['business'],
        contextFactors: ['rapid-growth', 'operational-complexity'],
        scenarios: ['Maintaining quality while increasing volume'],
        risks: ['Operational risk - Systems breaking under increased load']
      },
      {
        id: 'middle-management-gap',
        insight: 'Growing companies often promote individual contributors to management without leadership training',
        confidence: 91,
        category: 'Team Management',
        source: 'Harvard Business Review Leadership Study',
        action: 'Implement leadership development programs and hire experienced managers for key roles during scaling',
        timeframe: '2-3 months',
        riskLevel: 84,
        applicableStages: ['Growth Stage', 'Scale Stage'],
        industries: ['all'],
        personas: ['business'],
        contextFactors: ['team-growth', 'management-layers'],
        scenarios: ['Hiring and managing a growing team'],
        risks: ['Team risk - Key personnel leaving or cultural issues']
      },

      // Cross-Category Universal Blind Spots
      {
        id: 'survivorship-bias-learning',
        insight: 'People learn primarily from success stories, missing critical lessons from failures',
        confidence: 93,
        category: 'Decision Making',
        source: 'Cognitive Bias Research',
        action: 'Actively seek out and study failure case studies in your industry, join failure-focused communities',
        timeframe: 'Ongoing',
        riskLevel: 72,
        applicableStages: ['all'],
        industries: ['all'],
        personas: ['startup', 'business', 'creator', 'life'],
        contextFactors: ['learning-focused', 'decision-making'],
        scenarios: ['all'],
        risks: ['Strategic risk - Poor decision making based on incomplete information']
      },
      {
        id: 'sunk-cost-persistence',
        insight: 'Entrepreneurs often continue failing strategies due to previous investment rather than objective analysis',
        confidence: 89,
        category: 'Decision Making',
        source: 'Behavioral Economics Research',
        action: 'Establish predetermined decision points and objective metrics for pivoting or continuing strategies',
        timeframe: '1-2 weeks',
        riskLevel: 77,
        applicableStages: ['all'],
        industries: ['all'],
        personas: ['startup', 'business', 'creator'],
        contextFactors: ['strategic-decisions', 'resource-allocation'],
        scenarios: ['all'],
        risks: ['Strategic risk - Continuing failing strategies']
      }
    ];
  };

  // Advanced semantic matching algorithm
  const calculateContextualRelevance = (blindSpot: any, userProfile: any) => {
    let relevanceScore = 0;
    let confidenceFactors: string[] = [];

    // Industry matching (47% weight)
    if (blindSpot.industries.includes('all') || blindSpot.industries.includes(userProfile.context.industry)) {
      relevanceScore += CONTEXT_WEIGHTS.industryVertical * 100;
      confidenceFactors.push('industry-match');
    }

    // Stage matching (23% weight)
    if (blindSpot.applicableStages.includes('all') || blindSpot.applicableStages.includes(userProfile.context.companyStage)) {
      relevanceScore += CONTEXT_WEIGHTS.companyStage * 100;
      confidenceFactors.push('stage-match');
    }

    // Persona matching (18% weight equivalent)
    if (blindSpot.personas.includes(userProfile.intent.persona)) {
      relevanceScore += CONTEXT_WEIGHTS.businessModel * 100;
      confidenceFactors.push('persona-match');
    }

    // Geographic/market matching (8% weight)
    if (userProfile.context.geographicMarket === 'global' || blindSpot.geographicRelevance !== 'local') {
      relevanceScore += CONTEXT_WEIGHTS.geographicMarket * 100;
      confidenceFactors.push('market-match');
    }

    // Scenario/challenge matching (additional relevance boost)
    const scenarioMatch = userProfile.deepDive.specificScenarios.some((scenario: string) =>
      blindSpot.scenarios.includes(scenario)
    );
    if (scenarioMatch) {
      relevanceScore += 15;
      confidenceFactors.push('scenario-match');
    }

    // Risk area matching
    const riskMatch = userProfile.deepDive.riskAreas.some((risk: string) =>
      blindSpot.risks.includes(risk)
    );
    if (riskMatch) {
      relevanceScore += 10;
      confidenceFactors.push('risk-match');
    }

    // Risk tolerance adjustment
    const riskTolerance = userProfile.context.riskTolerance;
    if (blindSpot.riskLevel > 80 && riskTolerance < 30) {
      relevanceScore -= 20; // Reduce relevance for high-risk items when user is risk-averse
    } else if (blindSpot.riskLevel < 50 && riskTolerance > 70) {
      relevanceScore -= 10; // Reduce relevance for low-risk items when user is risk-seeking
    }

    return {
      score: Math.min(100, Math.max(0, relevanceScore)),
      factors: confidenceFactors
    };
  };

  // Priority calculation based on impact and urgency
  const calculatePriority = (blindSpot: any, relevanceScore: number, userProfile: any): 'critical' | 'high' | 'medium' | 'low' => {
    const impactScore = blindSpot.riskLevel;
    const urgencyScore = userProfile.context.timeline === 'urgent' ? 100 : 
                        userProfile.context.timeline === 'short' ? 75 : 
                        userProfile.context.timeline === 'medium' ? 50 : 25;
    
    const priorityScore = (impactScore * 0.6) + (urgencyScore * 0.2) + (relevanceScore * 0.2);

    if (priorityScore >= 85) return 'critical';
    if (priorityScore >= 70) return 'high';
    if (priorityScore >= 50) return 'medium';
    return 'low';
  };

  const runSemanticAnalysis = async () => {
    const database = getBlindSpotDatabase();
    const userProfile = { intent, context, deepDive };
    
    setCurrentPhase('Analyzing contextual factors...');
    setAnalysisProgress(20);
    
    // Simulate processing delay for UX
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setCurrentPhase('Calculating relevance scores...');
    setAnalysisProgress(40);
    
    const analyzedBlindSpots: BlindSpotAnalysis[] = database.map(blindSpot => {
      const relevanceAnalysis = calculateContextualRelevance(blindSpot, userProfile);
      const priority = calculatePriority(blindSpot, relevanceAnalysis.score, userProfile);
      
      return {
        ...blindSpot,
        relevanceScore: relevanceAnalysis.score,
        priority,
        industrySpecific: blindSpot.industries.includes(context.industry),
        contextFactors: relevanceAnalysis.factors
      };
    });

    await new Promise(resolve => setTimeout(resolve, 800));
    
    setCurrentPhase('Ranking and filtering results...');
    setAnalysisProgress(70);
    
    // Filter and sort by relevance
    const relevantBlindSpots = analyzedBlindSpots
      .filter(bs => bs.relevanceScore >= 40) // Only include reasonably relevant blind spots
      .sort((a, b) => {
        // Sort by priority first, then relevance, then confidence
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        if (a.relevanceScore !== b.relevanceScore) {
          return b.relevanceScore - a.relevanceScore;
        }
        return b.confidence - a.confidence;
      })
      .slice(0, 12); // Limit to top 12 most relevant blind spots

    await new Promise(resolve => setTimeout(resolve, 500));
    
    setCurrentPhase('Generating insights...');
    setAnalysisProgress(90);
    
    // Calculate contextual analysis
    const analysis: ContextualAnalysis = {
      totalBlindSpots: relevantBlindSpots.length,
      criticalCount: relevantBlindSpots.filter(bs => bs.priority === 'critical').length,
      averageConfidence: relevantBlindSpots.reduce((sum, bs) => sum + bs.confidence, 0) / relevantBlindSpots.length,
      topCategories: [...new Set(relevantBlindSpots.slice(0, 6).map(bs => bs.category))],
      contextualRelevance: relevantBlindSpots.reduce((sum, bs) => sum + bs.relevanceScore, 0) / relevantBlindSpots.length
    };

    setBlindSpots(relevantBlindSpots);
    setContextualAnalysis(analysis);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setCurrentPhase('Analysis complete');
    setAnalysisProgress(100);
    setIsComplete(true);
    
    // Notify parent component
    onAnalysisComplete(relevantBlindSpots);
  };

  useEffect(() => {
    runSemanticAnalysis();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-destructive';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-muted-foreground';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Analysis Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Brain className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Contextual Intelligence Engine</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Analyzing {intent.title.toLowerCase()} in {context.industry} using advanced semantic matching
        </p>
      </div>

      {/* Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Analysis Progress
          </CardTitle>
          <CardDescription>
            {currentPhase}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={analysisProgress} className="h-3" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Processing contextual factors</span>
            <span>{analysisProgress}% complete</span>
          </div>
        </CardContent>
      </Card>

      {/* Contextual Analysis Summary */}
      {contextualAnalysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <div>
                  <div className="text-2xl font-bold">{contextualAnalysis.criticalCount}</div>
                  <div className="text-sm text-muted-foreground">Critical Issues</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-2xl font-bold">{contextualAnalysis.totalBlindSpots}</div>
                  <div className="text-sm text-muted-foreground">Total Insights</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">{Math.round(contextualAnalysis.averageConfidence)}%</div>
                  <div className="text-sm text-muted-foreground">Avg Confidence</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">{Math.round(contextualAnalysis.contextualRelevance)}%</div>
                  <div className="text-sm text-muted-foreground">Relevance Score</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analysis Results Preview */}
      {isComplete && blindSpots.length > 0 && (
        <div className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Analysis complete! Found {blindSpots.length} contextually relevant blind spots with {Math.round(contextualAnalysis?.contextualRelevance || 0)}% average relevance.
            </AlertDescription>
          </Alert>

          {/* Top Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Key Focus Areas</CardTitle>
              <CardDescription>
                Primary categories identified for your situation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {contextualAnalysis?.topCategories.map(category => (
                  <Badge key={category} variant="secondary">
                    {category}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Preview of Top Blind Spots */}
          <Card>
            <CardHeader>
              <CardTitle>Preview: Top Priority Insights</CardTitle>
              <CardDescription>
                Your most critical blind spots based on contextual analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {blindSpots.slice(0, 3).map(blindSpot => (
                <div key={blindSpot.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getPriorityBadgeVariant(blindSpot.priority)}>
                        {blindSpot.priority}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{blindSpot.confidence}% confidence</span>
                    </div>
                    <h4 className="font-medium mb-1">{blindSpot.insight}</h4>
                    <p className="text-sm text-muted-foreground">{blindSpot.category}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{Math.round(blindSpot.relevanceScore)}%</div>
                    <div className="text-xs text-muted-foreground">relevance</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};