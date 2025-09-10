// Services index file - Export all API services
export { apiClient, handleApiError, API_BASE_URL } from './apiClient';
export { ApiService } from './apiService';
export { UserApiService } from './userApiService';

// Export types
export type { GenerateParagraphRequest, GenerateParagraphResponse } from './apiService';
export type { User, LoginRequest, LoginResponse } from './userApiService';
