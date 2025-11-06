import { apiClient, handleApiError } from './apiClient';
import type { UniqueVocabsApiResponse } from '../types/api';

export interface VocabCollection {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  status: boolean;
}

export interface VocabCollectionsApiResponse {
  collections: VocabCollection[];
  total: number;
  status: boolean;
}

export interface VocabCollectionsResponse {
  success: boolean;
  data?: VocabCollection[];
  error?: string;
}

export class VocabCollectionService {
  private static async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any
  ): Promise<T> {
    try {
      const response = await apiClient.request({
        url: endpoint,
        method,
        data,
      });
      
      return response.data;
    } catch (error) {
      console.error('Vocab Collection API request failed:', error);
      throw handleApiError(error);
    }
  }

  // Get all vocab collections
  static async getVocabCollections(): Promise<VocabCollectionsResponse> {
    try {
      const apiResponse = await this.makeRequest<VocabCollectionsApiResponse>('/vocab-collections', 'GET');
      
      return {
        success: apiResponse.status,
        data: apiResponse.collections,
      };
    } catch (error) {
      console.error('❌ Error fetching vocab collections:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch vocab collections',
      };
    }
  }

  // Get vocab count for a specific collection
  static async getVocabCountForCollection(collectionId: string): Promise<number> {
    try {
      const response = await apiClient.get<UniqueVocabsApiResponse>(`/vocabs_base_on_category?collection_id=${collectionId}&limit=1`);
      
      // The API response should have total_documents field
      if (response.data && typeof response.data.total_documents === 'number') {
        return response.data.total_documents;
      }
      
      return 0;
    } catch (error) {
      console.error('❌ Error fetching vocab count for collection:', collectionId, error);
      return 0;
    }
  }

  // Extended interface for collections with vocab counts
  static async getVocabCollectionsWithCounts(): Promise<{
    success: boolean;
    data?: (VocabCollection & { vocabCount: number })[];
    error?: string;
  }> {
    try {
      const collectionsResponse = await this.getVocabCollections();
      
      if (!collectionsResponse.success || !collectionsResponse.data) {
        return {
          success: false,
          error: collectionsResponse.error || 'Failed to fetch collections'
        };
      }

      // Get vocab counts for each collection in parallel
      const collectionsWithCounts = await Promise.all(
        collectionsResponse.data.map(async (collection) => {
          const vocabCount = await this.getVocabCountForCollection(collection.id);
          return {
            ...collection,
            vocabCount
          };
        })
      );

      return {
        success: true,
        data: collectionsWithCounts,
      };
    } catch (error) {
      console.error('❌ Error fetching vocab collections with counts:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch vocab collections with counts',
      };
    }
  }

  // Change the selected collection for the user
  static async changeSelectedCollection(collectionId: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      console.log('📤 Sending change collection request for:', collectionId);
      
      const response = await this.makeRequest<{
        status: boolean;
        message?: string;
      }>('/change-selected-collection', 'POST', {
        selected_collection_id: collectionId
      });
      
      return {
        success: response.status,
        message: response.message || 'Collection changed successfully',
      };
    } catch (error) {
      console.error('❌ Error changing selected collection:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to change selected collection',
      };
    }
  }

  // Create a new vocab collection
  static async createVocabCollection(name: string): Promise<{
    success: boolean;
    data?: VocabCollection;
    error?: string;
  }> {
    try {
      console.log('📤 Creating new vocab collection:', name);
      
      const response = await this.makeRequest<{
        status: boolean;
        collection?: VocabCollection;
        message?: string;
      }>('/vocab-collections', 'POST', {
        name
      });
      
      return {
        success: response.status,
        data: response.collection,
      };
    } catch (error) {
      console.error('❌ Error creating vocab collection:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create vocab collection',
      };
    }
  }

  // Delete a vocab collection
  static async deleteVocabCollection(collectionId: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      console.log('📤 Deleting vocab collection:', collectionId);
      
      const response = await this.makeRequest<{
        status: boolean;
        message?: string;
      }>(`/vocab-collections/${collectionId}`, 'DELETE');
      
      return {
        success: response.status,
        message: response.message || 'Collection deleted successfully',
      };
    } catch (error) {
      console.error('❌ Error deleting vocab collection:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete vocab collection',
      };
    }
  }
}