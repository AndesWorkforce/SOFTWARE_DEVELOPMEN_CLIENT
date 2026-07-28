"use client";

import { useState, useEffect, useCallback } from "react";
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

type Period = "day" | "week" | "month";

interface TalentPercentageData {
  active_percentage: number;
  inactive_percentage: number;
}

const agentsService = new AgentsService();
const AGENTS_REFRESH_MS = 60_000;

export default function SuperAdminPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("day");

  const [talentData, setTalentData] = useState<TalentPercentageData>({
    active_percentage: 0,
    inactive_percentage: 0,
  });
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

        const [talentPercentage, top5, worst5] = await Promise.all([
          adtService.getActiveTalentPercentage(selectedPeriod),
          adtService.getTopRanking(selectedPeriod, "best"),
          adtService.getTopRanking(selectedPeriod, "worst"),
        ]);

        setTalentData({
          active_percentage: talentPercentage.active_percentage,
          inactive_percentage: talentPercentage.inactive_percentage,
        });
        setTopRankings(top5);
        setWorstRankings(worst5);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setTalentData({ active_percentage: 0, inactive_percentage: 100 });
        setTopRankings([]);
        setWorstRankings([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedPeriod]);

  useEffect(() => {
    loadAgents();
    const interval = setInterval(loadAgents, AGENTS_REFRESH_MS);
    return () => clearInterval(interval);
  }, [loadAgents]);

  const handlePeriodChange = (period: Period) => {
    setSelectedPeriod(period);
  };

  return (
    <div className="p-6 md:p-8 min-h-screen overflow-x-hidden" style={{ background: "#FFFFFF" }}>
      <div className="max-w-full overflow-x-hidden">
        <h1 className="text-[24px] font-semibold text-black mb-6">
          {t("dashboard.title", { month: currentMonth }) || `${currentMonth} Summary`}
        </h1>

        <div className="flex flex-col lg:flex-row gap-6 items-stretch">
          <div className="w-full lg:flex-[1.81] lg:min-w-0 flex flex-col gap-6">
            <TalentPercentageChart
              activePercentage={talentData.active_percentage}
              inactivePercentage={talentData.inactive_percentage}
              loading={loading}
              period={selectedPeriod}
              onPeriodChange={handlePeriodChange}
            />
            <ConnectedAgentsPanel
              agents={agents}
              loading={agentsLoading}
              role="super-admin"
              onRefresh={loadAgents}
              compact
              className="flex-1"
            />
          </div>

          <div className="w-full lg:flex-[1] lg:min-w-0 flex flex-col gap-6">
            <TopEfficiency rankings={topRankings} loading={loading} />
            <LowPerformers rankings={worstRankings} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}
