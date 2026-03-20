"use client";

import { ClientCalendarDayHeader } from "./ClientCalendarDayHeader";
import { ClientCalendarTeamDayCard } from "./ClientCalendarTeamDayCard";
import { ClientCalendarContractorDayCard } from "./ClientCalendarContractorDayCard";
import type { Contractor } from "@/packages/api/contractors/contractors.service";

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
  dayDate: Date;
  isAllTeams: boolean;
  teams?: ClientCalendarDayColumnTeam[];
  contractors?: Contractor[];
  onTeamClick?: (teamId: string) => void;
  onContractorHistoryClick?: (contractorId: string, contractorName: string) => void;
  className?: string;
  jobPositionFilter?: string;
  absenceTypeFilter?: string;
  getContractorDayOffType?: (
    contractor: Contractor,
    dayDate: Date,
  ) => "Health" | "Vacation" | "License" | null;
}

export function ClientCalendarDayColumn({
  dayLabel,
  dayNumber,
  isToday = false,
  dayDate,
  isAllTeams,
  teams = [],
  contractors = [],
  onTeamClick,
  onContractorHistoryClick,
  className = "",
  jobPositionFilter = "all",
  absenceTypeFilter = "all",
  getContractorDayOffType,
}: ClientCalendarDayColumnProps) {
  const dayOfWeek = dayDate.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

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
          {!isWeekend &&
            (isAllTeams
              ? teams.map((team, index) => (
                  <ClientCalendarTeamDayCard
                    key={team.id}
                    teamName={team.name}
                    teamId={team.id}
                    date={dayDate}
                    activeCount={team.activeCount ?? 0}
                    absentCount={team.absentCount ?? 0}
                    variantIndex={index}
                    onClick={onTeamClick ? () => onTeamClick(team.id) : undefined}
                  />
                ))
              : contractors
                  .map((contractor) => {
                    const contractorDayOffType =
                      getContractorDayOffType?.(contractor, dayDate) ?? null;
                    return { contractor, contractorDayOffType };
                  })
                  .filter(({ contractor, contractorDayOffType }) => {
                    const matchesSchedule =
                      jobPositionFilter === "all"
                        ? true
                        : contractor.job_schedule === jobPositionFilter;

                    const matchesAbsence =
                      absenceTypeFilter === "all"
                        ? true
                        : contractorDayOffType === absenceTypeFilter;

                    return matchesSchedule && matchesAbsence;
                  })
                  .map(({ contractor, contractorDayOffType }) => (
                    <ClientCalendarContractorDayCard
                      key={contractor.id}
                      name={contractor.name}
                      jobPosition={contractor.job_position}
                      jobSchedule={contractor.job_schedule}
                      workScheduleStart={contractor.work_schedule_start}
                      workScheduleEnd={contractor.work_schedule_end}
                      dayOffType={contractorDayOffType}
                      onHistoryClick={
                        onContractorHistoryClick
                          ? () => onContractorHistoryClick(contractor.id, contractor.name)
                          : undefined
                      }
                    />
                  )))}
        </div>
      </div>
    </div>
  );
}
