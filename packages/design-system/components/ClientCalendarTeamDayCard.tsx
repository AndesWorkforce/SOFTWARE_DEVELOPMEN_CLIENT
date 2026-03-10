"use client";

import { ArrowRight, Users } from "lucide-react";

const TEAM_CARD_COLORS = [
  "#3FDC7E1A",
  "#6AD1FE1A",
  "#5D89DF1A",
  "#7B47E91A",
  "#EE60E01A",
  "#FA4B421A",
  "#FE6A351A",
  "#EECA341A",
  "#64BDC61A",
  "#2B72FB1A",
] as const;

export interface ClientCalendarTeamDayCardProps {
  teamId: string;
  teamName: string;
  date: Date;
  activeCount?: number;
  absentCount?: number;
  onClick?: () => void;
  className?: string;
  variantIndex?: number;
}

export function ClientCalendarTeamDayCard({
  teamId,
  teamName,
  date,
  activeCount = 0,
  absentCount = 0,
  onClick,
  className = "",
  variantIndex = 0,
}: ClientCalendarTeamDayCardProps) {
  const backgroundColor = TEAM_CARD_COLORS[variantIndex % TEAM_CARD_COLORS.length];

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
      className={`flex w-full flex-col items-start gap-[10px] rounded-[5px] px-[7px] py-[10px] shadow-[0px_4px_4px_0px_rgba(166,166,166,0.25)] ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      style={{ backgroundColor }}
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
