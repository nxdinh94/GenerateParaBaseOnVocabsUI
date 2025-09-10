// Utility functions for mapping between API and UI data formats
import type { SavedParagraph } from '../types/api';

export interface GeneratedParagraph {
  id: string;
  content: string;
  vocabularies: string[];
  settings?: any;
  timestamp: Date;
  saved: boolean;
}

/**
 * Convert API SavedParagraph format to UI GeneratedParagraph format
 */
export function mapApiToUI(apiParagraph: SavedParagraph): GeneratedParagraph {
  return {
    id: apiParagraph.id,
    content: apiParagraph.paragraph,      // API: paragraph -> UI: content
    vocabularies: apiParagraph.vocabs,    // API: vocabs -> UI: vocabularies
    settings: { 
      language: 'english', 
      length: 'short', 
      level: 'none', 
      topic: 'none', 
      tone: 'none' 
    },
    timestamp: new Date(apiParagraph.created_at || new Date()),
    saved: true
  };
}

/**
 * Convert UI format to API SaveParagraphRequest format
 */
export function mapUIToApiRequest(content: string, vocabularies: string[]) {
  return {
    paragraph: content,           // UI: content -> API: paragraph
    vocabs: vocabularies         // UI: vocabularies -> API: vocabs
  };
}

/**
 * Map array of API paragraphs to UI format
 */
export function mapApiArrayToUI(apiParagraphs: SavedParagraph[]): GeneratedParagraph[] {
  return apiParagraphs.map(mapApiToUI);
}
