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
      const apiResponse: any = response.data;
      
      console.log('🔍 ParagraphService: Raw API response:', apiResponse);
      console.log('🔍 ParagraphService: Response type:', typeof apiResponse);
      
      // Check if the response is the direct format
      if (apiResponse && typeof apiResponse === 'object') {
        // Direct response format: {paragraph: '...', explain_vocabs: {...}, explanation_in_paragraph: {...}}
        if (apiResponse.paragraph && typeof apiResponse.paragraph === 'string') {
          console.log('✨ ParagraphService: Direct response format detected');
          console.log('📄 Paragraph:', apiResponse.paragraph);
          console.log('📚 Raw explain_vocabs:', apiResponse.explain_vocabs);
          console.log('💡 Raw explanation_in_paragraph:', apiResponse.explanation_in_paragraph);
          
          return {
            success: true,
            data: {
              paragraph: apiResponse.paragraph,
              message: 'Paragraph generated successfully',
              explainVocabs: apiResponse.explain_vocabs,
              explanationInParagraph: apiResponse.explanation_in_paragraph
            }
          };
        }
        
        // Check for wrapped response format: {status: true, paragraph: '...', explain_vocabs: {...}, explanation_in_paragraph: {...}}
        if (apiResponse.status && apiResponse.paragraph) {
          console.log('✨ ParagraphService: Wrapped response format detected');
          return {
            success: true,
            data: {
              paragraph: apiResponse.paragraph,
              message: 'Paragraph generated successfully',
              explainVocabs: apiResponse.explain_vocabs,
              explanationInParagraph: apiResponse.explanation_in_paragraph
            }
          };
        }
      }
      
      // Fallback to original handling for backward compatibility
      const apiResponseTyped = apiResponse as ApiParagraphResponse;
      
      // Map the API response to our expected format with vocabulary highlighting
      return this.mapApiResponse(apiResponseTyped, requestData.vocabularies);
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
   * Parse JSON response if it comes wrapped in ```json``` markdown
   */
  private parseJsonResponse(result: string): any {
    try {
      // Remove ```json``` wrapper if present
      const cleanedResult = result.replace(/^```json\s*\n?/i, '').replace(/\n?```\s*$/i, '');
      
      // Try to parse as JSON
      const parsed = JSON.parse(cleanedResult);
      console.log('🔧 ParagraphService: Successfully parsed JSON result:', parsed);
      
      // Validate and clean the parsed data
      if (parsed && typeof parsed === 'object') {
        // Ensure explanation_in_paragraph values are strings
        if (parsed.explanation_in_paragraph && typeof parsed.explanation_in_paragraph === 'object') {
          Object.keys(parsed.explanation_in_paragraph).forEach(key => {
            if (typeof parsed.explanation_in_paragraph[key] !== 'string') {
              console.warn(`⚠️ ParagraphService: explanation_in_paragraph[${key}] is not a string, converting...`);
              parsed.explanation_in_paragraph[key] = String(parsed.explanation_in_paragraph[key]);
            }
          });
          console.log('✅ ParagraphService: explanation_in_paragraph object format validated');
        }
        
        // Ensure explain_vocabs values are arrays of meaning objects
        if (parsed.explain_vocabs) {
          Object.keys(parsed.explain_vocabs).forEach(vocab => {
            if (!Array.isArray(parsed.explain_vocabs[vocab])) {
              console.warn(`⚠️ ParagraphService: explain_vocabs[${vocab}] is not an array, converting...`);
              parsed.explain_vocabs[vocab] = [parsed.explain_vocabs[vocab]];
            }
            
            // Ensure each meaning has proper structure
            parsed.explain_vocabs[vocab] = parsed.explain_vocabs[vocab].map((meaning: any) => {
              if (typeof meaning === 'string') {
                return { 
                  meaning: meaning, 
                  example: '',
                  phonetic_transcription: '',
                  part_of_speech: ''
                };
              } else if (typeof meaning === 'object' && meaning !== null) {
                return {
                  meaning: meaning.meaning || '',
                  example: meaning.example || '',
                  phonetic_transcription: meaning.phonetic_transcription || '',
                  part_of_speech: meaning.part_of_speech || ''
                };
              } else {
                return { 
                  meaning: String(meaning), 
                  example: '',
                  phonetic_transcription: '',
                  part_of_speech: ''
                };
              }
            });
          });
        }
      }
      
      return parsed;
    } catch (error) {
      console.log('ℹ️ ParagraphService: Result is not JSON, treating as plain text');
      return null;
    }
  }

  /**
   * Map API response to our expected format with vocabulary highlighting
   */
  private mapApiResponse(apiResponse: ApiParagraphResponse, vocabularies: string[]): GenerateParagraphResponse {
    if (apiResponse.status) {
      // Handle new structured response
      if (apiResponse.paragraph) {
        console.log('🔍 ParagraphService: New structured API response detected');
        console.log('📄 Paragraph:', apiResponse.paragraph);
        console.log('📚 Vocabulary explanations:', apiResponse.explain_vocabs);
        console.log('💡 Context explanations:', apiResponse.explanation_in_paragraph);
        
        return {
          success: true,
          data: {
            paragraph: apiResponse.paragraph,
            message: 'Paragraph generated successfully',
            explainVocabs: apiResponse.explain_vocabs,
            explanationInParagraph: apiResponse.explanation_in_paragraph
          }
        };
      }
      // Handle legacy response format or JSON wrapped response
      else if (apiResponse.result) {
        console.log('🔍 ParagraphService: Processing result:', apiResponse.result);
        
        // Try to parse as JSON first
        const parsedJson = this.parseJsonResponse(apiResponse.result);
        
        if (parsedJson && parsedJson.paragraph) {
          // JSON response detected
          console.log('✨ ParagraphService: JSON response detected');
          console.log('📄 Parsed paragraph:', parsedJson.paragraph);
          console.log('📚 Parsed vocabulary explanations:', parsedJson.explain_vocabs);
          console.log('💡 Parsed context explanations:', parsedJson.explanation_in_paragraph);
          
          return {
            success: true,
            data: {
              paragraph: parsedJson.paragraph,
              message: 'Paragraph generated successfully',
              explainVocabs: parsedJson.explain_vocabs,
              explanationInParagraph: parsedJson.explanation_in_paragraph
            }
          };
        } else {
          // Legacy plain text response
          console.log('🔍 ParagraphService: Legacy plain text result:', apiResponse.result);
          
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
        }
      }
      else {
        return {
          success: false,
          error: 'Invalid response format - missing paragraph content'
        };
      }
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
