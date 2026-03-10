"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";

import { ClientCalendarCardData, ClientCalendarCardDataProps } from "./ClientCalendarCardData";
import { ClientCalendarWeekGrid } from "./ClientCalendarWeekGrid";
import { ContractorSearch } from "./ContractorSearch";
import { WeekRangePicker } from "./WeekRangePicker";
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
}

export function ClientCalendar({
  clientId,
  clientName,
  cards,
  teams = [],
  teamCount,
}: ClientCalendarProps) {
  const tCalendar = useTranslations("calendar");

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
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

  useEffect(() => {
    const loadTeamStats = async () => {
      if (!selectedTeamId) {
        setTeamStats(null);
        setSelectedTeamContractors([]);
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
      } catch (error) {
        console.error("❌ Error cargando stats de equipo en ClientCalendar:", error);
        setTeamStats(null);
        setSelectedTeamContractors([]);
      }
    };

    loadTeamStats();
  }, [selectedTeamId]);

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

      <div className="flex flex-col gap-[10px] sm:flex-row sm:items-center">
        <ContractorSearch
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={tCalendar("filters.searchPlaceholder")}
          className="sm:max-w-[311px]"
        />
        <WeekRangePicker value={weekRange} onChange={setWeekRange} />
      </div>

      <ClientCalendarWeekGrid
        weekRange={weekRange}
        teams={teams}
        isAllTeams={!selectedTeamId}
        contractors={selectedTeamContractors}
        teamDayStats={teamDayStats}
      />
    </section>
  );
}
