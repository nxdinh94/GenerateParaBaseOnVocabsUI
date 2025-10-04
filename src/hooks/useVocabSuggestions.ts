import { useState, useEffect } from 'react';
import { VocabSuggestionsService } from '../services/vocabSuggestionsService';
import { learnedVocabService } from '../services/learnedVocabService';
import { vocabRefreshEventEmitter } from '../utils/vocabRefreshEvents';
import { UserApiService } from '../services/userApiService';
import { useToast } from './use-toast';
import type { VocabFrequency, VocabDocument } from '../types/api';

/**
 * Custom hook for managing vocabulary suggestions from API
 */
export const useVocabSuggestions = (collectionId?: string, sort: string = 'frequent') => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionData, setSuggestionData] = useState<{ vocab: string; id?: string }[]>([]);
  const [documents, setDocuments] = useState<VocabDocument[]>([]);
  const [frequencyData, setFrequencyData] = useState<VocabFrequency[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadSuggestions = async () => {
    // Check authentication before making API call
    if (!UserApiService.isAuthenticated()) {
      console.log('⚠️ useVocabSuggestions: User not authenticated, skipping vocabulary suggestions load');
      setSuggestions([]);
      setFrequencyData([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await VocabSuggestionsService.getUniqueVocabs(collectionId, sort);
      
      if (response.success && response.data) {
        const vocabSuggestions = response.data.uniqueVocabs;
        const vocabSuggestionData = response.data.frequencyData.map(item => ({
          vocab: item.vocab,
          id: item.id
        }));
        
        setSuggestions(vocabSuggestions);
        setSuggestionData(vocabSuggestionData);
        setDocuments(response.data.documents);
        setFrequencyData(response.data.frequencyData);
        
        // Clear any previous errors on successful load
        setError(null);
        
        console.log('✅ Vocabulary suggestions loaded for TagInput:', {
          suggestions: vocabSuggestions.length,
          withIds: vocabSuggestionData.filter(item => item.id).length,
          message: response.data.message
        });
      } else {
        throw new Error(response.error || 'Failed to load vocabulary suggestions');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load vocabulary suggestions';
      setError(errorMessage);
      console.error('❌ Error loading vocabulary suggestions for TagInput:', error);
      
      // No fallback - keep suggestions empty if API fails
      setSuggestions([]);
      setSuggestionData([]);
      setDocuments([]);
      setFrequencyData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const removeSuggestion = async (vocab: string, _id?: string) => {
    // Optimistic UI - remove immediately from state
    const originalSuggestions = [...suggestions];
    const originalSuggestionData = [...suggestionData];
    
    // Remove from UI immediately
    setSuggestions(prev => prev.filter(v => v !== vocab));
    setSuggestionData(prev => prev.filter(item => item.vocab !== vocab));
    
    try {
      // Call API to mark as learned
      const response = await learnedVocabService.removeLearnedVocabulary(vocab);
      
      if (response.success) {
        toast({
          title: "Vocabulary removed",
          description: `"${vocab}" has been removed from suggestions`,
        });
        
        // Refresh data to get the latest from server
        await loadSuggestions();
      } else {
        throw new Error(response.error || 'Failed to remove vocabulary');
      }
    } catch (error) {
      // Revert optimistic changes on error
      setSuggestions(originalSuggestions);
      setSuggestionData(originalSuggestionData);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove vocabulary';
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
      
      console.error('❌ Error removing vocabulary suggestion:', error);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, [collectionId, sort]);

  // Listen for vocab refresh events
  useEffect(() => {
    const unsubscribe = vocabRefreshEventEmitter.subscribe(() => {
      console.log('🔄 useVocabSuggestions: Received refresh event, checking authentication');
      // Only refresh if user is authenticated
      if (UserApiService.isAuthenticated()) {
        console.log('🔄 useVocabSuggestions: User authenticated, reloading suggestions');
        loadSuggestions();
      } else {
        console.log('⚠️ useVocabSuggestions: User not authenticated, skipping refresh');
      }
    });

    return unsubscribe;
  }, []);

  return {
    suggestions,
    suggestionData,
    documents,
    frequencyData,
    isLoading,
    error,
    reload: loadSuggestions,
    removeSuggestion
  };
};
