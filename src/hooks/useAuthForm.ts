import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { validateWithSchema, signInSchema, signUpSchema } from '@/utils/validation';
import { ErrorHandler } from '@/utils/errorHandler';
import { logger } from '@/utils/logger';
import { useAuth } from '@/components/AuthProvider';
import { useBehavioralAnalytics } from '@/hooks/useBehavioralAnalytics';

interface UseAuthFormProps {
  isSignUp: boolean;
  onSuccess?: () => void;
  onTrackFailedAttempt: (email: string) => void;
  onClearFailedAttempts: (email: string) => void;
}

export function useAuthForm({ 
  isSignUp, 
  onSuccess, 
  onTrackFailedAttempt, 
  onClearFailedAttempts 
}: UseAuthFormProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<HCaptcha>(null);

  const { signIn, signUp } = useAuth();
  const { getCurrentScore } = useBehavioralAnalytics();

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setCaptchaToken(null);
    captchaRef.current?.resetCaptcha();
  };

  const handleSubmit = async (e: React.FormEvent, showCaptcha: boolean, captchaSiteKey?: string) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const currentScore = getCurrentScore();
    logger.debug('Bot score calculated', { score: currentScore?.score, recommendation: currentScore?.recommendation });

    if (currentScore && currentScore.recommendation === 'challenge' && !showCaptcha) {
      setError('Security verification required. Please complete the CAPTCHA.');
      return;
    }

    if (currentScore && currentScore.recommendation === 'block') {
      setError('Suspicious activity detected. Please try again later.');
      return;
    }

    const validationSchema = isSignUp ? signUpSchema : signInSchema;
    const validationData = isSignUp 
      ? { email, password, confirmPassword }
      : { email, password };
    
    const validation = validateWithSchema(validationSchema, validationData);
    
    if (!validation.success) {
      const errorMessage = ErrorHandler.handleValidationError(validation.errors || ['Invalid input']);
      setError(errorMessage.message);
      return;
    }

    if (captchaSiteKey && showCaptcha && !captchaToken) {
      setError('Please complete the CAPTCHA verification');
      return;
    }

    if (isSignUp && !fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error: signUpError } = await signUp(email, password, {
          full_name: fullName.trim(),
          captchaToken
        });

        if (signUpError) {
          const appError = ErrorHandler.handleAuthError(signUpError);
          setError(appError.message);
          onTrackFailedAttempt(email);
          captchaRef.current?.resetCaptcha();
          setCaptchaToken(null);
          return;
        }

        onClearFailedAttempts(email);
        setSuccess('Account created successfully! Please check your email to verify your account.');
        
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            navigate('/dashboard');
          }
        }, 2000);
      } else {
        const { error: signInError } = await signIn(email, password, captchaToken || undefined);

        if (signInError) {
          const appError = ErrorHandler.handleAuthError(signInError);
          setError(appError.message);
          onTrackFailedAttempt(email);
          captchaRef.current?.resetCaptcha();
          setCaptchaToken(null);
          return;
        }

        onClearFailedAttempts(email);
        setSuccess('Sign in successful!');
        
        if (onSuccess) {
          onSuccess();
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      const appError = ErrorHandler.handle(err, 'AuthForm');
      setError(appError.message);
      onTrackFailedAttempt(email);
      captchaRef.current?.resetCaptcha();
      setCaptchaToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    fullName,
    setFullName,
    showPassword,
    setShowPassword,
    isLoading,
    error,
    setError,
    success,
    setSuccess,
    captchaToken,
    setCaptchaToken,
    captchaRef,
    handleSubmit,
    resetForm
  };
}
