"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { ArrowLeft, Download, ListFilter, Calendar, ArrowDownWideNarrow } from "lucide-react";
import { Header } from "@/packages/design-system";
import { contractorsService } from "@/packages/api/contractors/contractors.service";
import type { ContractorDayOff } from "@/packages/api/contractors/contractors.service";
import { adtService } from "@/packages/api/adt/adt.service";

export default function ContractorHistoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("visualizer.contractorHistory");

  const contractorId = params.id as string;
  const contractorName = searchParams.get("name") ?? "";

  const productivityParam = searchParams.get("productivity");
  const avgProductivity = productivityParam !== null ? Number(productivityParam) : null;

  const [dayOffs, setDayOffs] = useState<ContractorDayOff[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("");
  const [workingDays, setWorkingDays] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [dayOffsData, sessionsData] = await Promise.all([
          contractorsService.getDayOffs(contractorId),
          adtService.getContractorSessions(contractorId).catch(() => null),
        ]);

        setDayOffs(dayOffsData);

        if (sessionsData && sessionsData.length > 0) {
          const uniqueDays = new Set(sessionsData.map((s) => s.session_start.split(" ")[0]));
          setWorkingDays(uniqueDays.size);
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [contractorId]);

  const filteredDayOffs = dateFilter
    ? dayOffs.filter((d) => {
        const matchesReason = d.reason.toLowerCase().includes(dateFilter.toLowerCase());
        const matchesDate = d.dates?.some((iso) => iso.includes(dateFilter)) ?? false;
        return matchesReason || matchesDate;
      })
    : dayOffs;

  const handleCleanFilters = () => {
    setDateFilter("");
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("T")[0].split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#F5F5F5" }}>
      <Header />
      <div className="flex-1 overflow-x-hidden pt-[71px] px-4 md:px-8 pb-4 md:pb-8">
        <div className="max-w-full overflow-x-hidden flex flex-col gap-6">
          {/* Título + Export */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-3">
              <Link
                href={`/${locale}/app/visualizer`}
                className="flex items-center justify-center w-[24px] h-[24px] shrink-0 hover:opacity-70 transition-opacity"
              >
                <ArrowLeft size={24} color="#000000" strokeWidth={2} />
              </Link>
              <h1 className="text-[24px] font-semibold text-black">
                {t("title")} {contractorName}
              </h1>
            </div>
            <button
              type="button"
              className="flex items-center gap-[10px] bg-[#0097b2] rounded-[8px] px-[21px] py-[7px] h-[40px] shadow-[0px_4px_4px_0px_rgba(166,166,166,0.25)] hover:bg-[#007a90] transition-colors"
            >
              <Download size={16} color="#ffffff" strokeWidth={2} />
              <span className="text-[14px] font-semibold text-white whitespace-nowrap">
                {t("exportPdf")}
              </span>
            </button>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-[15px]">
            <div className="bg-white border border-[rgba(166,166,166,0.25)] rounded-[10px] shadow-[0px_4px_4px_0px_rgba(166,166,166,0.25)] h-[100px] flex items-center justify-center">
              <div className="flex flex-col gap-[10px] items-center text-center">
                <p className="text-[16px] font-medium text-[#0097b2]">{t("workingDays")}</p>
                <p className="text-[32px] font-semibold text-black">
                  {loading ? "—" : (workingDays ?? "—")}
                </p>
              </div>
            </div>
            <div className="bg-white border border-[rgba(166,166,166,0.25)] rounded-[10px] shadow-[0px_4px_4px_0px_rgba(166,166,166,0.25)] h-[100px] flex items-center justify-center">
              <div className="flex flex-col gap-[10px] items-center text-center">
                <p className="text-[16px] font-medium text-[#0097b2]">{t("averageProductivity")}</p>
                <p className="text-[32px] font-semibold text-black">
                  {loading ? "—" : avgProductivity !== null ? `${avgProductivity}%` : "—"}
                </p>
              </div>
            </div>
            <div className="bg-white border border-[rgba(166,166,166,0.25)] rounded-[10px] shadow-[0px_4px_4px_0px_rgba(166,166,166,0.25)] h-[100px] flex items-center justify-center">
              <div className="flex flex-col gap-[10px] items-center text-center">
                <p className="text-[16px] font-medium text-[#0097b2]">{t("totalAbsences")}</p>
                <p className="text-[32px] font-semibold text-black">
                  {loading ? "—" : dayOffs.length}
                </p>
              </div>
            </div>
          </div>

          {/* Absence Report title */}
          <h2 className="text-[20px] font-semibold text-black -mb-2">{t("absenceReport")}</h2>

          {/* Filtros */}
          <div className="bg-white border border-[rgba(166,166,166,0.5)] rounded-[10px] shadow-[0px_4px_4px_0px_rgba(166,166,166,0.25)] px-[28px] py-[31px]">
            <div className="flex flex-col gap-[30px]">
              {/* Header filtros */}
              <div className="flex items-center gap-[10px]">
                <ListFilter size={20} color="#000000" strokeWidth={2} />
                <p className="text-[16px] font-semibold text-black">{t("applyFilters")}</p>
              </div>

              {/* Inputs + botón */}
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-[20px] w-full sm:w-auto">
                  {/* Search filter */}
                  <div className="flex flex-col gap-[5px]">
                    <p className="text-[16px] font-medium text-black">{t("date")}</p>
                    <div className="flex h-[35px] items-center border border-[rgba(166,166,166,0.5)] rounded-[5px] shadow-[0px_4px_4px_0px_rgba(166,166,166,0.25)] bg-white w-full sm:w-[341px] overflow-hidden">
                      <input
                        type="text"
                        placeholder={t("datePlaceholder")}
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="flex-1 px-[8px] text-[14px] text-[#b6b4b4] placeholder-[#b6b4b4] border-none outline-none bg-transparent"
                      />
                      <div className="flex items-center justify-center w-[40px] h-full border-l border-[rgba(166,166,166,0.5)] bg-white px-[8px]">
                        <Calendar size={18} color="#6d6d6d" strokeWidth={1.5} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Clean filters */}
                <button
                  type="button"
                  onClick={handleCleanFilters}
                  className="h-[35px] px-[20px] bg-[#ff0004] rounded-[5px] shadow-[0px_4px_4px_0px_rgba(166,166,166,0.25)] hover:bg-[#cc0003] transition-colors shrink-0"
                >
                  <span className="text-[14px] font-semibold text-white whitespace-nowrap">
                    {t("cleanFilters")}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Tabla de ausencias */}
          <div className="bg-white border border-[rgba(166,166,166,0.25)] rounded-[10px] shadow-[0px_4px_4px_0px_rgba(166,166,166,0.25)] overflow-hidden">
            {/* Header de la tabla */}
            <div className="grid grid-cols-[180px_1fr] px-6 py-4 border-b border-[rgba(166,166,166,0.2)]">
              <div className="flex items-center gap-[6px]">
                <span className="text-[14px] font-semibold text-black">{t("table.date")}</span>
                <ArrowDownWideNarrow size={16} color="#6d6d6d" strokeWidth={1.5} />
              </div>
              <div className="flex items-center gap-[6px]">
                <span className="text-[14px] font-semibold text-black">
                  {t("table.description")}
                </span>
              </div>
            </div>

            {/* Filas */}
            {loading ? (
              <div className="text-center py-12">
                <p className="text-[16px] text-gray-500">{t("loading")}</p>
              </div>
            ) : filteredDayOffs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[16px] text-gray-500">{t("noData")}</p>
              </div>
            ) : (
              filteredDayOffs.map((dayOff, index) => {
                const isEven = index % 2 === 0;
                return (
                  <div
                    key={dayOff.id}
                    className="grid grid-cols-[180px_1fr] px-6 py-4"
                    style={{
                      backgroundColor: isEven ? "#ffffff" : "rgba(235, 235, 235, 0.4)",
                    }}
                  >
                    <span className="text-[14px] text-black self-center">
                      {dayOff.dates && dayOff.dates.length > 0 ? formatDate(dayOff.dates[0]) : "-"}
                    </span>
                    <span className="text-[14px] text-[#6d6d6d] self-center">{dayOff.reason}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
