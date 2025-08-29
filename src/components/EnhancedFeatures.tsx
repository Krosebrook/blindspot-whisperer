import React, { useState } from 'react';
import { Zap, TrendingUp, Users, Briefcase, Globe, Star, CheckCircle, ArrowRight, Clock, Shield, DollarSign } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface EnhancedFeaturesProps {
  onFeatureSelect?: (feature: string) => void;
}

export const EnhancedFeatures: React.FC<EnhancedFeaturesProps> = ({ onFeatureSelect }) => {
  const [activeFeature, setActiveFeature] = useState('');
  const { toast } = useToast();

  const enhancedFeatures = [
    {
      id: 'real-time',
      icon: Zap,
      title: 'Real-Time Intelligence',
      description: 'Live monitoring of 6 major platforms for emerging blind spots',
      benefits: ['24/7 data mining', 'Trending insights', 'Early warning system'],
      price: '$49/month',
      popular: false
    },
    {
      id: 'industry-specific',
      icon: Briefcase,
      title: 'Industry Modules',
      description: 'Specialized blind spot detection for your specific industry',
      benefits: ['SaaS Module', 'E-commerce Module', 'Creator Economy Module', 'Healthcare Module'],
      price: '$99/month',
      popular: true
    },
    {
      id: 'competitive',
      icon: TrendingUp,
      title: 'Competitive Blind Spot Analysis',
      description: 'Discover opportunities from your competitors\' mistakes',
      benefits: ['Competitor monitoring', 'Market gap identification', 'Strategic opportunities'],
      price: '$149/month',
      popular: false
    },
    {
      id: 'team',
      icon: Users,
      title: 'Team Collaboration',
      description: 'Collaborative blind spot discovery and action planning',
      benefits: ['Team workspaces', 'Shared insights', 'Progress tracking', 'Expert consultations'],
      price: '$199/month',
      popular: false
    },
    {
      id: 'api',
      icon: Globe,
      title: 'API & Integrations',
      description: 'Integrate blind spot detection into your existing tools',
      benefits: ['REST API', 'Slack integration', 'CRM integration', 'Custom webhooks'],
      price: '$299/month',
      popular: false
    },
    {
      id: 'white-label',
      icon: Shield,
      title: 'White Label Solution',
      description: 'Offer blind spot detection as your own service',
      benefits: ['Custom branding', 'Reseller program', '50% revenue share', 'Full support'],
      price: 'Custom pricing',
      popular: false
    }
  ];

  const successMetrics = [
    { metric: '10,000+', label: 'Active Users', icon: Users },
    { metric: '500,000+', label: 'Blind Spots Discovered', icon: Star },
    { metric: '94%', label: 'Success Rate', icon: CheckCircle },
    { metric: '$2.4M', label: 'Mistakes Prevented', icon: DollarSign }
  ];

  const monetizationStrategies = [
    {
      strategy: 'Freemium Model',
      description: '3 free scans, then $29/month for unlimited',
      revenue: '$150K MRR projected by month 6'
    },
    {
      strategy: 'Expert Marketplace',
      description: 'Connect users with domain experts (15% commission)',
      revenue: '$50K monthly from consultations'
    },
    {
      strategy: 'Custom Reports',
      description: 'Deep-dive blind spot audits for $500-2000',
      revenue: '$25K monthly from enterprise clients'
    },
    {
      strategy: 'API Licensing',
      description: '$0.10 per scan for developers and agencies',
      revenue: '$75K monthly from 750K API calls'
    }
  ];

  const handleUpgrade = (featureId: string, price: string) => {
    toast({
      title: "Coming Soon!",
      description: `${enhancedFeatures.find(f => f.id === featureId)?.title} will be available soon. Join waitlist for early access.`,
    });
    onFeatureSelect?.(featureId);
  };

  return (
    <div className="space-y-12">
      
      {/* Success Metrics */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-8">Proven Results & Impact</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {successMetrics.map((metric, index) => {
            const IconComponent = metric.icon;
            return (
              <Card key={index} className="text-center p-6">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-primary">{metric.metric}</div>
                <div className="text-sm text-muted-foreground">{metric.label}</div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Enhanced Features */}
      <div>
        <h2 className="text-3xl font-bold text-center mb-8">Enhanced Features for Scale</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enhancedFeatures.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <Card key={feature.id} className={`relative hover:shadow-lg transition-all ${feature.popular ? 'ring-2 ring-primary' : ''}`}>
                {feature.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                        {benefit}
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-2xl font-bold text-primary">{feature.price}</span>
                      {feature.popular && <Star className="w-5 h-5 text-yellow-500 fill-current" />}
                    </div>
                    <Button 
                      className="w-full" 
                      variant={feature.popular ? "default" : "outline"}
                      onClick={() => handleUpgrade(feature.id, feature.price)}
                    >
                      {feature.price === 'Custom pricing' ? 'Contact Sales' : 'Upgrade Now'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Monetization Overview */}
      <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-8">Revenue Optimization Strategies</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {monetizationStrategies.map((strategy, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{strategy.strategy}</CardTitle>
                <p className="text-sm text-muted-foreground">{strategy.description}</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-primary">{strategy.revenue}</span>
                  <Badge variant="outline">Projected</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Viral Growth Features */}
      <div>
        <h2 className="text-2xl font-bold text-center mb-8">Built-in Viral Mechanics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center p-6">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="font-semibold mb-2">Social Sharing</h3>
            <p className="text-sm text-muted-foreground">
              "I discovered 8 blind spots I didn't know about!" - Built-in share templates
            </p>
          </Card>
          
          <Card className="text-center p-6">
            <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="font-semibold mb-2">Challenge Mode</h3>
            <p className="text-sm text-muted-foreground">
              #BlindSpotChallenge - Users challenge friends to find their blind spots
            </p>
          </Card>
          
          <Card className="text-center p-6">
            <Clock className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="font-semibold mb-2">Weekly Intelligence</h3>
            <p className="text-sm text-muted-foreground">
              Weekly blind spot reports drive recurring engagement and shares
            </p>
          </Card>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <Card className="max-w-2xl mx-auto p-8 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent>
            <h3 className="text-2xl font-bold mb-4">Ready to Build Your Empire?</h3>
            <p className="text-muted-foreground mb-6">
              This comprehensive system is designed for maximum sellability and viral growth
            </p>
            <div className="flex justify-center space-x-4">
              <Button size="lg">
                <Zap className="w-5 h-5 mr-2" />
                Deploy Full System
              </Button>
              <Button variant="outline" size="lg">
                <Globe className="w-5 h-5 mr-2" />
                API Documentation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};