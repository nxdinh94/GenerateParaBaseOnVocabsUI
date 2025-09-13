// Paragraph Controller - handles UI logic and coordinates with services
import { ParagraphService } from '../services/paragraphService';
import { SavedParagraphService } from '../services/savedParagraphService';
import { inputHistoryService } from '../services/inputHistoryService';
import { VocabSuggestionsService } from '../services/vocabSuggestionsService';
import { triggerVocabRefresh } from '../utils/vocabRefreshEvents';
import type { 
  GenerateParagraphRequest, 
  GenerateParagraphResponse,
  SaveParagraphRequest,
  SavedParagraphsResponse,
  ParagraphSettings
} from '../types/api';

export class ParagraphController {
  private paragraphService: ParagraphService;
  private savedParagraphService: SavedParagraphService;

  constructor() {
    this.paragraphService = new ParagraphService();
    this.savedParagraphService = new SavedParagraphService();
  }

  /**
   * Generate a new paragraph with vocabulary highlighting
   */
  async generateParagraph(
    vocabularies: string[],
    settings: ParagraphSettings
  ): Promise<GenerateParagraphResponse> {
    try {
      console.log('ParagraphController: Generating paragraph');
      console.log('Vocabularies:', vocabularies);
      console.log('Settings:', settings);

      // Validate input data
      if (!vocabularies || vocabularies.length === 0) {
        return {
          success: false,
          error: 'At least one vocabulary word is required'
        };
      }

      // Convert length to number for API
      let paragraphLength: number | string = 0;
      if (settings.length === 'short') paragraphLength = 70;
      else if (settings.length === 'medium') paragraphLength = 100;
      else if (settings.length === 'long') paragraphLength = 150;
      else if (settings.length === 'custom' && settings.customLength) {
        paragraphLength = settings.customLength;
      } else {
        paragraphLength = settings.length; // fallback to string value
      }

      // Prepare request data
      const requestData: GenerateParagraphRequest = {
        vocabularies: vocabularies,
        language: settings.language,
        length: paragraphLength,
        level: settings.level,
        topic: settings.topic === 'custom' ? (settings.customTopic || 'custom') : settings.topic,
        tone: settings.tone
      };

      // Log the request data for debugging
      console.log('=== Controller: API Request Debug Info ===');
      console.log('Original vocabularies:', vocabularies);
      console.log('Original settings:', settings);
      console.log('Processed request data:', JSON.stringify(requestData, null, 2));
      console.log('=== End Debug Info ===');

      // Validate request using service validation
      const validation = this.paragraphService.validateRequest(requestData);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Call the paragraph service
      const result = await this.paragraphService.generateParagraph(requestData);
      
      // If paragraph generation was successful and user is authenticated, save input history
      if (result.success) {
        try {
          console.log('ParagraphController: Paragraph generated successfully, saving input history');
          await inputHistoryService.saveInputHistory(vocabularies);
        } catch (inputHistoryError) {
          // Don't fail the main operation if input history fails
          console.warn('ParagraphController: Failed to save input history, but paragraph generation succeeded:', inputHistoryError);
        }

        // Refresh vocabulary suggestions data after successful paragraph generation
        try {
          console.log('ParagraphController: Refreshing vocabulary suggestions data');
          await VocabSuggestionsService.refreshVocabData();
          
          // Trigger UI refresh event to notify all components
          triggerVocabRefresh();
          console.log('ParagraphController: Triggered vocabulary refresh event for UI components');
        } catch (vocabRefreshError) {
          // Don't fail the main operation if vocab refresh fails
          console.warn('ParagraphController: Failed to refresh vocabulary suggestions, but paragraph generation succeeded:', vocabRefreshError);
        }
      }
      
      return result;
    } catch (error) {
      console.error('ParagraphController: Generate paragraph error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate paragraph'
      };
    }
  }

  /**
   * Get all saved paragraphs
   */
  async getSavedParagraphs(): Promise<SavedParagraphsResponse> {
    try {
      console.log('ParagraphController: Getting saved paragraphs');
      const result = await this.savedParagraphService.getAllParagraphs();
      return result;
    } catch (error) {
      console.error('ParagraphController: Get saved paragraphs error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load saved paragraphs'
      };
    }
  }

  /**
   * Save a paragraph
   */
  async saveParagraph(request: SaveParagraphRequest): Promise<SavedParagraphsResponse> {
    try {
      console.log('ParagraphController: Saving paragraph');
      const result = await this.savedParagraphService.saveParagraph(request);
      return result;
    } catch (error) {
      console.error('ParagraphController: Save paragraph error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save paragraph'
      };
    }
  }

  /**
   * Delete a saved paragraph
   */
  async deleteSavedParagraph(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('ParagraphController: Deleting paragraph with ID:', id);
      const result = await this.savedParagraphService.deleteParagraph(id);
      return result;
    } catch (error) {
      console.error('ParagraphController: Delete paragraph error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete paragraph'
      };
    }
  }

  /**
   * Update a saved paragraph
   */
  async updateSavedParagraph(id: string, request: SaveParagraphRequest): Promise<SavedParagraphsResponse> {
    try {
      console.log('ParagraphController: Updating paragraph with ID:', id);
      const result = await this.savedParagraphService.updateParagraph(id, request);
      return result;
    } catch (error) {
      console.error('ParagraphController: Update paragraph error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update paragraph'
      };
    }
  }

  /**
   * Get a specific paragraph by ID
   */
  async getParagraphById(id: string): Promise<SavedParagraphsResponse> {
    try {
      console.log('ParagraphController: Getting paragraph by ID:', id);
      const result = await this.savedParagraphService.getParagraphById(id);
      return result;
    } catch (error) {
      console.error('ParagraphController: Get paragraph by ID error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get paragraph'
      };
    }
  }

  /**
   * Refresh saved paragraphs list
   */
  async refreshSavedParagraphs(): Promise<SavedParagraphsResponse> {
    return this.getSavedParagraphs();
  }
}

// Export singleton instance
export const paragraphController = new ParagraphController();
