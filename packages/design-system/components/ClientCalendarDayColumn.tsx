"use client";

import { ClientCalendarDayHeader } from "./ClientCalendarDayHeader";
import { ClientCalendarTeamDayCard } from "./ClientCalendarTeamDayCard";

export interface ClientCalendarDayColumnTeam {
  id: string;
  name: string;
  activeCount?: number;
  absentCount?: number;
}

export interface ClientCalendarDayColumnProps {
  dayLabel: string;
  dayNumber: number;
  isToday?: boolean;
  teams?: ClientCalendarDayColumnTeam[];
  onTeamClick?: (teamId: string) => void;
  className?: string;
}

export function ClientCalendarDayColumn({
  dayLabel,
  dayNumber,
  isToday = false,
  teams = [],
  onTeamClick,
  className = "",
}: ClientCalendarDayColumnProps) {
  return (
    <div className={`flex min-w-0 flex-1 flex-col ${className}`}>
      <div className="mb-[15px] flex h-[19px] items-center justify-center">
        <ClientCalendarDayHeader label={dayLabel} isToday={isToday} />
      </div>
      <div className="flex min-h-[200px] flex-1 flex-col rounded-[10px] border-[0.5px] border-[#c2c2c2] border-solid bg-[#f6f6f6]">
        <p className="px-[14px] pt-[20px] font-bold leading-normal text-[16px] text-black">
          {dayNumber}
        </p>
        <div className="flex min-h-0 flex-1 flex-col gap-[5px] overflow-y-auto p-2">
          {teams.map((team) => (
            <ClientCalendarTeamDayCard
              key={team.id}
              teamName={team.name}
              activeCount={team.activeCount ?? 9}
              absentCount={team.absentCount ?? 1}
              onClick={onTeamClick ? () => onTeamClick(team.id) : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
