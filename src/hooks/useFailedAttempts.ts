import { useState } from 'react';
import { StorageService } from '@/services/storageService';

export function useFailedAttempts() {
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showCaptcha, setShowCaptcha] = useState(false);

  const checkFailedAttempts = (email: string) => {
    if (!email) return;
    
    const storageKey = `auth_failed_${email}`;
    const stored = StorageService.get<{ count: number; timestamp: number }>(storageKey);
    
    if (stored) {
      setFailedAttempts(stored.count);
      setShowCaptcha(stored.count >= 2);
    } else {
      setFailedAttempts(0);
      setShowCaptcha(false);
    }
  };

  const trackFailedAttempt = (email: string) => {
    const storageKey = `auth_failed_${email}`;
    const newCount = failedAttempts + 1;
    
    StorageService.set(storageKey, {
      count: newCount,
      timestamp: Date.now()
    }, 15 * 60 * 1000);
    
    setFailedAttempts(newCount);
    
    if (newCount >= 2) {
      setShowCaptcha(true);
    }
  };

  const clearFailedAttempts = (email: string) => {
    const storageKey = `auth_failed_${email}`;
    StorageService.remove(storageKey);
    setFailedAttempts(0);
    setShowCaptcha(false);
  };

  return {
    failedAttempts,
    showCaptcha,
    checkFailedAttempts,
    trackFailedAttempt,
    clearFailedAttempts
  };
}
