"use client";
import { useState, useMemo } from "react";
import { ChevronDown, NotebookTabs, Hourglass, Target } from "lucide-react";
import type { ContractorSession } from "@/packages/types/adt.types";

export interface SessionSummaryMobileProps {
  sessions: ContractorSession[];
  date: string;
}

export const SessionSummaryMobile = ({ sessions, date }: SessionSummaryMobileProps) => {
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());

  const formatSecondsToTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m`;
  };

  const toggleSession = (sessionId: string) => {
    const newExpanded = new Set(expandedSessions);
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId);
    } else {
      newExpanded.add(sessionId);
    }
    setExpandedSessions(newExpanded);
  };

  const totals = useMemo(() => {
    const count = sessions.length;
    const totalSeconds = sessions.reduce((sum, s) => sum + s.total_seconds, 0);
    const avgSeconds = count > 0 ? totalSeconds / count : 0;
    const avgProductivity =
      count > 0 ? sessions.reduce((sum, s) => sum + (s.productivity_score || 0), 0) / count : 0;

    return {
      count,
      avgDuration: formatSecondsToTime(avgSeconds),
      avgProductivity: `${Math.round(avgProductivity)}%`,
    };
  }, [sessions]);

  const formatDateForDisplay = (dateStr: string) => {
    try {
      const date = new Date(dateStr + "T12:00:00");
      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col gap-[15px] w-full">
      {/* Header */}
      <div className="flex flex-col gap-[10px] items-center w-full">
        <h3 className="text-[20px] font-semibold text-black w-full">Session Summary</h3>
        <p className="text-[16px] font-normal text-black w-full">{formatDateForDisplay(date)}</p>
      </div>

      {/* Sessions List */}
      <div className="bg-white border border-[rgba(166,166,166,0.5)] rounded-[10px] shadow-[0px_4px_4px_rgba(166,166,166,0.25)] px-[11px] py-[6px] w-full overflow-hidden">
        <div className="flex flex-col gap-0 w-full">
          {sessions.map((session, index) => {
            const isExpanded = expandedSessions.has(session.session_id);
            const isEven = index % 2 === 1;
            const startTime = session.session_start.split(" ")[1]?.substring(0, 5) || "00:00";
            const endTime = session.session_end.split(" ")[1]?.substring(0, 5) || "00:00";
            const duration = formatSecondsToTime(session.total_seconds);
            const activeTime = formatSecondsToTime(session.active_seconds);
            const idleTime = formatSecondsToTime(session.idle_seconds);
            const productivity = `${Math.round(session.productivity_score || 0)}%`;
            const productivityColor = session.productivity_score >= 70 ? "#0097B2" : "#FF0004";

            return (
              <div
                key={session.session_id}
                className={`${isEven ? "bg-[#E2E2E2]" : "bg-white"} transition-colors relative`}
                style={{ minHeight: isExpanded ? "195px" : "69px" }}
              >
                <button
                  onClick={() => toggleSession(session.session_id)}
                  className="w-full flex items-center justify-between relative"
                  style={{ minHeight: isExpanded ? "195px" : "69px" }}
                >
                  <div
                    className="flex flex-col text-left min-w-0 flex-1"
                    style={{
                      maxWidth: "335px",
                      paddingLeft: "12px",
                      paddingRight: "40px",
                      minHeight: isExpanded ? "195px" : "69px",
                      position: isExpanded ? "relative" : "absolute",
                      top: isExpanded ? "0" : "50%",
                      transform: isExpanded ? "none" : "translateY(-50%)",
                      justifyContent: isExpanded ? "center" : "center",
                    }}
                  >
                    {!isExpanded ? (
                      <>
                        <p className="text-[16px] font-semibold text-black mb-0 leading-[25px]">
                          <span style={{ marginRight: "12px" }}>{index + 1}</span>
                        </p>
                        <p className="text-[16px] font-semibold text-black leading-[25px]">
                          <span style={{ marginRight: "12px" }}>Start Time: </span>
                          <span className="font-normal">{startTime}</span>
                        </p>
                      </>
                    ) : (
                      <div
                        className="flex flex-col gap-0 text-[16px] font-semibold text-black"
                        style={{ justifyContent: "center", minHeight: "195px" }}
                      >
                        <p className="mb-0 leading-[25px]">
                          <span style={{ marginRight: "12px" }}>{index + 1}</span>
                        </p>
                        <p className="mb-0 leading-[25px]">
                          <span style={{ marginRight: "12px" }}>Start Time: </span>
                          <span className="font-normal">{startTime}</span>
                        </p>
                        <p className="mb-0 leading-[25px]">
                          <span style={{ marginRight: "12px" }}>End Time: </span>
                          <span className="font-normal">{endTime}</span>
                        </p>
                        <p className="mb-0 leading-[25px]">
                          <span style={{ marginRight: "12px" }}>Duration: </span>
                          <span className="font-normal">{duration}</span>
                        </p>
                        <p className="mb-0 leading-[25px]">
                          <span style={{ marginRight: "12px" }}>Active Time: </span>
                          <span className="font-normal">{activeTime}</span>
                        </p>
                        <p className="mb-0 leading-[25px]">
                          <span style={{ marginRight: "12px" }}>Idle Time: </span>
                          <span className="font-normal">{idleTime}</span>
                        </p>
                        <p className="leading-[25px]">
                          <span style={{ marginRight: "12px" }}>Productivity: </span>
                          <span className="font-normal" style={{ color: productivityColor }}>
                            {productivity}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                  <div
                    className="absolute right-[11px] flex items-center justify-center"
                    style={{
                      width: "20px",
                      height: "20px",
                      top: isExpanded ? "8.5px" : "50%",
                      transform: isExpanded ? "none" : "translateY(-50%)",
                    }}
                  >
                    <ChevronDown
                      className="w-5 h-5 text-black transition-transform"
                      style={{
                        transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
                      }}
                    />
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Totals */}
      <div className="bg-white border border-[rgba(166,166,166,0.5)] rounded-[5px] px-[15px] py-[10px] w-full overflow-hidden">
        <div className="flex flex-col gap-[10px] w-full">
          <div className="flex gap-4 md:gap-[50px] flex-wrap">
            <div className="flex items-center gap-[10px] min-w-0">
              <NotebookTabs className="w-[30px] h-[30px] text-[#0097B2] shrink-0" />
              <div className="min-w-0">
                <p className="text-[12px] text-[#6D6D6D] mb-0">Total Session</p>
                <p className="text-[16px] font-semibold text-[#0097B2]">{totals.count}</p>
              </div>
            </div>
            <div className="flex items-center gap-[10px] min-w-0">
              <Hourglass className="w-[30px] h-[30px] text-[#0097B2] shrink-0" />
              <div className="min-w-0">
                <p className="text-[12px] text-[#6D6D6D] mb-0">Total Avg. Duration</p>
                <p className="text-[16px] font-semibold text-[#0097B2]">{totals.avgDuration}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-[10px] min-w-0">
            <Target className="w-[30px] h-[30px] text-[#0097B2] shrink-0" />
            <div className="min-w-0">
              <p className="text-[12px] text-[#6D6D6D] mb-0">Total Avg. Productivity</p>
              <p className="text-[16px] font-semibold text-[#0097B2]">{totals.avgProductivity}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
