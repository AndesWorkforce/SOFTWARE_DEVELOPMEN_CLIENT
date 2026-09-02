"use client";
import { useMemo } from "react";
import { NotebookTabs, Hourglass, Target, Clock } from "lucide-react";
import type { ContractorSession } from "@/packages/types/adt.types";

export interface SessionSummaryTableProps {
  sessions: ContractorSession[];
  date: string;
}

export const SessionSummaryTable = ({ sessions }: SessionSummaryTableProps) => {
  const formatSecondsToTime = (seconds: number): string => {
    const safe = Number(seconds) || 0;
    const hours = Math.floor(safe / 3600);
    const minutes = Math.floor((safe % 3600) / 60);
    return `${hours.toString().padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m`;
  };

  const uniqueSessions = useMemo(() => {
    const seen = new Set<string>();
    const deduped = sessions.filter((session) => {
      const key = `${session.session_id}-${session.agent_id ?? ""}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Orden cronologico ASCENDENTE: la fila #1 es la PRIMERA sesion del dia.
    // El backend las devuelve DESC (mas reciente primero), que sirve para un
    // listado de "ultimas sesiones" pero no para una tabla numerada donde el
    // indice se lee como el orden en que ocurrieron. Se ordena aca, en la capa
    // de presentacion, para no cambiarle el contrato a otros consumidores del
    // endpoint.
    return deduped.sort(
      (a, b) => new Date(a.session_start).getTime() - new Date(b.session_start).getTime(),
    );
  }, [sessions]);

  const totals = useMemo(() => {
    const count = uniqueSessions.length;
    // ClickHouse Int64 llega como string en JSON; sin Number() el `+` concatena.
    const totalSeconds = uniqueSessions.reduce((sum, s) => sum + (Number(s.total_seconds) || 0), 0);
    const avgSeconds = count > 0 ? totalSeconds / count : 0;
    const avgProductivity =
      count > 0
        ? uniqueSessions.reduce((sum, s) => sum + (Number(s.productivity_score) || 0), 0) / count
        : 0;

    return {
      count,
      // Suma de la duracion de todas las sesiones del dia.
      totalDuration: formatSecondsToTime(totalSeconds),
      avgDuration: formatSecondsToTime(avgSeconds),
      avgProductivity: `${Math.round(avgProductivity)}%`,
    };
  }, [uniqueSessions]);

  return (
    <div className="flex flex-col w-full gap-4">
      <div className="overflow-x-auto border border-[rgba(166,166,166,0.5)] rounded-[10px]">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-[rgba(166,166,166,0.5)]">
            <tr>
              <th className="px-4 py-3 font-semibold text-black">#</th>
              <th className="px-4 py-3 font-semibold text-black">Start Time</th>
              <th className="px-4 py-3 font-semibold text-black">End Time</th>
              <th className="px-4 py-3 font-semibold text-black">Duration</th>
              <th className="px-4 py-3 font-semibold text-black">Active Time</th>
              <th className="px-4 py-3 font-semibold text-black">Idle Time</th>
              <th className="px-4 py-3 font-semibold text-black">Productivity</th>
            </tr>
          </thead>
          <tbody>
            {uniqueSessions.map((session, index) => {
              const rowKey = `${session.session_id}-${session.agent_id ?? ""}`;
              const startTime = session.session_start.split(" ")[1]?.substring(0, 5) || "00:00";
              const endTime = session.session_end.split(" ")[1]?.substring(0, 5) || "00:00";
              const duration = formatSecondsToTime(Number(session.total_seconds) || 0);
              const activeTime = formatSecondsToTime(Number(session.active_seconds) || 0);
              const idleTime = formatSecondsToTime(Number(session.idle_seconds) || 0);
              const productivity = `${Math.round(Number(session.productivity_score) || 0)}%`;

              return (
                <tr key={rowKey} className={index % 2 === 1 ? "bg-[#E2E2E2]" : "bg-white"}>
                  <td className="px-4 py-3 text-black font-semibold">{index + 1}</td>
                  <td className="px-4 py-3 text-black">{startTime}</td>
                  <td className="px-4 py-3 text-black">{endTime}</td>
                  <td className="px-4 py-3 text-black">{duration}</td>
                  <td className="px-4 py-3 text-black">{activeTime}</td>
                  <td className="px-4 py-3 text-black">{idleTime}</td>
                  <td className="px-4 py-3 text-[#0097B2] font-medium">{productivity}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-white border border-[rgba(166,166,166,0.5)] rounded-[5px] p-4 flex flex-wrap gap-x-10 gap-y-4 items-center">
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 p-2 rounded-lg">
            <NotebookTabs className="w-6 h-6 text-[#0097B2]" />
          </div>
          <div>
            <p className="text-[12px] text-[#6D6D6D]">Total Session</p>
            <p className="text-base font-semibold text-[#0097B2]">{totals.count}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 p-2 rounded-lg">
            <Clock className="w-6 h-6 text-[#0097B2]" />
          </div>
          <div>
            <p className="text-[12px] text-[#6D6D6D]">Total Duration</p>
            <p className="text-base font-semibold text-[#0097B2]">{totals.totalDuration}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 p-2 rounded-lg">
            <Hourglass className="w-6 h-6 text-[#0097B2]" />
          </div>
          <div>
            <p className="text-[12px] text-[#6D6D6D]">Total Avg. Duration</p>
            <p className="text-base font-semibold text-[#0097B2]">{totals.avgDuration}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 p-2 rounded-lg">
            <Target className="w-6 h-6 text-[#0097B2]" />
          </div>
          <div>
            <p className="text-[12px] text-[#6D6D6D]">Total Avg. Productivity</p>
            <p className="text-base font-semibold text-[#0097B2]">{totals.avgProductivity}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
