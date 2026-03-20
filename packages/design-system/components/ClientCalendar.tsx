"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Users } from "lucide-react";

import { ClientCalendarCardData, ClientCalendarCardDataProps } from "./ClientCalendarCardData";
import { ClientCalendarWeekGrid } from "./ClientCalendarWeekGrid";
import { ContractorSearch } from "./ContractorSearch";
import { WeekRangePicker } from "./WeekRangePicker";
import { ClientCalendarFilters } from "./ClientCalendarFilters";
import {
  contractorsService,
  type Contractor,
} from "@/packages/api/contractors/contractors.service";

export interface ClientCalendarTeam {
  id: string;
  name: string;
}

export interface ClientCalendarProps {
  clientId: string;
  clientName: string;
  cards: ClientCalendarCardDataProps[];
  teams?: ClientCalendarTeam[];
  teamCount?: number;
  onContractorHistoryClick?: (contractorId: string, contractorName: string) => void;
}

export function ClientCalendar({
  clientId,
  clientName,
  cards,
  teams = [],
  teamCount,
  onContractorHistoryClick,
}: ClientCalendarProps) {
  const tCalendar = useTranslations("calendar");

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [jobPositionFilter, setJobPositionFilter] = useState<string>("all");
  const [absenceTypeFilter, setAbsenceTypeFilter] = useState<string>("all");
  const defaultWeek = useMemo(() => {
    const d = new Date();
    const day = d.getDay();
    const start = new Date(d);
    start.setDate(d.getDate() - day);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }, []);
  const [weekRange, setWeekRange] = useState<{ start: Date; end: Date }>(defaultWeek);

  const allTeamsCount = teamCount ?? (teams.length || 0);
  const allTeamsLabel = tCalendar("filters.allTeams");
  const tabLabels: string[] = [allTeamsLabel, ...teams.map((t) => t.name)];

  const selectedTeamId = selectedIndex === 0 ? null : (teams[selectedIndex - 1]?.id ?? null);

  const [teamStats, setTeamStats] = useState<{
    teamId: string;
    todayActive: number;
    todayAbsent: number;
    fullTime: number;
    partTime: number;
    total: number;
  } | null>(null);
  const [selectedTeamContractors, setSelectedTeamContractors] = useState<Contractor[]>([]);

  // Mapa: teamId -> date(YYYY-MM-DD) -> { activeCount, absentCount }
  const [teamDayStats, setTeamDayStats] = useState<
    Record<string, Record<string, { activeCount: number; absentCount: number }>>
  >({});
  const [teamDayOffs, setTeamDayOffs] = useState<
    Array<{ contractorId: string; date: string; type: "License" | "Vacation" | "Health" }>
  >([]);

  const jobPositionOptions = useMemo(
    () =>
      Array.from(
        new Set(
          selectedTeamContractors
            .map((c) => c.job_schedule)
            .filter(
              (value): value is Exclude<Contractor["job_schedule"], null | undefined> =>
                value === "full_time" || value === "part_time" || value === "no_schedule",
            ),
        ),
      ),
    [selectedTeamContractors],
  );

  useEffect(() => {
    const loadTeamStats = async () => {
      if (!selectedTeamId) {
        setTeamStats(null);
        setSelectedTeamContractors([]);
        setJobPositionFilter("all");
        setAbsenceTypeFilter("all");
        return;
      }

      try {
        const todayIso = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

        const [teamContractors, dayOffStats] = await Promise.all([
          contractorsService.getByTeamId(selectedTeamId),
          contractorsService.getTeamDayOffStatsOnDate(selectedTeamId, todayIso),
        ]);

        const fullTime = teamContractors.filter(
          (c: Contractor) => c.job_schedule === "full_time",
        ).length;
        const partTime = teamContractors.filter(
          (c: Contractor) => c.job_schedule === "part_time",
        ).length;

        const total = teamContractors.length;
        const todayActive = dayOffStats.activeCount;
        const todayAbsent = dayOffStats.absentCount;

        setSelectedTeamContractors(teamContractors);

        setTeamStats({
          teamId: selectedTeamId,
          todayActive,
          todayAbsent,
          fullTime,
          partTime,
          total,
        });
        setJobPositionFilter("all");
        setAbsenceTypeFilter("all");
      } catch (error) {
        console.error("❌ Error cargando stats de equipo en ClientCalendar:", error);
        setTeamStats(null);
        setSelectedTeamContractors([]);
      }
    };

    loadTeamStats();
  }, [selectedTeamId]);

  const handleTeamClickFromGrid = (teamId: string) => {
    const teamIndex = teams.findIndex((team) => team.id === teamId);
    if (teamIndex >= 0) {
      setSelectedIndex(teamIndex + 1);
    }
  };

  // Cargar stats agregadas por semana para TODOS los equipos del cliente
  useEffect(() => {
    const loadWeeklyTeamStats = async () => {
      if (!clientId || !weekRange?.start || !weekRange?.end || !teams.length) {
        setTeamDayStats({});
        return;
      }

      try {
        const startIso = weekRange.start.toISOString().slice(0, 10);
        const endIso = weekRange.end.toISOString().slice(0, 10);

        const stats = await contractorsService.getClientTeamsDayOffStatsInRange(
          clientId,
          startIso,
          endIso,
        );

        const map: Record<
          string,
          Record<string, { activeCount: number; absentCount: number }>
        > = {};

        for (const item of stats) {
          if (!map[item.teamId]) {
            map[item.teamId] = {};
          }
          map[item.teamId][item.date] = {
            activeCount: item.activeCount,
            absentCount: item.absentCount,
          };
        }

        setTeamDayStats(map);
      } catch (error) {
        console.error("❌ Error cargando weekly team stats en ClientCalendar:", error);
        setTeamDayStats({});
      }
    };

    loadWeeklyTeamStats();
  }, [clientId, weekRange.start, weekRange.end, teams]);

  useEffect(() => {
    const loadTeamWeekDayOffs = async () => {
      if (!selectedTeamId) {
        setTeamDayOffs([]);
        return;
      }

      try {
        const startIso = weekRange.start.toISOString().slice(0, 10);
        const endIso = weekRange.end.toISOString().slice(0, 10);

        const data = await contractorsService.getTeamDayOffsInRange(
          selectedTeamId,
          startIso,
          endIso,
        );
        setTeamDayOffs(data);
      } catch (error) {
        console.error("❌ Error cargando day offs semanales de equipo en ClientCalendar:", error);
        setTeamDayOffs([]);
      }
    };

    loadTeamWeekDayOffs();
  }, [selectedTeamId, weekRange.start, weekRange.end]);

  const dayOffByContractorAndDate = useMemo(() => {
    const map: Record<string, Record<string, "License" | "Vacation" | "Health">> = {};
    for (const item of teamDayOffs) {
      if (!map[item.contractorId]) {
        map[item.contractorId] = {};
      }
      map[item.contractorId][item.date] = item.type;
    }
    return map;
  }, [teamDayOffs]);

  const displayCards: ClientCalendarCardDataProps[] = useMemo(() => {
    if (!selectedTeamId || !teamStats) {
      return cards;
    }

    return cards.map((card, index) => {
      if (index === 0) {
        const value = teamStats.total > 0 ? `${teamStats.todayActive}/${teamStats.total}` : "0/0";
        return { ...card, value };
      }
      if (index === 1) {
        return { ...card, value: teamStats.todayAbsent };
      }
      if (index === 2) {
        return { ...card, value: teamStats.fullTime };
      }
      if (index === 3) {
        return { ...card, value: teamStats.partTime };
      }
      return card;
    });
  }, [cards, selectedTeamId, teamStats]);

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold text-gray-900">
          {tCalendar("title", { name: clientName })}
        </h2>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {displayCards.map((card, index) => (
          <ClientCalendarCardData
            key={`${card.title}-${index}`}
            icon={card.icon}
            title={card.title}
            value={card.value}
            accentColorClass={card.accentColorClass}
          />
        ))}
      </div>

      <div
        className="flex gap-[5px] overflow-x-auto no-scrollbar w-full"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        role="tablist"
        aria-label="Teams"
      >
        {tabLabels.map((label, index) => {
          const isSelected = selectedIndex === index;
          const isFirst = index === 0;
          const displayLabel = isFirst ? `All Teams (${allTeamsCount})` : label;

          return (
            <button
              key={isFirst ? "all-teams" : (teams[index - 1]?.id ?? index)}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => setSelectedIndex(index)}
              className={`
                shrink-0 rounded-[5px] px-[10px] py-[6px] text-[14px] whitespace-nowrap
                transition-colors cursor-pointer
                ${isSelected ? "bg-[#0097b2] text-white font-medium" : "bg-[rgba(226,226,226,0.5)] text-black font-normal"}
              `}
            >
              {displayLabel}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-[10px] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-[10px] sm:flex-row sm:items-center">
          <ContractorSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={tCalendar("filters.searchPlaceholder")}
            className="sm:max-w-[311px]"
          />
          <WeekRangePicker value={weekRange} onChange={setWeekRange} />
        </div>
        {selectedTeamId ? (
          <ClientCalendarFilters
            jobPositionOptions={jobPositionOptions}
            selectedJobPosition={jobPositionFilter}
            onJobPositionChange={setJobPositionFilter}
            selectedAbsenceType={absenceTypeFilter}
            onAbsenceTypeChange={setAbsenceTypeFilter}
          />
        ) : (
          <div className="mt-2 flex flex-col items-end text-right text-[#4B4B4B] sm:mt-0">
            <span className="mb-1 text-[13px] font-medium">Activity Type</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="flex h-[20px] w-[20px] items-center justify-center rounded-full bg-[#E5F6FF]">
                  <Users className="h-4 w-4 text-[#0097B2]" />
                </div>
                <span className="text-[15px] font-medium text-[#0097B2]">Active Contractors</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex h-[20px] w-[20px] items-center justify-center rounded-full bg-[#FFE4E6]">
                  <Users className="h-4 w-4 text-[#FE6A35]" />
                </div>
                <span className="text-[15px] font-medium text-[#FE6A35]">Absent Contractors</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <ClientCalendarWeekGrid
        weekRange={weekRange}
        teams={teams}
        isAllTeams={!selectedTeamId}
        contractors={selectedTeamContractors}
        teamDayStats={teamDayStats}
        onTeamClick={handleTeamClickFromGrid}
        onContractorHistoryClick={onContractorHistoryClick}
        jobPositionFilter={jobPositionFilter}
        absenceTypeFilter={absenceTypeFilter}
        getContractorDayOffType={
          selectedTeamId
            ? (contractor, dayDate) => {
                const iso = dayDate.toISOString().slice(0, 10);
                return dayOffByContractorAndDate[contractor.id]?.[iso] ?? null;
              }
            : undefined
        }
      />
    </section>
  );
}
