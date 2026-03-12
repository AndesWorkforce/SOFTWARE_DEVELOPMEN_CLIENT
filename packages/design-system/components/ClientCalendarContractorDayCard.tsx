"use client";

import { BriefcaseBusiness, Clock } from "lucide-react";

export interface ClientCalendarContractorDayCardProps {
  name: string;
  jobPosition: string;
  jobSchedule?: "full_time" | "part_time" | "no_schedule" | null;
  workScheduleStart?: string | null;
  workScheduleEnd?: string | null;
}

export function ClientCalendarContractorDayCard({
  name,
  jobPosition,
  jobSchedule,
  workScheduleStart,
  workScheduleEnd,
}: ClientCalendarContractorDayCardProps) {
  const isFullTime = jobSchedule === "full_time";
  const isPartTime = jobSchedule === "part_time";

  const backgroundColor = isFullTime ? "#CFFAFE" : isPartTime ? "#F3E8FF" : "#FFFFFF";
  const textColor = isFullTime ? "#0E7490" : isPartTime ? "#7E22CE" : "#000000";

  const scheduleLabel =
    workScheduleStart && workScheduleEnd ? `${workScheduleStart} - ${workScheduleEnd}` : "-";

  return (
    <div
      className="group flex w-full items-center gap-[8px] rounded-[5px] px-[7px] py-[10px]"
      style={{ backgroundColor, color: textColor }}
    >
      {/* Vista por defecto */}
      <div className="flex w-full items-center gap-[8px] group-hover:hidden">
        <BriefcaseBusiness className="h-4 w-4 shrink-0" />
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-[12px] font-medium leading-normal">{name}</span>
          <span className="truncate text-[10px] font-normal leading-normal">{jobPosition}</span>
        </div>
      </div>

      {/* Vista en hover: horario de trabajo */}
      <div className="hidden w-full items-center gap-[8px] group-hover:flex">
        <Clock className="h-4 w-4 shrink-0" />
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-[12px] font-medium leading-normal">{scheduleLabel}</span>
          <span className="truncate text-[10px] font-normal leading-normal">Working Hours</span>
        </div>
      </div>
    </div>
  );
}
