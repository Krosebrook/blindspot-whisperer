import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ChevronRight, ChevronLeft, AlertCircle, Clock, DollarSign, Users } from 'lucide-react';

interface ContextData {
  industry: string;
  companyStage: string;
  teamSize: number;
  timeline: string;
  budget: string;
  riskTolerance: number;
  specificChallenges: string;
  previousExperience: string;
  geographicMarket: string;
}

interface ContextBuilderProps {
  intent: any;
  onContextComplete: (context: ContextData) => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

// Dynamic industry options based on intent
const getIndustryOptions = (intentId: string) => {
  const baseOptions = ['Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing'];
  
  switch (intentId) {
    case 'startup-launch':
      return [...baseOptions, 'SaaS', 'E-commerce', 'AI/ML', 'Fintech', 'Biotech'];
    case 'build-audience':
      return ['Content Creation', 'Influencer Marketing', 'Education', 'Entertainment', 'Fashion', 'Gaming'];
    case 'scale-business':
      return [...baseOptions, 'Professional Services', 'Consulting', 'Real Estate'];
    default:
      return baseOptions;
  }
};

export const ContextBuilder = ({ intent, onContextComplete, onBack, currentStep, totalSteps }: ContextBuilderProps) => {
  const [context, setContext] = useState<ContextData>({
    industry: '',
    companyStage: '',
    teamSize: 1,
    timeline: '',
    budget: '',
    riskTolerance: 50,
    specificChallenges: '',
    previousExperience: '',
    geographicMarket: ''
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [currentSubStep, setCurrentSubStep] = useState(0);

  const industryOptions = getIndustryOptions(intent.id);
  
  // Context-specific questions based on intent
  const getContextQuestions = () => {
    const baseQuestions = [
      {
        id: 'industry-stage',
        title: 'Industry & Stage',
        fields: ['industry', 'companyStage', 'geographicMarket']
      },
      {
        id: 'team-resources',
        title: 'Team & Resources', 
        fields: ['teamSize', 'budget', 'timeline']
      },
      {
        id: 'risk-experience',
        title: 'Risk & Experience',
        fields: ['riskTolerance', 'previousExperience', 'specificChallenges']
      }
    ];

    return baseQuestions;
  };

  const contextQuestions = getContextQuestions();
  const currentQuestion = contextQuestions[currentSubStep];

  const validateCurrentStep = () => {
    const errors: string[] = [];
    const requiredFields = currentQuestion.fields;

    requiredFields.forEach(field => {
      if (!context[field as keyof ContextData] || context[field as keyof ContextData] === '') {
        errors.push(field);
      }
    });

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentSubStep < contextQuestions.length - 1) {
        setCurrentSubStep(currentSubStep + 1);
      } else {
        onContextComplete(context);
      }
    }
  };

  const handlePrevious = () => {
    if (currentSubStep > 0) {
      setCurrentSubStep(currentSubStep - 1);
    } else {
      onBack();
    }
  };

  const updateContext = (field: keyof ContextData, value: any) => {
    setContext(prev => ({ ...prev, [field]: value }));
    // Clear validation errors for this field
    setValidationErrors(prev => prev.filter(error => error !== field));
  };

  const renderField = (field: string) => {
    const hasError = validationErrors.includes(field);
    const errorClass = hasError ? 'border-destructive' : '';

    switch (field) {
      case 'industry':
        return (
          <div className="space-y-2">
            <Label htmlFor="industry">Industry *</Label>
            <Select value={context.industry} onValueChange={(value) => updateContext('industry', value)}>
              <SelectTrigger className={errorClass}>
                <SelectValue placeholder="Select your industry" />
              </SelectTrigger>
              <SelectContent>
                {industryOptions.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'companyStage':
        const stageOptions = intent.persona === 'startup' 
          ? ['Idea Stage', 'MVP', 'Early Traction', 'Growth Stage', 'Scale Stage']
          : ['Planning', 'Early Stage', 'Established', 'Mature', 'Transformation'];
        
        return (
          <div className="space-y-2">
            <Label htmlFor="companyStage">Current Stage *</Label>
            <Select value={context.companyStage} onValueChange={(value) => updateContext('companyStage', value)}>
              <SelectTrigger className={errorClass}>
                <SelectValue placeholder="Select current stage" />
              </SelectTrigger>
              <SelectContent>
                {stageOptions.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'geographicMarket':
        return (
          <div className="space-y-2">
            <Label htmlFor="geographicMarket">Primary Market *</Label>
            <Select value={context.geographicMarket} onValueChange={(value) => updateContext('geographicMarket', value)}>
              <SelectTrigger className={errorClass}>
                <SelectValue placeholder="Select primary market" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="north-america">North America</SelectItem>
                <SelectItem value="europe">Europe</SelectItem>
                <SelectItem value="asia-pacific">Asia Pacific</SelectItem>
                <SelectItem value="latin-america">Latin America</SelectItem>
                <SelectItem value="global">Global</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case 'teamSize':
        return (
          <div className="space-y-3">
            <Label>Team Size: {context.teamSize} {context.teamSize === 1 ? 'person' : 'people'}</Label>
            <Slider
              value={[context.teamSize]}
              onValueChange={(value) => updateContext('teamSize', value[0])}
              max={100}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Solo</span>
              <span>Small Team</span>
              <span>Large Team</span>
            </div>
          </div>
        );

      case 'budget':
        const budgetOptions = intent.persona === 'startup'
          ? ['<$10K', '$10K-$50K', '$50K-$100K', '$100K-$500K', '$500K+']
          : ['<$1K', '$1K-$10K', '$10K-$50K', '$50K-$100K', '$100K+'];
        
        return (
          <div className="space-y-2">
            <Label htmlFor="budget">Available Budget *</Label>
            <Select value={context.budget} onValueChange={(value) => updateContext('budget', value)}>
              <SelectTrigger className={errorClass}>
                <SelectValue placeholder="Select budget range" />
              </SelectTrigger>
              <SelectContent>
                {budgetOptions.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'timeline':
        return (
          <div className="space-y-2">
            <Label htmlFor="timeline">Timeline *</Label>
            <Select value={context.timeline} onValueChange={(value) => updateContext('timeline', value)}>
              <SelectTrigger className={errorClass}>
                <SelectValue placeholder="Select timeline" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="urgent">ASAP (&lt; 1 month)</SelectItem>
                <SelectItem value="short">Short term (1-3 months)</SelectItem>
                <SelectItem value="medium">Medium term (3-6 months)</SelectItem>
                <SelectItem value="long">Long term (6+ months)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case 'riskTolerance':
        const getRiskLabel = (value: number) => {
          if (value < 25) return 'Conservative';
          if (value < 50) return 'Moderate';
          if (value < 75) return 'Aggressive';
          return 'High Risk';
        };

        return (
          <div className="space-y-3">
            <Label>Risk Tolerance: {getRiskLabel(context.riskTolerance)}</Label>
            <Slider
              value={[context.riskTolerance]}
              onValueChange={(value) => updateContext('riskTolerance', value[0])}
              max={100}
              min={0}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Conservative</span>
              <span>Balanced</span>
              <span>Aggressive</span>
            </div>
          </div>
        );

      case 'previousExperience':
        return (
          <div className="space-y-2">
            <Label htmlFor="previousExperience">Previous Experience *</Label>
            <Textarea
              id="previousExperience"
              placeholder="Describe your relevant experience, past successes/failures, lessons learned..."
              value={context.previousExperience}
              onChange={(e) => updateContext('previousExperience', e.target.value)}
              className={`min-h-20 ${errorClass}`}
            />
          </div>
        );

      case 'specificChallenges':
        return (
          <div className="space-y-2">
            <Label htmlFor="specificChallenges">Current Challenges *</Label>
            <Textarea
              id="specificChallenges"
              placeholder="What specific obstacles, concerns, or unknowns are you facing?"
              value={context.specificChallenges}
              onChange={(e) => updateContext('specificChallenges', e.target.value)}
              className={`min-h-20 ${errorClass}`}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Progress Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {currentQuestion.title}
            </h1>
            <p className="text-muted-foreground">
              Help us understand your context for {intent.title.toLowerCase()}
            </p>
          </div>
          <Badge variant="secondary">
            Step {currentStep} of {totalSteps}
          </Badge>
        </div>
        <Progress value={((currentStep - 1 + (currentSubStep + 1) / contextQuestions.length) / totalSteps) * 100} className="h-2" />
      </div>

      {/* Current Question Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentSubStep === 0 && <Users className="h-5 w-5" />}
            {currentSubStep === 1 && <DollarSign className="h-5 w-5" />}
            {currentSubStep === 2 && <AlertCircle className="h-5 w-5" />}
            {currentQuestion.title}
          </CardTitle>
          <CardDescription>
            Step {currentSubStep + 1} of {contextQuestions.length} - Context Building
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentQuestion.fields.map(field => (
            <div key={field}>
              {renderField(field)}
            </div>
          ))}

          {validationErrors.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">
                Please fill in all required fields to continue
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          className="group"
        >
          <ChevronLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back
        </Button>
        
        <Button 
          onClick={handleNext}
          className="group"
        >
          {currentSubStep < contextQuestions.length - 1 ? 'Next' : 'Continue to Deep Dive'}
          <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>

      {/* Progress Indicator */}
      <div className="flex justify-center space-x-2">
        {contextQuestions.map((_, index) => (
          <div
            key={index}
            className={`h-2 w-8 rounded-full transition-colors ${
              index === currentSubStep ? 'bg-primary' : 
              index < currentSubStep ? 'bg-primary/60' : 'bg-muted'
            }`}
          />
        ))}
      </div>
    </div>
  );
};