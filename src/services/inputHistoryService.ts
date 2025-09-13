// Input History Service - handles vocabulary input history tracking
import { apiClient, handleApiError } from './apiClient';
import { UserApiService } from './userApiService';
import type { 
  InputHistoryRequest, 
  InputHistoryResponse,
  InputHistoryApiResponse 
} from '../types/api';

export class InputHistoryService {
  private static readonly ENDPOINT = '/db/input-history/';

  /**
   * Save vocabulary words to input history
   * Only works for authenticated users
   */
  async saveInputHistory(words: string[]): Promise<InputHistoryResponse> {
    try {
      // Check if user is authenticated
      if (!UserApiService.isAuthenticated()) {
        console.log('InputHistoryService: User not authenticated, skipping input history save');
        return {
          success: true,
          error: 'User must be authenticated to save input history'
        };
      }

      // Validate input
      if (!words || words.length === 0) {
        return {
          success: false,
          error: 'No words provided to save to input history'
        };
      }

      console.log('InputHistoryService: Saving input history for words:', words);

      const requestData: InputHistoryRequest = {
        words: words
      };

      const response = await apiClient.post<InputHistoryApiResponse>(
        InputHistoryService.ENDPOINT,
        requestData
      );

      if (response.data.status) {
        console.log('InputHistoryService: Input history saved successfully');
        return {
          success: true,
          message: response.data.message || 'Input history saved successfully'
        };
      } else {
        console.warn('InputHistoryService: API returned status false');
        return {
          success: false,
          error: response.data.message || 'Failed to save input history'
        };
      }

    } catch (error) {
      console.error('InputHistoryService: Save input history error:', error);
      const handledError = handleApiError(error);
      return {
        success: false,
        error: handledError.message
      };
    }
  }

  /**
   * Validate input history request data
   */
  validateRequest(data: InputHistoryRequest): { isValid: boolean; error?: string } {
    if (!data) {
      return { isValid: false, error: 'Request data is required' };
    }

    if (!data.words || !Array.isArray(data.words)) {
      return { isValid: false, error: 'Words array is required' };
    }

    if (data.words.length === 0) {
      return { isValid: false, error: 'At least one word is required' };
    }

    // Check for empty or whitespace-only words
    const invalidWords = data.words.filter(word => !word || typeof word !== 'string' || word.trim().length === 0);
    if (invalidWords.length > 0) {
      return { isValid: false, error: 'All words must be non-empty strings' };
    }

    return { isValid: true };
  }
}

// Export singleton instance
export const inputHistoryService = new InputHistoryService();
