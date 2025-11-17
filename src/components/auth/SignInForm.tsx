import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { CaptchaChallenge } from './CaptchaChallenge';
import HCaptcha from '@hcaptcha/react-hcaptcha';

interface SignInFormProps {
  email: string;
  password: string;
  showPassword: boolean;
  isLoading: boolean;
  showCaptcha: boolean;
  failedAttempts: number;
  captchaToken: string | null;
  captchaRef: React.RefObject<HCaptcha>;
  captchaSiteKey?: string;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onShowPasswordToggle: () => void;
  onCaptchaVerify: (token: string) => void;
  onCaptchaExpire: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onCheckFailedAttempts: (email: string) => void;
}

export function SignInForm({
  email,
  password,
  showPassword,
  isLoading,
  showCaptcha,
  failedAttempts,
  captchaToken,
  captchaRef,
  captchaSiteKey,
  onEmailChange,
  onPasswordChange,
  onShowPasswordToggle,
  onCaptchaVerify,
  onCaptchaExpire,
  onSubmit,
  onCheckFailedAttempts
}: SignInFormProps) {
  const navigate = useNavigate();

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              onEmailChange(e.target.value);
              if (e.target.value.includes('@')) {
                onCheckFailedAttempts(e.target.value);
              }
            }}
            onBlur={() => {
              if (email.includes('@')) {
                onCheckFailedAttempts(email);
              }
            }}
            placeholder="you@example.com"
            disabled={isLoading}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder="••••••••"
            disabled={isLoading}
            className="pl-10 pr-10"
          />
          <button
            type="button"
            onClick={onShowPasswordToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {captchaSiteKey && showCaptcha && (
        <CaptchaChallenge
          captchaRef={captchaRef}
          captchaSiteKey={captchaSiteKey}
          failedAttempts={failedAttempts}
          onVerify={onCaptchaVerify}
          onExpire={onCaptchaExpire}
        />
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Processing...' : 'Sign In'}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => navigate('/request-password-reset')}
          className="text-sm text-primary hover:underline"
        >
          Forgot Password?
        </button>
      </div>
    </form>
  );
}
