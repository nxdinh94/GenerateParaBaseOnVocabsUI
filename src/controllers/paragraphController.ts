import { ApiService } from '../services/apiService';
import type { GenerateParagraphRequest, GenerateParagraphResponse } from '../services/apiService';

export interface ParagraphSettings {
  language: string;
  length: 'short' | 'medium' | 'long' | 'custom';
  customLength?: number;
  level: 'none' | 'beginner' | 'intermediate' | 'advanced';
  topic: string;
  customTopic?: string;
  tone: 'none' | 'friendly' | 'formal' | 'humorous' | 'storytelling' | 'academic';
}

export class ParagraphController {
  static async generateParagraph(
    vocabularies: string[],
    settings: ParagraphSettings
  ): Promise<GenerateParagraphResponse> {
    try {
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
      console.log('=== API Request Debug Info ===');
      console.log('Original vocabularies:', vocabularies);
      console.log('Original settings:', settings);
      console.log('Processed request data:', JSON.stringify(requestData, null, 2));
      console.log('=== End Debug Info ===');

      // Call the API service
      const response = await ApiService.generateParagraph(requestData);
      
      return response;
    } catch (error) {
      console.error('Error generating paragraph:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}
