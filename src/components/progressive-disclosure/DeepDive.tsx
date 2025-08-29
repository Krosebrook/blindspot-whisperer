import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronRight, ChevronLeft, AlertTriangle, Target, Brain, Zap } from 'lucide-react';

interface DeepDiveData {
  specificScenarios: string[];
  riskAreas: string[];
  priorityOutcomes: string[];
  additionalContext: string;
  confidenceLevel: string;
}

interface DeepDiveProps {
  intent: any;
  context: any;
  onComplete: (deepDiveData: DeepDiveData) => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

export const DeepDive = ({ intent, context, onComplete, onBack, currentStep, totalSteps }: DeepDiveProps) => {
  const [deepDiveData, setDeepDiveData] = useState<DeepDiveData>({
    specificScenarios: [],
    riskAreas: [],
    priorityOutcomes: [],
    additionalContext: '',
    confidenceLevel: ''
  });

  const [currentSubStep, setCurrentSubStep] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Adaptive questions based on intent and context
  const getAdaptiveQuestions = () => {
    const questions = [
      {
        id: 'scenarios',
        title: 'Specific Scenarios',
        description: 'What specific situations or challenges are you most concerned about?',
        icon: Target
      },
      {
        id: 'risks',
        title: 'Risk Areas',
        description: 'Which areas feel most uncertain or risky to you?',
        icon: AlertTriangle
      },
      {
        id: 'outcomes',
        title: 'Priority Outcomes',
        description: 'What outcomes matter most for your success?',
        icon: Zap
      },
      {
        id: 'context',
        title: 'Additional Context',
        description: 'Any specific details, constraints, or unique aspects of your situation?',
        icon: Brain
      }
    ];

    return questions;
  };

  // Generate options based on intent and context
  const getScenarioOptions = () => {
    const baseScenarios = {
      'startup-launch': [
        'Finding and validating the right market opportunity',
        'Building an MVP that users actually want',
        'Securing initial funding without giving up too much equity',
        'Assembling the right founding team',
        'Navigating legal and regulatory requirements',
        'Competing against established players',
        'Scaling too quickly or too slowly',
        'Managing cash flow and runway'
      ],
      'build-audience': [
        'Creating content that stands out in saturated markets',
        'Building authentic engagement vs vanity metrics',
        'Monetizing without alienating audience',
        'Platform algorithm changes affecting reach',
        'Maintaining consistency and avoiding burnout',
        'Choosing the right content platforms and formats',
        'Building a sustainable content creation process',
        'Transitioning from free to paid offerings'
      ],
      'scale-business': [
        'Maintaining quality while increasing volume',
        'Hiring and managing a growing team',
        'Expanding to new markets or customer segments',
        'Optimizing operations and reducing costs',
        'Managing increased complexity and processes',
        'Maintaining company culture during growth',
        'Securing growth financing',
        'Competing with larger, established competitors'
      ]
    };

    return baseScenarios[intent.id as keyof typeof baseScenarios] || baseScenarios['startup-launch'];
  };

  const getRiskOptions = () => {
    const baseRisks = {
      'startup-launch': [
        'Market risk - No demand for the product',
        'Technical risk - Unable to build the solution',
        'Team risk - Co-founder conflicts or departures',
        'Financial risk - Running out of funding',
        'Competitive risk - Being outmaneuvered by competitors',
        'Regulatory risk - Legal or compliance issues',
        'Execution risk - Poor implementation or delays',
        'Personal risk - Impact on health, relationships, finances'
      ],
      'build-audience': [
        'Platform risk - Dependence on third-party platforms',
        'Content risk - Running out of ideas or losing relevance',
        'Audience risk - Failing to build genuine community',
        'Monetization risk - Unable to convert audience to revenue',
        'Brand risk - Reputation damage or controversy',
        'Competition risk - Other creators copying or outpacing',
        'Burnout risk - Unsustainable content creation pace',
        'Technology risk - Platform changes or technical issues'
      ],
      'scale-business': [
        'Operational risk - Systems breaking under increased load',
        'Quality risk - Standards declining during growth',
        'Financial risk - Cash flow problems or overextension',
        'Team risk - Key personnel leaving or cultural issues',
        'Market risk - Economic downturns or demand changes',
        'Competition risk - New entrants or price wars',
        'Technology risk - Legacy systems unable to scale',
        'Strategic risk - Losing focus or expanding too quickly'
      ]
    };

    return baseRisks[intent.id as keyof typeof baseRisks] || baseRisks['startup-launch'];
  };

  const getOutcomeOptions = () => {
    const baseOutcomes = {
      'startup-launch': [
        'Achieve product-market fit within 12 months',
        'Secure Series A funding',
        'Build a sustainable, profitable business model',
        'Assemble a strong, committed team',
        'Establish brand recognition in target market',
        'Create defensible competitive advantages',
        'Maintain work-life balance and personal well-being',
        'Build something that creates genuine value for users'
      ],
      'build-audience': [
        'Build a highly engaged, loyal community',
        'Create multiple sustainable revenue streams',
        'Establish thought leadership in my niche',
        'Maintain authentic voice while growing',
        'Achieve location and time independence',
        'Build a personal brand that opens new opportunities',
        'Create content that makes a meaningful impact',
        'Develop systems for consistent, quality content creation'
      ],
      'scale-business': [
        'Double revenue within 18 months',
        'Expand into new geographic markets',
        'Build a strong, autonomous leadership team',
        'Establish market leadership position',
        'Create predictable, recurring revenue streams',
        'Optimize operations for maximum efficiency',
        'Maintain high customer satisfaction during growth',
        'Build systems that enable continued scaling'
      ]
    };

    return baseOutcomes[intent.id as keyof typeof baseOutcomes] || baseOutcomes['startup-launch'];
  };

  const questions = getAdaptiveQuestions();
  const currentQuestion = questions[currentSubStep];
  
  const scenarioOptions = getScenarioOptions();
  const riskOptions = getRiskOptions();
  const outcomeOptions = getOutcomeOptions();

  const validateCurrentStep = () => {
    const errors: string[] = [];
    
    switch (currentQuestion.id) {
      case 'scenarios':
        if (deepDiveData.specificScenarios.length === 0) errors.push('scenarios');
        break;
      case 'risks':
        if (deepDiveData.riskAreas.length === 0) errors.push('risks');
        break;
      case 'outcomes':
        if (deepDiveData.priorityOutcomes.length === 0) errors.push('outcomes');
        break;
      case 'context':
        if (!deepDiveData.confidenceLevel) errors.push('confidence');
        break;
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentSubStep < questions.length - 1) {
        setCurrentSubStep(currentSubStep + 1);
      } else {
        onComplete(deepDiveData);
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

  const updateArrayField = (field: keyof DeepDiveData, value: string, checked: boolean) => {
    setDeepDiveData(prev => ({
      ...prev,
      [field]: checked 
        ? [...(prev[field] as string[]), value]
        : (prev[field] as string[]).filter(item => item !== value)
    }));
    setValidationErrors(prev => prev.filter(error => error !== field.replace('Areas', '').replace('Outcomes', '').replace('Scenarios', '')));
  };

  const renderCurrentStep = () => {
    const Icon = currentQuestion.icon;

    switch (currentQuestion.id) {
      case 'scenarios':
        return (
          <div className="space-y-4">
            <div className="grid gap-3">
              {scenarioOptions.map(scenario => (
                <div key={scenario} className="flex items-start space-x-3">
                  <Checkbox
                    id={scenario}
                    checked={deepDiveData.specificScenarios.includes(scenario)}
                    onCheckedChange={(checked) => updateArrayField('specificScenarios', scenario, checked as boolean)}
                  />
                  <Label htmlFor={scenario} className="text-sm leading-relaxed cursor-pointer">
                    {scenario}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'risks':
        return (
          <div className="space-y-4">
            <div className="grid gap-3">
              {riskOptions.map(risk => (
                <div key={risk} className="flex items-start space-x-3">
                  <Checkbox
                    id={risk}
                    checked={deepDiveData.riskAreas.includes(risk)}
                    onCheckedChange={(checked) => updateArrayField('riskAreas', risk, checked as boolean)}
                  />
                  <Label htmlFor={risk} className="text-sm leading-relaxed cursor-pointer">
                    {risk}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'outcomes':
        return (
          <div className="space-y-4">
            <div className="grid gap-3">
              {outcomeOptions.map(outcome => (
                <div key={outcome} className="flex items-start space-x-3">
                  <Checkbox
                    id={outcome}
                    checked={deepDiveData.priorityOutcomes.includes(outcome)}
                    onCheckedChange={(checked) => updateArrayField('priorityOutcomes', outcome, checked as boolean)}
                  />
                  <Label htmlFor={outcome} className="text-sm leading-relaxed cursor-pointer">
                    {outcome}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'context':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="additionalContext">Additional Context</Label>
              <Textarea
                id="additionalContext"
                placeholder="Any specific constraints, unique circumstances, or important details we should consider..."
                value={deepDiveData.additionalContext}
                onChange={(e) => setDeepDiveData(prev => ({ ...prev, additionalContext: e.target.value }))}
                className="min-h-24"
              />
            </div>

            <div className="space-y-3">
              <Label>How confident are you in your current approach? *</Label>
              <RadioGroup
                value={deepDiveData.confidenceLevel}
                onValueChange={(value) => {
                  setDeepDiveData(prev => ({ ...prev, confidenceLevel: value }));
                  setValidationErrors(prev => prev.filter(error => error !== 'confidence'));
                }}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="very-confident" id="very-confident" />
                  <Label htmlFor="very-confident">Very confident - I have a clear plan</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="somewhat-confident" id="somewhat-confident" />
                  <Label htmlFor="somewhat-confident">Somewhat confident - I have ideas but need validation</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="uncertain" id="uncertain" />
                  <Label htmlFor="uncertain">Uncertain - I'm exploring options</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="completely-unsure" id="completely-unsure" />
                  <Label htmlFor="completely-unsure">Completely unsure - I need guidance</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Progress Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <currentQuestion.icon className="h-6 w-6 text-primary" />
              {currentQuestion.title}
            </h1>
            <p className="text-muted-foreground">
              {currentQuestion.description}
            </p>
          </div>
          <Badge variant="secondary">
            Step {currentStep} of {totalSteps}
          </Badge>
        </div>
        <Progress value={((currentStep - 1 + (currentSubStep + 1) / questions.length) / totalSteps) * 100} className="h-2" />
      </div>

      {/* Current Question Card */}
      <Card>
        <CardHeader>
          <CardTitle>
            Deep Dive - Question {currentSubStep + 1} of {questions.length}
          </CardTitle>
          <CardDescription>
            Select all that apply. The more specific you are, the better we can identify relevant blind spots.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderCurrentStep()}

          {validationErrors.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg mt-4">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">
                Please make at least one selection to continue
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selection Summary */}
      {(deepDiveData.specificScenarios.length > 0 || deepDiveData.riskAreas.length > 0 || deepDiveData.priorityOutcomes.length > 0) && (
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="text-lg">Your Selections So Far</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {deepDiveData.specificScenarios.length > 0 && (
              <div>
                <Badge variant="outline" className="mb-2">Scenarios ({deepDiveData.specificScenarios.length})</Badge>
                <div className="text-sm text-muted-foreground">
                  Focus areas selected for blind spot analysis
                </div>
              </div>
            )}
            {deepDiveData.riskAreas.length > 0 && (
              <div>
                <Badge variant="outline" className="mb-2">Risk Areas ({deepDiveData.riskAreas.length})</Badge>
                <div className="text-sm text-muted-foreground">
                  Risk categories identified for deeper analysis
                </div>
              </div>
            )}
            {deepDiveData.priorityOutcomes.length > 0 && (
              <div>
                <Badge variant="outline" className="mb-2">Priority Outcomes ({deepDiveData.priorityOutcomes.length})</Badge>
                <div className="text-sm text-muted-foreground">
                  Success metrics to optimize recommendations for
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
          {currentSubStep < questions.length - 1 ? 'Next Question' : 'Generate Blind Spot Analysis'}
          <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>

      {/* Progress Indicator */}
      <div className="flex justify-center space-x-2">
        {questions.map((_, index) => (
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