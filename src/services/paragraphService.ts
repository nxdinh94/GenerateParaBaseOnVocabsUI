// Paragraph Service - handles paragraph generation business logic
import { apiClient, handleApiError } from './apiClient';
import { highlightVocabularies } from '../utits/hightlight_vocabs';
import type { 
  GenerateParagraphRequest, 
  GenerateParagraphResponse,
  ApiParagraphResponse 
} from '../types/api';

export class ParagraphService {
  /**
   * Generate a paragraph with vocabulary highlighting
   */
  async generateParagraph(requestData: GenerateParagraphRequest): Promise<GenerateParagraphResponse> {
    try {
      console.log('ParagraphService: Generating paragraph with data:', requestData);
      
      // Call the API with extended timeout for AI processing
      const response = await apiClient.request({
        url: '/generate-paragraph',
        method: 'POST',
        data: requestData,
        timeout: 120000, // 2 minutes timeout specifically for paragraph generation
      });
      
      // The response.data should contain the API response
      const apiResponse = response.data as unknown as ApiParagraphResponse;
      
      // Map the API response to our expected format with vocabulary highlighting
      return this.mapApiResponse(apiResponse, requestData.vocabularies);
    } catch (error) {
      console.error('ParagraphService: Generate paragraph failed:', error);
      
      // Handle specific timeout error for better UX
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ECONNABORTED') {
        return {
          success: false,
          error: 'The AI is taking longer than usual to generate your paragraph. This can happen with complex vocabulary sets. Please try again with fewer words or wait a moment.'
        };
      }
      
      const handledError = handleApiError(error);
      return {
        success: false,
        error: handledError.message
      };
    }
  }

  /**
   * Map API response to our expected format with vocabulary highlighting
   */
  private mapApiResponse(apiResponse: ApiParagraphResponse, vocabularies: string[]): GenerateParagraphResponse {
    if (apiResponse.status && apiResponse.result) {
      console.log('🔍 ParagraphService: Raw API result:', apiResponse.result);
      
      // Check if the API result already contains highlighting markers (** or ***)
      const hasExistingHighlighting = /\*{2,3}.*?\*{2,3}/.test(apiResponse.result);
      
      let finalParagraph: string;
      
      if (hasExistingHighlighting) {
        // API already provided highlighting, use it as-is
        console.log('✨ ParagraphService: API provided highlighting detected, preserving it');
        finalParagraph = apiResponse.result;
      } else {
        // No highlighting from API, apply our own highlighting
        console.log('🎯 ParagraphService: No API highlighting detected, applying vocabulary highlighting');
        finalParagraph = highlightVocabularies(apiResponse.result, vocabularies);
      }
      
      console.log('📄 ParagraphService: Final paragraph:', finalParagraph);
      
      return {
        success: true,
        data: {
          paragraph: finalParagraph,
          message: 'Paragraph generated successfully'
        }
      };
    } else {
      return {
        success: false,
        error: 'Failed to generate paragraph - invalid response from server'
      };
    }
  }

  /**
   * Validate paragraph generation request
   */
  validateRequest(requestData: GenerateParagraphRequest): { isValid: boolean; error?: string } {
    if (!requestData.vocabularies || requestData.vocabularies.length === 0) {
      return { isValid: false, error: 'At least one vocabulary word is required' };
    }

    if (!requestData.language || requestData.language.trim().length === 0) {
      return { isValid: false, error: 'Language is required' };
    }

    if (!requestData.level || requestData.level.trim().length === 0) {
      return { isValid: false, error: 'Level is required' };
    }

    if (!requestData.topic || requestData.topic.trim().length === 0) {
      return { isValid: false, error: 'Topic is required' };
    }

    if (!requestData.tone || requestData.tone.trim().length === 0) {
      return { isValid: false, error: 'Tone is required' };
    }

    if (!requestData.length || (typeof requestData.length === 'number' && requestData.length <= 0)) {
      return { isValid: false, error: 'Valid length is required' };
    }

    return { isValid: true };
  }
}
