// Learned Vocabulary Service - handles learned vocabulary API operations
import { apiClient, handleApiError } from './apiClient';

export interface LearnedVocabRequest {
  vocabs: string[];
}

export interface LearnedVocabResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export class LearnedVocabService {
  /**
   * Mark vocabularies as learned by sending them to the learned-vocabs API
   */
  async markVocabulariesAsLearned(vocabularies: string[]): Promise<LearnedVocabResponse> {
    try {
      console.log('LearnedVocabService: Marking vocabularies as learned:', vocabularies);
      
      if (!vocabularies || vocabularies.length === 0) {
        return {
          success: false,
          error: 'No vocabularies provided to mark as learned'
        };
      }

      const requestData: LearnedVocabRequest = {
        vocabs: vocabularies
      };

      // Call the learned-vocabs API
      const response = await apiClient.request({
        url: '/learned-vocabs/',
        method: 'POST',
        data: requestData,
        timeout: 30000, // 30 seconds timeout
      });

      console.log('LearnedVocabService: API response:', response.data);

      // Check if the response indicates success
      if (response.status >= 200 && response.status < 300) {
        return {
          success: true,
          message: `Successfully marked ${vocabularies.length} vocabularies as learned`
        };
      } else {
        return {
          success: false,
          error: 'Failed to mark vocabularies as learned'
        };
      }
    } catch (error) {
      console.error('LearnedVocabService: Failed to mark vocabularies as learned:', error);
      
      const handledError = handleApiError(error);
      return {
        success: false,
        error: handledError.message
      };
    }
  }

  /**
   * Remove a specific vocabulary from the learned list by ID
   */
  async removeLearnedVocabularyById(vocabularyId: string): Promise<LearnedVocabResponse> {
    try {
      console.log('LearnedVocabService: Removing vocabulary from learned list by ID:', vocabularyId);
      
      if (!vocabularyId || vocabularyId.trim().length === 0) {
        return {
          success: false,
          error: 'No vocabulary ID provided to remove'
        };
      }

      // Call the learned-vocabs DELETE API with ID
      const response = await apiClient.request({
        url: `/learned-vocabs/${vocabularyId}`,
        method: 'DELETE',
        timeout: 30000, // 30 seconds timeout
      });

      console.log('LearnedVocabService: Remove by ID API response:', response.data);

      if (response.status >= 200 && response.status < 300) {
        return {
          success: true,
          message: `Successfully removed vocabulary from learned list`
        };
      } else {
        return {
          success: false,
          error: 'Failed to remove vocabulary from learned list'
        };
      }
    } catch (error) {
      console.error('LearnedVocabService: Failed to remove vocabulary by ID from learned list:', error);
      
      const handledError = handleApiError(error);
      return {
        success: false,
        error: handledError.message
      };
    }
  }

  /**
   * Remove a specific vocabulary from the learned list
   */
  async removeLearnedVocabulary(vocabulary: string): Promise<LearnedVocabResponse> {
    try {
      console.log('LearnedVocabService: Removing vocabulary from learned list:', vocabulary);
      
      if (!vocabulary || vocabulary.trim().length === 0) {
        return {
          success: false,
          error: 'No vocabulary provided to remove'
        };
      }

      const requestData = {
        vocab: vocabulary.trim()
      };

      // Call the learned-vocabs DELETE API with JSON body
      const response = await apiClient.request({
        url: '/learned-vocabs',
        method: 'DELETE',
        data: requestData,
        timeout: 30000, // 30 seconds timeout
      });

      console.log('LearnedVocabService: Remove API response:', response.data);

      if (response.status >= 200 && response.status < 300) {
        return {
          success: true,
          message: `Successfully removed ${vocabulary} from learned vocabularies`
        };
      } else {
        return {
          success: false,
          error: 'Failed to remove vocabulary from learned list'
        };
      }
    } catch (error) {
      console.error('LearnedVocabService: Failed to remove vocabulary from learned list:', error);
      
      const handledError = handleApiError(error);
      return {
        success: false,
        error: handledError.message
      };
    }
  }
}

// Export singleton instance
export const learnedVocabService = new LearnedVocabService();