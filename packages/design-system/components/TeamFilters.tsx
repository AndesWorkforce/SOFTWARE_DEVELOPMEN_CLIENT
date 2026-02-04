"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect } from "react";

export interface TeamFilterOption {
  id: string;
  label: string;
}

export interface TeamFiltersProps {
  teams: TeamFilterOption[];
  selectedTeamId: string | null;
  onTeamChange: (teamId: string | null) => void;
  allTeamsLabel?: string;
  className?: string;
}

export const TeamFilters = ({
  teams,
  selectedTeamId,
  onTeamChange,
  allTeamsLabel = "All Teams",
  className = "",
}: TeamFiltersProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setShowLeftArrow(container.scrollLeft > 0);
    setShowRightArrow(container.scrollLeft < container.scrollWidth - container.clientWidth - 1);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [teams]);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = direction === "left" ? -200 : 200;
    container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    setTimeout(checkScroll, 300);
  };

  return (
    <div className={`flex items-center ${className}`} role="group" aria-label="Team filters">
      {showLeftArrow && (
        <button
          onClick={() => scroll("left")}
          className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-md transition-colors"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-gray-600" />
        </button>
      )}

      <div
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="flex gap-[5px] items-center overflow-x-auto no-scrollbar flex-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <button
          onClick={() => onTeamChange(null)}
          className={`
            flex-shrink-0 h-[30px] md:h-[35px] px-[10px] md:px-[20px] py-[6px] rounded-[5px] text-sm md:text-base font-semibold transition-colors
            ${
              selectedTeamId === null
                ? "bg-[#0097b2] text-white"
                : "bg-gray-200/50 text-black hover:bg-gray-200"
            }
          `}
          aria-pressed={selectedTeamId === null}
        >
          {allTeamsLabel}
        </button>

        {teams.map((team) => (
          <button
            key={team.id}
            onClick={() => onTeamChange(team.id)}
            className={`
              flex-shrink-0 h-[30px] md:h-[35px] px-[10px] md:px-[20px] py-[6px] rounded-[5px] text-sm md:text-base font-normal transition-colors whitespace-nowrap
              ${
                selectedTeamId === team.id
                  ? "bg-[#0097b2] text-white"
                  : "bg-gray-200/50 text-black hover:bg-gray-200"
              }
            `}
            aria-pressed={selectedTeamId === team.id}
          >
            {team.label}
          </button>
        ))}
      </div>

      {showRightArrow && (
        <button
          onClick={() => scroll("right")}
          className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-md transition-colors"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
        </button>
      )}
    </div>
  );
};
