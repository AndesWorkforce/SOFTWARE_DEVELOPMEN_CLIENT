export interface Agent {
  id: string;
  contractor_id: string | null;
  activation_key: string | null;
  type: "UNASSIGNED" | "HOST" | "VM";
  hostname: string | null;
  parent_agent_id: string | null;
  is_active: boolean;
  last_heartbeat: string | null;
  created_at: string;
  updated_at: string;
  contractor?: { id: string; name: string; email: string | null } | null;
}

export interface LinkAgentDto {
  activation_key: string;
  contractorId: string;
}
