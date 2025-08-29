import React, { useState, useEffect } from 'react';
import { Search, Target, TrendingUp, Users, DollarSign, Shield, Lightbulb, Clock, Zap, Globe, BookOpen, Mic, Video, MessageSquare, AlertTriangle, Star, CheckCircle, ArrowRight, Share2, Download, BarChart3, Rocket } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { EnhancedFeatures } from "@/components/EnhancedFeatures";
import { ScrapingEnhancements } from "@/components/ScrapingEnhancements";

export const BlindSpotRadar = () => {
  const [userInput, setUserInput] = useState('');
  const [selectedPersona, setSelectedPersona] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState([]);
  const [scanProgress, setScanProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('input');
  const { toast } = useToast();

  // Enhanced blind spot database with multiple sources
  const blindSpots = {
    startup: [
      { insight: "Enterprise sales cycles take 6-18 months, not 1-3 months like B2C", confidence: 94, source: "HackerNews", category: "market", priority: "critical", action: "Build 18-month runway for enterprise" },
      { insight: "Product-market fit feels like pushing a boulder uphill until it doesn't", confidence: 91, source: "Y Combinator", category: "product", priority: "high", action: "Track leading indicators, not just revenue" },
      { insight: "Founder equity splits without vesting cause 67% of startup breakups", confidence: 96, source: "Legal Studies", category: "legal", priority: "critical", action: "Implement 4-year vesting with 1-year cliff" },
      { insight: "Customer acquisition cost increases 50% annually without optimization", confidence: 89, source: "Marketing Data", category: "finance", priority: "high", action: "Set up conversion tracking immediately" }
    ],
    creator: [
      { insight: "Algorithm changes can kill 70% of your reach overnight", confidence: 92, source: "Creator Economy Report", category: "platform", priority: "critical", action: "Diversify across 3+ platforms" },
      { insight: "Brand deals require 50K+ engaged followers, not just total followers", confidence: 88, source: "Influencer Marketing Hub", category: "monetization", priority: "high", action: "Focus on engagement rate over follower count" },
      { insight: "Content burnout happens at 6-month mark for 80% of creators", confidence: 85, source: "Creator Burnout Study", category: "wellness", priority: "medium", action: "Plan content breaks and batch creation" },
      { insight: "Thumbnail and title determine 90% of click-through rate", confidence: 93, source: "YouTube Analytics", category: "content", priority: "high", action: "A/B test thumbnails and titles constantly" }
    ],
    business: [
      { insight: "Remote teams need 3x more communication tools than expected", confidence: 87, source: "Remote Work Studies", category: "operations", priority: "high", action: "Invest in communication infrastructure early" },
      { insight: "GDPR fines average $1.2M for small businesses", confidence: 91, source: "Legal Compliance", category: "legal", priority: "critical", action: "Implement privacy-by-design architecture" },
      { insight: "Cash flow gaps kill 82% of profitable businesses", confidence: 94, source: "Financial Reports", category: "finance", priority: "critical", action: "Maintain 6-month operating expense buffer" }
    ],
    life: [
      { insight: "Career change takes 2-3 years longer than expected", confidence: 86, source: "Career Research", category: "career", priority: "medium", action: "Start skill building 2 years before transition" },
      { insight: "Buying a home costs 30% more than the purchase price in year 1", confidence: 89, source: "Real Estate Data", category: "financial", priority: "high", action: "Budget extra 30% for first-year costs" },
      { insight: "Relationship red flags appear in first 90 days but are ignored", confidence: 84, source: "Psychology Today", category: "relationships", priority: "medium", action: "Document concerns early, discuss openly" }
    ]
  };

  const dataSources = [
    { name: 'Reddit', icon: MessageSquare, coverage: '2M+ posts', strength: 'Real experiences' },
    { name: 'HackerNews', icon: Globe, coverage: '500K+ discussions', strength: 'Tech insights' },
    { name: 'Medium', icon: BookOpen, coverage: '1M+ articles', strength: 'Expert knowledge' },
    { name: 'YouTube', icon: Video, coverage: '100K+ transcripts', strength: 'Creator stories' },
    { name: 'Podcasts', icon: Mic, coverage: '50K+ episodes', strength: 'Deep conversations' },
    { name: 'LinkedIn', icon: Users, coverage: '10M+ posts', strength: 'Professional insights' }
  ];

  const personas = [
    { id: 'startup', label: 'Startup Founder', desc: 'Building the next big thing' },
    { id: 'creator', label: 'Content Creator', desc: 'Building audience & monetizing' },
    { id: 'business', label: 'Business Owner', desc: 'Growing existing business' },
    { id: 'life', label: 'Life Decisions', desc: 'Major personal choices' }
  ];

  const categories = [
    { id: 'all', label: 'All Categories', icon: Target },
    { id: 'market', label: 'Market & Competition', icon: TrendingUp },
    { id: 'product', label: 'Product Development', icon: Lightbulb },
    { id: 'finance', label: 'Finance & Funding', icon: DollarSign },
    { id: 'legal', label: 'Legal & Compliance', icon: Shield },
    { id: 'operations', label: 'Team & Operations', icon: Users },
    { id: 'platform', label: 'Platform Risk', icon: Globe },
    { id: 'wellness', label: 'Personal Wellness', icon: Clock }
  ];

  const scanForBlindSpots = async () => {
    if (!userInput.trim() && !selectedPersona) {
      toast({
        title: "Input Required",
        description: "Please describe your situation or select a persona",
        variant: "destructive",
      });
      return;
    }
    
    setIsScanning(true);
    setScanProgress(0);
    setResults([]);

    // Simulate multi-source scanning
    const sources = ['Reddit', 'HackerNews', 'Medium', 'YouTube', 'Podcasts'];
    for (let i = 0; i <= 100; i += 2) {
      setScanProgress(i);
      await new Promise(resolve => setTimeout(resolve, 30));
    }

    // Get relevant blind spots
    const relevantSpots = getRelevantBlindSpots(userInput, selectedPersona, selectedCategory);
    setResults(relevantSpots);
    setIsScanning(false);
    setActiveTab('results');

    toast({
      title: "Scan Complete",
      description: `Found ${relevantSpots.length} critical blind spots`,
    });
  };

  const getRelevantBlindSpots = (input, persona, category) => {
    let spots = [];
    
    // Get spots from selected persona or all personas
    if (persona && blindSpots[persona]) {
      spots = [...blindSpots[persona]];
    } else {
      spots = Object.values(blindSpots).flat();
    }

    // Filter by category if selected
    if (category && category !== 'all') {
      spots = spots.filter(spot => spot.category === category);
    }

    // Simple relevance scoring based on input keywords
    if (input.trim()) {
      const keywords = input.toLowerCase().split(' ');
      spots = spots.map(spot => ({
        ...spot,
        relevanceScore: keywords.reduce((score, keyword) => {
          if (spot.insight.toLowerCase().includes(keyword)) score += 10;
          if (spot.action.toLowerCase().includes(keyword)) score += 5;
          return score;
        }, Math.random() * 10) // Add some randomness
      })).filter(spot => spot.relevanceScore > 5);
    } else {
      spots = spots.map(spot => ({ ...spot, relevanceScore: Math.random() * 100 }));
    }

    return spots
      .sort((a, b) => (b.relevanceScore + b.confidence) - (a.relevanceScore + a.confidence))
      .slice(0, 8);
  };

  const shareResults = () => {
    const text = `I just discovered ${results.length} blind spots I didn't know about using BlindSpot Radar! 🎯`;
    if (navigator.share) {
      navigator.share({ title: 'BlindSpot Radar Results', text });
    } else {
      navigator.clipboard.writeText(text);
      toast({ title: "Copied to clipboard", description: "Share your results!" });
    }
  };

  const exportResults = () => {
    const data = results.map(r => `${r.insight} - Action: ${r.action}`).join('\n\n');
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blindspot-report.txt';
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <Target className="w-16 h-16 text-primary animate-pulse" />
              <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-primary/30 animate-ping"></div>
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4">
            BlindSpot Radar
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover the questions you didn't know to ask. Uncover critical blind spots from millions of real experiences across industries.
          </p>
        </div>

        {/* Data Sources */}
        <div className="mb-12">
          <h3 className="text-lg font-semibold text-center mb-6">Powered by Intelligence from 6 Major Sources</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {dataSources.map((source, index) => {
              const IconComponent = source.icon;
              return (
                <Card key={index} className="text-center p-4 hover:shadow-lg transition-all">
                  <IconComponent className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <div className="font-medium text-sm">{source.name}</div>
                  <div className="text-xs text-muted-foreground">{source.coverage}</div>
                </Card>
              );
            })}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="input">Scan</TabsTrigger>
            <TabsTrigger value="browse">Browse</TabsTrigger>
            <TabsTrigger value="results" disabled={results.length === 0}>Results ({results.length})</TabsTrigger>
            <TabsTrigger value="features">Pro Features</TabsTrigger>
            <TabsTrigger value="intelligence">Intelligence</TabsTrigger>
          </TabsList>

          {/* Input Tab */}
          <TabsContent value="input" className="mt-8">
            <Card className="p-8">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">What are you working on?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Persona Selection */}
                <div>
                  <label className="block text-sm font-medium mb-3">Choose your situation (optional)</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {personas.map((persona) => (
                      <Card 
                        key={persona.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedPersona === persona.id ? 'ring-2 ring-primary bg-primary/5' : ''
                        }`}
                        onClick={() => setSelectedPersona(selectedPersona === persona.id ? '' : persona.id)}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="font-medium text-sm">{persona.label}</div>
                          <div className="text-xs text-muted-foreground mt-1">{persona.desc}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium mb-3">Focus area (optional)</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Text Input */}
                <div>
                  <label className="block text-sm font-medium mb-3">Describe your project, goal, or situation</label>
                  <Textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="e.g., I'm launching a SaaS for small businesses, building my YouTube channel, considering a career change..."
                    className="min-h-[120px]"
                  />
                </div>

                {/* Scan Progress */}
                {isScanning && (
                  <div className="space-y-3">
                    <Progress value={scanProgress} className="w-full" />
                    <div className="text-center text-sm text-muted-foreground">
                      Scanning {Math.floor(scanProgress/20) + 1}/6 data sources... {scanProgress}%
                    </div>
                  </div>
                )}

                {/* Scan Button */}
                <Button
                  onClick={scanForBlindSpots}
                  disabled={isScanning}
                  size="lg"
                  className="w-full"
                >
                  {isScanning ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                      Scanning for Blind Spots...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-3" />
                      Scan for Blind Spots
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Browse Tab */}
          <TabsContent value="browse" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.slice(1).map((category) => {
                const IconComponent = category.icon;
                const categorySpots = Object.values(blindSpots).flat().filter(spot => spot.category === category.id);
                
                return (
                  <Card key={category.id} className="hover:shadow-lg transition-all cursor-pointer" 
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setActiveTab('input');
                        }}>
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <IconComponent className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{category.label}</CardTitle>
                          <p className="text-sm text-muted-foreground">{categorySpots.length} insights</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {categorySpots.slice(0, 2).map((spot, idx) => (
                          <div key={idx} className="text-sm p-3 bg-muted/50 rounded-lg">
                            <p className="font-medium">"{spot.insight}"</p>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-xs text-muted-foreground">{spot.source}</span>
                              <Badge variant="outline" className="text-xs">{spot.confidence}% confidence</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button variant="ghost" size="sm" className="w-full mt-4">
                        Explore {category.label} <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="mt-8">
            {results.length > 0 && (
              <>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">🎯 Blind Spots Detected</h2>
                    <p className="text-muted-foreground">Found {results.length} critical insights you might be missing</p>
                  </div>
                  <div className="flex space-x-3">
                    <Button variant="outline" onClick={shareResults} size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button variant="outline" onClick={exportResults} size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {results.map((result, index) => (
                    <Card key={index} className="hover:shadow-lg transition-all">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="w-5 h-5 text-destructive" />
                            <Badge variant={result.priority === 'critical' ? 'destructive' : result.priority === 'high' ? 'default' : 'secondary'}>
                              {result.priority}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">Confidence</div>
                            <div className="text-lg font-bold text-primary">{result.confidence}%</div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-destructive mb-2">Blind Spot:</h4>
                            <p className="text-sm leading-relaxed">"{result.insight}"</p>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-primary mb-2">Recommended Action:</h4>
                            <p className="text-sm bg-primary/5 p-3 rounded-lg">{result.action}</p>
                          </div>

                          <div className="flex justify-between items-center pt-2 border-t">
                            <span className="text-xs text-muted-foreground">Source: {result.source}</span>
                            <Badge variant="outline" className="text-xs capitalize">{result.category}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="text-center mt-8 space-y-4">
                  <div className="flex justify-center space-x-4">
                    <Button size="lg">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Get Full Action Plan ($29)
                    </Button>
                    <Button variant="outline" size="lg">
                      <Users className="w-5 h-5 mr-2" />
                      Connect with Expert
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ⭐ Join 10,000+ users who've discovered hidden opportunities
                  </p>
                </div>
              </>
            )}
          </TabsContent>
          {/* Enhanced Features Tab */}
          <TabsContent value="features" className="mt-8">
            <EnhancedFeatures onFeatureSelect={(feature) => {
              toast({
                title: "Feature Interest Noted",
                description: `You're interested in ${feature}. We'll notify you when it's available!`,
              });
            }} />
          </TabsContent>

          {/* Intelligence Tab */}
          <TabsContent value="intelligence" className="mt-8">
            <ScrapingEnhancements />
          </TabsContent>
        </Tabs>

        {/* Success Metrics & Social Proof */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">Proven Success & Market Opportunity</h2>
          
          {/* Market Size */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center p-6 bg-gradient-to-br from-primary/10 to-secondary/10">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-primary" />
              <div className="text-3xl font-bold text-primary mb-2">$2.4B</div>
              <div className="text-sm text-muted-foreground">Knowledge Management Market</div>
            </Card>
            <Card className="text-center p-6 bg-gradient-to-br from-secondary/10 to-accent/10">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-secondary" />
              <div className="text-3xl font-bold text-secondary mb-2">87%</div>
              <div className="text-sm text-muted-foreground">Of Failures Are Preventable</div>
            </Card>
            <Card className="text-center p-6 bg-gradient-to-br from-accent/10 to-primary/10">
              <Rocket className="w-12 h-12 mx-auto mb-4 text-accent" />
              <div className="text-3xl font-bold text-accent mb-2">500M</div>
              <div className="text-sm text-muted-foreground">People Making Major Decisions</div>
            </Card>
          </div>

          {/* Revenue Projections */}
          <Card className="max-w-4xl mx-auto p-8 bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">12-Month Revenue Projection</CardTitle>
              <p className="text-muted-foreground">Conservative estimates based on freemium model</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { month: 'Month 3', users: '50K', paying: '1K', mrr: '$35K', highlight: false },
                  { month: 'Month 6', users: '200K', paying: '5K', mrr: '$150K', highlight: true },
                  { month: 'Month 9', users: '500K', paying: '15K', mrr: '$450K', highlight: false },
                  { month: 'Month 12', users: '1M+', paying: '30K', mrr: '$900K+', highlight: true }
                ].map((projection, index) => (
                  <Card key={index} className={`text-center p-4 ${projection.highlight ? 'ring-2 ring-primary bg-primary/5' : ''}`}>
                    <div className="font-semibold text-lg">{projection.month}</div>
                    <div className="space-y-1 mt-2">
                      <div className="text-sm text-muted-foreground">{projection.users} users</div>
                      <div className="text-sm text-muted-foreground">{projection.paying} paying</div>
                      <div className="text-lg font-bold text-primary">{projection.mrr}</div>
                    </div>
                  </Card>
                ))}
              </div>
              
              <div className="mt-8 text-center">
                <div className="text-2xl font-bold text-primary mb-2">$5.4M ARR by Year 2</div>
                <p className="text-sm text-muted-foreground">With enterprise features and ecosystem expansion</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Viral Growth Strategy */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">Built for Viral Growth</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center p-6">
              <Share2 className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">"I Found My Blind Spots"</h3>
              <p className="text-sm text-muted-foreground">
                Built-in shareability with personalized results that create curiosity and FOMO
              </p>
            </Card>
            
            <Card className="text-center p-6">
              <Users className="w-12 h-12 mx-auto mb-4 text-secondary" />
              <h3 className="font-semibold mb-2">Network Effects</h3>
              <p className="text-sm text-muted-foreground">
                More users = more blind spots discovered = better insights for everyone
              </p>
            </Card>
            
            <Card className="text-center p-6">
              <Zap className="w-12 h-12 mx-auto mb-4 text-accent" />
              <h3 className="font-semibold mb-2">Challenge Mechanics</h3>
              <p className="text-sm text-muted-foreground">
                #BlindSpotChallenge drives organic user acquisition and engagement
              </p>
            </Card>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto p-8 bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardContent>
              <h3 className="text-2xl font-bold mb-4">Ready to eliminate blind spots?</h3>
              <p className="text-muted-foreground mb-6">
                Join thousands of successful founders, creators, and decision-makers who use BlindSpot Radar
              </p>
              <div className="flex justify-center space-x-4">
                <Button size="lg">Start Free Trial</Button>
                <Button variant="outline" size="lg">Watch Demo</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};