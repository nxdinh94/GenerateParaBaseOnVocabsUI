// Event system for streak updates across components

export interface StreakUpdateEvent {
  count: number;
  is_qualify: boolean;
}

class StreakEventEmitter {
  private listeners: ((data: StreakUpdateEvent) => void)[] = [];

  subscribe(listener: (data: StreakUpdateEvent) => void): () => void {
    this.listeners.push(listener);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  emit(data: StreakUpdateEvent): void {
    this.listeners.forEach(listener => listener(data));
  }
}

export const streakEvents = new StreakEventEmitter();
