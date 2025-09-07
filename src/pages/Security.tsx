import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SecurityMonitor } from '@/components/SecurityMonitor'
import { Shield, Lock, Eye, Database } from 'lucide-react'

export default function Security() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Security Center
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Monitor and review security events, access controls, and data protection measures for your BlindSpot Radar account.
          </p>
        </div>

        {/* Security Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader className="text-center">
              <Shield className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <CardTitle className="text-lg">Data Protection</CardTitle>
              <CardDescription>
                All data is encrypted in transit and at rest using industry-standard protocols
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader className="text-center">
              <Lock className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <CardTitle className="text-lg">Access Control</CardTitle>
              <CardDescription>
                Row-level security policies ensure you can only access your own data
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader className="text-center">
              <Eye className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <CardTitle className="text-lg">Audit Logging</CardTitle>
              <CardDescription>
                All security events are logged and monitored for suspicious activity
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Security Features */}
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Security Features
            </CardTitle>
            <CardDescription>
              BlindSpot Radar implements multiple layers of security to protect your data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Input Sanitization</h4>
                <p className="text-sm text-muted-foreground">
                  All user inputs are automatically sanitized to prevent XSS attacks and remove sensitive information like emails, phone numbers, and API keys.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Rate Limiting</h4>
                <p className="text-sm text-muted-foreground">
                  Progressive rate limiting prevents abuse and protects against DDoS attacks, with stricter limits for repeated violations.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Content Quality Scoring</h4>
                <p className="text-sm text-muted-foreground">
                  Advanced ML-style scoring evaluates content quality and flags potential spam or inappropriate content automatically.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Threat Detection</h4>
                <p className="text-sm text-muted-foreground">
                  Real-time scanning for SQL injection, XSS attempts, and command injection patterns in all user inputs.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Monitor */}
        <SecurityMonitor />
      </div>
    </div>
  )
}