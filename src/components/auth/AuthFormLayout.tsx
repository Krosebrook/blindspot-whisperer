import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { useBehavioralAnalytics } from '@/hooks/useBehavioralAnalytics';
import { ErrorAlert } from '@/components/ui/error-alert';
import { SuccessAlert } from '@/components/ui/success-alert';

interface AuthFormLayoutProps {
  isSignUp: boolean;
  error: string;
  success: string;
  onToggleMode: () => void;
  children: React.ReactNode;
  className?: string;
}

export function AuthFormLayout({
  isSignUp,
  error,
  success,
  onToggleMode,
  children,
  className = ''
}: AuthFormLayoutProps) {
  const { botScore } = useBehavioralAnalytics();

  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-2">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </CardTitle>
            <CardDescription>
              {isSignUp 
                ? 'Sign up to start analyzing your business blind spots'
                : 'Sign in to access your dashboard'
              }
            </CardDescription>
          </CardHeader>

          <CardContent>
            <ErrorAlert message={error} className="mb-4" />
            <SuccessAlert message={success} className="mb-4" />

            {process.env.NODE_ENV === 'development' && botScore && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-4 p-3 rounded-lg border ${
                  botScore.recommendation === 'block' 
                    ? 'bg-destructive/10 border-destructive/20' 
                    : botScore.recommendation === 'challenge'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-green-50 border-green-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Bot Score: {botScore.score}/100 (Confidence: {botScore.confidence}%)
                  </span>
                </div>
                {botScore.triggers.length > 0 && (
                  <ul className="text-xs space-y-1">
                    {botScore.triggers.map((trigger, idx) => (
                      <li key={idx}>• {trigger}</li>
                    ))}
                  </ul>
                )}
              </motion.div>
            )}

            {children}
          </CardContent>

          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              {' '}
              <button
                type="button"
                onClick={onToggleMode}
                className="text-primary hover:underline font-medium"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
