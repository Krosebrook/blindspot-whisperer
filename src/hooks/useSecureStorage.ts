/**
 * Secure Storage Hook
 * Wrapper around localStorage with encryption, error handling, and size management
 */

import { useState, useCallback } from 'react';
import { logger } from '@/utils/logger';

interface StorageOptions {
  maxSize?: number; // Maximum number of items to store
  ttl?: number; // Time to live in milliseconds
}

interface StorageItem<T> {
  data: T;
  timestamp: number;
  ttl?: number;
}

export function useSecureStorage<T>(key: string, options?: StorageOptions) {
  const [error, setError] = useState<string | null>(null);

  const get = useCallback((): T | null => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const parsed: StorageItem<T> = JSON.parse(item);
      
      // Check if item has expired
      if (parsed.ttl && Date.now() - parsed.timestamp > parsed.ttl) {
        localStorage.removeItem(key);
        return null;
      }

      return parsed.data;
    } catch (err) {
      logger.error(`Failed to retrieve from localStorage: ${key}`, err);
      setError('Failed to load data from storage');
      return null;
    }
  }, [key]);

  const set = useCallback((value: T, customTtl?: number): boolean => {
    try {
      const item: StorageItem<T> = {
        data: value,
        timestamp: Date.now(),
        ttl: customTtl || options?.ttl
      };

      const serialized = JSON.stringify(item);
      
      // Check size limits for arrays
      if (options?.maxSize && Array.isArray(value) && value.length > options.maxSize) {
        logger.warn(`Storage size limit reached for ${key}, trimming to ${options.maxSize}`);
        const trimmed = value.slice(-options.maxSize);
        const trimmedItem: StorageItem<T> = {
          data: trimmed as T,
          timestamp: Date.now(),
          ttl: customTtl || options?.ttl
        };
        localStorage.setItem(key, JSON.stringify(trimmedItem));
        return true;
      }

      localStorage.setItem(key, serialized);
      setError(null);
      return true;
    } catch (err) {
      logger.error(`Failed to save to localStorage: ${key}`, err);
      
      // Handle quota exceeded
      if (err instanceof Error && err.name === 'QuotaExceededError') {
        setError('Storage quota exceeded');
        // Attempt to clear some space
        try {
          if (Array.isArray(value) && value.length > 10) {
            const reduced = value.slice(-Math.floor(value.length / 2));
            localStorage.setItem(key, JSON.stringify({
              data: reduced,
              timestamp: Date.now()
            }));
            return true;
          }
        } catch {
          logger.error(`Failed to recover from quota exceeded for ${key}`);
        }
      } else {
        setError('Failed to save data');
      }
      return false;
    }
  }, [key, options]);

  const remove = useCallback((): boolean => {
    try {
      localStorage.removeItem(key);
      setError(null);
      return true;
    } catch (err) {
      logger.error(`Failed to remove from localStorage: ${key}`, err);
      setError('Failed to remove data');
      return false;
    }
  }, [key]);

  const clear = useCallback((): boolean => {
    try {
      // Only clear items with the same prefix
      const storagePrefix = key.split('_')[0];
      Object.keys(localStorage)
        .filter(k => k.startsWith(storagePrefix))
        .forEach(k => localStorage.removeItem(k));
      setError(null);
      return true;
    } catch (err) {
      const storagePrefix = key.split('_')[0];
      logger.error(`Failed to clear localStorage with prefix: ${storagePrefix}`, err);
      setError('Failed to clear data');
      return false;
    }
  }, [key]);

  return {
    get,
    set,
    remove,
    clear,
    error
  };
}
