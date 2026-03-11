"use client";

import { useTranslations } from "next-intl";
import { BriefcaseBusiness, FileUser, TreePalm, Cross } from "lucide-react";

export interface ClientCalendarFiltersProps {
  jobPositionOptions: string[];
  selectedJobPosition: string;
  onJobPositionChange: (value: string) => void;
  selectedAbsenceType: string;
  onAbsenceTypeChange: (value: string) => void;
}

export function ClientCalendarFilters({
  jobPositionOptions,
  selectedJobPosition,
  onJobPositionChange,
  selectedAbsenceType,
  onAbsenceTypeChange,
}: ClientCalendarFiltersProps) {
  const tCalendar = useTranslations("calendar");

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-[#4B4B4B]">
            {tCalendar("filters.timeWorkLabel")}
          </span>
          <select
            value={selectedJobPosition}
            onChange={(e) => onJobPositionChange(e.target.value)}
            className="h-[32px] min-w-[130px] rounded-[6px] border border-[#D4D4D4] bg-white px-2 text-[13px] text-[#1F2933] shadow-sm focus:border-[#0097B2] focus:outline-none"
          >
            <option value="all">{tCalendar("filters.timeWorkAll")}</option>
            {jobPositionOptions.map((job) => (
              <option key={job} value={job}>
                {job === "full_time"
                  ? tCalendar("stats.fullTimeContractors")
                  : job === "part_time"
                    ? tCalendar("stats.partTimeContractors")
                    : job}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <div className="flex items-center gap-1 rounded-[6px] bg-[#F3E8FF] px-2 py-[4px] text-[11px] font-medium text-[#7E22CE]">
            <BriefcaseBusiness className="h-3 w-3" />
            <span>Full-Time</span>
          </div>
          <div className="flex items-center gap-1 rounded-[6px] bg-[#CFFAFE] px-2 py-[4px] text-[11px] font-medium text-[#0E7490]">
            <BriefcaseBusiness className="h-3 w-3" />
            <span>Part-Time</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-[#4B4B4B]">
            {tCalendar("filters.absenceTypeLabel")}
          </span>
          <select
            value={selectedAbsenceType}
            onChange={(e) => onAbsenceTypeChange(e.target.value)}
            className="h-[32px] min-w-[130px] rounded-[6px] border border-[#D4D4D4] bg-white px-2 text-[13px] text-[#1F2933] shadow-sm focus:border-[#0097B2] focus:outline-none"
          >
            <option value="all">{tCalendar("filters.absenceTypeAll")}</option>
            <option value="License">{tCalendar("filters.absenceTypeLicense")}</option>
            <option value="Vacation">{tCalendar("filters.absenceTypeVacation")}</option>
            <option value="Health">{tCalendar("filters.absenceTypeHealth")}</option>
          </select>
        </div>

        <div className="flex gap-2">
          <div className="flex items-center gap-1 rounded-[6px] bg-[#DBEAFE] px-2 py-[4px] text-[11px] font-medium text-[#1E40AF]">
            <FileUser className="h-3 w-3" />
            <span>{tCalendar("filters.absenceTypeLicense")}</span>
          </div>
          <div className="flex items-center gap-1 rounded-[6px] bg-[#DCFCE7] px-2 py-[4px] text-[11px] font-medium text-[#166534]">
            <TreePalm className="h-3 w-3" />
            <span>{tCalendar("filters.absenceTypeVacation")}</span>
          </div>
          <div className="flex items-center gap-1 rounded-[6px] bg-[#FEE2E2] px-2 py-[4px] text-[11px] font-medium text-[#B91C1C]">
            <Cross className="h-3 w-3" />
            <span>{tCalendar("filters.absenceTypeHealth")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
