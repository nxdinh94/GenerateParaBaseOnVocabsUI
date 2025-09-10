// Utility functions for mapping between API and UI data formats
import type { SavedParagraphGroup } from '../types/api';

// Import the ParagraphSettings type from the UI component
interface ParagraphSettings {
  language: string;
  length: 'short' | 'medium' | 'long' | 'custom';
  customLength?: number;
  level: 'none' | 'beginner' | 'intermediate' | 'advanced';
  topic: string;
  customTopic?: string;
  tone: 'none' | 'friendly' | 'formal' | 'humorous' | 'storytelling' | 'academic';
}

export interface GeneratedParagraph {
  id: string;
  content: string;
  vocabularies: string[];
  settings: ParagraphSettings;
  timestamp: Date;
  saved: boolean;
}

// New interface for grouped paragraphs from API
export interface GroupedParagraphs {
  id: string;
  vocabularies: string[];
  paragraphs: string[];
  totalParagraphs: number;
  isGroup: boolean;
  timestamp: Date;
  saved: boolean;
}

/**
 * Convert API SavedParagraphGroup format to UI GroupedParagraphs format
 */
export function mapApiGroupToUI(apiGroup: SavedParagraphGroup): GroupedParagraphs {
  return {
    id: apiGroup.id,
    vocabularies: apiGroup.vocabs,        // API: vocabs -> UI: vocabularies
    paragraphs: apiGroup.paragraphs,      // Keep paragraphs array
    totalParagraphs: apiGroup.total_paragraphs,
    isGroup: apiGroup.is_group,
    timestamp: new Date(), // API doesn't provide timestamp for groups
    saved: true
  };
}

/**
 * Convert API SavedParagraphGroup format to individual GeneratedParagraph items
 * This flattens each paragraph in the group into separate items
 */
export function mapApiGroupToIndividualParagraphs(apiGroup: SavedParagraphGroup): GeneratedParagraph[] {
  return apiGroup.paragraphs.map((paragraph, index) => ({
    id: `${apiGroup.id}_${index}`, // Create unique ID for each paragraph
    content: paragraph,
    vocabularies: apiGroup.vocabs,    // API: vocabs -> UI: vocabularies
    settings: { 
      language: 'english', 
      length: 'short', 
      level: 'none', 
      topic: 'none', 
      tone: 'none' 
    } as ParagraphSettings,
    timestamp: new Date(),
    saved: true
  }));
}

/**
 * Convert UI format to API request format
 */
export function mapUIToApiRequest(content: string, vocabularies: string[]) {
  return {
    paragraph: content,           // UI: content -> API: paragraph
    vocabs: vocabularies         // UI: vocabularies -> API: vocabs
  };
}

/**
 * Map array of API grouped paragraphs to UI format (as groups)
 */
export function mapApiGroupArrayToUI(apiGroups: SavedParagraphGroup[]): GroupedParagraphs[] {
  return apiGroups.map(mapApiGroupToUI);
}

/**
 * Map array of API grouped paragraphs to flattened individual paragraphs
 */
export function mapApiGroupArrayToIndividualParagraphs(apiGroups: SavedParagraphGroup[]): GeneratedParagraph[] {
  return apiGroups.flatMap(mapApiGroupToIndividualParagraphs);
}
