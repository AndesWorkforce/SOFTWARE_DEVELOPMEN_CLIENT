import { http } from "../../setup/axios.config";
import type { AxiosError } from "axios";
import type { Domain, CreateDomainPayload } from "../../types/domains.types";

export type { Domain, CreateDomainPayload } from "../../types/domains.types";

export class DomainsService {
  async create(payload: CreateDomainPayload): Promise<Domain> {
    try {
      const response = await http.post<Domain>("/domains", payload);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(
        (axiosError.response?.data as { message?: string })?.message ?? "Failed to create domain",
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await http.delete(`/domains/${id}`);
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(
        (axiosError.response?.data as { message?: string })?.message ?? "Failed to delete domain",
      );
    }
  }

  async getAll(): Promise<Domain[]> {
    try {
      const response = await http.get<Domain[]>("/domains");
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(
        (axiosError.response?.data as { message?: string })?.message ?? "Failed to fetch domains",
      );
    }
  }

  async getByContractor(contractorId: string): Promise<Domain[]> {
    try {
      const response = await http.get<Domain[]>(`/domains/contractor/${contractorId}`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(
        (axiosError.response?.data as { message?: string })?.message ??
          "Failed to fetch contractor domains",
      );
    }
  }

  async assignToContractor(
    contractorId: string,
    domain_ids: string[],
  ): Promise<{ message: string; assigned: number }> {
    try {
      const response = await http.post<{ message: string; assigned: number }>(
        `/domains/contractor/${contractorId}/assign`,
        { domain_ids },
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(
        (axiosError.response?.data as { message?: string })?.message ??
          "Failed to assign domains to contractor",
      );
    }
  }

  async removeFromContractor(contractorId: string, domain_ids: string[]): Promise<void> {
    try {
      await http.delete(`/domains/contractor/${contractorId}/remove`, {
        data: { domain_ids },
      });
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(
        (axiosError.response?.data as { message?: string })?.message ??
          "Failed to remove domains from contractor",
      );
    }
  }
}
