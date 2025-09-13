// Vocabulary Refresh Event System
// Simple event emitter for notifying components to refresh vocabulary data

type VocabRefreshListener = () => void;

class VocabRefreshEventEmitter {
  private listeners: VocabRefreshListener[] = [];

  /**
   * Subscribe to vocabulary refresh events
   */
  subscribe(listener: VocabRefreshListener): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Emit a vocabulary refresh event
   * This will notify all subscribed components to refresh their vocab data
   */
  emit(): void {
    console.log('🔄 VocabRefreshEventEmitter: Emitting refresh event to', this.listeners.length, 'listeners');
    this.listeners.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.error('❌ Error in vocab refresh listener:', error);
      }
    });
  }

  /**
   * Get current number of listeners (for debugging)
   */
  getListenerCount(): number {
    return this.listeners.length;
  }
}

// Export singleton instance
export const vocabRefreshEventEmitter = new VocabRefreshEventEmitter();

// Convenience function to trigger vocab refresh
export const triggerVocabRefresh = (): void => {
  vocabRefreshEventEmitter.emit();
};