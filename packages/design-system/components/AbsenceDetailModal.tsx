"use client";

import { Modal } from "./Modal";
import type { AbsenceEvent } from "./ClientCalendarGrid";
import { FileUser, TreePalm, Cross } from "lucide-react";

export interface AbsenceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  absences: AbsenceEvent[];
  locale?: string;
}

const absenceColors = {
  license: { bg: "#dbeafe", text: "#1e40af", icon: FileUser },
  vacation: { bg: "#dcfce7", text: "#166534", icon: TreePalm },
  health: { bg: "#fee2e2", text: "#991b1b", icon: Cross },
};

export const AbsenceDetailModal = ({
  isOpen,
  onClose,
  date,
  absences,
  locale = "en-US",
}: AbsenceDetailModalProps) => {
  if (!date) return null;

  const dateString = date.toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={dateString} size="md">
      <div className="flex flex-col gap-2.5 p-6">
        {absences.map((absence) => {
          const config = absenceColors[absence.type];
          const Icon = config.icon;

          return (
            <div
              key={absence.id}
              className="flex items-center gap-2 px-5 py-3 rounded-[5px] h-[45px]"
              style={{ backgroundColor: config.bg, color: config.text }}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <div className="flex flex-col leading-tight min-w-0 flex-1">
                <span className="font-semibold text-xs truncate">{absence.contractorName}</span>
                <span className="font-light text-[10px] truncate">{absence.contractorRole}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
};
