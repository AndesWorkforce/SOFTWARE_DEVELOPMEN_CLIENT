"use client";

import { Calendar, Pencil, Trash2 } from "lucide-react";

import type { Contractor } from "@/packages/types/contractors.types";
import type { DataTableConfig } from "@/packages/types/DataTable.types";
import { ActivationKeyCell } from "../contractors/ActivationKeyCell";

interface Handlers {
  handleViewCalendar: (contractor: Contractor) => void;
  handleEdit?: (contractor: Contractor) => void;
  handleDelete?: (contractor: Contractor) => void;
}

export function buildClientContractorsTableConfig(
  t: (key: string) => string,
  handlers: Handlers,
  options: { showActivationKey: boolean; showActions: boolean },
): DataTableConfig<Contractor> {
  const { handleViewCalendar, handleEdit, handleDelete } = handlers;
  const { showActivationKey, showActions } = options;

  const baseColumns: DataTableConfig<Contractor>["columns"] = [
    {
      key: "calendar",
      title: "Calendar",
      translationKey: "contractors.table.calendar",
      dataPath: "id",
      type: "custom",
      minWidth: "120px",
      align: "center",
      render: (_value: unknown, row: Contractor) => (
        <button
          type="button"
          onClick={() => handleViewCalendar(row)}
          className="inline-flex items-center gap-1.5 text-[#0097B2] hover:opacity-80 transition-opacity cursor-pointer"
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[16px] underline">{t("contractors.table.view")}</span>
        </button>
      ),
    },
    {
      key: "user",
      title: "User",
      translationKey: "contractors.table.user",
      dataPath: "name",
      type: "text",
      minWidth: "160px",
      align: "center",
    },
    {
      key: "email",
      title: "Email",
      translationKey: "contractors.table.email",
      dataPath: "email",
      type: "text",
      minWidth: "180px",
      align: "center",
    },
    {
      key: "jobPosition",
      title: "Job Position",
      translationKey: "contractors.table.jobPosition",
      dataPath: "job_position",
      type: "text",
      minWidth: "180px",
      align: "center",
    },
    {
      key: "client",
      title: "Client",
      translationKey: "contractors.table.client",
      dataPath: (row) => row.client_name || "N/A",
      type: "text",
      minWidth: "160px",
      align: "center",
    },
    {
      key: "team",
      title: "Team",
      translationKey: "contractors.table.team",
      dataPath: (row) => row.team_name || "N/A",
      type: "text",
      minWidth: "160px",
      align: "center",
    },
    {
      key: "country",
      title: "Country",
      translationKey: "contractors.table.country",
      dataPath: "country",
      type: "text",
      minWidth: "120px",
      align: "center",
    },
  ];

  if (showActivationKey) {
    baseColumns.push({
      key: "activationKey",
      title: "Activation Key",
      translationKey: "contractors.table.activationKey",
      dataPath: "activation_key",
      type: "custom",
      minWidth: "220px",
      align: "center",
      render: (value: unknown, row: Contractor) => (
        <ActivationKeyCell value={value as string} contractorId={row.id} />
      ),
    });
  }

  if (showActions && handleEdit && handleDelete) {
    baseColumns.push({
      key: "actions",
      title: "Action",
      translationKey: "contractors.table.action",
      dataPath: "id",
      type: "custom",
      minWidth: "120px",
      align: "left",
      render: (_value: unknown, row: Contractor) => (
        <div className="w-full flex justify-center">
          <div className="flex flex-col gap-1 items-start">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(row);
              }}
              className="inline-flex items-center gap-1 text-[#0097B2] hover:underline cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span className="text-sm">{t("contractors.table.edit")}</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(row);
              }}
              className="inline-flex items-center gap-1 text-[#FF0004] hover:underline cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="text-sm">{t("contractors.table.delete")}</span>
            </button>
          </div>
        </div>
      ),
    });
  }

  const primaryFields: NonNullable<DataTableConfig<Contractor>["mobileConfig"]>["primaryFields"] = [
    {
      key: "calendar",
      label: t("contractors.table.calendar"),
      dataPath: "id",
      render: (_value: unknown, row: Contractor) => (
        <button
          type="button"
          className="inline-flex items-center gap-1 text-[#0097B2] cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            handleViewCalendar(row);
          }}
        >
          <Calendar className="w-4.5 h-4.5" />
          <span className="underline text-[16px]">{t("contractors.table.view")}</span>
        </button>
      ),
    },
    {
      key: "user",
      label: t("contractors.table.user"),
      dataPath: (row) => row.name,
    },
  ];

  const expandedFields: NonNullable<DataTableConfig<Contractor>["mobileConfig"]>["expandedFields"] =
    [
      {
        key: "jobPosition",
        label: t("contractors.table.jobPosition"),
        dataPath: (row) => row.job_position,
      },
      {
        key: "email",
        label: t("contractors.table.email"),
        dataPath: (row) => row.email || "",
      },
      {
        key: "client",
        label: t("contractors.table.client"),
        dataPath: (row) => row.client_name || "N/A",
      },
      {
        key: "team",
        label: t("contractors.table.team"),
        dataPath: (row) => row.team_name || "N/A",
      },
      {
        key: "country",
        label: t("contractors.table.country"),
        dataPath: (row) => row.country || "",
      },
    ];

  if (showActivationKey) {
    expandedFields.push({
      key: "activationKey",
      label: t("contractors.table.activationKey"),
      dataPath: "activation_key",
      render: (value: unknown, row: Contractor) => (
        <ActivationKeyCell value={value as string} contractorId={row.id} />
      ),
    });
  }

  if (showActions && handleEdit && handleDelete) {
    expandedFields.push({
      key: "actions",
      label: t("contractors.table.action"),
      dataPath: "id",
      render: (_value: unknown, row: Contractor) => (
        <span className="inline-flex flex-row items-center gap-4 flex-wrap">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row);
            }}
            className="inline-flex items-center gap-1 text-[#0097B2] hover:underline text-sm cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>{t("contractors.table.edit")}</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row);
            }}
            className="inline-flex items-center gap-1 text-[#FF0004] hover:underline text-sm cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t("contractors.table.delete")}</span>
          </button>
        </span>
      ),
    });
  }

  return {
    columns: baseColumns,
    rowKey: "id",
    striped: true,
    evenRowColor: "#E2E2E2",
    oddRowColor: "#FFFFFF",
    emptyState: {
      message: t("contractors.noContractors"),
    },
    styles: {
      table: {
        border: "1px solid rgba(166,166,166,0.5)",
        boxShadow: "0px 4px 4px rgba(166,166,166,0.25)",
        borderRadius: "10px",
      },
      cell: {
        paddingTop: "4px",
        paddingBottom: "4px",
      },
      mobileCard: {
        border: "1px solid rgba(166,166,166,0.5)",
        boxShadow: "0px 4px 4px rgba(166,166,166,0.25)",
        borderRadius: "10px",
      },
    },
    mobileConfig: {
      primaryFields,
      expandedFields,
      expandable: true,
    },
  };
}
