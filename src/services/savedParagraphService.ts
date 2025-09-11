// Saved Paragraph Service - handles saved paragraph business logic
import { apiClient, handleApiError } from './apiClient';
import type { 
  SavedParagraphGroup,
  SavedParagraph,
  SaveParagraphRequest,
  SavedParagraphsResponse,
  SavedParagraphsApiResponse 
} from '../types/api';

export class SavedParagraphService {
  /**
   * Get all saved paragraphs
   */
  async getAllParagraphs(): Promise<SavedParagraphsResponse> {
    try {
      console.log('SavedParagraphService: Fetching all saved paragraphs');
      
      const response = await apiClient.request({
        url: '/saved-paragraphs',
        params : {grouped: true},
        method: 'GET',
      });
      
      // Handle the actual API response structure
      const apiResponse = response.data as SavedParagraphsApiResponse;
      
      if (apiResponse.status && apiResponse.data) {
        return {
          success: true,
          data: apiResponse.data,
          total: apiResponse.total
        };
      } else {
        return {
          success: false,
          error: 'Invalid response from server'
        };
      }
    } catch (error) {
      console.error('SavedParagraphService: Get saved paragraphs failed:', error);
      const handledError = handleApiError(error);
      
      return {
        success: false,
        error: handledError.message
      };
    }
  }

  /**
   * Save a paragraph
   */
  async saveParagraph(requestData: SaveParagraphRequest): Promise<SavedParagraphsResponse> {
    try {
      console.log('SavedParagraphService: Saving paragraph:', requestData);
      
      // Validate request
      const validation = this.validateSaveRequest(requestData);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error
        };
      }
      
      const response = await apiClient.request({
        url: '/save-paragraph',
        method: 'POST',
        data: requestData,
      });
      
      // Handle the actual API response structure
      const responseData = response.data as any;
      
      if (responseData.status && responseData.saved_paragraph_id) {
        // Convert the save response to a group format for consistency
        const groupFormat: SavedParagraphGroup = {
          id: responseData.saved_paragraph_id,
          vocabs: requestData.vocabs,
          is_group: true,
          paragraphs: [requestData.paragraph],
          total_paragraphs: 1
        };
        
        return {
          success: true,
          data: [groupFormat],
          message: responseData.message
        };
      } else {
        return {
          success: false,
          error: responseData.message || 'Failed to save paragraph'
        };
      }
    } catch (error) {
      console.error('SavedParagraphService: Save paragraph failed:', error);
      const handledError = handleApiError(error);
      
      return {
        success: false,
        error: handledError.message
      };
    }
  }

  /**
   * Delete a saved paragraph
   */
  async deleteParagraph(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('SavedParagraphService: Deleting paragraph with ID:', id);
      
      // Validate ID
      if (!id || id.trim().length === 0) {
        return {
          success: false,
          error: 'Paragraph ID is required'
        };
      }
      
      await apiClient.request({
        url: `/saved-paragraphs/${id}`,
        method: 'DELETE',
      });
      
      return { success: true };
    } catch (error) {
      console.error('SavedParagraphService: Delete saved paragraph failed:', error);
      const handledError = handleApiError(error);
      
      return {
        success: false,
        error: handledError.message
      };
    }
  }

  /**
   * Update a saved paragraph
   */
  async updateParagraph(id: string, requestData: SaveParagraphRequest): Promise<SavedParagraphsResponse> {
    try {
      console.log('SavedParagraphService: Updating paragraph:', { id, requestData });
      
      // Validate ID and request
      if (!id || id.trim().length === 0) {
        return {
          success: false,
          error: 'Paragraph ID is required'
        };
      }
      
      const validation = this.validateSaveRequest(requestData);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error
        };
      }
      
      const response = await apiClient.request({
        url: `/saved-paragraphs/${id}`,
        method: 'PUT',
        data: requestData,
      });
      
      // Convert single paragraph response to group format
      const updatedParagraph = response.data as SavedParagraph;
      const groupFormat: SavedParagraphGroup = {
        id: updatedParagraph.id,
        vocabs: updatedParagraph.vocabs,
        is_group: true,
        paragraphs: [updatedParagraph.paragraph],
        total_paragraphs: 1
      };
      
      return {
        success: true,
        data: [groupFormat]
      };
    } catch (error) {
      console.error('SavedParagraphService: Update paragraph failed:', error);
      const handledError = handleApiError(error);
      
      return {
        success: false,
        error: handledError.message
      };
    }
  }

  /**
   * Get a specific saved paragraph by ID
   */
  async getParagraphById(id: string): Promise<SavedParagraphsResponse> {
    try {
      console.log('SavedParagraphService: Fetching paragraph with ID:', id);
      
      if (!id || id.trim().length === 0) {
        return {
          success: false,
          error: 'Paragraph ID is required'
        };
      }
      
      const response = await apiClient.request({
        url: `/saved-paragraphs/${id}`,
        method: 'GET',
      });
      
      // Convert single paragraph response to group format
      const savedParagraph = response.data as SavedParagraph;
      const groupFormat: SavedParagraphGroup = {
        id: savedParagraph.id,
        vocabs: savedParagraph.vocabs,
        is_group: true,
        paragraphs: [savedParagraph.paragraph],
        total_paragraphs: 1
      };
      
      return {
        success: true,
        data: [groupFormat]
      };
    } catch (error) {
      console.error('SavedParagraphService: Get paragraph by ID failed:', error);
      const handledError = handleApiError(error);
      
      return {
        success: false,
        error: handledError.message
      };
    }
  }

  /**
   * Validate save request data
   */
  private validateSaveRequest(requestData: SaveParagraphRequest): { isValid: boolean; error?: string } {
    if (!requestData.paragraph || requestData.paragraph.trim().length === 0) {
      return { isValid: false, error: 'Paragraph content is required' };
    }

    if (!requestData.vocabs || requestData.vocabs.length === 0) {
      return { isValid: false, error: 'At least one vocabulary word is required' };
    }

    // Check if vocabularies are valid strings
    for (const vocab of requestData.vocabs) {
      if (!vocab || vocab.trim().length === 0) {
        return { isValid: false, error: 'All vocabulary words must be valid non-empty strings' };
      }
    }

    return { isValid: true };
  }
}
