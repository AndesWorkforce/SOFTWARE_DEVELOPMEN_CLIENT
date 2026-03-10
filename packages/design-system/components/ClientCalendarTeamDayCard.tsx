"use client";

import { ArrowRight, Users } from "lucide-react";

export interface ClientCalendarTeamDayCardProps {
  teamName: string;
  activeCount: number;
  absentCount: number;
  onClick?: () => void;
  className?: string;
}

export function ClientCalendarTeamDayCard({
  teamName,
  activeCount,
  absentCount,
  onClick,
  className = "",
}: ClientCalendarTeamDayCardProps) {
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`flex w-full flex-col items-start gap-[10px] rounded-[5px] bg-[rgba(63,220,126,0.1)] px-[7px] py-[10px] shadow-[0px_4px_4px_0px_rgba(166,166,166,0.25)] ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      <div className="flex h-[18px] w-full items-center justify-between">
        <span className="min-w-0 truncate text-[12px] font-medium leading-normal text-black">
          {teamName}
        </span>
        <ArrowRight className="size-3 shrink-0 text-black" aria-hidden />
      </div>
      <div className="flex items-center gap-[5px]">
        <div className="flex items-center gap-[3px]">
          <Users className="size-3 shrink-0 text-[#0097b2]" aria-hidden />
          <span className="text-[10px] font-semibold leading-normal text-[#0097b2] whitespace-nowrap">
            {activeCount} Active
          </span>
        </div>
        <div className="flex items-center gap-[3px]">
          <Users className="size-3 shrink-0 text-[#fe6a35]" aria-hidden />
          <span className="text-[10px] font-semibold leading-normal text-[#fe6a35] whitespace-nowrap">
            {absentCount} Absent
          </span>
        </div>
      </div>
    </div>
  );
}
