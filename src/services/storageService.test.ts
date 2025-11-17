import { describe, it, expect, beforeEach, vi } from 'vitest'
import { StorageService } from './storageService'

describe('StorageService', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('get', () => {
    it('retrieves stored value', () => {
      const data = { name: 'test', value: 123 }
      const item = {
        data,
        timestamp: Date.now(),
        ttl: undefined
      }
      localStorage.setItem('test-key', JSON.stringify(item))

      const result = StorageService.get('test-key')
      expect(result).toEqual(data)
    })

    it('returns null for non-existent key', () => {
      const result = StorageService.get('non-existent')
      expect(result).toBeNull()
    })

    it('returns null for expired items', () => {
      const data = { name: 'test' }
      const item = {
        data,
        timestamp: Date.now() - 10000, // 10 seconds ago
        ttl: 5000 // 5 second TTL
      }
      localStorage.setItem('expired-key', JSON.stringify(item))

      const result = StorageService.get('expired-key')
      expect(result).toBeNull()
    })

    it('returns non-expired items with TTL', () => {
      const data = { name: 'test' }
      const item = {
        data,
        timestamp: Date.now(),
        ttl: 10000 // 10 second TTL
      }
      localStorage.setItem('valid-key', JSON.stringify(item))

      const result = StorageService.get('valid-key')
      expect(result).toEqual(data)
    })
  })

  describe('set', () => {
    it('stores value without TTL', () => {
      const data = { name: 'test', count: 42 }
      const success = StorageService.set('test-key', data)
      
      expect(success).toBe(true)
      const stored = JSON.parse(localStorage.getItem('test-key')!)
      expect(stored.data).toEqual(data)
      expect(stored.ttl).toBeUndefined()
    })

    it('stores value with TTL', () => {
      const data = { name: 'test' }
      const ttl = 5000
      const success = StorageService.set('test-key', data, ttl)
      
      expect(success).toBe(true)
      const stored = JSON.parse(localStorage.getItem('test-key')!)
      expect(stored.data).toEqual(data)
      expect(stored.ttl).toBe(ttl)
    })

    it('handles quota exceeded error', () => {
      // Mock localStorage to throw QuotaExceededError
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        const error = new Error('QuotaExceededError')
        error.name = 'QuotaExceededError'
        throw error
      })

      const success = StorageService.set('test-key', { data: 'test' })
      expect(success).toBe(false)
    })
  })

  describe('remove', () => {
    it('removes item from storage', () => {
      localStorage.setItem('test-key', 'value')
      StorageService.remove('test-key')
      
      expect(localStorage.getItem('test-key')).toBeNull()
    })
  })

  describe('clearPrefix', () => {
    it('removes items with matching prefix', () => {
      localStorage.setItem('app_key1', 'value1')
      localStorage.setItem('app_key2', 'value2')
      localStorage.setItem('other_key', 'value3')

      StorageService.clearPrefix('app_')

      expect(localStorage.getItem('app_key1')).toBeNull()
      expect(localStorage.getItem('app_key2')).toBeNull()
      expect(localStorage.getItem('other_key')).toBe('value3')
    })
  })

  describe('cleanup', () => {
    it('removes expired items', () => {
      // Expired item
      const expiredItem = {
        data: 'old',
        timestamp: Date.now() - 10000,
        ttl: 5000
      }
      localStorage.setItem('expired', JSON.stringify(expiredItem))

      // Valid item
      const validItem = {
        data: 'new',
        timestamp: Date.now(),
        ttl: 10000
      }
      localStorage.setItem('valid', JSON.stringify(validItem))

      StorageService.cleanup()

      expect(localStorage.getItem('expired')).toBeNull()
      expect(localStorage.getItem('valid')).not.toBeNull()
    })
  })

  describe('getUsage', () => {
    it('calculates storage usage', () => {
      StorageService.set('key1', { data: 'value1' })
      StorageService.set('key2', { data: 'value2' })

      const usage = StorageService.getUsage()
      
      expect(usage.used).toBeGreaterThan(0)
      expect(usage.available).toBeGreaterThan(0)
      expect(usage.used + usage.available).toBeLessThanOrEqual(10 * 1024 * 1024)
    })
  })
})
