"use client";

import type React from "react";

export interface ClientCalendarCardDataProps {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  accentColorClass?: string;
}

export function ClientCalendarCardData({
  icon,
  title,
  value,
  accentColorClass,
}: ClientCalendarCardDataProps) {
  const accent = accentColorClass || "text-sky-500";

  return (
    <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm border border-gray-100">
      <div className={`flex items-center justify-center ${accent}`}>{icon}</div>
      <div className="flex flex-col">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-500">{title}</span>
        <span className={`text-xl font-semibold ${accent}`}>{value}</span>
      </div>
    </div>
  );
}
