import { useState, useEffect } from 'react';
import { VocabSuggestionsService } from '../services/vocabSuggestionsService';
import { vocabRefreshEventEmitter } from '../utils/vocabRefreshEvents';
import type { VocabFrequency } from '../types/api';

/**
 * Custom hook for managing vocabulary suggestions from API
 */
export const useVocabSuggestions = () => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [frequencyData, setFrequencyData] = useState<VocabFrequency[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSuggestions = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await VocabSuggestionsService.getUniqueVocabs();
      
      if (response.success && response.data) {
        const vocabSuggestions = response.data.frequencyData.map(item => item.vocab);
        setSuggestions(vocabSuggestions);
        setFrequencyData(response.data.frequencyData);
        console.log('✅ Vocabulary suggestions loaded for TagInput:', vocabSuggestions.length);
      } else {
        throw new Error(response.error || 'Failed to load vocabulary suggestions');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load vocabulary suggestions';
      setError(errorMessage);
      console.error('❌ Error loading vocabulary suggestions for TagInput:', error);
      
      // No fallback - keep suggestions empty if API fails
      setSuggestions([]);
      setFrequencyData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, []);

  // Listen for vocab refresh events
  useEffect(() => {
    const unsubscribe = vocabRefreshEventEmitter.subscribe(() => {
      console.log('🔄 useVocabSuggestions: Received refresh event, reloading suggestions');
      loadSuggestions();
    });

    return unsubscribe;
  }, []);

  return {
    suggestions,
    frequencyData,
    isLoading,
    error,
    reload: loadSuggestions
  };
};
