// Test service to verify JWT token authentication
import { apiClient } from './apiClient';

export interface AuthTestResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export class AuthTestService {
  // Test authenticated endpoint
  static async testAuthenticatedRequest(): Promise<AuthTestResponse> {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data as AuthTestResponse;
    } catch (error) {
      console.error('Auth test failed:', error);
      throw error;
    }
  }

  // Test protected endpoint
  static async testProtectedEndpoint(): Promise<any> {
    try {
      const response = await apiClient.get('/user/profile');
      return response.data;
    } catch (error) {
      console.error('Protected endpoint test failed:', error);
      throw error;
    }
  }

  // Test public endpoint (should not include auth header)
  static async testPublicEndpoint(): Promise<any> {
    try {
      const response = await apiClient.get('/public/health');
      return response.data;
    } catch (error) {
      console.error('Public endpoint test failed:', error);
      throw error;
    }
  }

  // Test new saved paragraphs API
  
}