"use client";

import { useState, useMemo } from "react";

import { ClientCalendarCardData, ClientCalendarCardDataProps } from "./ClientCalendarCardData";
import { ClientCalendarWeekGrid } from "./ClientCalendarWeekGrid";
import { ContractorSearch } from "./ContractorSearch";
import { WeekRangePicker } from "./WeekRangePicker";

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
  clientId: _clientId,
  clientName,
  cards,
  teams = [],
  teamCount,
}: ClientCalendarProps) {
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

  const allTeamsCount = teamCount ?? (teams.length || 10);
  const tabLabels: string[] = ["All Teams", ...teams.map((t) => t.name)];

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold text-gray-900">{`Calendar ${clientName}`}</h2>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => (
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
          placeholder="Search here..."
          className="sm:max-w-[311px]"
        />
        <WeekRangePicker value={weekRange} onChange={setWeekRange} />
      </div>

      <ClientCalendarWeekGrid weekRange={weekRange} teams={teams} />
    </section>
  );
}
