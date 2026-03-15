"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { TalentPercentageChart, TopEfficiency, LowPerformers } from "@/packages/design-system";
import { adtService } from "@/packages/api/adt/adt.service";
import type { RealtimeMetrics } from "@/packages/api/adt/adt.service";

type Period = "day" | "week" | "month";

interface TalentPercentageData {
  active_percentage: number;
  inactive_percentage: number;
}

export default function SuperAdminPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("day");

  // Estados para los datos
  const [talentData, setTalentData] = useState<TalentPercentageData>({
    active_percentage: 0,
    inactive_percentage: 0,
  });
  const [topRankings, setTopRankings] = useState<RealtimeMetrics[]>([]);
  const [worstRankings, setWorstRankings] = useState<RealtimeMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  // Obtener el mes actual para el título
  const currentMonth = new Date().toLocaleString(locale === "es" ? "es-ES" : "en-US", {
    month: "long",
  });

  // Cargar datos cuando cambia el período
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Cargar todos los datos en paralelo
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
        // Mantener valores por defecto en caso de error
        setTalentData({ active_percentage: 0, inactive_percentage: 100 });
        setTopRankings([]);
        setWorstRankings([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedPeriod]);

  const handlePeriodChange = (period: Period) => {
    setSelectedPeriod(period);
  };

  return (
    <div className="p-8 min-h-screen overflow-x-hidden" style={{ background: "#FFFFFF" }}>
      <div className="max-w-full overflow-x-hidden">
        {/* Título */}
        <h1 className="text-[24px] font-semibold text-black mb-[46px]">
          {t("dashboard.title", { month: currentMonth }) || `${currentMonth} Summary`}
        </h1>

        {/* Layout principal: gráfico a la izquierda, rankings a la derecha */}
        <div className="flex flex-col lg:flex-row gap-[40px] items-start">
          {/* Gráfico de porcentaje de talento */}
          <div className="w-full lg:flex-[1.81] lg:min-w-0">
            <TalentPercentageChart
              activePercentage={talentData.active_percentage}
              inactivePercentage={talentData.inactive_percentage}
              loading={loading}
              period={selectedPeriod}
              onPeriodChange={handlePeriodChange}
            />
          </div>

          {/* Paneles de rankings */}
          <div className="w-full lg:flex-[1] lg:min-w-0 flex flex-col gap-[40px]">
            <TopEfficiency rankings={topRankings} loading={loading} />
            <LowPerformers rankings={worstRankings} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}
