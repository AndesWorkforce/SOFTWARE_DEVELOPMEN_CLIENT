import { http } from "../../setup/axios.config";
import type { AxiosError } from "axios";
import type { Application, CreateApplicationPayload } from "../../types/applications.types";

export type { Application, CreateApplicationPayload } from "../../types/applications.types";

export class ApplicationsService {
  async create(payload: CreateApplicationPayload): Promise<Application> {
    try {
      const response = await http.post<Application>("/apps", payload);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(
        (axiosError.response?.data as { message?: string })?.message ?? "Failed to create application",
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await http.delete(`/apps/${id}`);
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(
        (axiosError.response?.data as { message?: string })?.message ?? "Failed to delete application",
      );
    }
  }

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

  async assignToContractor(
    contractorId: string,
    app_ids: string[],
  ): Promise<{ message: string; assigned: number }> {
    try {
      const response = await http.post<{ message: string; assigned: number }>(
        `/apps/contractor/${contractorId}/assign`,
        { app_ids },
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(
        (axiosError.response?.data as { message?: string })?.message ??
          "Failed to assign applications to contractor",
      );
    }
  }

  async removeFromContractor(contractorId: string, app_ids: string[]): Promise<void> {
    try {
      await http.delete(`/apps/contractor/${contractorId}/remove`, {
        data: { app_ids },
      });
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(
        (axiosError.response?.data as { message?: string })?.message ??
          "Failed to remove applications from contractor",
      );
    }
  }
}

export const applicationsService = new ApplicationsService();
