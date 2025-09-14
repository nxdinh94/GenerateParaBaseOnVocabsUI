import { useState, useEffect } from 'react';
import { UserApiService, type User } from '@/services/userApiService';
import { LocalStorageService } from '@/services/localStorageService';

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
  });

  // Check authentication status on hook initialization
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const isAuthenticated = UserApiService.isAuthenticated() && !UserApiService.isTokenExpired();
      const user = isAuthenticated ? UserApiService.getCurrentUserFromToken() : null;
      
      setAuthState({
        isAuthenticated,
        user,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error checking auth status:', error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
    }
  };

  const login = (tokens: any) => {
    try {
      UserApiService.storeAuthTokens(tokens);
      const user = UserApiService.getCurrentUserFromToken();
      
      setAuthState({
        isAuthenticated: true,
        user,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  };

  const logout = () => {
    UserApiService.clearStoredAuth();
    // Clear history data from localStorage (preserves user settings)
    LocalStorageService.clearHistoryData();
    setAuthState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
    });
    // Redirect to home page and refresh to clear all data in one step
    window.location.href = '/';
  };

  const refreshAuth = () => {
    checkAuthStatus();
  };

  return {
    ...authState,
    login,
    logout,
    refreshAuth,
    checkAuthStatus,
  };
};