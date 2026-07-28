"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Monitor, RefreshCw } from "lucide-react";

import type { Agent, DeviceStatus } from "@/packages/types/agents.types";
import {
  resolveDeviceStatus,
  getDeviceStatusDisplay,
  formatLastHeartbeat,
} from "@/packages/utils/device-status.utils";

export interface ConnectedAgentsPanelProps {
  agents: Agent[];
  loading?: boolean;
  role?: "super-admin" | "admin";
  onRefresh?: () => void;
  className?: string;
}

const STATUS_ORDER: DeviceStatus[] = ["ONLINE", "OFFLINE", "SUSPENDED", "UNKNOWN", "DISABLED"];

export function ConnectedAgentsPanel({
  agents,
  loading = false,
  role = "super-admin",
  onRefresh,
  className,
}: ConnectedAgentsPanelProps) {
  const t = useTranslations("dashboard.agentsConnectivity");
  const locale = useLocale();
  const router = useRouter();

  const linkedAgents = useMemo(
    () => agents.filter((agent) => agent.contractor_id != null),
    [agents],
  );

  const summary = useMemo(() => {
    const counts: Record<DeviceStatus, number> = {
      ONLINE: 0,
      OFFLINE: 0,
      SUSPENDED: 0,
      UNKNOWN: 0,
      DISABLED: 0,
    };
    for (const agent of linkedAgents) {
      counts[resolveDeviceStatus(agent)]++;
    }
    return counts;
  }, [linkedAgents]);

  const onlineAgents = useMemo(
    () =>
      linkedAgents
        .filter((agent) => resolveDeviceStatus(agent) === "ONLINE")
        .sort((a, b) => {
          const nameA = a.contractor?.name ?? a.hostname ?? "";
          const nameB = b.contractor?.name ?? b.hostname ?? "";
          return nameA.localeCompare(nameB);
        }),
    [linkedAgents],
  );

  const totalLinked = linkedAgents.length;
  const connectedPct = totalLinked > 0 ? Math.round((summary.ONLINE / totalLinked) * 100) : 0;

  const openDeviceStatus = () => {
    router.push(`/${locale}/app/${role}/roles`);
  };

  return (
    <div
      className={`bg-white border border-[rgba(166,166,166,0.5)] rounded-[10px] shadow-[0px_4px_4px_rgba(166,166,166,0.25)] p-5 md:p-6 w-full ${className ?? ""}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <Monitor className="w-6 h-6 shrink-0" style={{ color: "#0097B2" }} />
          <div>
            <h2 className="font-bold text-[20px] text-black">{t("title")}</h2>
            <p className="text-sm" style={{ color: "#64748B" }}>
              {t("subtitle", { connected: summary.ONLINE, total: totalLinked })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm cursor-pointer disabled:cursor-not-allowed"
              style={{
                border: "1px solid rgba(166,166,166,0.5)",
                color: "#475569",
                background: "#FFFFFF",
              }}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              {t("refresh")}
            </button>
          )}
          <button
            type="button"
            onClick={openDeviceStatus}
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer"
            style={{ background: "#0097B2", color: "#FFFFFF" }}
          >
            {t("viewAll")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
        {STATUS_ORDER.map((status) => {
          const display = getDeviceStatusDisplay(status, locale);
          return (
            <div
              key={status}
              className="rounded-[10px] p-3 text-left"
              style={{
                border: "1px solid rgba(166,166,166,0.4)",
                background: display.background,
              }}
            >
              <p className="text-2xl font-bold" style={{ color: display.color }}>
                {loading ? "—" : summary[status]}
              </p>
              <p className="text-xs font-medium" style={{ color: display.color }}>
                {display.label}
              </p>
            </div>
          );
        })}
      </div>

      <div
        className="mb-4 rounded-[10px] px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
        style={{ background: "#F8FAFC", border: "1px solid rgba(166,166,166,0.25)" }}
      >
        <p className="text-sm" style={{ color: "#475569" }}>
          {t("connectedRate")}
        </p>
        <p className="text-lg font-semibold" style={{ color: "#0097B2" }}>
          {loading ? "—" : `${connectedPct}%`}
          <span className="text-sm font-normal ml-2" style={{ color: "#64748B" }}>
            ({summary.ONLINE}/{totalLinked})
          </span>
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-[16px] text-black mb-3">{t("onlineList")}</h3>
        {loading ? (
          <p className="text-sm py-6 text-center" style={{ color: "#64748B" }}>
            {t("loading")}
          </p>
        ) : onlineAgents.length === 0 ? (
          <p className="text-sm py-6 text-center" style={{ color: "#64748B" }}>
            {t("noOnline")}
          </p>
        ) : (
          <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto">
            {onlineAgents.map((agent) => {
              const lastSeen = formatLastHeartbeat(agent.last_heartbeat ?? null, locale);
              return (
                <div
                  key={agent.id}
                  className="flex items-center justify-between gap-3 rounded-[8px] px-3 py-2"
                  style={{
                    border: "1px solid rgba(166,166,166,0.3)",
                    background: "#FFFFFF",
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-black truncate">
                      {agent.contractor?.name ?? "—"}
                    </p>
                    <p className="text-xs truncate" style={{ color: "#6d6d6d" }}>
                      {agent.hostname ?? "—"}
                      {agent.type ? ` · ${agent.type}` : ""}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ background: "#D1FAE5", color: "#065F46" }}
                    >
                      {getDeviceStatusDisplay("ONLINE", locale).label}
                    </span>
                    {lastSeen && (
                      <p className="text-[10px] mt-1" style={{ color: "#94A3B8" }}>
                        {lastSeen}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
