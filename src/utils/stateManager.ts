// Advanced state management with persistence and sync capabilities

interface AssessmentState {
  id: string;
  userId?: string;
  intent: any;
  context: any;
  deepDive: any;
  results: any;
  progress: {
    currentStep: number;
    totalSteps: number;
    completedSteps: string[];
    lastUpdated: Date;
  };
  metadata: {
    version: string;
    device: string;
    userAgent: string;
    sessionDuration: number;
  };
}

interface StateManagerConfig {
  enableLocalStorage: boolean;
  enableBackendSync: boolean;
  autoSaveInterval: number;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
}

class StateManager {
  private static instance: StateManager;
  private config: StateManagerConfig;
  private currentState: AssessmentState | null = null;
  private syncQueue: any[] = [];
  private autoSaveTimer: NodeJS.Timeout | null = null;
  private sessionStartTime: Date;

  private constructor(config: StateManagerConfig) {
    this.config = config;
    this.sessionStartTime = new Date();
    this.initializeAutoSave();
  }

  static getInstance(config?: StateManagerConfig): StateManager {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager(config || {
        enableLocalStorage: true,
        enableBackendSync: false, // Will be enabled when Supabase is connected
        autoSaveInterval: 30000, // 30 seconds
        compressionEnabled: true,
        encryptionEnabled: false // Basic version, enable with backend
      });
    }
    return StateManager.instance;
  }

  // Generate unique assessment ID
  private generateAssessmentId(): string {
    return `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Initialize a new assessment
  initializeAssessment(totalSteps: number = 4): AssessmentState {
    const newState: AssessmentState = {
      id: this.generateAssessmentId(),
      intent: null,
      context: null,
      deepDive: null,
      results: null,
      progress: {
        currentStep: 1,
        totalSteps,
        completedSteps: [],
        lastUpdated: new Date()
      },
      metadata: {
        version: '1.0.0',
        device: this.getDeviceInfo(),
        userAgent: navigator.userAgent,
        sessionDuration: 0
      }
    };

    this.currentState = newState;
    this.saveState();
    return newState;
  }

  // Update assessment state
  updateState(updates: Partial<AssessmentState>): void {
    if (!this.currentState) {
      throw new Error('No active assessment. Call initializeAssessment() first.');
    }

    this.currentState = {
      ...this.currentState,
      ...updates,
      progress: {
        ...this.currentState.progress,
        ...updates.progress,
        lastUpdated: new Date()
      },
      metadata: {
        ...this.currentState.metadata,
        sessionDuration: Date.now() - this.sessionStartTime.getTime()
      }
    };

    this.saveState();
  }

  // Update progress
  updateProgress(step: number, completedStep?: string): void {
    if (!this.currentState) return;

    const completedSteps = completedStep 
      ? [...this.currentState.progress.completedSteps, completedStep]
      : this.currentState.progress.completedSteps;

    this.updateState({
      progress: {
        ...this.currentState.progress,
        currentStep: step,
        completedSteps: [...new Set(completedSteps)] // Remove duplicates
      }
    });
  }

  // Get current state
  getCurrentState(): AssessmentState | null {
    return this.currentState;
  }

  // Load state from storage
  loadState(assessmentId?: string): AssessmentState | null {
    if (!this.config.enableLocalStorage) return null;

    try {
      const key = assessmentId ? `blindspot_assessment_${assessmentId}` : 'blindspot_current_assessment';
      const saved = localStorage.getItem(key);
      
      if (!saved) return null;

      const parsed = JSON.parse(saved);
      
      // Decompress if needed
      const state = this.config.compressionEnabled ? this.decompress(parsed) : parsed;
      
      // Validate state structure
      if (this.validateState(state)) {
        this.currentState = {
          ...state,
          progress: {
            ...state.progress,
            lastUpdated: new Date(state.progress.lastUpdated)
          }
        };
        return this.currentState;
      }
    } catch (error) {
      console.error('Failed to load state:', error);
      // Clear corrupted state
      if (assessmentId) {
        localStorage.removeItem(`blindspot_assessment_${assessmentId}`);
      } else {
        localStorage.removeItem('blindspot_current_assessment');
      }
    }

    return null;
  }

  // Save state to storage
  private saveState(): void {
    if (!this.currentState || !this.config.enableLocalStorage) return;

    try {
      const stateToSave = this.config.compressionEnabled 
        ? this.compress(this.currentState)
        : this.currentState;

      // Save current state
      localStorage.setItem('blindspot_current_assessment', JSON.stringify(stateToSave));
      
      // Save with ID for recovery
      localStorage.setItem(
        `blindspot_assessment_${this.currentState.id}`, 
        JSON.stringify(stateToSave)
      );

      // Add to sync queue if backend sync is enabled
      if (this.config.enableBackendSync) {
        this.queueForSync(this.currentState);
      }

    } catch (error) {
      console.error('Failed to save state:', error);
    }
  }

  // Auto-save functionality
  private initializeAutoSave(): void {
    if (this.config.autoSaveInterval > 0) {
      this.autoSaveTimer = setInterval(() => {
        if (this.currentState) {
          this.saveState();
        }
      }, this.config.autoSaveInterval);
    }
  }

  // Export assessment data
  exportAssessment(): string {
    if (!this.currentState) {
      throw new Error('No assessment to export');
    }

    const exportData = {
      assessment: this.currentState,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };

    return JSON.stringify(exportData, null, 2);
  }

  // Import assessment data
  importAssessment(data: string): AssessmentState {
    try {
      const parsed = JSON.parse(data);
      
      if (!parsed.assessment || !this.validateState(parsed.assessment)) {
        throw new Error('Invalid assessment data');
      }

      this.currentState = {
        ...parsed.assessment,
        id: this.generateAssessmentId(), // Generate new ID for imported data
        progress: {
          ...parsed.assessment.progress,
          lastUpdated: new Date()
        }
      };

      this.saveState();
      return this.currentState;

    } catch (error) {
      throw new Error(`Failed to import assessment: ${error}`);
    }
  }

  // Get all saved assessments
  getSavedAssessments(): { id: string; lastUpdated: Date; progress: number }[] {
    if (!this.config.enableLocalStorage) return [];

    const assessments: { id: string; lastUpdated: Date; progress: number }[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('blindspot_assessment_')) {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            const state = JSON.parse(data);
            assessments.push({
              id: state.id,
              lastUpdated: new Date(state.progress.lastUpdated),
              progress: (state.progress.currentStep / state.progress.totalSteps) * 100
            });
          }
        } catch (error) {
          console.error('Error reading saved assessment:', error);
        }
      }
    }

    return assessments.sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());
  }

  // Delete assessment
  deleteAssessment(assessmentId: string): boolean {
    try {
      localStorage.removeItem(`blindspot_assessment_${assessmentId}`);
      
      // If this is the current assessment, clear it
      if (this.currentState?.id === assessmentId) {
        this.currentState = null;
        localStorage.removeItem('blindspot_current_assessment');
      }

      return true;
    } catch (error) {
      console.error('Failed to delete assessment:', error);
      return false;
    }
  }

  // Clear all data
  clearAllData(): void {
    try {
      // Clear all assessment data
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('blindspot_') || key.includes('assessment'))) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Clear current state
      this.currentState = null;
      this.syncQueue = [];

    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  }

  // Backend sync functionality (placeholder for Supabase integration)
  private queueForSync(state: AssessmentState): void {
    this.syncQueue.push({
      action: 'upsert',
      data: state,
      timestamp: Date.now()
    });
  }

  // Sync with backend (to be implemented with Supabase)
  async syncWithBackend(): Promise<boolean> {
    if (!this.config.enableBackendSync || this.syncQueue.length === 0) {
      return true;
    }

    // Placeholder for actual backend sync
    console.log('Backend sync not implemented - requires Supabase connection');
    return false;
  }

  // Utility methods
  private validateState(state: any): boolean {
    return state && 
           typeof state.id === 'string' &&
           typeof state.progress === 'object' &&
           typeof state.metadata === 'object';
  }

  private compress(data: any): any {
    // Simple compression placeholder - in production, use actual compression
    return data;
  }

  private decompress(data: any): any {
    // Simple decompression placeholder
    return data;
  }

  private getDeviceInfo(): string {
    const width = window.screen.width;
    const height = window.screen.height;
    
    if (width <= 768) return 'mobile';
    if (width <= 1024) return 'tablet';
    return 'desktop';
  }

  // Cleanup
  destroy(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }
}

// Export singleton instance creator
export const createStateManager = (config?: StateManagerConfig) => {
  return StateManager.getInstance(config);
};

// Export types
export type { AssessmentState, StateManagerConfig };

// Utility hooks for React components
export const useStateManager = () => {
  const stateManager = StateManager.getInstance();
  
  return {
    initializeAssessment: (totalSteps?: number) => stateManager.initializeAssessment(totalSteps),
    updateState: (updates: Partial<AssessmentState>) => stateManager.updateState(updates),
    updateProgress: (step: number, completedStep?: string) => stateManager.updateProgress(step, completedStep),
    getCurrentState: () => stateManager.getCurrentState(),
    loadState: (id?: string) => stateManager.loadState(id),
    exportAssessment: () => stateManager.exportAssessment(),
    importAssessment: (data: string) => stateManager.importAssessment(data),
    getSavedAssessments: () => stateManager.getSavedAssessments(),
    deleteAssessment: (id: string) => stateManager.deleteAssessment(id),
    clearAllData: () => stateManager.clearAllData()
  };
};