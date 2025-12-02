import { http } from "../../setup/axios.config";
import type { ReportFilters, UserActivity, FilterOptions, ReportSummary } from "./reports.types";

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

  /**
   * Generate mock data for development
   */
  getMockActivityData(): UserActivity[] {
    return [
      {
        id: "1",
        user: {
          id: "u1",
          name: "Adriana Soto",
          email: "adriana.soto@example.com",
        },
        jobPosition: "Frontend Developer",
        client: {
          id: "c1",
          name: "Tech Corporation",
        },
        team: {
          id: "t1",
          name: "Development",
        },
        country: "Colombia",
        timeWorked: "4:25:26",
        activityPercentage: 87,
        date: new Date().toISOString(),
        details: [],
      },
      {
        id: "2",
        user: {
          id: "u2",
          name: "Alejandra Vilanova",
          email: "alejandra.v@example.com",
        },
        jobPosition: "Fullstack Engineer",
        client: {
          id: "c2",
          name: "RTM Corporation",
        },
        team: {
          id: "t1",
          name: "Development",
        },
        country: "Honduras",
        timeWorked: "1:26:05",
        activityPercentage: 51,
        date: new Date().toISOString(),
        details: [],
      },
      {
        id: "3",
        user: {
          id: "u3",
          name: "Ana Maria Corcho",
          email: "ana.corcho@example.com",
        },
        jobPosition: "Backend Developer",
        client: {
          id: "c3",
          name: "IBM Conect",
        },
        team: {
          id: "t2",
          name: "Development IT",
        },
        country: "Venezuela",
        timeWorked: "0:21:17",
        activityPercentage: 70,
        date: new Date().toISOString(),
        details: [],
      },
      {
        id: "4",
        user: {
          id: "u4",
          name: "Celeste Lacomba",
          email: "celeste.l@example.com",
        },
        jobPosition: "Support Engineer",
        client: {
          id: "c4",
          name: "Bamboo",
        },
        team: {
          id: "t2",
          name: "Development IT",
        },
        country: "Brasil",
        timeWorked: "1:06:53",
        activityPercentage: 25,
        date: new Date().toISOString(),
        details: [],
      },
      {
        id: "5",
        user: {
          id: "u5",
          name: "Daniel Ayala",
          email: "daniel.ayala@example.com",
        },
        jobPosition: "UX/UI Designer",
        client: {
          id: "c5",
          name: "Qilla",
        },
        team: {
          id: "t1",
          name: "Development",
        },
        country: "Bolivia",
        timeWorked: "1:33:33",
        activityPercentage: 95,
        date: new Date().toISOString(),
        details: [],
      },
      {
        id: "6",
        user: {
          id: "u6",
          name: "Luis Cepeda",
          email: "luis.cepeda@example.com",
        },
        jobPosition: "DevOps Engineer",
        client: {
          id: "c6",
          name: "PM Consulting",
        },
        team: {
          id: "t3",
          name: "DevOps",
        },
        country: "Ecuador",
        timeWorked: "1:55:12",
        activityPercentage: 36,
        date: new Date().toISOString(),
        details: [],
      },
      {
        id: "7",
        user: {
          id: "u7",
          name: "Mateo Cantillo",
          email: "mateo.cantillo@example.com",
        },
        jobPosition: "Support Engineer",
        client: {
          id: "c7",
          name: "Studio Lineal",
        },
        team: {
          id: "t2",
          name: "Development IT",
        },
        country: "Argentina",
        timeWorked: "3:18:53",
        activityPercentage: 86,
        date: new Date().toISOString(),
        details: [],
      },
      {
        id: "8",
        user: {
          id: "u8",
          name: "Oliver Junior Ortega",
          email: "oliver.ortega@example.com",
        },
        jobPosition: "Backend Developer",
        client: {
          id: "c8",
          name: "Bimo",
        },
        team: {
          id: "t1",
          name: "Development",
        },
        country: "Uruguay",
        timeWorked: "5:04:23",
        activityPercentage: 89,
        date: new Date().toISOString(),
        details: [],
      },
      {
        id: "9",
        user: {
          id: "u9",
          name: "Valentina Bernal",
          email: "valentina.bernal@example.com",
        },
        jobPosition: "DevOps Engineer",
        client: {
          id: "c9",
          name: "Perpleto",
        },
        team: {
          id: "t3",
          name: "DevOps",
        },
        country: "Panama",
        timeWorked: "4:01:30",
        activityPercentage: 45,
        date: new Date().toISOString(),
        details: [],
      },
      {
        id: "10",
        user: {
          id: "u10",
          name: "Ximena Florez",
          email: "ximena.florez@example.com",
        },
        jobPosition: "Support Engineer",
        client: {
          id: "c10",
          name: "Triple Ten",
        },
        team: {
          id: "t2",
          name: "Development IT",
        },
        country: "Republica Dominicana",
        timeWorked: "3:29:21",
        activityPercentage: 95,
        date: new Date().toISOString(),
        details: [],
      },
    ];
  }

  /**
   * Generate mock filter options
   */
  getMockFilterOptions(): FilterOptions {
    return {
      users: [
        { value: "u1", label: "Adriana Soto" },
        { value: "u2", label: "Alejandra Vilanova" },
        { value: "u3", label: "Ana Maria Corcho" },
        { value: "u4", label: "Celeste Lacomba" },
        { value: "u5", label: "Daniel Ayala" },
      ],
      countries: [
        { value: "CO", label: "Colombia" },
        { value: "AR", label: "Argentina" },
        { value: "MX", label: "Mexico" },
        { value: "UY", label: "Uruguay" },
        { value: "CL", label: "Chile" },
      ],
      clients: [
        { value: "c1", label: "Andes Workforce" },
        { value: "c2", label: "Tech Solutions Inc" },
      ],
      teams: [
        { value: "t1", label: "Development" },
        { value: "t2", label: "Support" },
        { value: "t3", label: "Design" },
      ],
      jobPositions: [
        { value: "frontend", label: "Frontend Developer" },
        { value: "backend", label: "Backend Developer" },
        { value: "fullstack", label: "Fullstack Engineer" },
        { value: "designer", label: "UX/UI Designer" },
        { value: "support", label: "Support Engineer" },
      ],
    };
  }
}

export const reportsService = new ReportsService();
