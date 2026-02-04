"use client";

import { FileUser, TreePalm, Cross } from "lucide-react";

export type AbsenceType = "license" | "vacation" | "health";

export interface AbsenceLegendItem {
  type: AbsenceType;
  label: string;
  color: string;
}

export interface AbsenceLegendProps {
  items?: AbsenceLegendItem[];
  className?: string;
}

const defaultItems: AbsenceLegendItem[] = [
  { type: "license", label: "License", color: "#1e40af" },
  { type: "vacation", label: "Vacation", color: "#166534" },
  { type: "health", label: "Health", color: "#991b1b" },
];

const iconMap = {
  license: FileUser,
  vacation: TreePalm,
  health: Cross,
};

export const AbsenceLegend = ({ items = defaultItems, className = "" }: AbsenceLegendProps) => {
  return (
    <div
      className={`flex items-center gap-4 md:gap-6 ${className}`}
      role="group"
      aria-label="Absence types legend"
    >
      {items.map((item) => {
        const Icon = iconMap[item.type];
        return (
          <div key={item.type} className="flex items-center gap-2 md:gap-[10px]">
            <Icon
              className="w-4 h-4 md:w-5 md:h-5"
              style={{ color: item.color }}
              aria-hidden="true"
            />
            <span className="text-sm md:text-base font-normal" style={{ color: item.color }}>
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
