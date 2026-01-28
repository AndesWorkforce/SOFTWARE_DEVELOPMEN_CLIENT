"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ChevronsDown, ArrowRight, ChevronRight } from "lucide-react";
import { Header, TopEfficiency, LowPerformers } from "@/packages/design-system";
import { adtService } from "@/packages/api/adt/adt.service";
import type { RealtimeMetrics } from "@/packages/api/adt/adt.service";

type FilterType = "all" | "high" | "absences" | "low";

interface Alert {
  id: string;
  name: string;
  position: string;
  productivity: number;
  type: "high" | "low" | "absence";
}

export default function VisualizerPage() {
  const t = useTranslations("visualizer");
  const [loading, setLoading] = useState(true);

  // Estados para los datos
  const [topRankings, setTopRankings] = useState<RealtimeMetrics[]>([]);
  const [worstRankings, setWorstRankings] = useState<RealtimeMetrics[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
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
            name: r.contractor_name || "N/A",
            position: r.job_position || "N/A",
            productivity: Math.round(r.productivity_score || 0),
            type: "high" as const,
          })),
          ...worst5.map((r, i) => ({
            id: `low-${i}`,
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

                {/* Lista de Alertas */}
                <div className="flex flex-col gap-3">
                  {loading ? (
                    <div className="text-center py-12">
                      <p className="text-[16px] text-gray-500">{t("loading")}</p>
                    </div>
                  ) : alerts.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-[16px] text-gray-500">{t("noDataAvailable")}</p>
                    </div>
                  ) : (
                    <>
                      {alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className="bg-white border border-[rgba(166,166,166,0.25)] rounded-[10px] shadow-[0px_4px_4px_0px_rgba(166,166,166,0.25)] px-[30px] py-[12px]"
                        >
                          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            {/* Información del contratista */}
                            <div className="flex flex-col w-full md:w-[280px]">
                              <p className="text-[16px] font-semibold text-black">{alert.name}</p>
                              <p className="text-[14px] text-[#6d6d6d]">{alert.position}</p>
                              <div className="flex items-center justify-between mt-1">
                                <div className="bg-[#d9d9d9] h-[5px] rounded-[20px] w-[235px]">
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
                                  className="text-[12px] font-bold ml-2"
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
                              className="px-[20px] py-[6px] rounded-[5px] h-[30px] flex items-center gap-[5px] w-full md:w-[165px] justify-center"
                              style={{
                                backgroundColor:
                                  alert.type === "high"
                                    ? "rgba(46, 195, 109, 0.1)"
                                    : "rgba(255, 0, 4, 0.1)",
                              }}
                            >
                              <div
                                className={alert.type === "high" ? "-scale-y-100" : "scale-y-100"}
                              >
                                <ChevronsDown
                                  size={16}
                                  color={alert.type === "high" ? "#2EC36D" : "#FF0004"}
                                  strokeWidth={2}
                                />
                              </div>
                              <p
                                className="text-[14px] font-semibold whitespace-nowrap"
                                style={{
                                  color: alert.type === "high" ? "#2EC36D" : "#FF0004",
                                }}
                              >
                                {alert.type === "high" ? "High Productivity" : "Low Productivity"}
                              </p>
                            </div>

                            {/* Botón View History */}
                            <button
                              type="button"
                              className="bg-white border border-[rgba(166,166,166,0.25)] rounded-[5px] shadow-[0px_4px_4px_0px_rgba(166,166,166,0.25)] px-[20px] py-[6px] h-[30px] flex items-center gap-[5px] hover:bg-gray-50 transition-colors w-full md:w-[165px] justify-center"
                            >
                              <p className="text-[14px] font-medium text-[#0097b2]">View History</p>
                              <ArrowRight size={16} color="#0097b2" strokeWidth={2} />
                            </button>
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
                  )}
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
