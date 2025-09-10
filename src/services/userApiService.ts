// Example: User API Service using shared apiClient
import { apiClient, handleApiError } from './apiClient';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data?: {
    user: User;
    token: string;
  };
  error?: string;
}

export class UserApiService {
  private static async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any
  ): Promise<T> {
    try {
      const response = await apiClient.request({
        url: endpoint,
        method,
        data,
      });
      
      return response.data;
    } catch (error) {
      console.error('User API request failed:', error);
      throw handleApiError(error);
    }
  }

  // Example: Login user
  static async login(requestData: LoginRequest): Promise<LoginResponse> {
    return this.makeRequest<LoginResponse>('/auth/login', 'POST', requestData);
  }

  // Example: Get user profile
  static async getProfile(): Promise<User> {
    return this.makeRequest<User>('/auth/profile', 'GET');
  }

  // Example: Update user profile
  static async updateProfile(userData: Partial<User>): Promise<User> {
    return this.makeRequest<User>('/auth/profile', 'PUT', userData);
  }

  // Example: Logout user
  static async logout(): Promise<{ success: boolean }> {
    return this.makeRequest<{ success: boolean }>('/auth/logout', 'POST');
  }
}
