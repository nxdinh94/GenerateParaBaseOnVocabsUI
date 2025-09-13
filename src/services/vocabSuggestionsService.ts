// Service for handling vocabulary suggestions API calls
import { apiClient, handleApiError } from './apiClient';
import type { VocabSuggestionsApiResponse, VocabSuggestionsResponse } from '../types/api';

export class VocabSuggestionsService {
  /**
   * Get unique vocabularies from server with frequency data
   * Sorted by frequency (highest to lowest)
   */
  static async getUniqueVocabs(): Promise<VocabSuggestionsResponse> {
    try {
      console.log('🔄 Fetching unique vocabularies from API...');
      
      const response = await apiClient.get<VocabSuggestionsApiResponse>('/unique-vocabs');
      
      if (response.data && response.data.status) {
        // Sort frequency_data by frequency (highest to lowest)
        const sortedFrequencyData = response.data.frequency_data.sort((a, b) => b.frequency - a.frequency);
        
        console.log('✅ Successfully fetched unique vocabularies:', {
          total: response.data.total_unique,
          message: response.data.message
        });
        
        return {
          success: true,
          data: {
            totalUnique: response.data.total_unique,
            uniqueVocabs: response.data.unique_vocabs,
            frequencyData: sortedFrequencyData, // Already sorted by frequency
            message: response.data.message
          }
        };
      } else {
        const errorMessage = 'Invalid response from vocabulary suggestions API';
        console.error('❌', errorMessage, response.data);
        return {
          success: false,
          error: errorMessage
        };
      }
    } catch (error) {
      const handledError = handleApiError(error);
      console.error('❌ Error fetching unique vocabularies:', handledError.message);
      return {
        success: false,
        error: handledError.message
      };
    }
  }

  /**
   * Get vocabulary suggestions sorted by frequency
   * Returns array of vocab strings sorted by usage frequency
   */
  static async getVocabSuggestionsSorted(): Promise<string[]> {
    try {
      const response = await this.getUniqueVocabs();
      
      if (response.success && response.data) {
        // Extract vocab names from frequency data (already sorted by frequency)
        return response.data.frequencyData.map(item => item.vocab);
      } else {
        console.warn('⚠️ Failed to fetch vocabulary suggestions, using empty array');
        return [];
      }
    } catch (error) {
      console.error('❌ Error getting sorted vocabulary suggestions:', error);
      return [];
    }
  }

  /**
   * Get top N most frequent vocabularies
   */
  static async getTopFrequentVocabs(limit: number = 10): Promise<string[]> {
    try {
      const response = await this.getUniqueVocabs();
      
      if (response.success && response.data) {
        // Take top N vocabularies by frequency
        return response.data.frequencyData
          .slice(0, limit)
          .map(item => item.vocab);
      } else {
        console.warn('⚠️ Failed to fetch top frequent vocabularies, using empty array');
        return [];
      }
    } catch (error) {
      console.error('❌ Error getting top frequent vocabularies:', error);
      return [];
    }
  }

  /**
   * Refresh vocabulary data by calling the API
   * This is typically called after operations that might change vocab frequency (like generating paragraphs)
   */
  static async refreshVocabData(): Promise<VocabSuggestionsResponse> {
    console.log('🔄 Refreshing vocabulary suggestions data...');
    const response = await this.getUniqueVocabs();
    
    if (response.success) {
      console.log('✅ Vocabulary suggestions data refreshed successfully');
    } else {
      console.warn('⚠️ Failed to refresh vocabulary suggestions data:', response.error);
    }
    
    return response;
  }
}
