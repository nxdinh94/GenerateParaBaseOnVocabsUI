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

export interface GoogleLoginRequest {
  authorization_code: string;
}

export interface GoogleLoginResponse {
  access_token: string;
  jwt_token: string;
  refresh_token: string;
  jwt_refresh_token: string;
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

  // Google OAuth login
  static async googleLogin(requestData: GoogleLoginRequest): Promise<GoogleLoginResponse> {
    return this.makeRequest<GoogleLoginResponse>('/auth/google/login', 'POST', requestData);
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

  // Helper methods for token management
  static getStoredJwtToken(): string | null {
    return sessionStorage.getItem('jwt_token');
  }

  static getStoredAccessToken(): string | null {
    return sessionStorage.getItem('access_token');
  }

  static getStoredRefreshToken(): string | null {
    return sessionStorage.getItem('refresh_token');
  }

  static getStoredJwtRefreshToken(): string | null {
    return sessionStorage.getItem('jwt_refresh_token');
  }

  static getStoredUser(): User | null {
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr) as User;
      } catch {
        return null;
      }
    }
    return null;
  }

  static storeAuthTokens(response: GoogleLoginResponse): void {
    sessionStorage.setItem('jwt_token', response.jwt_token);
    sessionStorage.setItem('access_token', response.access_token);
    sessionStorage.setItem('refresh_token', response.refresh_token);
    sessionStorage.setItem('jwt_refresh_token', response.jwt_refresh_token);
  }

  static storeUser(user: User): void {
    sessionStorage.setItem('user', JSON.stringify(user));
  }

  static clearStoredAuth(): void {
    sessionStorage.removeItem('jwt_token');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('jwt_refresh_token');
    sessionStorage.removeItem('user');
  }

  static isAuthenticated(): boolean {
    return !!this.getStoredJwtToken();
  }

  // JWT Token utilities
  static decodeJwtToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      return null;
    }
  }

  static getCurrentUserFromToken(): User | null {
    const jwtToken = this.getStoredJwtToken();
    if (!jwtToken) return null;

    const decoded = this.decodeJwtToken(jwtToken);
    if (!decoded) return null;

    // Map JWT payload to User interface
    return {
      id: decoded.user_id,
      name: decoded.name,
      email: decoded.email,
      avatar: decoded.picture
    };
  }

  static isTokenExpired(): boolean {
    const jwtToken = this.getStoredJwtToken();
    if (!jwtToken) return true;

    const decoded = this.decodeJwtToken(jwtToken);
    if (!decoded || !decoded.exp) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  }
}
