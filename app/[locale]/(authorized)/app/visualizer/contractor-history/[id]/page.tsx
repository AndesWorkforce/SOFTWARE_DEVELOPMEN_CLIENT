"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  ArrowLeft,
  BriefcaseBusiness,
  BadgeAlert,
  ChevronDown,
  ChevronRight,
  TreePalm,
  Cross,
  FileUser,
} from "lucide-react";
import { Header } from "@/packages/design-system";
import { contractorsService } from "@/packages/api/contractors/contractors.service";
import type { ContractorDayOff } from "@/packages/api/contractors/contractors.service";

type AbsenceTypeFilter = "All" | "License" | "Vacation" | "Health";

function TypeBadge({ type }: { type: string }) {
  const t = useTranslations("visualizer.contractorHistory");
  if (type === "Vacation") {
    return (
      <span className="inline-flex items-center gap-[5px] text-[#5e7a00] text-[14px]">
        <TreePalm size={14} strokeWidth={1.5} />
        {t("absenceTypes.vacation")}
      </span>
    );
  }
  if (type === "Health") {
    return (
      <span className="inline-flex items-center gap-[5px] text-[#991b1b] text-[14px]">
        <Cross size={14} strokeWidth={1.5} />
        {t("absenceTypes.health")}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-[5px] text-[#007489] text-[14px]">
      <FileUser size={14} strokeWidth={1.5} />
      {t("absenceTypes.license")}
    </span>
  );
}

export default function ContractorHistoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("visualizer.contractorHistory");

  const contractorId = params.id as string;
  const contractorName = searchParams.get("name") ?? "";

  const [dayOffs, setDayOffs] = useState<ContractorDayOff[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<AbsenceTypeFilter>("All");
  const [workingDays, setWorkingDays] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const dateDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [dayOffsData, workingDaysData] = await Promise.all([
          contractorsService.getDayOffs(contractorId),
          contractorsService.getWorkingDays(contractorId).catch(() => null),
        ]);

        setDayOffs(dayOffsData);

        if (workingDaysData) {
          setWorkingDays(workingDaysData.workingDays);
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [contractorId]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(e.target as Node)) {
        setDateDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("T")[0].split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateRange = (dates: string[]) => {
    if (!dates || dates.length === 0) return "-";
    if (dates.length === 1) return formatDate(dates[0]);
    return `${formatDate(dates[0])} - ${formatDate(dates[dates.length - 1])}`;
  };

  const getDuration = (dates: string[]) => {
    if (!dates || dates.length === 0) return "-";
    return dates.length === 1 ? `1 ${t("durationDay")}` : `${dates.length} ${t("durationDays")}`;
  };

  const filteredDayOffs = dayOffs.filter((d) => {
    if (typeFilter !== "All" && d.type !== typeFilter) return false;
    if (startDate && d.dates) {
      const afterStart = d.dates.some((dd) => dd.split("T")[0] >= startDate);
      if (!afterStart) return false;
    }
    if (endDate && d.dates) {
      const beforeEnd = d.dates.some((dd) => dd.split("T")[0] <= endDate);
      if (!beforeEnd) return false;
    }
    return true;
  });

  const dateRangeLabel =
    startDate || endDate
      ? `${startDate ? formatDate(startDate) : "..."} – ${endDate ? formatDate(endDate) : "..."}`
      : t("datePlaceholder");

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      <Header />
      <div className="flex-1 pt-[71px] px-4 md:px-8 pb-6 md:pb-10">
        <div className="max-w-full flex flex-col gap-6">
          {/* Title */}
          <div className="flex items-center gap-3 pt-4">
            <Link
              href={`/${locale}/app/visualizer`}
              className="flex items-center justify-center w-[24px] h-[24px] shrink-0 hover:opacity-70 transition-opacity"
            >
              <ArrowLeft size={24} color="#0F172A" strokeWidth={2} />
            </Link>
            <h1 className="text-[24px] font-semibold text-[#0F172A]">
              {t("title")} {contractorName}
            </h1>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 gap-2 md:gap-4 md:w-2/3">
            {/* Working Days */}
            <div className="group relative bg-white border border-[rgba(100,116,139,0.2)] rounded-[10px] shadow-[0px_4px_4px_0px_rgba(166,166,166,0.2)] h-[58px] md:h-[90px] overflow-hidden">
              {/* Normal state */}
              <div className="absolute inset-0 flex flex-row items-center px-[10px] gap-[10px] md:px-5 md:gap-4 transition-opacity duration-200 group-hover:opacity-0">
                <div className="w-[30px] h-[30px] md:w-10 md:h-10 rounded-full bg-[rgba(124,58,237,0.1)] flex items-center justify-center shrink-0">
                  <BriefcaseBusiness
                    className="w-[14px] h-[14px] md:w-5 md:h-5"
                    color="#7c3aed"
                    strokeWidth={1.8}
                  />
                </div>
                <div className="flex flex-col items-start">
                  <p className="text-[10px] md:text-[12px] font-normal text-[#0F172A] leading-tight">
                    {t("workingDays")}
                  </p>
                  <p className="text-[20px] md:text-[28px] font-semibold text-[#7c3aed] leading-tight">
                    {loading ? "—" : (workingDays ?? "—")}
                  </p>
                </div>
              </div>
              {/* Hover state */}
              <div className="absolute inset-0 flex flex-row items-center px-[10px] gap-[10px] md:px-5 md:gap-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <div className="w-[30px] h-[30px] md:w-10 md:h-10 rounded-full bg-[rgba(124,58,237,0.1)] flex items-center justify-center shrink-0">
                  <BriefcaseBusiness
                    className="w-[14px] h-[14px] md:w-5 md:h-5"
                    color="#7c3aed"
                    strokeWidth={1.8}
                  />
                </div>
                <p className="text-[11px] md:text-[14px] font-normal text-[#0F172A] leading-snug">
                  {t("workingDaysDesc")}
                </p>
              </div>
            </div>
            {/* Total Absences */}
            <div className="group relative bg-white border border-[rgba(100,116,139,0.2)] rounded-[10px] shadow-[0px_4px_4px_0px_rgba(166,166,166,0.2)] h-[58px] md:h-[90px] overflow-hidden">
              {/* Normal state */}
              <div className="absolute inset-0 flex flex-row items-center px-[10px] gap-[10px] md:px-5 md:gap-4 transition-opacity duration-200 group-hover:opacity-0">
                <div className="w-[30px] h-[30px] md:w-10 md:h-10 rounded-full bg-[rgba(239,68,68,0.1)] flex items-center justify-center shrink-0">
                  <BadgeAlert
                    className="w-[14px] h-[14px] md:w-5 md:h-5"
                    color="#ef4444"
                    strokeWidth={1.8}
                  />
                </div>
                <div className="flex flex-col items-start">
                  <p className="text-[10px] md:text-[12px] font-normal text-[#0F172A] leading-tight">
                    {t("totalAbsences")}
                  </p>
                  <p className="text-[20px] md:text-[28px] font-semibold text-[#ef4444] leading-tight">
                    {loading ? "—" : dayOffs.length}
                  </p>
                </div>
              </div>
              {/* Hover state */}
              <div className="absolute inset-0 flex flex-row items-center px-[10px] gap-[10px] md:px-5 md:gap-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <div className="w-[30px] h-[30px] md:w-10 md:h-10 rounded-full bg-[rgba(239,68,68,0.1)] flex items-center justify-center shrink-0">
                  <BadgeAlert
                    className="w-[14px] h-[14px] md:w-5 md:h-5"
                    color="#ef4444"
                    strokeWidth={1.8}
                  />
                </div>
                <p className="text-[11px] md:text-[14px] font-normal text-[#0F172A] leading-snug">
                  {t("totalAbsencesDesc")}
                </p>
              </div>
            </div>
          </div>

          {/* Section title */}
          <h2 className="text-[20px] font-semibold text-[#0F172A]">{t("absenceReport")}</h2>

          {/* Filters row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Date range dropdown */}
            <div className="relative w-full sm:w-auto" ref={dateDropdownRef}>
              <button
                type="button"
                onClick={() => setDateDropdownOpen((o) => !o)}
                className="w-full sm:w-auto flex items-center gap-2 border border-[rgba(100,116,139,0.3)] rounded-[8px] bg-white px-4 py-2 text-[14px] text-[#0F172A] shadow-sm hover:bg-gray-50 transition-colors"
              >
                <span className="text-[11px] text-[#64748B]">{t("date")}</span>
                <span className="font-medium">{dateRangeLabel}</span>
                <ChevronDown size={16} color="#64748B" />
              </button>
              {dateDropdownOpen && (
                <div className="absolute top-[calc(100%+6px)] left-0 z-20 bg-white border border-[rgba(100,116,139,0.2)] rounded-[10px] shadow-lg p-4 flex flex-col gap-3 min-w-[260px]">
                  <div className="flex flex-col gap-1">
                    <label className="text-[12px] font-medium text-[#64748B]">
                      {t("dateFrom")}
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="border border-[rgba(100,116,139,0.3)] rounded-[6px] px-3 py-1.5 text-[14px] text-[#0F172A] outline-none focus:border-[#007489]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[12px] font-medium text-[#64748B]">{t("dateTo")}</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="border border-[rgba(100,116,139,0.3)] rounded-[6px] px-3 py-1.5 text-[14px] text-[#0F172A] outline-none focus:border-[#007489]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setStartDate("");
                        setEndDate("");
                        setDateDropdownOpen(false);
                      }}
                      className="flex-1 py-1.5 rounded-[6px] border border-[rgba(100,116,139,0.3)] text-[13px] text-[#64748B] hover:bg-gray-50 transition-colors"
                    >
                      {t("cleanFilters")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDateDropdownOpen(false)}
                      className="flex-1 py-1.5 rounded-[6px] bg-[#007489] text-[13px] text-white hover:bg-[#005f70] transition-colors"
                    >
                      {t("apply")}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Absence type filter + legend */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-[#64748B]">{t("absenceType")}</span>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as AbsenceTypeFilter)}
                  className="border border-[rgba(100,116,139,0.3)] rounded-[6px] px-2 py-1 text-[14px] text-[#0F172A] bg-white outline-none focus:border-[#007489]"
                >
                  <option value="All">{t("absenceTypes.all")}</option>
                  <option value="License">{t("absenceTypes.license")}</option>
                  <option value="Vacation">{t("absenceTypes.vacation")}</option>
                  <option value="Health">{t("absenceTypes.health")}</option>
                </select>
              </div>
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-[5px] text-[#007489] text-[13px]">
                  <FileUser size={13} strokeWidth={1.5} />
                  {t("absenceTypes.license")}
                </span>
                <span className="inline-flex items-center gap-[5px] text-[#5e7a00] text-[13px]">
                  <TreePalm size={13} strokeWidth={1.5} />
                  {t("absenceTypes.vacation")}
                </span>
                <span className="inline-flex items-center gap-[5px] text-[#991b1b] text-[13px]">
                  <Cross size={13} strokeWidth={1.5} />
                  {t("absenceTypes.health")}
                </span>
              </div>
            </div>
          </div>

          {/* Table — desktop */}
          <div className="hidden md:block bg-white border border-[rgba(100,116,139,0.2)] rounded-[10px] shadow-[0px_4px_4px_0px_rgba(166,166,166,0.2)] overflow-hidden">
            <div className="grid grid-cols-[1fr_150px_120px_1fr] px-6 py-3 border-b border-[rgba(100,116,139,0.15)]">
              <span className="text-[14px] font-semibold text-[#0F172A]">{t("table.date")}</span>
              <span className="text-[14px] font-semibold text-[#0F172A]">{t("table.type")}</span>
              <span className="text-[14px] font-semibold text-[#0F172A]">
                {t("table.duration")}
              </span>
              <span className="text-[14px] font-semibold text-[#0F172A]">
                {t("table.description")}
              </span>
            </div>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-[14px] text-[#64748B]">{t("loading")}</p>
              </div>
            ) : filteredDayOffs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[14px] text-[#64748B]">{t("noData")}</p>
              </div>
            ) : (
              filteredDayOffs.map((dayOff, index) => (
                <div
                  key={dayOff.id}
                  className="grid grid-cols-[1fr_150px_120px_1fr] px-6 py-3 items-center"
                  style={{
                    backgroundColor: index % 2 === 0 ? "#ffffff" : "rgba(0,116,137,0.08)",
                  }}
                >
                  <span className="text-[14px] text-[#0F172A]">
                    {formatDateRange(dayOff.dates)}
                  </span>
                  <TypeBadge type={dayOff.type} />
                  <span className="text-[14px] text-[#0F172A]">{getDuration(dayOff.dates)}</span>
                  <span className="text-[14px] text-[#64748B]">{dayOff.reason}</span>
                </div>
              ))
            )}
          </div>

          {/* Cards — mobile */}
          <div className="md:hidden bg-white border border-[rgba(100,116,139,0.2)] rounded-[10px] shadow-[0px_4px_4px_0px_rgba(166,166,166,0.2)] overflow-hidden">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-[14px] text-[#64748B]">{t("loading")}</p>
              </div>
            ) : filteredDayOffs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[14px] text-[#64748B]">{t("noData")}</p>
              </div>
            ) : (
              filteredDayOffs.map((dayOff, index) => {
                const isExpanded = expandedId === dayOff.id;
                return (
                  <div
                    key={dayOff.id}
                    style={{
                      backgroundColor: index % 2 === 0 ? "#ffffff" : "rgba(0,116,137,0.08)",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : dayOff.id)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[14px] text-[#0F172A]">
                          <strong>{t("table.date")}:</strong>{" "}
                          <span className="font-normal">{formatDateRange(dayOff.dates)}</span>
                        </span>
                        <span className="text-[14px] text-[#0F172A] flex items-center gap-1">
                          <strong>{t("table.type")}:</strong>
                          <TypeBadge type={dayOff.type} />
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown size={18} color="#64748B" />
                      ) : (
                        <ChevronRight size={18} color="#64748B" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-4 flex flex-col gap-2 border-t border-[rgba(100,116,139,0.1)]">
                        <span className="text-[14px] text-[#0F172A] pt-2">
                          <strong>{t("table.duration")}:</strong> {getDuration(dayOff.dates)}
                        </span>
                        <span className="text-[14px] text-[#64748B]">
                          <strong className="text-[#0F172A]">{t("table.description")}:</strong>{" "}
                          {dayOff.reason}
                        </span>
                      </div>
                    )}
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
