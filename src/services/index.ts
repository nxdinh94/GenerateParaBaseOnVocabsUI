// Services index file - Export all API services
export { apiClient, handleApiError, API_BASE_URL } from './apiClient';
export { ApiService } from './apiService';
export { UserApiService } from './userApiService';
export { VocabSuggestionsService } from './vocabSuggestionsService';
export { InputHistoryService, inputHistoryService } from './inputHistoryService';
export { LearnedVocabService, learnedVocabService } from './learnedVocabService';
export { VocabCollectionService } from './vocabCollectionService';

// Export types
export type { GenerateParagraphRequest, GenerateParagraphResponse } from './apiService';
export type { User, LoginRequest, LoginResponse } from './userApiService';
export type { VocabSuggestionsResponse, VocabFrequency, InputHistoryRequest, InputHistoryResponse } from '../types/api';
export type { LearnedVocabRequest, LearnedVocabResponse } from './learnedVocabService';
export type { VocabCollection, VocabCollectionsResponse } from './vocabCollectionService';
