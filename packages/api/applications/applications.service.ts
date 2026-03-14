import { http } from "../../setup/axios.config";
import type { AxiosError } from "axios";
import type { Application } from "../../types/applications.types";

export type { Application } from "../../types/applications.types";

export class ApplicationsService {
  async getAll(): Promise<Application[]> {
    try {
      const response = await http.get<Application[]>("/apps");
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(
        (axiosError.response?.data as { message?: string })?.message ??
          "Failed to fetch applications",
      );
    }
  }

  async getById(id: string): Promise<Application> {
    try {
      const response = await http.get<Application>(`/apps/${id}`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(
        (axiosError.response?.data as { message?: string })?.message ??
          "Failed to fetch application",
      );
    }
  }

  async getByContractor(contractorId: string): Promise<Application[]> {
    try {
      const response = await http.get<Application[]>(`/apps/contractor/${contractorId}`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(
        (axiosError.response?.data as { message?: string })?.message ??
          "Failed to fetch contractor applications",
      );
    }
  }
}

export const applicationsService = new ApplicationsService();
