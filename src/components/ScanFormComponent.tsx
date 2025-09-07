import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { AlertCircle, Building2, Code, DollarSign, GraduationCap, Rocket, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '@/integrations/supabase/client'
import { db } from '@/lib/database'
import { SecurityService } from '@/lib/security'
import { AuditLogger } from '@/lib/auditLogger'

interface PersonaOption {
  id: 'saas_founder' | 'ecommerce' | 'content_creator' | 'service_business' | 'student' | 'no_coder' | 'enterprise'
  label: string
  description: string
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
}

const personaOptions: PersonaOption[] = [
  {
    id: 'saas_founder',
    label: 'SaaS Founder',
    description: 'Building or scaling a software-as-a-service business',
    icon: <Rocket className="w-6 h-6" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200 hover:border-blue-300'
  },
  {
    id: 'ecommerce',
    label: 'E-commerce',
    description: 'Running an online store or marketplace business',
    icon: <DollarSign className="w-6 h-6" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200 hover:border-green-300'
  },
  {
    id: 'content_creator',
    label: 'Content Creator',
    description: 'Creating digital content, courses, or media',
    icon: <Users className="w-6 h-6" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200 hover:border-purple-300'
  },
  {
    id: 'service_business',
    label: 'Service Business',
    description: 'Providing professional services or consulting',
    icon: <Building2 className="w-6 h-6" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200 hover:border-orange-300'
  },
  {
    id: 'student',
    label: 'Student',
    description: 'Learning or working on educational projects',
    icon: <GraduationCap className="w-6 h-6" />,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200 hover:border-indigo-300'
  },
  {
    id: 'no_coder',
    label: 'No-Coder',
    description: 'Building without traditional programming',
    icon: <Code className="w-6 h-6" />,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200 hover:border-pink-300'
  },
  {
    id: 'enterprise',
    label: 'Enterprise',
    description: 'Large organization or corporate initiative',
    icon: <Building2 className="w-6 h-6" />,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200 hover:border-gray-300'
  }
]

interface ScanFormComponentProps {
  onSubmit?: (scanData: any) => void
  className?: string
}

export default function ScanFormComponent({ onSubmit, className = '' }: ScanFormComponentProps) {
  const [selectedPersona, setSelectedPersona] = useState<string>('')
  const [businessDescription, setBusinessDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Enhanced security validation
    const advancedValidation = SecurityService.validateBusinessDescriptionAdvanced(businessDescription)
    if (!advancedValidation.isValid) {
      setError(`Input validation failed: ${advancedValidation.errors.join(', ')}`)
      return
    }

    // Security threat detection
    const threatAnalysis = SecurityService.detectSecurityThreats(businessDescription)
    if (threatAnalysis.riskLevel === 'critical' || threatAnalysis.riskLevel === 'high') {
      setError(`Security check failed: ${threatAnalysis.threats.join(', ')}`)
      return
    }

    // Validate scan input
    const validation = SecurityService.validateScanInput({
      persona: selectedPersona,
      business_description: businessDescription,
      user_id: 'temp' // Will be validated with actual user ID below
    })
    
    if (!validation.isValid) {
      setError(validation.errors[0])
      return
    }

    setIsLoading(true)
    
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        setError('You must be logged in to start a scan')
        setIsLoading(false)
        return
      }

      // Log the scan attempt for security monitoring
      await AuditLogger.trackUserAction('scan_initiated', {
        persona: selectedPersona,
        contentLength: businessDescription.length,
        qualityScore: advancedValidation.qualityScore,
        riskScore: advancedValidation.riskScore
      })

      // Create scan record with sanitized data
      const scanData = {
        user_id: user.id,
        persona: selectedPersona as any,
        business_description: advancedValidation.sanitized, // Use enhanced sanitized content
        status: 'pending' as const,
      }

      const { data: scan, error: scanError } = await db.createScan(scanData)
      
      if (scanError) {
        console.error('Scan creation error:', scanError)
        setError('Failed to start scan. Please try again.')
        setIsLoading(false)
        return
      }

      // Track successful scan creation
      await AuditLogger.trackUserAction('scan_created', {
        scanId: scan.id,
        persona: selectedPersona,
        qualityScore: advancedValidation.qualityScore
      })

      // Call onSubmit callback if provided
      if (onSubmit && scan) {
        onSubmit({
          scanId: scan.id,
          persona: selectedPersona,
          businessDescription: businessDescription.trim()
        })
      }

      // Reset form
      setSelectedPersona('')
      setBusinessDescription('')
      
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const selectedPersonaData = personaOptions.find(p => p.id === selectedPersona)

  return (
    <div className={`max-w-4xl mx-auto space-y-8 ${className}`}>
      <div className="text-center space-y-4">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-gray-900"
        >
          Discover Your Business Blind Spots
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-gray-600 max-w-2xl mx-auto"
        >
          Get AI-powered insights into potential risks and opportunities you might be missing
        </motion.p>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            Start Your Business Scan
          </CardTitle>
          <CardDescription>
            Tell us about yourself and your business to get personalized insights
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8">
            {/* Persona Selection */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">
                Which best describes you? *
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {personaOptions.map((persona) => (
                  <motion.button
                    key={persona.id}
                    type="button"
                    onClick={() => setSelectedPersona(persona.id)}
                    className={`
                      relative p-4 rounded-lg border-2 text-left transition-all duration-200
                      ${selectedPersona === persona.id 
                        ? `${persona.bgColor} ${persona.borderColor.replace('hover:', '')} ring-2 ring-offset-2 ring-blue-500` 
                        : `bg-white ${persona.borderColor}`
                      }
                    `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={persona.color}>
                        {persona.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900">
                          {persona.label}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {persona.description}
                        </p>
                      </div>
                    </div>
                    {selectedPersona === persona.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2"
                      >
                        <Badge className="bg-blue-500 text-white">
                          Selected
                        </Badge>
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Business Description */}
            <div className="space-y-4">
              <Label htmlFor="business-description" className="text-base font-semibold">
                Describe your business or project *
              </Label>
              <div className="space-y-2">
                <Textarea
                  id="business-description"
                  placeholder="Tell us about your business, what you do, your target market, current challenges, and goals. The more detail you provide, the better insights we can give you..."
                  value={businessDescription}
                  onChange={(e) => {
                    const value = e.target.value
                    // Real-time basic validation
                    if (value.length <= 2000) {
                      setBusinessDescription(value)
                    }
                  }}
                  className="min-h-[120px] text-base"
                  maxLength={2000}
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Minimum 50 characters for better analysis</span>
                  <span>{businessDescription.length}/2000</span>
                </div>
              </div>
            </div>

            {/* Selected Persona Preview */}
            {selectedPersonaData && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 rounded-lg bg-blue-50 border border-blue-200"
              >
                <div className="flex items-center gap-3">
                  <div className={selectedPersonaData.color}>
                    {selectedPersonaData.icon}
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">
                      Scanning as: {selectedPersonaData.label}
                    </p>
                    <p className="text-sm text-blue-700">
                      We'll tailor our analysis for {selectedPersonaData.description.toLowerCase()}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-red-50 border border-red-200"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </motion.div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              disabled={isLoading || !selectedPersona || !businessDescription.trim()}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Starting Your Scan...
                </div>
              ) : (
                'Start Blind Spot Analysis'
              )}
            </Button>
            
            <p className="text-sm text-gray-500 text-center">
              Your scan will identify potential risks, opportunities, and areas for improvement specific to your business type
            </p>
          </CardFooter>
        </form>
      </Card>

      {/* Feature Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid md:grid-cols-3 gap-6"
      >
        <Card className="border-dashed border-2 border-gray-200">
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Smart Analysis</h3>
            <p className="text-sm text-gray-600">
              AI-powered insights tailored to your business type and industry
            </p>
          </CardContent>
        </Card>

        <Card className="border-dashed border-2 border-gray-200">
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Rocket className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Actionable Steps</h3>
            <p className="text-sm text-gray-600">
              Concrete recommendations to address identified blind spots
            </p>
          </CardContent>
        </Card>

        <Card className="border-dashed border-2 border-gray-200">
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Share Results</h3>
            <p className="text-sm text-gray-600">
              Generate beautiful reports to share with your team
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}