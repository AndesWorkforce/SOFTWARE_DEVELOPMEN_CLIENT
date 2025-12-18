import { http } from "../../setup/axios.config";
import type {
  ReportFilters,
  UserActivity,
  FilterOptions,
  ReportSummary,
} from "../../types/reports.types";

// Re-export types for convenience
export type { ReportFilters, UserActivity, FilterOptions, ReportSummary };

export class ReportsService {
  /**
   * Get activity data for today with filters
   */
  async getActivityToday(filters?: ReportFilters): Promise<UserActivity[]> {
    const params = this.buildQueryParams(filters);
    const response = await http.get<UserActivity[]>("/reports/activity-today", { params });
    return response.data;
  }

  /**
   * Get summary statistics
   */
  async getSummary(filters?: ReportFilters): Promise<ReportSummary> {
    const params = this.buildQueryParams(filters);
    const response = await http.get<ReportSummary>("/reports/summary", { params });
    return response.data;
  }

  /**
   * Get filter options (users, countries, clients, teams, positions)
   */
  async getFilterOptions(): Promise<FilterOptions> {
    const response = await http.get<FilterOptions>("/reports/filters/options");
    return response.data;
  }

  /**
   * Get detailed activity for a specific user
   */
  async getActivityDetail(userId: string, date: string): Promise<UserActivity> {
    const response = await http.get<UserActivity>(`/reports/activity-detail/${userId}`, {
      params: { date },
    });
    return response.data;
  }

  /**
   * Build query params from filters
   */
  private buildQueryParams(filters?: ReportFilters): Record<string, string> {
    if (!filters) return {};

    const params: Record<string, string> = {};

    if (filters.dateRange) {
      params.startDate = filters.dateRange.start;
      params.endDate = filters.dateRange.end;
    }
    if (filters.userId) params.userId = filters.userId;
    if (filters.country) params.country = filters.country;
    if (filters.clientId) params.clientId = filters.clientId;
    if (filters.teamId) params.teamId = filters.teamId;
    if (filters.jobPosition) params.jobPosition = filters.jobPosition;

    return params;
  }
}

export const reportsService = new ReportsService();
