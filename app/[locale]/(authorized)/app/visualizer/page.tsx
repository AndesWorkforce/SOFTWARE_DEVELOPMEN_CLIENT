"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { ArrowRight, ChevronRight, CalendarDays } from "lucide-react";
import { Header, TopEfficiency, LowPerformers } from "@/packages/design-system";
import { adtService } from "@/packages/api/adt/adt.service";
import type { RealtimeMetrics } from "@/packages/api/adt/adt.service";
import { clientsService } from "@/packages/api/clients/clients.service";
import type { ClientDayOff } from "@/packages/api/clients/clients.service";
import { useAuthStore } from "@/packages/store";

export default function VisualizerPage() {
  const t = useTranslations("visualizer");
  const locale = useLocale();
  const { user } = useAuthStore();
  const clientId = user?.userType === "client" ? user.id : undefined;
  const [loading, setLoading] = useState(true);

  // Estados para los datos
  const [topRankings, setTopRankings] = useState<RealtimeMetrics[]>([]);
  const [worstRankings, setWorstRankings] = useState<RealtimeMetrics[]>([]);
  const [weekDayOffs, setWeekDayOffs] = useState<ClientDayOff[]>([]);
  const [dayOffMode, setDayOffMode] = useState<"week" | "recent">("week");
  const [weekRange, setWeekRange] = useState<{ start: string; end: string } | null>(null);
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

        const now = new Date();
        const dayOfWeek = now.getDay();
        const monday = new Date(now);
        monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        const startDate = monday.toISOString().split("T")[0];
        const endDate = sunday.toISOString().split("T")[0];

        setWeekRange({ start: startDate, end: endDate });

        const fetchWeekDayOffs = clientId
          ? clientsService.getDayOffs(clientId, { startDate, endDate })
          : clientsService.getAllDayOffs({ startDate, endDate });

        const [rankingBest, rankingWorst, weekResult] = await Promise.allSettled([
          adtService.getTopRanking("month", "best"),
          adtService.getTopRanking("month", "worst"),
          fetchWeekDayOffs,
        ]);

        setTopRankings(rankingBest.status === "fulfilled" ? rankingBest.value : []);
        setWorstRankings(rankingWorst.status === "fulfilled" ? rankingWorst.value : []);

        const weekDayOffsResult =
          weekResult.status === "fulfilled" ? (weekResult.value as ClientDayOff[]) : [];

        if (weekDayOffsResult.length > 0) {
          setDayOffMode("week");
          setWeekDayOffs(weekDayOffsResult);
        } else {
          // Fallback: fetch latest absences without date filter
          try {
            const allDayOffs = clientId
              ? await clientsService.getDayOffs(clientId)
              : await clientsService.getAllDayOffs();
            const sorted = [...allDayOffs].sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
            );
            setDayOffMode("recent");
            setWeekDayOffs(sorted.slice(0, 6));
          } catch {
            setWeekDayOffs([]);
          }
        }
      } catch {
        setTopRankings([]);
        setWorstRankings([]);
        setWeekDayOffs([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [clientId]);

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

              {/* Sección de Days Off */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <h2 className="text-[24px] font-bold text-black">
                    {dayOffMode === "week" ? t("weekDaysOff") : t("lastDaysOff")}
                  </h2>
                  {dayOffMode === "week" && weekRange && (
                    <p className="text-[14px] text-[#6d6d6d]">
                      {new Date(weekRange.start).toLocaleDateString(locale, {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      –{" "}
                      {new Date(weekRange.end).toLocaleDateString(locale, {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  )}
                </div>

                {/* Lista de Days Off */}
                <div className="flex flex-col gap-3">
                  {loading ? (
                    <div className="text-center py-12">
                      <p className="text-[16px] text-gray-500">{t("loading")}</p>
                    </div>
                  ) : weekDayOffs.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-[16px] text-gray-500">{t("noDataAvailable")}</p>
                    </div>
                  ) : (
                    <>
                      {weekDayOffs.map((dayOff) => (
                        <div
                          key={dayOff.id}
                          className="bg-white border border-[rgba(166,166,166,0.25)] rounded-[10px] shadow-[0px_4px_4px_0px_rgba(166,166,166,0.25)] px-[15px] sm:px-[30px] py-[12px]"
                        >
                          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between w-full gap-3 xl:gap-0">
                            {/* Información del contratista */}
                            <div className="flex flex-col items-start w-full xl:w-[280px] xl:h-[58px] xl:shrink-0">
                              <p className="text-[18px] font-semibold text-black truncate w-full">
                                {dayOff.contractor_name}
                              </p>
                              <p className="text-[16px] text-[#6d6d6d] truncate w-full">
                                {dayOff.team_name ?? t("noTeam")}
                              </p>
                            </div>

                            {/* Badge de fecha */}
                            <div className="px-[12px] py-[6px] rounded-[5px] h-[38px] flex items-center justify-center xl:justify-between w-full xl:w-auto xl:min-w-[150px] xl:shrink-0 bg-[rgba(0,151,178,0.1)]">
                              <div className="flex gap-[5px] items-center">
                                <CalendarDays size={16} color="#0097b2" strokeWidth={2} />
                                <p className="text-[16px] font-semibold text-[#0097b2] whitespace-nowrap">
                                  {new Date(dayOff.date).toLocaleDateString(locale, {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </p>
                              </div>
                              x
                            </div>

                            {/* Bsuotón View History */}
                            <Link
                              href={`/${locale}/app/visualizer/contractor-history/${dayOff.contractor_id}?name=${encodeURIComponent(dayOff.contractor_name)}`}
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

                      {/* Ver Todos */}
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
