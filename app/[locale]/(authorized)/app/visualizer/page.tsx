"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { ChevronsDown, ArrowRight, ChevronRight } from "lucide-react";
import { Header, TopEfficiency, LowPerformers } from "@/packages/design-system";
import { adtService } from "@/packages/api/adt/adt.service";
import type { RealtimeMetrics } from "@/packages/api/adt/adt.service";

type FilterType = "all" | "high" | "absences" | "low";

interface Alert {
  id: string;
  contractor_id: string;
  name: string;
  position: string;
  productivity: number;
  type: "high" | "low" | "absence";
}

export default function VisualizerPage() {
  const t = useTranslations("visualizer");
  const locale = useLocale();
  const [loading, setLoading] = useState(true);

  // Estados para los datos
  const [topRankings, setTopRankings] = useState<RealtimeMetrics[]>([]);
  const [worstRankings, setWorstRankings] = useState<RealtimeMetrics[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [metrics] = useState({
    productivity: 75,
    absences: 6,
    activeContractors: 120,
  });

  // Cargar datos
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Cargar datos en paralelo - usar 'month' para obtener máximo rango (6 meses)
        const results = await Promise.allSettled([
          adtService.getTopRanking("month", "best"),
          adtService.getTopRanking("month", "worst"),
        ]);

        // Manejar top rankings
        if (results[0].status === "fulfilled") {
          setTopRankings(results[0].value);
        } else {
          console.error("Error loading top rankings:", results[0].reason);
          setTopRankings([]);
        }

        // Manejar worst rankings
        if (results[1].status === "fulfilled") {
          setWorstRankings(results[1].value);
        } else {
          console.error("Error loading worst rankings:", results[1].reason);
          setWorstRankings([]);
        }

        // Generar alertas basadas en todos los rankings disponibles
        const top5 = results[0].status === "fulfilled" ? results[0].value : [];
        const worst5 = results[1].status === "fulfilled" ? results[1].value : [];

        const mockAlerts: Alert[] = [
          ...top5.map((r, i) => ({
            id: `high-${i}`,
            contractor_id: r.contractor_id || `top-${i}`,
            name: r.contractor_name || "N/A",
            position: r.job_position || "N/A",
            productivity: Math.round(r.productivity_score || 0),
            type: "high" as const,
          })),
          ...worst5.map((r, i) => ({
            id: `low-${i}`,
            contractor_id: r.contractor_id || `worst-${i}`,
            name: r.contractor_name || "N/A",
            position: r.job_position || "N/A",
            productivity: Math.round(r.productivity_score || 0),
            type: "low" as const,
          })),
        ].slice(0, 6);

        setAlerts(mockAlerts);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setTopRankings([]);
        setWorstRankings([]);
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#F5F5F5" }}>
      <Header />
      <div className="flex-1 overflow-x-hidden pt-[71px] px-4 md:px-8 pb-4 md:pb-8">
        <div className="max-w-full overflow-x-hidden">
          {/* Layout principal */}
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Columna izquierda - Contenido principal */}
            <div className="w-full lg:flex-[2] lg:min-w-0 flex flex-col gap-6">
              {/* Título */}
              <h1 className="text-[24px] font-bold text-black">{t("title")}</h1>

              {/* Tarjetas de métricas */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                {/* Productividad */}
                <div
                  className="bg-white border border-[rgba(166,166,166,0.5)] rounded-lg shadow-[0px_4px_4px_rgba(166,166,166,0.25)] p-6 flex flex-col justify-center items-center"
                  style={{ height: "100px" }}
                >
                  <p className="text-[16px] font-semibold text-black mb-2">{t("productivity")}</p>
                  <p className="text-[32px] font-bold text-black">{metrics.productivity}%</p>
                </div>

                {/* Ausencias */}
                <div
                  className="bg-white border border-[rgba(166,166,166,0.5)] rounded-lg shadow-[0px_4px_4px_rgba(166,166,166,0.25)] p-6 flex flex-col justify-center items-center"
                  style={{ height: "100px" }}
                >
                  <p className="text-[16px] font-semibold text-black mb-2">{t("absences")}</p>
                  <p className="text-[32px] font-bold text-black">{metrics.absences}</p>
                </div>

                {/* Contratistas Activos */}
                <div
                  className="bg-white border border-[rgba(166,166,166,0.5)] rounded-lg shadow-[0px_4px_4px_rgba(166,166,166,0.25)] p-6 flex flex-col justify-center items-center"
                  style={{ height: "100px" }}
                >
                  <p className="text-[16px] font-semibold text-black mb-2 text-center">
                    {t("activeContractors")}
                  </p>
                  <p className="text-[32px] font-bold text-black">{metrics.activeContractors}</p>
                </div>
              </div>

              {/* Sección de Alertas Recientes */}
              <div className="flex flex-col gap-4">
                <h2 className="text-[24px] font-bold text-black">{t("recentAlerts")}</h2>

                {/* Filtros */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-[5px]">
                  {[
                    { key: "all" as FilterType, label: t("filters.all") },
                    { key: "high" as FilterType, label: t("filters.highProductivity") },
                    { key: "absences" as FilterType, label: t("filters.absences") },
                    { key: "low" as FilterType, label: t("filters.lowContractors") },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActiveFilter(key)}
                      className={`w-full h-[38px] px-[6px] sm:px-[20px] py-[6px] rounded-[5px] text-[13px] sm:text-[15px] transition-colors ${
                        activeFilter === key
                          ? "bg-[#0097b2] text-white font-semibold"
                          : "bg-[rgba(226,226,226,0.5)] text-black font-normal hover:bg-[rgba(226,226,226,0.8)]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Lista de Alertas */}
                <div className="flex flex-col gap-3">
                  {(() => {
                    const filteredAlerts =
                      activeFilter === "all"
                        ? alerts
                        : activeFilter === "absences"
                          ? alerts.filter((a) => a.type === "absence")
                          : alerts.filter((a) => a.type === activeFilter);
                    return loading ? (
                      <div className="text-center py-12">
                        <p className="text-[16px] text-gray-500">{t("loading")}</p>
                      </div>
                    ) : filteredAlerts.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-[16px] text-gray-500">{t("noDataAvailable")}</p>
                      </div>
                    ) : (
                      <>
                        {filteredAlerts.map((alert) => (
                          <div
                            key={alert.id}
                            className="bg-white border border-[rgba(166,166,166,0.25)] rounded-[10px] shadow-[0px_4px_4px_0px_rgba(166,166,166,0.25)] px-[15px] sm:px-[30px] py-[12px]"
                          >
                            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between w-full gap-3 xl:gap-0">
                              {/* Información del contratista */}
                              <div className="flex flex-col items-start w-full xl:w-[280px] xl:h-[58px] xl:shrink-0">
                                <p className="text-[18px] font-semibold text-black truncate w-full">
                                  {alert.name}
                                </p>
                                <p className="text-[16px] text-[#6d6d6d] truncate w-full">
                                  {alert.position}
                                </p>
                                <div className="flex h-[10px] items-center gap-2 w-full">
                                  <div className="bg-[#d9d9d9] h-[5px] rounded-[20px] flex-1">
                                    <div
                                      className="h-[5px] rounded-[20px]"
                                      style={{
                                        backgroundColor:
                                          alert.type === "high" ? "#0097b2" : "#ff0004",
                                        width: `${alert.productivity}%`,
                                      }}
                                    />
                                  </div>
                                  <span
                                    className="text-[14px] font-bold shrink-0"
                                    style={{
                                      color: alert.type === "high" ? "#0097b2" : "#ff0004",
                                    }}
                                  >
                                    {alert.productivity}%
                                  </span>
                                </div>
                              </div>

                              {/* Badge de estado */}
                              <div
                                className="px-[12px] py-[6px] rounded-[5px] h-[38px] flex items-center justify-center xl:justify-between w-full xl:w-auto xl:min-w-[150px] xl:shrink-0"
                                style={{
                                  backgroundColor:
                                    alert.type === "high"
                                      ? "rgba(46, 195, 109, 0.1)"
                                      : "rgba(255, 0, 4, 0.1)",
                                }}
                              >
                                <div className="flex gap-[5px] items-center">
                                  <div className={alert.type === "high" ? "-scale-y-100" : ""}>
                                    <ChevronsDown
                                      size={16}
                                      color={alert.type === "high" ? "#2EC36D" : "#FF0004"}
                                      strokeWidth={2}
                                    />
                                  </div>
                                  <p
                                    className="text-[16px] font-semibold whitespace-nowrap"
                                    style={{
                                      color: alert.type === "high" ? "#2EC36D" : "#FF0004",
                                    }}
                                  >
                                    {alert.type === "high"
                                      ? "High Productivity"
                                      : "Low Productivity"}
                                  </p>
                                </div>
                              </div>

                              {/* Botón View History */}
                              <Link
                                href={`/${locale}/app/visualizer/contractor-history/${alert.contractor_id}?name=${encodeURIComponent(alert.name)}&productivity=${alert.productivity}`}
                                className="bg-white border border-[rgba(166,166,166,0.25)] rounded-[5px] shadow-[0px_4px_4px_0px_rgba(166,166,166,0.25)] px-[20px] py-[6px] h-[38px] flex items-center justify-center xl:justify-between w-full xl:w-[165px] xl:shrink-0 hover:bg-gray-50 transition-colors"
                              >
                                <div className="flex gap-[5px] items-center">
                                  <p className="text-[16px] font-medium text-[#0097b2]">
                                    {t("actions.viewHistory")}
                                  </p>
                                  <ArrowRight size={16} color="#0097b2" strokeWidth={2} />
                                </div>
                              </Link>
                            </div>
                          </div>
                        ))}

                        {/* Ver Todos - Botón centrado sin contenedor adicional */}
                        <div className="flex justify-center items-center pt-2">
                          <button
                            type="button"
                            className="flex items-center gap-2 text-[16px] font-semibold transition-colors"
                            style={{ color: "#6D6D6D" }}
                          >
                            {t("actions.viewAll")}
                            <ChevronRight size={20} color="#6D6D6D" strokeWidth={2} />
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Columna derecha - Paneles de rankings */}
            <div className="w-full lg:w-[380px] lg:min-w-[380px] flex flex-col gap-6">
              <TopEfficiency rankings={topRankings} loading={loading} className="w-full" />
              <LowPerformers rankings={worstRankings} loading={loading} className="w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
