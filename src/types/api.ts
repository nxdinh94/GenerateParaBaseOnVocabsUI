// API Types and Interfaces
export interface GenerateParagraphRequest {
  vocabularies: string[];
  language: string;
  length: number | string;
  level: string;
  topic: string;
  tone: string;
  prompt?: string;
}

// API response from server - new structure with vocabulary explanations
export interface VocabMeaning {
  meaning: string;
  example: string;
  phonetic_transcription: string;
  part_of_speech: string;
}

export interface VocabExplanations {
  [vocab: string]: VocabMeaning[];
}

export interface ExplanationInParagraph {
  [vocab: string]: string;
}

// Alternative type for when API returns explanation as single string
export type ExplanationText = string;

export interface ApiParagraphResponse {
  result?: string;  // Legacy support
  status: boolean;
  paragraph?: string;
  explain_vocabs?: VocabExplanations;
  explanation_in_paragraph?: ExplanationInParagraph;
}

export interface GenerateParagraphResponse {
  success: boolean;
  data?: {
    paragraph: string;
    message?: string;
    explainVocabs?: VocabExplanations;
    explanationInParagraph?: ExplanationInParagraph;
  };
  error?: string;
}

// Saved paragraph interfaces - Updated to match actual API response (grouped structure)
export interface SavedParagraphGroup {
  id: string;
  vocabs: string[];
  is_group: boolean;
  paragraphs: string[];          // Array of paragraphs for this vocabulary set
  total_paragraphs: number;
}

export interface SaveParagraphRequest {
  paragraph: string;
  vocabs: string[];
}

// API response structure for saved paragraphs (grouped)
export interface SavedParagraphsApiResponse {
  data: SavedParagraphGroup[];
  total: number;
  status: boolean;
}

export interface SavedParagraphsResponse {
  success: boolean;
  data?: SavedParagraphGroup[];
  total?: number;
  error?: string;
  message?: string;
}

// Legacy interface for backward compatibility
export interface SavedParagraph {
  id: string;
  paragraph: string;
  vocabs: string[];
  created_at: string;
}

// UI-specific interfaces
export interface ParagraphSettings {
  language: string;
  length: 'short' | 'medium' | 'long' | 'sentence' | 'custom';
  customLength?: number;
  level: 'none' | 'beginner' | 'intermediate' | 'advanced';
  topic: string;
  customTopic?: string;
  tone: 'none' | 'friendly' | 'formal' | 'humorous' | 'storytelling' | 'academic';
  prompt?: string;
}

// API Client types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// Vocab suggestions interfaces
export interface VocabFrequency {
  vocab: string;
  frequency: number;
}

export interface VocabSuggestionsApiResponse {
  status: boolean;
  total_unique: number;
  unique_vocabs: string[];
  frequency_data: VocabFrequency[];
  message: string;
}

export interface VocabSuggestionsResponse {
  success: boolean;
  data?: {
    totalUnique: number;
    uniqueVocabs: string[];
    frequencyData: VocabFrequency[];
    message: string;
  };
  error?: string;
}

// Input History interfaces
export interface InputHistoryRequest {
  words: string[];
}

export interface InputHistoryApiResponse {
  status: boolean;
  message?: string;
}

export interface InputHistoryResponse {
  success: boolean;
  message?: string;
  error?: string;
}
