// Service for handling vocabulary suggestions API calls
import { apiClient, handleApiError } from './apiClient';
import { UserApiService } from './userApiService';
import type { UniqueVocabsApiResponse, VocabSuggestionsResponse, VocabFrequency, VocabDocument } from '../types/api';

export class VocabSuggestionsService {
  /**
   * Get unique vocabularies from server with document data
   * Sorted by newest (default sort method from API)
   */
  static async getUniqueVocabs(): Promise<VocabSuggestionsResponse> {
    try {
      // Check authentication before making API call
      if (!UserApiService.isAuthenticated()) {
        console.log('⚠️ VocabSuggestionsService: User not authenticated, cannot fetch vocabulary data');
        return {
          success: false,
          error: 'Authentication required to access vocabulary suggestions'
        };
      }

      console.log('🔄 Fetching unique vocabularies from API...');
      
      const response = await apiClient.get<UniqueVocabsApiResponse>('/unique-vocabs?sort=frequent');
      
      if (response.data && response.data.status) {
        // Extract all vocabularies from documents with their IDs
        const frequencyData: VocabFrequency[] = [];
        const uniqueVocabs: string[] = [];
        
        response.data.documents.forEach((doc: VocabDocument) => {
          doc.vocabs.forEach((vocab: string) => {
            if (!uniqueVocabs.includes(vocab)) {
              uniqueVocabs.push(vocab);
              frequencyData.push({
                id: doc.id,
                vocab: vocab,
                frequency: 1 // Set frequency to 1 since the new API doesn't provide frequency
              });
            }
          });
        });
        
        console.log('✅ Successfully fetched unique vocabularies:', {
          total: response.data.total_documents,
          uniqueVocabs: uniqueVocabs.length,
          message: response.data.message
        });
        
        return {
          success: true,
          data: {
            totalDocuments: response.data.total_documents,
            documents: response.data.documents,
            uniqueVocabs: uniqueVocabs,
            frequencyData: frequencyData,
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
   * Get vocabulary suggestions sorted by document creation date (newest first)
   * Returns array of vocab strings with their IDs
   */
  static async getVocabSuggestionsSorted(): Promise<{ vocab: string; id: string }[]> {
    try {
      const response = await this.getUniqueVocabs();
      
      if (response.success && response.data) {
        // Return vocab suggestions with their IDs from frequency data
        return response.data.frequencyData.map(item => ({
          vocab: item.vocab,
          id: item.id || ''
        }));
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
   * Get top N most recent vocabularies
   */
  static async getTopRecentVocabs(limit: number = 10): Promise<string[]> {
    try {
      const response = await this.getUniqueVocabs();
      
      if (response.success && response.data) {
        // Take top N vocabularies (already sorted by newest from API)
        return response.data.uniqueVocabs.slice(0, limit);
      } else {
        console.warn('⚠️ Failed to fetch top recent vocabularies, using empty array');
        return [];
      }
    } catch (error) {
      console.error('❌ Error getting top recent vocabularies:', error);
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
