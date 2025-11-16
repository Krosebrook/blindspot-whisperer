/**
 * Storage Service
 * Centralized storage operations with type safety and error handling
 */

import { logger } from '@/utils/logger';

interface StorageItem<T> {
  data: T;
  timestamp: number;
  ttl?: number;
}

export class StorageService {
  /**
   * Get item from storage with TTL support
   */
  static get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const parsed: StorageItem<T> = JSON.parse(item);
      
      // Check TTL
      if (parsed.ttl && Date.now() - parsed.timestamp > parsed.ttl) {
        localStorage.removeItem(key);
        return null;
      }

      return parsed.data;
    } catch (error) {
      logger.error(`Failed to retrieve ${key} from storage`, error);
      return null;
    }
  }

  /**
   * Set item in storage with optional TTL
   */
  static set<T>(key: string, value: T, ttl?: number): boolean {
    try {
      const item: StorageItem<T> = {
        data: value,
        timestamp: Date.now(),
        ttl
      };
      localStorage.setItem(key, JSON.stringify(item));
      return true;
    } catch (error) {
      logger.error(`Failed to save ${key} to storage`, error);
      
      // Handle quota exceeded
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        logger.warn('Storage quota exceeded, attempting cleanup');
        this.cleanup();
        try {
          localStorage.setItem(key, JSON.stringify({ data: value, timestamp: Date.now(), ttl }));
          return true;
        } catch {
          return false;
        }
      }
      return false;
    }
  }

  /**
   * Remove item from storage
   */
  static remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      logger.error(`Failed to remove ${key} from storage`, error);
    }
  }

  /**
   * Clear all items with a specific prefix
   */
  static clearPrefix(prefix: string): void {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(prefix))
        .forEach(key => localStorage.removeItem(key));
    } catch (error) {
      logger.error(`Failed to clear storage with prefix ${prefix}`, error);
    }
  }

  /**
   * Cleanup expired items
   */
  static cleanup(): void {
    try {
      const now = Date.now();
      Object.keys(localStorage).forEach(key => {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const parsed = JSON.parse(item);
            if (parsed.ttl && now - parsed.timestamp > parsed.ttl) {
              localStorage.removeItem(key);
            }
          }
        } catch {
          // Skip invalid items
        }
      });
    } catch (error) {
      logger.error('Failed to cleanup storage', error);
    }
  }

  /**
   * Get storage usage
   */
  static getUsage(): { used: number; available: number } {
    let used = 0;
    try {
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length;
        }
      }
    } catch (error) {
      logger.error('Failed to calculate storage usage', error);
    }

    // Approximate available storage (5MB typical limit)
    const available = 5 * 1024 * 1024 - used;
    return { used, available };
  }
}
