/**
 * Scan Hook
 * Custom hook for managing scan operations
 */

import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '@/lib/database'
import { logger } from '@/utils/logger'
import { ErrorHandler } from '@/utils/errorHandler'
import type { Scan, ScanInput } from '@/types'

interface UseScanResult {
  scan: Scan | null
  loading: boolean
  error: string | null
  createScan: (input: ScanInput) => Promise<Scan | null>
  getScan: (scanId: string) => Promise<Scan | null>
  getUserScans: (userId: string) => Promise<Scan[] | null>
}

export function useScan(): UseScanResult {
  const [scan, setScan] = useState<Scan | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const createScan = useCallback(async (input: ScanInput): Promise<Scan | null> => {
    setLoading(true)
    setError(null)

    try {
      logger.info('Creating scan', { persona: input.persona, userId: input.user_id })

      const { data, error: dbError } = await db.createScan({
        ...input,
        status: 'pending'
      })

      if (dbError) {
        const appError = ErrorHandler.handleDatabaseError(dbError)
        setError(appError.message)
        logger.error('Failed to create scan', dbError, { userId: input.user_id })
        return null
      }

      logger.info('Scan created successfully', { scanId: data.id })
      setScan(data as Scan)
      return data as Scan
    } catch (err) {
      const appError = ErrorHandler.handle(err, 'useScan.createScan')
      setError(appError.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const getScan = useCallback(async (scanId: string): Promise<Scan | null> => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: dbError } = await db.getScan(scanId)

      if (dbError) {
        const appError = ErrorHandler.handleDatabaseError(dbError)
        setError(appError.message)
        return null
      }

      setScan(data as Scan)
      return data as Scan
    } catch (err) {
      const appError = ErrorHandler.handle(err, 'useScan.getScan')
      setError(appError.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const getUserScans = useCallback(async (userId: string): Promise<Scan[] | null> => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: dbError } = await db.getUserScans(userId)

      if (dbError) {
        const appError = ErrorHandler.handleDatabaseError(dbError)
        setError(appError.message)
        return null
      }

      return (data || []) as unknown as Scan[]
    } catch (err) {
      const appError = ErrorHandler.handle(err, 'useScan.getUserScans')
      setError(appError.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    scan,
    loading,
    error,
    createScan,
    getScan,
    getUserScans
  }
}
