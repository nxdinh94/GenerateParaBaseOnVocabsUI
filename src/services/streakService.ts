import { apiClient, handleApiError } from './apiClient';

export interface StreakStatus {
  count: number;
  is_qualify: boolean;
  date: string;
  status: boolean;
}

export class StreakService {
  /**
   * Get today's streak status
   */
  static async getTodayStreakStatus(): Promise<StreakStatus> {
    try {
      const response = await apiClient.get<StreakStatus>('/today-streak-status');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}
