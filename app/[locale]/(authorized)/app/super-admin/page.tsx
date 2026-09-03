"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  TalentPercentageChart,
  TopEfficiency,
  LowPerformers,
  ConnectedAgentsPanel,
} from "@/packages/design-system";
import { adtService } from "@/packages/api/adt/adt.service";
import type { RealtimeMetrics } from "@/packages/api/adt/adt.service";
import { AgentsService } from "@/packages/api/agents/agents.service";
import type { Agent } from "@/packages/types/agents.types";
import { resolveDeviceStatus } from "@/packages/utils/device-status.utils";

interface TalentPercentageData {
  active_percentage: number;
  inactive_percentage: number;
}

const agentsService = new AgentsService();
const AGENTS_REFRESH_MS = 60_000;

export default function SuperAdminPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [topRankings, setTopRankings] = useState<RealtimeMetrics[]>([]);
  const [worstRankings, setWorstRankings] = useState<RealtimeMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(true);

  const currentMonth = new Date().toLocaleString(locale === "es" ? "es-ES" : "en-US", {
    month: "long",
  });

  const loadAgents = useCallback(async () => {
    try {
      setAgentsLoading(true);
      const data = await agentsService.getAll();
      setAgents(data);
    } catch (error) {
      console.error("Error loading agents connectivity:", error);
      setAgents([]);
    } finally {
      setAgentsLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Fijo en "day": el panel muestra solo el dia de hoy.
        const [top5, worst5] = await Promise.all([
          adtService.getTopRanking("day", "best"),
          adtService.getTopRanking("day", "worst"),
        ]);

        setTopRankings(top5);
        setWorstRankings(worst5);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setTopRankings([]);
        setWorstRankings([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    loadAgents();
    const interval = setInterval(loadAgents, AGENTS_REFRESH_MS);
    return () => clearInterval(interval);
  }, [loadAgents]);

  /**
   * Talento activo = agentes VINCULADOS que estan EN LINEA, sobre el total de
   * vinculados.
   *
   * Antes venia de `adtService.getActiveTalentPercentage()`, que contaba
   * CONTRATISTAS con beats en el periodo sobre el total de
   * `contractor_info_raw`. Ese denominador incluye contratistas que ni siquiera
   * tienen agente instalado, asi que el porcentaje medía cobertura de
   * despliegue, no actividad: al instalar agentes nuevos el numero subia sin
   * que nadie trabajara mas, y al dar de alta un contratista bajaba sin que
   * nadie trabajara menos.
   *
   * Se calcula acá y no en el backend porque la pagina ya tiene los agentes
   * cargados para el panel de conectividad, que aplica exactamente el mismo
   * criterio. Tenerlo en un solo lugar evita que las dos tarjetas se
   * contradigan.
   */
  const talentData: TalentPercentageData = useMemo(() => {
    const linked = agents.filter((agent) => agent.contractor_id != null);
    if (linked.length === 0) {
      return { active_percentage: 0, inactive_percentage: 100 };
    }
    const online = linked.filter((agent) => resolveDeviceStatus(agent) === "ONLINE").length;
    const active = Math.round((online / linked.length) * 100 * 100) / 100;
    return {
      active_percentage: active,
      inactive_percentage: Math.round((100 - active) * 100) / 100,
    };
  }, [agents]);

  return (
    <div className="p-6 md:p-8 min-h-screen overflow-x-hidden" style={{ background: "#FFFFFF" }}>
      <div className="max-w-full overflow-x-hidden">
        <h1 className="text-[24px] font-semibold text-black mb-5">
          {t("dashboard.title", { month: currentMonth }) || `${currentMonth} Summary`}
        </h1>

        <div className="flex flex-col lg:flex-row gap-5 items-start">
          <div className="w-full lg:flex-[1.81] lg:min-w-0 flex flex-col gap-4">
            <TalentPercentageChart
              activePercentage={talentData.active_percentage}
              inactivePercentage={talentData.inactive_percentage}
              loading={agentsLoading}
            />
            <ConnectedAgentsPanel
              agents={agents}
              loading={agentsLoading}
              role="super-admin"
              onRefresh={loadAgents}
              compact
            />
          </div>

          <div className="w-full lg:flex-[1] lg:min-w-0 flex flex-col gap-5">
            <TopEfficiency rankings={topRankings} loading={loading} />
            <LowPerformers rankings={worstRankings} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}
