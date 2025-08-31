import { useState, useEffect } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Share2, 
  Eye, 
  AlertTriangle, 
  Target, 
  TrendingUp,
  ExternalLink,
  Clock,
  Shield
} from 'lucide-react'
import { ShareCardService } from '@/lib/shareCardService'
import { motion } from 'framer-motion'

export default function Share() {
  const { slug } = useParams<{ slug: string }>()
  const [shareCard, setShareCard] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const loadShareCard = async () => {
      if (!slug) {
        setError('Invalid share card link')
        setLoading(false)
        return
      }

      try {
        // Get client identifier for rate limiting
        const clientId = sessionStorage.getItem('client_id') || 
                        `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        if (!sessionStorage.getItem('client_id')) {
          sessionStorage.setItem('client_id', clientId)
        }

        const result = await ShareCardService.getPublicShareCard(slug, clientId)
        
        if (result.error) {
          setError(result.error.message || 'Failed to load share card')
        } else if (result.data) {
          setShareCard(result.data)
        } else {
          setError('Share card not found or has expired')
        }
      } catch (err) {
        console.error('Error loading share card:', err)
        setError('Something went wrong loading this share card')
      } finally {
        setLoading(false)
      }
    }

    loadShareCard()
  }, [slug])

  const handleShare = async () => {
    if (!shareCard) return

    const shareData = {
      title: `BlindSpot Radar: ${shareCard.title}`,
      text: shareCard.description || 'Check out my business blind spots analysis',
      url: window.location.href
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href)
        // You could show a toast here
      }
    } catch (err) {
      console.warn('Sharing failed:', err)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'  
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-pulse space-y-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
            <p className="text-muted-foreground mt-4">Loading share card...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Share Card Unavailable</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button asChild>
              <a href="/">Try BlindSpot Radar</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!shareCard) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>Shared BlindSpot Analysis</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{shareCard.title}</h1>
          {shareCard.description && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {shareCard.description}
            </p>
          )}
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-4 gap-4"
        >
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">
                {shareCard.blind_spot_count || 0}
              </p>
              <p className="text-sm text-muted-foreground">Total Blind Spots</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-600">
                {shareCard.critical_count || 0}
              </p>
              <p className="text-sm text-muted-foreground">Critical Issues</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">
                {shareCard.scans?.persona || 'Business'}
              </p>
              <p className="text-sm text-muted-foreground">Analysis Type</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Eye className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-600">
                {shareCard.view_count || 0}
              </p>
              <p className="text-sm text-muted-foreground">Views</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Key Insights */}
        {shareCard.key_insights && shareCard.key_insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span>Key Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {shareCard.key_insights.map((insight: string, index: number) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <p className="text-gray-700">{insight}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center space-y-6"
        >
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">
                Discover Your Own Blind Spots
              </h3>
              <p className="text-lg opacity-90 mb-6">
                Get AI-powered insights tailored to your business and identify risks before they impact your success.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  variant="secondary"
                  asChild
                  className="bg-white text-blue-600 hover:bg-blue-50"
                >
                  <a href="/scan">
                    <Target className="w-5 h-5 mr-2" />
                    Start Your Analysis
                  </a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleShare}
                  className="border-white text-white hover:bg-white/10"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Share This Card
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Alert className="max-w-2xl mx-auto">
            <Shield className="h-4 w-4" />
            <AlertDescription className="text-left">
              <strong>Privacy Protected:</strong> This share card contains sanitized, anonymized insights. 
              Sensitive business information has been automatically removed for security.
            </AlertDescription>
          </Alert>

          {/* Footer */}
          <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>Generated by BlindSpot Radar AI</span>
            </div>
            <span>•</span>
            <a 
              href="/" 
              className="hover:text-blue-600 transition-colors flex items-center space-x-1"
            >
              <span>Try it yourself</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}