import { useState, useEffect } from 'react'
import { useParams, Navigate, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { supabase } from '@/integrations/supabase/client'
import { 
  Share2, 
  Eye, 
  AlertTriangle, 
  Target, 
  TrendingUp,
  ExternalLink,
  Clock,
  Shield,
  Lock
} from 'lucide-react'
import { ShareCardService } from '@/lib/shareCardService'
import { motion } from 'framer-motion'

export default function Share() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
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
        // Check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession()
        const isAuthenticated = !!session
        
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
          setShareCard({
            ...result.data,
            isLimitedView: !isAuthenticated
          })
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => window.location.href = '/'}>
              Go to Homepage
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto p-4 py-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-2">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">BlindSpot Radar</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Shared Analysis Report
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{shareCard.title}</CardTitle>
                  {!shareCard.isLimitedView && shareCard.description && (
                    <p className="text-gray-600">{shareCard.description}</p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Limited View Warning for Unauthenticated Users */}
              {shareCard.isLimitedView && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Alert className="border-blue-200 bg-blue-50">
                    <Lock className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between flex-wrap gap-2">
                      <span>Sign in to view full insights and detailed analysis</span>
                      <Button 
                        size="sm" 
                        onClick={() => navigate('/auth')}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Sign In
                      </Button>
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4 text-center">
                    <Target className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-900">{shareCard.blind_spot_count || 0}</p>
                    <p className="text-xs text-blue-700">Total Blind Spots</p>
                  </CardContent>
                </Card>

                <Card className="bg-red-50 border-red-200">
                  <CardContent className="p-4 text-center">
                    <AlertTriangle className="w-6 h-6 text-red-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-red-900">{shareCard.critical_count || 0}</p>
                    <p className="text-xs text-red-700">Critical Issues</p>
                  </CardContent>
                </Card>

                {shareCard.scans && (
                  <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-purple-900 capitalize">
                        {shareCard.scans.persona || 'N/A'}
                      </p>
                      <p className="text-xs text-purple-700">Analysis Type</p>
                    </CardContent>
                  </Card>
                )}

                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4 text-center">
                    <Eye className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-900">{shareCard.view_count || 0}</p>
                    <p className="text-xs text-green-700">Views</p>
                  </CardContent>
                </Card>
              </div>

              {/* Key Insights - Only show for authenticated users with full access */}
              {!shareCard.isLimitedView && shareCard.key_insights && shareCard.key_insights.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                    Key Insights
                  </h3>
                  <ol className="space-y-2">
                    {shareCard.key_insights.map((insight: string, index: number) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg"
                      >
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <p className="text-gray-700 flex-1">{insight}</p>
                      </motion.li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Call to Action */}
              <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <CardContent className="p-6 text-center space-y-4">
                  <h3 className="text-xl font-bold">Ready to Analyze Your Business?</h3>
                  <p className="text-blue-100">
                    Get your own comprehensive blind spot analysis and discover hidden opportunities
                  </p>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="bg-white text-blue-600 hover:bg-blue-50"
                    onClick={() => window.location.href = '/auth'}
                  >
                    Start Your Analysis
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-sm text-gray-500 space-y-2"
        >
          <p className="flex items-center justify-center gap-2">
            <Clock className="w-4 h-4" />
            Shared on {new Date(shareCard.created_at).toLocaleDateString()}
          </p>
          <p className="text-xs">
            This report is shared publicly. Content is sanitized for security.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
