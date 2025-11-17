import { useState, useEffect } from 'react';
import { useAuthForm } from '@/hooks/useAuthForm';
import { useFailedAttempts } from '@/hooks/useFailedAttempts';
import { useBehavioralAnalytics } from '@/hooks/useBehavioralAnalytics';
import { AuthFormLayout } from './auth/AuthFormLayout';
import { SignInForm } from './auth/SignInForm';
import { SignUpForm } from './auth/SignUpForm';

interface AuthFormProps {
  mode?: 'signin' | 'signup';
  onSuccess?: () => void;
  className?: string;
}

export default function AuthForm({ mode = 'signin', onSuccess, className = '' }: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(mode === 'signup');
  const captchaSiteKey = import.meta.env.VITE_CAPTCHA_SITE_KEY;

  const { startTracking, stopTracking } = useBehavioralAnalytics();
  
  const {
    failedAttempts,
    showCaptcha,
    checkFailedAttempts,
    trackFailedAttempt,
    clearFailedAttempts
  } = useFailedAttempts();

  const {
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
  } = useAuthForm({
    isSignUp,
    onSuccess,
    onTrackFailedAttempt: trackFailedAttempt,
    onClearFailedAttempts: clearFailedAttempts
  });

  useEffect(() => {
    startTracking();
    return () => {
      stopTracking();
    };
  }, []);

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setSuccess('');
    resetForm();
  };

  const onSubmit = (e: React.FormEvent) => {
    handleSubmit(e, showCaptcha, captchaSiteKey);
  };

  return (
    <AuthFormLayout
      isSignUp={isSignUp}
      error={error}
      success={success}
      onToggleMode={toggleMode}
      className={className}
    >
      {isSignUp ? (
        <SignUpForm
          email={email}
          password={password}
          confirmPassword={confirmPassword}
          fullName={fullName}
          showPassword={showPassword}
          isLoading={isLoading}
          showCaptcha={showCaptcha}
          failedAttempts={failedAttempts}
          captchaToken={captchaToken}
          captchaRef={captchaRef}
          captchaSiteKey={captchaSiteKey}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onConfirmPasswordChange={setConfirmPassword}
          onFullNameChange={setFullName}
          onShowPasswordToggle={() => setShowPassword(!showPassword)}
          onCaptchaVerify={setCaptchaToken}
          onCaptchaExpire={() => setCaptchaToken(null)}
          onSubmit={onSubmit}
          onCheckFailedAttempts={checkFailedAttempts}
        />
      ) : (
        <SignInForm
          email={email}
          password={password}
          showPassword={showPassword}
          isLoading={isLoading}
          showCaptcha={showCaptcha}
          failedAttempts={failedAttempts}
          captchaToken={captchaToken}
          captchaRef={captchaRef}
          captchaSiteKey={captchaSiteKey}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onShowPasswordToggle={() => setShowPassword(!showPassword)}
          onCaptchaVerify={setCaptchaToken}
          onCaptchaExpire={() => setCaptchaToken(null)}
          onSubmit={onSubmit}
          onCheckFailedAttempts={checkFailedAttempts}
        />
      )}
    </AuthFormLayout>
  );
}
