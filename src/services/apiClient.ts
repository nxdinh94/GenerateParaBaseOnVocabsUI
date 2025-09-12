// API Client configuration for shared use across all API services
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds timeout (increased for AI processing)
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    // Add authorization header if JWT token exists
    const jwtToken = sessionStorage.getItem('jwt_token');
    if (jwtToken && config.headers) {
      config.headers.Authorization = `Bearer ${jwtToken}`;
    }
    
    console.log('🚀 Making API request to:', `${config.baseURL}${config.url}`);
    console.log('📤 Request config:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      data: config.data,
      headers: config.headers,
    });
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ Response received:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
    });
    console.log('📥 Response data:', response.data);
    return response;
  },
  (error) => {
    console.error('❌ Response interceptor error:', error);
    if (error.response) {
      console.log('🔍 Error details:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config?.url,
      });
    } else if (error.request) {
      console.log('🌐 Network error - no response received:', error.request);
    } else {
      console.log('⚙️ Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Helper function for handling API errors consistently
export const handleApiError = (error: any): Error => {
  if (error && typeof error === 'object') {
    const axiosError = error as any;
    
    // Handle timeout errors specifically
    if (axiosError.code === 'ECONNABORTED' && axiosError.message?.includes('timeout')) {
      return new Error('Request timeout: The server is taking too long to respond. This may happen when AI is processing complex requests. Please try again.');
    }
    
    // Handle network errors
    if (axiosError.code === 'ERR_NETWORK') {
      return new Error('Network error: Unable to connect to the server. Please check your internet connection and server status.');
    }
    
    // Handle response errors
    if ('response' in error) {
      let errorMessage = `HTTP error! status: ${axiosError.response?.status || 'unknown'}`;
      
      if (axiosError.response?.data) {
        // Try to extract meaningful error message from response
        const responseData = axiosError.response.data;
        if (typeof responseData === 'string') {
          errorMessage += ` - ${responseData}`;
        } else if (responseData.message) {
          errorMessage += ` - ${responseData.message}`;
        } else if (responseData.error) {
          errorMessage += ` - ${responseData.error}`;
        } else {
          errorMessage += ` - ${JSON.stringify(responseData)}`;
        }
      } else if (axiosError.message) {
        errorMessage += ` - ${axiosError.message}`;
      }
      
      return new Error(errorMessage);
    }
    
    // Handle other axios errors
    if (axiosError.message) {
      return new Error(`Request failed: ${axiosError.message}`);
    }
  }
  
  return new Error(`Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
};

// Export the base URL for other services that might need it
export { API_BASE_URL };
