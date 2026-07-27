export type DeviceStatus = "ONLINE" | "OFFLINE" | "SUSPENDED" | "UNKNOWN" | "DISABLED";

export interface Agent {
  id: string;
  contractor_id: string | null;
  activation_key: string | null;
  type: "UNASSIGNED" | "HOST" | "VM";
  hostname: string | null;
  parent_agent_id: string | null;
  is_active: boolean;
  is_disabled?: boolean;
  last_heartbeat: string | null;
  device_status?: DeviceStatus;
  power_state?: string | null;
  last_power_event_at?: string | null;
  seconds_since_heartbeat?: number | null;
  created_at: string;
  updated_at: string;
  contractor?: {
    id: string;
    name: string;
    email: string | null;
    job_position?: string;
  } | null;
}

export interface AgentConnectivity extends Agent {
  seconds_since_heartbeat: number | null;
}

export interface LinkAgentDto {
  activation_key: string;
  contractorId: string;
}
