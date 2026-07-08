import type { Agent, DeviceStatus } from "../types/agents.types";

export interface DeviceStatusDisplay {
  label: string;
  background: string;
  color: string;
}

const DEVICE_STATUS_STYLES: Record<DeviceStatus, DeviceStatusDisplay> = {
  ONLINE: { label: "En línea", background: "#D1FAE5", color: "#065F46" },
  OFFLINE: { label: "Apagado / Sin conexión", background: "#FEE2E2", color: "#991B1B" },
  SUSPENDED: { label: "Suspendido", background: "#FEF3C7", color: "#92400E" },
  UNKNOWN: { label: "Desconocido", background: "#F3F4F6", color: "#4B5563" },
};

const DEVICE_STATUS_STYLES_EN: Record<DeviceStatus, DeviceStatusDisplay> = {
  ONLINE: { label: "Online", background: "#D1FAE5", color: "#065F46" },
  OFFLINE: { label: "Powered off / Offline", background: "#FEE2E2", color: "#991B1B" },
  SUSPENDED: { label: "Suspended", background: "#FEF3C7", color: "#92400E" },
  UNKNOWN: { label: "Unknown", background: "#F3F4F6", color: "#4B5563" },
};

export function resolveDeviceStatus(agent: Agent): DeviceStatus {
  if (agent.device_status) {
    return agent.device_status;
  }
  if (!agent.last_heartbeat) {
    return "UNKNOWN";
  }
  const secondsSince = Math.floor((Date.now() - new Date(agent.last_heartbeat).getTime()) / 1000);
  if (secondsSince <= 180) {
    return "ONLINE";
  }
  if (agent.power_state === "suspended") {
    return "SUSPENDED";
  }
  return "OFFLINE";
}

export function getDeviceStatusDisplay(
  status: DeviceStatus,
  locale: string = "es",
): DeviceStatusDisplay {
  const styles = locale.startsWith("en") ? DEVICE_STATUS_STYLES_EN : DEVICE_STATUS_STYLES;
  return styles[status] ?? styles.UNKNOWN;
}

export function formatLastHeartbeat(
  lastHeartbeat: string | null,
  locale: string = "es",
): string | null {
  if (!lastHeartbeat) return null;
  const seconds = Math.floor((Date.now() - new Date(lastHeartbeat).getTime()) / 1000);
  if (seconds < 60) {
    return locale.startsWith("en") ? "Just now" : "Hace un momento";
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return locale.startsWith("en") ? `${minutes} min ago` : `Hace ${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return locale.startsWith("en") ? `${hours} h ago` : `Hace ${hours} h`;
  }
  const days = Math.floor(hours / 24);
  return locale.startsWith("en") ? `${days} d ago` : `Hace ${days} d`;
}
