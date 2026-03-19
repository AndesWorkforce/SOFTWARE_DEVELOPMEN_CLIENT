"use client";

import { FileUser, TreePalm, Cross, Pencil, Trash2 } from "lucide-react";

type DayOffType = "License" | "Vacation" | "Health";

export interface DayOffBadgeProps {
  type: DayOffType;
  label: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  onEdit?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
}

const typeConfig: Record<DayOffType, { icon: typeof FileUser; bg: string; text: string }> = {
  License: {
    icon: FileUser,
    bg: "#DBEAFE", // azul claro
    text: "#1E40AF",
  },
  Vacation: {
    icon: TreePalm,
    bg: "#DCFCE7", // verde claro
    text: "#166534",
  },
  Health: {
    icon: Cross,
    bg: "#FEE2E2", // rojo claro
    text: "#B91C1C",
  },
};

export const DayOffBadge: React.FC<DayOffBadgeProps> = ({
  type,
  label,
  onClick,
  onEdit,
  onDelete,
}) => {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div
      className="group flex items-center gap-2 rounded-[999px] px-2 py-1 text-xs font-medium cursor-pointer truncate min-h-[24px]"
      style={{
        backgroundColor: config.bg,
        color: config.text,
      }}
      onClick={onClick}
    >
      {/* Contenido por defecto: ícono + label */}
      <span className="flex items-center gap-2 truncate group-hover:hidden">
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{label}</span>
      </span>
      {/* Contenido en hover: lápiz y papelera, cada uno centrado en su mitad */}
      <span className="hidden w-full group-hover:flex flex-1 min-w-0">
        <span className="flex flex-1 items-center justify-center">
          <span
            role="button"
            tabIndex={0}
            className="cursor-pointer p-0.5 rounded hover:opacity-80 transition-opacity"
            style={{ color: "#0097B2" }}
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(e);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onEdit?.(e as unknown as React.MouseEvent);
              }
            }}
            aria-label="Editar"
          >
            <Pencil className="h-3.5 w-3.5" />
          </span>
        </span>
        <span className="flex flex-1 items-center justify-center">
          <span
            role="button"
            tabIndex={0}
            className="cursor-pointer p-0.5 rounded hover:opacity-80 transition-opacity"
            style={{ color: "#FF0004" }}
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(e);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onDelete?.(e as unknown as React.MouseEvent);
              }
            }}
            aria-label="Eliminar"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </span>
        </span>
      </span>
    </div>
  );
};
