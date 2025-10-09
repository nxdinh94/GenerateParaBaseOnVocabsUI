// Service for handling vocabulary suggestions API calls
import { apiClient, handleApiError } from './apiClient';
import { UserApiService } from './userApiService';
import { VocabCollectionService } from './vocabCollectionService';
import type { UniqueVocabsApiResponse, VocabSuggestionsResponse, VocabFrequency, VocabDocument } from '../types/api';

export class VocabSuggestionsService {
  // Cache for collection ID to avoid multiple API calls
  private static cachedCollectionId: string | null = null;
  private static collectionCacheTime: number = 0;
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get a valid collection ID from user's available collections
   * Returns the first active collection ID or null if none available
   */
  private static async getFirstAvailableCollectionId(): Promise<string | null> {
    // Check cache first
    const now = Date.now();
    if (this.cachedCollectionId && (now - this.collectionCacheTime) < this.CACHE_DURATION) {
      console.log('🔄 Using cached collection ID:', this.cachedCollectionId);
      return this.cachedCollectionId;
    }

    try {
      console.log('🔄 Fetching available collections...');
      const collectionsResponse = await VocabCollectionService.getVocabCollections();
      if (collectionsResponse.success && collectionsResponse.data && collectionsResponse.data.length > 0) {
        // Find the first active collection
        const activeCollection = collectionsResponse.data.find(c => c.status === true);
        if (activeCollection && activeCollection.id) {
          // Cache the result
          this.cachedCollectionId = activeCollection.id;
          this.collectionCacheTime = now;
          console.log('✅ Found and cached active collection:', activeCollection.id);
          return activeCollection.id;
        }
        
        // If no active collection, use the first available collection
        const firstCollection = collectionsResponse.data[0];
        if (firstCollection && firstCollection.id) {
          // Cache the result
          this.cachedCollectionId = firstCollection.id;
          this.collectionCacheTime = now;
          console.log('✅ Found and cached first collection:', firstCollection.id);
          return firstCollection.id;
        }
      }
      
      // Clear cache if no collections found
      this.cachedCollectionId = null;
      this.collectionCacheTime = 0;
      return null;
    } catch (error) {
      console.warn('⚠️ Failed to fetch collections for vocabulary suggestions:', error);
      // Clear cache on error
      this.cachedCollectionId = null;
      this.collectionCacheTime = 0;
      return null;
    }
  }

  /**
   * Get unique vocabularies from server with document data
   * Sorted by newest (default sort method from API)
   */
  static async getUniqueVocabs(collectionId?: string, sort: string = 'frequent'): Promise<VocabSuggestionsResponse> {
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
      
      // Get a valid collection ID (required by API and must be a valid ObjectId)
      let finalCollectionId: string;
      
      if (collectionId) {
        finalCollectionId = collectionId;
      } else {
        // Try to get an available collection ID from user's collections
        const availableCollectionId = await this.getFirstAvailableCollectionId();
        
        if (!availableCollectionId) {
          console.log('ℹ️ No valid collection ID available for vocabulary suggestions - returning empty data');
          return {
            success: true,
            data: {
              totalDocuments: 0,
              documents: [],
              uniqueVocabs: [],
              frequencyData: [],
              message: 'No collections available. Please create a collection to see vocabulary suggestions.'
            }
          };
        }
        
        finalCollectionId = availableCollectionId;
      }
      
      console.log(`🔄 Using collection ID: ${finalCollectionId}`);
      
      // Build query parameters - collection_id is required by API
      const queryParams = new URLSearchParams({ 
        sort,
        collection_id: finalCollectionId
      });
      
      const response = await apiClient.get<UniqueVocabsApiResponse>(`/vocabs_base_on_category?${queryParams.toString()}`);
      
      if (response.data && response.data.status) {
        // Extract all vocabularies from documents with their IDs
        const frequencyData: VocabFrequency[] = [];
        const uniqueVocabs: string[] = [];
        
        response.data.documents.forEach((doc: VocabDocument) => {
          // Each document has a single "vocab" property, not an array "vocabs"
          if (doc.vocab && !uniqueVocabs.includes(doc.vocab)) {
            uniqueVocabs.push(doc.vocab);
            frequencyData.push({
              id: doc.id,
              vocab: doc.vocab,
              frequency: doc.usage_count || 1 // Use usage_count from API
            });
          }
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
  static async getVocabSuggestionsSorted(collectionId?: string, sort: string = 'newest'): Promise<{ vocab: string; id: string }[]> {
    try {
      const response = await this.getUniqueVocabs(collectionId, sort);
      
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
  static async getTopRecentVocabs(limit: number = 10, collectionId?: string, sort: string = 'newest'): Promise<string[]> {
    try {
      const response = await this.getUniqueVocabs(collectionId, sort);
      
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
  static async refreshVocabData(collectionId?: string, sort: string = 'newest'): Promise<VocabSuggestionsResponse> {
    console.log('🔄 Refreshing vocabulary suggestions data...');
    const response = await this.getUniqueVocabs(collectionId, sort);
    
    if (response.success) {
      console.log('✅ Vocabulary suggestions data refreshed successfully');
    } else {
      console.warn('⚠️ Failed to refresh vocabulary suggestions data:', response.error);
    }
    
    return response;
  }

  /**
   * Get vocabularies by collection ID with specified sort order
   * This method follows the structure: getVocabsByCollection(collectionId, sort)
   * Collection ID is required by the API
   */
  static async getVocabsByCollection(collectionId: string, sort: string = 'newest'): Promise<VocabSuggestionsResponse> {
    console.log(`🔄 Fetching vocabularies for collection: ${collectionId} with sort: ${sort}`);
    return await this.getUniqueVocabs(collectionId, sort);
  }

  /**
   * Clear the cached collection ID
   * Call this when collections are updated or user changes
   */
  static clearCollectionCache(): void {
    this.cachedCollectionId = null;
    this.collectionCacheTime = 0;
    console.log('🔄 Collection cache cleared');
  }
}
