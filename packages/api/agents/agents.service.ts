import { http } from "../../setup/axios.config";
import type { AxiosError } from "axios";
import type { Agent, AgentConnectivity, LinkAgentDto } from "../../types/agents.types";

export type { Agent, AgentConnectivity, LinkAgentDto } from "../../types/agents.types";

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

  /**
   * Borra definitivamente un agente sin vincular.
   *
   * El backend rechaza los agentes ya vinculados: esos se dan de baja con
   * decommission, que preserva sus métricas históricas.
   */
  async remove(agentId: string): Promise<void> {
    try {
      await http.delete(`/agents/${agentId}`);
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(
        (axiosError.response?.data as { message?: string })?.message ?? "Failed to delete agent",
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

  async getContractorConnectivity(contractorId: string): Promise<AgentConnectivity[]> {
    try {
      const response = await http.get<AgentConnectivity[]>(
        `/agents/contractor/${contractorId}/connectivity`,
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(
        (axiosError.response?.data as { message?: string })?.message ??
          "Failed to fetch contractor connectivity",
      );
    }
  }
}

export const agentsService = new AgentsService();
