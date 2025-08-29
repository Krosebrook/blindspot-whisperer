import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Target, TrendingUp, Users, Lightbulb, Globe, Heart } from 'lucide-react';

interface Intent {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  tags: string[];
  timeEstimate: string;
  persona: string;
}

const intents: Intent[] = [
  {
    id: 'startup-launch',
    title: 'Launch a New Startup',
    description: 'Validate ideas, build MVP, find product-market fit',
    icon: Target,
    tags: ['funding', 'mvp', 'market-validation'],
    timeEstimate: '8-12 min',
    persona: 'startup'
  },
  {
    id: 'scale-business',
    title: 'Scale Existing Business',
    description: 'Optimize operations, expand markets, increase revenue',
    icon: TrendingUp,
    tags: ['operations', 'growth', 'revenue'],
    timeEstimate: '10-15 min',
    persona: 'business'
  },
  {
    id: 'build-audience',
    title: 'Build Content/Creator Business',
    description: 'Grow audience, monetize content, brand partnerships',
    icon: Users,
    tags: ['content', 'audience', 'monetization'],
    timeEstimate: '6-10 min',
    persona: 'creator'
  },
  {
    id: 'career-transition',
    title: 'Make Major Career Change',
    description: 'Switch industries, roles, or become entrepreneur',
    icon: Lightbulb,
    tags: ['career', 'transition', 'skills'],
    timeEstimate: '8-12 min',
    persona: 'life'
  },
  {
    id: 'expand-globally',
    title: 'Enter New Markets',
    description: 'International expansion, cultural adaptation, compliance',
    icon: Globe,
    tags: ['expansion', 'international', 'compliance'],
    timeEstimate: '12-18 min',
    persona: 'business'
  },
  {
    id: 'life-decision',
    title: 'Navigate Major Life Decision',
    description: 'Marriage, relocation, investment, family planning',
    icon: Heart,
    tags: ['life', 'decisions', 'planning'],
    timeEstimate: '5-8 min',
    persona: 'life'
  }
];

interface IntentCaptureProps {
  onIntentSelected: (intent: Intent) => void;
  currentStep: number;
  totalSteps: number;
}

export const IntentCapture = ({ onIntentSelected, currentStep, totalSteps }: IntentCaptureProps) => {
  const [selectedIntent, setSelectedIntent] = useState<Intent | null>(null);
  const [hoveredIntent, setHoveredIntent] = useState<string | null>(null);

  const handleIntentSelect = (intent: Intent) => {
    setSelectedIntent(intent);
    // Small delay for visual feedback
    setTimeout(() => onIntentSelected(intent), 200);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Progress Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              What are you trying to achieve?
            </h1>
            <p className="text-muted-foreground mt-2">
              Choose your primary goal to get personalized blind spot insights
            </p>
          </div>
          <Badge variant="secondary" className="text-sm">
            Step {currentStep} of {totalSteps}
          </Badge>
        </div>
        <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
      </div>

      {/* Intent Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {intents.map((intent) => {
          const Icon = intent.icon;
          const isSelected = selectedIntent?.id === intent.id;
          const isHovered = hoveredIntent === intent.id;

          return (
            <Card
              key={intent.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 ${
                isSelected ? 'ring-2 ring-primary shadow-lg' : ''
              } ${isHovered ? 'shadow-md' : ''}`}
              onMouseEnter={() => setHoveredIntent(intent.id)}
              onMouseLeave={() => setHoveredIntent(null)}
              onClick={() => handleIntentSelect(intent)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg transition-colors ${
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span>{intent.timeEstimate}</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                </div>
                <CardTitle className="text-lg">{intent.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <CardDescription className="text-sm leading-relaxed">
                  {intent.description}
                </CardDescription>
                <div className="flex flex-wrap gap-1">
                  {intent.tags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="outline" 
                      className="text-xs px-2 py-1"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Help Text */}
      <div className="text-center p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          Not sure which fits? Choose the closest match - we'll refine your path in the next steps.
        </p>
      </div>

      {/* Next Button */}
      {selectedIntent && (
        <div className="flex justify-center pt-4">
          <Button 
            size="lg" 
            className="group"
            onClick={() => onIntentSelected(selectedIntent)}
          >
            Continue with {selectedIntent.title}
            <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      )}
    </div>
  );
};