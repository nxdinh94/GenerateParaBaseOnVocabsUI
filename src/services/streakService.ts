import { apiClient, handleApiError } from './apiClient';

export interface StreakStatus {
  count: number;
  is_qualify: boolean;
  date: string;
  status: boolean;
}

export interface StreakResponse {
  id: string;
  user_id: string;
  learned_date: string;
  count: number;
  is_qualify: boolean;
  created_at: string;
  status: boolean;
}

export class StreakService {
  /**
   * Get today's streak status
   */
  static async getTodayStreakStatus(): Promise<StreakStatus> {
    try {
      const response = await apiClient.get<StreakStatus>('/today-yesterday-streak-status?date=today');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create or update streak (increment count)
   * Called after successful paragraph generation
   */
  static async updateStreak(): Promise<StreakResponse> {
    try {
      const response = await apiClient.post<StreakResponse>('/streak', {});
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}
