import { http } from "../../setup/axios.config";
import type { AxiosError } from "axios";
import type { Agent, LinkAgentDto } from "../../types/agents.types";

export type { Agent, LinkAgentDto } from "../../types/agents.types";

export class AgentsService {
  async getAll(): Promise<Agent[]> {
    try {
      const response = await http.get<Agent[]>("/agents");
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(
        (axiosError.response?.data as { message?: string })?.message ?? "Failed to fetch agents",
      );
    }
  }

  async getUnlinked(): Promise<Agent[]> {
    try {
      const response = await http.get<Agent[]>("/agents/unlinked");
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(
        (axiosError.response?.data as { message?: string })?.message ??
          "Failed to fetch unlinked agents",
      );
    }
  }

  async linkToContractor(dto: LinkAgentDto): Promise<void> {
    try {
      await http.post("/agents/link", dto);
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(
        (axiosError.response?.data as { message?: string })?.message ??
          "Failed to link agent to contractor",
      );
    }
  }

  async getContractorAgents(contractorId: string): Promise<Agent[]> {
    try {
      const response = await http.get<Agent[]>(`/agents/contractor/${contractorId}`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(
        (axiosError.response?.data as { message?: string })?.message ??
          "Failed to fetch contractor agents",
      );
    }
  }
}

export const agentsService = new AgentsService();
