// Deprecated API Service - Use controllers and services instead
// This file is kept for backward compatibility
// New architecture: UI -> Controller -> Service -> API Client

export { paragraphController } from '../controllers/paragraphController';

// Re-export types for backward compatibility
export type { 
  GenerateParagraphRequest,
  GenerateParagraphResponse,
  SavedParagraph,
  SaveParagraphRequest,
  SavedParagraphsResponse,
  ParagraphSettings
} from '../types/api';

// Deprecated: Use paragraphController instead
export class ApiService {
  static async generateParagraph() {
    throw new Error('ApiService.generateParagraph is deprecated. Use paragraphController.generateParagraph instead.');
  }

  static async getSavedParagraphs() {
    throw new Error('ApiService.getSavedParagraphs is deprecated. Use paragraphController.getSavedParagraphs instead.');
  }

  static async saveParagraph() {
    throw new Error('ApiService.saveParagraph is deprecated. Use paragraphController.saveParagraph instead.');
  }

  static async deleteSavedParagraph() {
    throw new Error('ApiService.deleteSavedParagraph is deprecated. Use paragraphController.deleteSavedParagraph instead.');
  }
}
