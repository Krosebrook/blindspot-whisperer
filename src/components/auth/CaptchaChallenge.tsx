import { motion } from 'framer-motion';
import HCaptcha from '@hcaptcha/react-hcaptcha';

interface CaptchaChallengeProps {
  captchaRef: React.RefObject<HCaptcha>;
  captchaSiteKey: string;
  failedAttempts: number;
  onVerify: (token: string) => void;
  onExpire: () => void;
}

export function CaptchaChallenge({
  captchaRef,
  captchaSiteKey,
  failedAttempts,
  onVerify,
  onExpire
}: CaptchaChallengeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      transition={{ duration: 0.3 }}
      className="space-y-2"
    >
      <div className="flex justify-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="space-y-2">
          <p className="text-sm text-yellow-800 text-center">
            Security verification required after {failedAttempts} failed {failedAttempts === 1 ? 'attempt' : 'attempts'}
          </p>
          <HCaptcha
            ref={captchaRef}
            sitekey={captchaSiteKey}
            onVerify={onVerify}
            onExpire={onExpire}
          />
        </div>
      </div>
    </motion.div>
  );
}
