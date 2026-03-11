"use client";

import { useMemo } from "react";

import type { ClientCalendarDayColumnTeam } from "./ClientCalendarDayColumn";
import { ClientCalendarDayColumn } from "./ClientCalendarDayColumn";
import type { Contractor } from "@/packages/api/contractors/contractors.service";

const DAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export interface ClientCalendarWeekGridProps {
  weekRange: { start: Date; end: Date };
  teams?: ClientCalendarDayColumnTeam[];
  isAllTeams: boolean;
  contractors?: Contractor[];
  onTeamClick?: (teamId: string) => void;
  className?: string;
  teamDayStats?: Record<string, Record<string, { activeCount: number; absentCount: number }>>;
  jobPositionFilter?: string;
}

export function ClientCalendarWeekGrid({
  weekRange,
  teams = [],
  isAllTeams,
  contractors = [],
  onTeamClick,
  className = "",
  teamDayStats,
  jobPositionFilter = "all",
}: ClientCalendarWeekGridProps) {
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t.getTime();
  }, []);

  const days = useMemo(() => {
    const start = new Date(weekRange.start);
    start.setHours(0, 0, 0, 0);
    const result: { date: Date; label: string; dayNumber: number; isToday: boolean }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      result.push({
        date: d,
        label: DAY_LABELS[i],
        dayNumber: d.getDate(),
        isToday: dayStart.getTime() === today,
      });
    }
    return result;
  }, [weekRange.start, today]);

  return (
    <div className={`flex w-full flex-col ${className}`}>
      <div className="grid grid-cols-7 gap-[9px] sm:gap-4">
        {days.map((day) => {
          const isoDate = day.date.toISOString().slice(0, 10);

          const teamsWithStats: ClientCalendarDayColumnTeam[] = teams.map((team) => {
            const statsForDay = teamDayStats?.[team.id]?.[isoDate];
            return {
              ...team,
              activeCount: statsForDay?.activeCount ?? 0,
              absentCount: statsForDay?.absentCount ?? 0,
            };
          });

          return (
            <ClientCalendarDayColumn
              key={day.date.toISOString()}
              dayLabel={day.label}
              dayNumber={day.dayNumber}
              isToday={day.isToday}
              dayDate={day.date}
              isAllTeams={isAllTeams}
              teams={teamsWithStats}
              contractors={contractors}
              onTeamClick={onTeamClick}
              jobPositionFilter={jobPositionFilter}
            />
          );
        })}
      </div>
    </div>
  );
}
