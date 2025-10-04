import { apiClient, handleApiError } from './apiClient';

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
}