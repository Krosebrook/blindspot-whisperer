// Offline-first architecture with service worker integration

import { useEffect, useState } from 'react';

interface OfflineCapabilities {
  cacheAssessments: boolean;
  queueActions: boolean;
  syncOnReconnect: boolean;
  preloadCriticalData: boolean;
}

interface QueuedAction {
  id: string;
  type: 'assessment_save' | 'results_sync' | 'user_action';
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

interface OfflineData {
  blindSpotDatabase: any[];
  industryData: any[];
  companyStages: any[];
  riskCategories: any[];
  lastUpdated: Date;
}

class OfflineManager {
  private static instance: OfflineManager;
  private capabilities: OfflineCapabilities;
  private actionQueue: QueuedAction[] = [];
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;
  private retryTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.capabilities = {
      cacheAssessments: true,
      queueActions: true,
      syncOnReconnect: true,
      preloadCriticalData: true
    };

    this.initializeEventListeners();
    this.loadQueueFromStorage();
    this.initializeServiceWorker();
  }

  static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  // Initialize service worker for advanced caching
  private async initializeServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('ServiceWorker registered:', registration);

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data.type === 'CACHE_UPDATED') {
            console.log('Cache updated with new data');
          }
        });

      } catch (error) {
        console.error('ServiceWorker registration failed:', error);
      }
    }
  }

  // Network status monitoring
  private initializeEventListeners(): void {
    window.addEventListener('online', () => {
      console.log('Connection restored');
      this.isOnline = true;
      this.processQueuedActions();
    });

    window.addEventListener('offline', () => {
      console.log('Connection lost - enabling offline mode');
      this.isOnline = false;
    });

    // Page visibility change handling
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isOnline && this.actionQueue.length > 0) {
        this.processQueuedActions();
      }
    });
  }

  // Queue action for later processing
  queueAction(type: QueuedAction['type'], data: any, maxRetries: number = 3): string {
    const action: QueuedAction = {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries
    };

    this.actionQueue.push(action);
    this.saveQueueToStorage();

    // Try to process immediately if online
    if (this.isOnline) {
      this.processQueuedActions();
    }

    return action.id;
  }

  // Process queued actions when connection is restored
  private async processQueuedActions(): Promise<void> {
    if (this.syncInProgress || this.actionQueue.length === 0 || !this.isOnline) {
      return;
    }

    this.syncInProgress = true;
    console.log(`Processing ${this.actionQueue.length} queued actions`);

    const actionsToProcess = [...this.actionQueue];
    const processedActions: string[] = [];
    const failedActions: QueuedAction[] = [];

    for (const action of actionsToProcess) {
      try {
        const success = await this.processAction(action);
        if (success) {
          processedActions.push(action.id);
        } else {
          action.retryCount++;
          if (action.retryCount < action.maxRetries) {
            failedActions.push(action);
          } else {
            console.error(`Action ${action.id} failed after ${action.maxRetries} retries`);
          }
        }
      } catch (error) {
        console.error(`Error processing action ${action.id}:`, error);
        action.retryCount++;
        if (action.retryCount < action.maxRetries) {
          failedActions.push(action);
        }
      }
    }

    // Update queue - remove processed actions, keep failed ones for retry
    this.actionQueue = this.actionQueue.filter(action => 
      !processedActions.includes(action.id)
    );

    // Schedule retry for failed actions
    if (failedActions.length > 0) {
      this.scheduleRetry();
    }

    this.saveQueueToStorage();
    this.syncInProgress = false;

    console.log(`Processed ${processedActions.length} actions, ${failedActions.length} failed`);
  }

  // Process individual action
  private async processAction(action: QueuedAction): Promise<boolean> {
    switch (action.type) {
      case 'assessment_save':
        return this.syncAssessment(action.data);
      
      case 'results_sync':
        return this.syncResults(action.data);
      
      case 'user_action':
        return this.syncUserAction(action.data);
      
      default:
        console.warn(`Unknown action type: ${action.type}`);
        return false;
    }
  }

  // Sync assessment to backend (placeholder for Supabase)
  private async syncAssessment(assessmentData: any): Promise<boolean> {
    try {
      // Placeholder for actual API call
      console.log('Syncing assessment:', assessmentData.id);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real implementation, this would be:
      // const response = await supabase.from('assessments').upsert(assessmentData);
      // return response.error === null;
      
      return true;
    } catch (error) {
      console.error('Failed to sync assessment:', error);
      return false;
    }
  }

  // Sync results to backend
  private async syncResults(resultsData: any): Promise<boolean> {
    try {
      console.log('Syncing results:', resultsData);
      await new Promise(resolve => setTimeout(resolve, 500));
      return true;
    } catch (error) {
      console.error('Failed to sync results:', error);
      return false;
    }
  }

  // Sync user action to backend
  private async syncUserAction(actionData: any): Promise<boolean> {
    try {
      console.log('Syncing user action:', actionData);
      await new Promise(resolve => setTimeout(resolve, 300));
      return true;
    } catch (error) {
      console.error('Failed to sync user action:', error);
      return false;
    }
  }

  // Schedule retry for failed actions
  private scheduleRetry(): void {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }

    // Exponential backoff: wait longer for subsequent retries
    const baseDelay = 5000; // 5 seconds
    const maxDelay = 300000; // 5 minutes
    
    const averageRetryCount = this.actionQueue.reduce((sum, action) => sum + action.retryCount, 0) / this.actionQueue.length;
    const delay = Math.min(baseDelay * Math.pow(2, averageRetryCount), maxDelay);

    this.retryTimer = setTimeout(() => {
      if (this.isOnline) {
        this.processQueuedActions();
      }
    }, delay);
  }

  // Cache critical data for offline access
  async cacheOfflineData(): Promise<void> {
    if (!this.capabilities.preloadCriticalData) return;

    try {
      const offlineData: OfflineData = {
        blindSpotDatabase: await this.fetchBlindSpotDatabase(),
        industryData: await this.fetchIndustryData(),
        companyStages: await this.fetchCompanyStages(),
        riskCategories: await this.fetchRiskCategories(),
        lastUpdated: new Date()
      };

      localStorage.setItem('blindspot_offline_data', JSON.stringify(offlineData));
      console.log('Offline data cached successfully');

    } catch (error) {
      console.error('Failed to cache offline data:', error);
    }
  }

  // Get cached offline data
  getCachedOfflineData(): OfflineData | null {
    try {
      const cached = localStorage.getItem('blindspot_offline_data');
      if (!cached) return null;

      const data = JSON.parse(cached);
      
      // Check if data is stale (older than 24 hours)
      const lastUpdated = new Date(data.lastUpdated);
      const now = new Date();
      const hoursDiff = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff > 24) {
        console.warn('Cached offline data is stale');
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to load cached offline data:', error);
      return null;
    }
  }

  // Data fetching methods (placeholders)
  private async fetchBlindSpotDatabase(): Promise<any[]> {
    // Placeholder - in real implementation, fetch from API
    return [
      {
        id: 'market-validation-timing',
        insight: 'Many founders validate their product idea but not the timing of market entry',
        confidence: 87,
        category: 'Market Validation'
      }
      // ... more blind spots
    ];
  }

  private async fetchIndustryData(): Promise<any[]> {
    return ['Technology', 'Healthcare', 'Finance', 'Education', 'Retail'];
  }

  private async fetchCompanyStages(): Promise<any[]> {
    return ['Idea Stage', 'MVP', 'Early Traction', 'Growth Stage', 'Scale Stage'];
  }

  private async fetchRiskCategories(): Promise<any[]> {
    return ['Market Risk', 'Technical Risk', 'Team Risk', 'Financial Risk'];
  }

  // Storage management
  private saveQueueToStorage(): void {
    try {
      localStorage.setItem('blindspot_action_queue', JSON.stringify(this.actionQueue));
    } catch (error) {
      console.error('Failed to save action queue:', error);
    }
  }

  private loadQueueFromStorage(): void {
    try {
      const saved = localStorage.getItem('blindspot_action_queue');
      if (saved) {
        this.actionQueue = JSON.parse(saved);
        console.log(`Loaded ${this.actionQueue.length} queued actions from storage`);
      }
    } catch (error) {
      console.error('Failed to load action queue:', error);
      this.actionQueue = [];
    }
  }

  // Public API methods
  isOffline(): boolean {
    return !this.isOnline;
  }

  getQueueLength(): number {
    return this.actionQueue.length;
  }

  clearQueue(): void {
    this.actionQueue = [];
    this.saveQueueToStorage();
  }

  getConnectionStatus(): { 
    isOnline: boolean; 
    queueLength: number; 
    syncInProgress: boolean;
    lastSyncAttempt?: Date;
  } {
    return {
      isOnline: this.isOnline,
      queueLength: this.actionQueue.length,
      syncInProgress: this.syncInProgress,
      lastSyncAttempt: this.actionQueue.length > 0 ? 
        new Date(Math.max(...this.actionQueue.map(a => a.timestamp))) : 
        undefined
    };
  }

  // Cleanup
  destroy(): void {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
  }
}

// Service Worker code (to be placed in public/sw.js)
export const serviceWorkerCode = `
const CACHE_NAME = 'blindspot-radar-v1';
const OFFLINE_RESOURCES = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/offline.html'
];

// Cache critical resources during install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(OFFLINE_RESOURCES))
  );
});

// Serve cached content when offline
self.addEventListener('fetch', event => {
  if (event.request.url.includes('/api/')) {
    // Handle API requests
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseClone));
          }
          return response;
        })
        .catch(() => {
          // Serve cached response when offline
          return caches.match(event.request);
        })
    );
  } else {
    // Handle static resources
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
  }
});
`;

// Export singleton instance
export const offlineManager = OfflineManager.getInstance();

// React hook for offline capabilities
export const useOfflineCapabilities = () => {
  const [status, setStatus] = useState(offlineManager.getConnectionStatus());

  useEffect(() => {
    const updateStatus = () => {
      setStatus(offlineManager.getConnectionStatus());
    };

    const interval = setInterval(updateStatus, 1000);
    
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  return {
    ...status,
    queueAction: (type: any, data: any) => offlineManager.queueAction(type, data),
    cacheData: () => offlineManager.cacheOfflineData(),
    getCachedData: () => offlineManager.getCachedOfflineData()
  };
};
