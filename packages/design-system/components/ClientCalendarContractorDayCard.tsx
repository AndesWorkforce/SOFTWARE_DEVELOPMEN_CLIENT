"use client";

import { BriefcaseBusiness } from "lucide-react";

export interface ClientCalendarContractorDayCardProps {
  name: string;
  jobPosition: string;
  jobSchedule?: "full_time" | "part_time" | "no_schedule" | null;
}

export function ClientCalendarContractorDayCard({
  name,
  jobPosition,
  jobSchedule,
}: ClientCalendarContractorDayCardProps) {
  const isFullTime = jobSchedule === "full_time";
  const isPartTime = jobSchedule === "part_time";

  const backgroundColor = isFullTime ? "#CFFAFE" : isPartTime ? "#F3E8FF" : "#FFFFFF";

  const textColor = isFullTime ? "#0E7490" : isPartTime ? "#7E22CE" : "#000000";

  return (
    <div
      className="flex w-full items-center gap-[8px] rounded-[5px] px-[7px] py-[10px]"
      style={{ backgroundColor: backgroundColor }}
    >
      <BriefcaseBusiness className={`h-4 w-4 shrink-0 text-[${textColor}]`} />
      <div className="flex min-w-0 flex-col">
        <span className={`truncate text-[12px] font-medium leading-normal text-[${textColor}]`}>
          {name}
        </span>
        <span className={`truncate text-[10px] font-normal leading-normal text-[${textColor}]`}>
          {jobPosition}
        </span>
      </div>
    </div>
  );
}
