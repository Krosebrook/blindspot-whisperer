import React, { useState } from 'react';
import { Globe, MessageSquare, BookOpen, Video, Mic, Users, TrendingUp, Star, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

export const ScrapingEnhancements = () => {
  const [scrapingProgress, setScrapingProgress] = useState({});
  const [isScrapingActive, setIsScrapingActive] = useState(false);
  const { toast } = useToast();

  const enhancedDataSources = [
    {
      name: 'Reddit',
      icon: MessageSquare,
      coverage: '2M+ posts',
      strength: 'Real user experiences',
      subreddits: ['Entrepreneur', 'startups', 'smallbusiness', 'freelance', 'YoutubeCreators'],
      patterns: [
        'I wish I knew...',
        'Biggest mistake was...',
        'Nobody told me...',
        'Should have started...',
        'Learned the hard way...'
      ],
      confidence: 94,
      status: 'active'
    },
    {
      name: 'HackerNews',
      icon: Globe,
      coverage: '500K+ discussions',
      strength: 'Technical & startup insights',
      subreddits: ['Ask HN', 'Show HN', 'Startup stories'],
      patterns: [
        'Lessons learned:',
        'What I wish I knew:',
        'Mistakes we made:',
        'Technical debt:',
        'Scaling challenges:'
      ],
      confidence: 91,
      status: 'active'
    },
    {
      name: 'Medium',
      icon: BookOpen,
      coverage: '1M+ articles',
      strength: 'Expert knowledge & case studies',
      subreddits: ['Startup Grind', 'The Startup', 'Better Marketing'],
      patterns: [
        'Case study:',
        'Lessons from failure:',
        'What went wrong:',
        'Hidden costs of:',
        'The truth about:'
      ],
      confidence: 88,
      status: 'active'
    },
    {
      name: 'YouTube',
      icon: Video,
      coverage: '100K+ transcripts',
      strength: 'Creator & entrepreneur stories',
      subreddits: ['Creator channels', 'Business vlogs', 'Failure stories'],
      patterns: [
        'Here\'s what I learned:',
        'Mistakes I made:',
        'What killed my channel:',
        'Algorithm changes:',
        'Burnout signs:'
      ],
      confidence: 85,
      status: 'beta'
    },
    {
      name: 'Podcasts',
      icon: Mic,
      coverage: '50K+ episodes',
      strength: 'Deep conversations & insights',
      subreddits: ['Business podcasts', 'Founder interviews', 'Industry shows'],
      patterns: [
        'In hindsight:',
        'What surprised me:',
        'Unexpected challenges:',
        'If I could go back:',
        'Warning signs:'
      ],
      confidence: 87,
      status: 'beta'
    },
    {
      name: 'LinkedIn',
      icon: Users,
      coverage: '10M+ posts',
      strength: 'Professional insights & career advice',
      subreddits: ['Professional posts', 'Industry leaders', 'Career advice'],
      patterns: [
        'Career lesson:',
        'Professional mistake:',
        'Leadership blind spot:',
        'Industry insight:',
        'Network effect:'
      ],
      confidence: 82,
      status: 'coming-soon'
    }
  ];

  const scrapingStrategies = [
    {
      title: 'Real-Time Monitoring',
      description: 'Continuous scanning for emerging blind spots',
      features: [
        '24/7 automated scraping',
        'Trending topic detection',
        'Alert system for new patterns',
        'Rate limit management'
      ],
      impact: 'Catch blind spots as they emerge'
    },
    {
      title: 'Semantic Analysis',
      description: 'AI-powered understanding of context and meaning',
      features: [
        'Natural language processing',
        'Sentiment analysis',
        'Context understanding',
        'Similar insight clustering'
      ],
      impact: 'Higher quality, relevant insights'
    },
    {
      title: 'Community Validation',
      description: 'Crowd-sourced verification of blind spot accuracy',
      features: [
        'User voting system',
        'Expert verification',
        'Community corrections',
        'Quality scoring'
      ],
      impact: 'Improved data quality and trust'
    },
    {
      title: 'Personalization Engine',
      description: 'Tailored blind spot discovery based on user profile',
      features: [
        'Industry-specific filtering',
        'Experience level matching',
        'Goal-oriented recommendations',
        'Learning path optimization'
      ],
      impact: 'More relevant, actionable insights'
    }
  ];

  const competitiveAdvantages = [
    {
      advantage: 'First Mover',
      description: 'No direct competitors in blind spot detection',
      moat: 'Category creation & brand recognition'
    },
    {
      advantage: 'Data Network Effects',
      description: 'More users = more blind spots = better insights',
      moat: 'Self-reinforcing data advantage'
    },
    {
      advantage: 'Multi-Source Intelligence',
      description: 'Comprehensive coverage across platforms',
      moat: 'Breadth and depth of insights'
    },
    {
      advantage: 'Real-Time Processing',
      description: 'Fresh insights from current conversations',
      moat: 'Speed and relevance advantage'
    }
  ];

  const simulateScrapingDemo = async () => {
    setIsScrapingActive(true);
    
    for (const source of enhancedDataSources) {
      if (source.status === 'active') {
        for (let progress = 0; progress <= 100; progress += 5) {
          setScrapingProgress(prev => ({
            ...prev,
            [source.name]: progress
          }));
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
    }

    toast({
      title: "Scraping Complete!",
      description: "Successfully gathered 1,247 new blind spots across all sources",
    });
    
    setIsScrapingActive(false);
  };

  return (
    <div className="space-y-12">
      
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Enhanced Multi-Source Intelligence</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Beyond Reddit: Comprehensive blind spot detection across 6 major platforms with AI-powered analysis
        </p>
      </div>

      {/* Data Sources Overview */}
      <div>
        <h2 className="text-2xl font-bold mb-8">Enhanced Data Sources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enhancedDataSources.map((source, index) => {
            const IconComponent = source.icon;
            const progress = scrapingProgress[source.name] || 0;
            
            return (
              <Card key={index} className={`hover:shadow-lg transition-all ${source.status === 'active' ? 'ring-2 ring-primary/20' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${source.status === 'active' ? 'bg-primary/10' : 'bg-muted'}`}>
                        <IconComponent className={`w-6 h-6 ${source.status === 'active' ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{source.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{source.coverage}</p>
                      </div>
                    </div>
                    <Badge variant={source.status === 'active' ? 'default' : source.status === 'beta' ? 'secondary' : 'outline'}>
                      {source.status === 'coming-soon' ? 'Soon' : source.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm font-medium mb-2">Strength: {source.strength}</div>
                    <div className="text-sm text-muted-foreground">Confidence: {source.confidence}%</div>
                  </div>

                  {isScrapingActive && source.status === 'active' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Scraping Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="w-full" />
                    </div>
                  )}

                  <div>
                    <div className="text-sm font-medium mb-2">Key Patterns:</div>
                    <div className="space-y-1">
                      {source.patterns.slice(0, 3).map((pattern, idx) => (
                        <div key={idx} className="text-xs bg-muted/50 p-2 rounded">
                          "{pattern}"
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <Button onClick={simulateScrapingDemo} disabled={isScrapingActive} size="lg">
            {isScrapingActive ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                Scraping in Progress...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                Demo Live Scraping
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Enhancement Strategies */}
      <div>
        <h2 className="text-2xl font-bold mb-8">Advanced Enhancement Strategies</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scrapingStrategies.map((strategy, index) => (
            <Card key={index} className="hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-primary mr-2" />
                  {strategy.title}
                </CardTitle>
                <p className="text-muted-foreground">{strategy.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium mb-2">Key Features:</div>
                  <div className="space-y-1">
                    {strategy.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center text-sm">
                        <Star className="w-3 h-3 text-yellow-500 mr-2 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="text-sm font-medium text-primary">Impact: {strategy.impact}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Competitive Advantages */}
      <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-8">Competitive Moats & Advantages</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {competitiveAdvantages.map((item, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 text-primary mr-2" />
                  {item.advantage}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-primary">Moat: {item.moat}</span>
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Implementation Roadmap */}
      <div>
        <h2 className="text-2xl font-bold text-center mb-8">Implementation Roadmap</h2>
        <div className="space-y-6">
          {[
            { phase: 'Phase 1', title: 'Reddit + HackerNews + Medium', timeline: 'Week 1-2', status: 'ready' },
            { phase: 'Phase 2', title: 'YouTube + Podcast Integration', timeline: 'Week 3-4', status: 'development' },
            { phase: 'Phase 3', title: 'LinkedIn + AI Enhancement', timeline: 'Week 5-6', status: 'planned' },
            { phase: 'Phase 4', title: 'Real-time + Personalization', timeline: 'Week 7-8', status: 'planned' }
          ].map((phase, index) => (
            <Card key={index} className={`${phase.status === 'ready' ? 'bg-primary/5' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Badge variant={phase.status === 'ready' ? 'default' : phase.status === 'development' ? 'secondary' : 'outline'}>
                      {phase.phase}
                    </Badge>
                    <div>
                      <h3 className="font-semibold">{phase.title}</h3>
                      <p className="text-sm text-muted-foreground">{phase.timeline}</p>
                    </div>
                  </div>
                  <Badge variant={phase.status === 'ready' ? 'default' : 'outline'}>
                    {phase.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};