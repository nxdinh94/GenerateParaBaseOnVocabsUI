// API Service for handling HTTP requests
import { apiClient, handleApiError } from './apiClient';
import { highlightVocabularies } from '../utits/hightlight_vocabs';

export interface GenerateParagraphRequest {
  vocabularies: string[];
  language: string;
  length: number | string;
  level: string;
  topic: string;
  tone: string;
}

// API response from server
interface ApiParagraphResponse {
  result: string;
  status: boolean;
}

export interface GenerateParagraphResponse {
  success: boolean;
  data?: {
    paragraph: string;
    message?: string;
  };
  error?: string;
}

// Helper function to map API response to our expected format
const mapApiResponse = (apiResponse: ApiParagraphResponse, vocabularies: string[]): GenerateParagraphResponse => {
  if (apiResponse.status && apiResponse.result) {
    // Use the new token-based highlighting approach
    const highlightedParagraph = highlightVocabularies(apiResponse.result, vocabularies);
    
    return {
      success: true,
      data: {
        paragraph: highlightedParagraph,
        message: 'Paragraph generated successfully'
      }
    };
  } else {
    return {
      success: false,
      error: 'Failed to generate paragraph - invalid response from server'
    };
  }
};

export class ApiService {
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
      console.error('API request failed:', error);
      throw handleApiError(error);
    }
  }

  static async generateParagraph(
    requestData: GenerateParagraphRequest
  ): Promise<GenerateParagraphResponse> {
    try {
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
      return mapApiResponse(apiResponse, requestData.vocabularies);
    } catch (error) {
      console.error('Generate paragraph failed:', error);
      
      // Handle specific timeout error for better UX
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ECONNABORTED') {
        return {
          success: false,
          error: 'The AI is taking longer than usual to generate your paragraph. This can happen with complex vocabulary sets. Please try again with fewer words or wait a moment.'
        };
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}
