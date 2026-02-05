"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Plus, Pencil, Trash2, Calendar } from "lucide-react";
import { Button, DataTable, FilterPanel } from "@/packages/design-system";
import type { Contractor } from "@/packages/types/contractors.types";
import type { DataTableConfig } from "@/packages/types/DataTable.types";
import { useContractorsPage } from "./useContractorsPage";
import { ActivationKeyCell } from "./ActivationKeyCell";
import type { Role } from "@/packages/role-utils";

interface ContractorsPageProps {
  role: Role;
}

export function ContractorsPage({ role }: ContractorsPageProps) {
  const {
    t,
    contractors,
    loading,
    filters,
    setFilters,
    handleEdit,
    handleDelete,
    handleViewCalendar,
    filtersConfig,
    handleClearFilters,
    routes,
    permissions,
  } = useContractorsPage(role);

  const tableConfig = useMemo(() => {
    const columns: DataTableConfig<Contractor>["columns"] = [
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
      {
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
      },
    ];

    // Actions column (only if user can edit or delete)
    if (permissions.canEdit || permissions.canDelete) {
      columns.push({
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
              {permissions.canEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(row);
                  }}
                  className="inline-flex items-center gap-1 text-[#0097B2] hover:underline cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span className="text-sm">{t("contractors.table.edit")}</span>
                </button>
              )}
              {permissions.canDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(row);
                  }}
                  className="inline-flex items-center gap-1 text-[#FF0004] hover:underline cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="text-sm">{t("contractors.table.delete")}</span>
                </button>
              )}
            </div>
          </div>
        ),
      });
    }

    const baseTableConfig: DataTableConfig<Contractor> = {
      columns,
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
        primaryFields: [
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
        ],
        expandedFields: [
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
          {
            key: "activationKey",
            label: t("contractors.table.activationKey"),
            dataPath: "activation_key",
            render: (value: unknown, row: Contractor) => (
              <ActivationKeyCell value={value as string} contractorId={row.id} />
            ),
          },
          ...(permissions.canEdit || permissions.canDelete
            ? [
                {
                  key: "actions",
                  label: t("contractors.table.action"),
                  dataPath: "id",
                  render: (_value: unknown, row: Contractor) => (
                    <span className="inline-flex flex-row items-center gap-4 flex-wrap">
                      {permissions.canEdit && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(row);
                          }}
                          className="inline-flex items-center gap-1 text-[#0097B2] hover:underline text-sm cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>{t("contractors.table.edit")}</span>
                        </button>
                      )}
                      {permissions.canDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(row);
                          }}
                          className="inline-flex items-center gap-1 text-[#FF0004] hover:underline text-sm cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{t("contractors.table.delete")}</span>
                        </button>
                      )}
                    </span>
                  ),
                },
              ]
            : []),
        ],
        expandable: true,
      },
    };
    return baseTableConfig;
  }, [t, handleEdit, handleDelete, handleViewCalendar, permissions]);

  return (
    <div className="p-4 md:p-8 min-h-screen" style={{ background: "#FFFFFF" }}>
      <div className="max-w-full">
        <div className="mb-6 md:mb-8 flex items-center justify-between">
          <h1 className="text-xl md:text-3xl font-bold" style={{ color: "#000000" }}>
            {t("contractors.title")}
          </h1>
          {permissions.canAdd && (
            <Link href={routes.contractors.add}>
              <Button
                variant="primary"
                style={{
                  background: "#0097B2",
                  color: "#FFFFFF",
                  fontSize: "15px",
                  fontWeight: 600,
                  padding: "7px 21px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  borderRadius: "8px",
                  boxShadow: "0px 4px 4px rgba(166,166,166,0.25)",
                  cursor: "pointer",
                }}
                className="md:text-[15px] h-[35px] md:h-[40px]"
              >
                <Plus className="w-[14px] h-[14px] md:w-5 md:h-5" />
                <span className="font-semibold">{t("contractors.addContractor")}</span>
              </Button>
            </Link>
          )}
        </div>

        <FilterPanel
          config={filtersConfig}
          initialValues={filters}
          onChange={setFilters}
          onClear={handleClearFilters}
          loading={loading}
        />

        <DataTable config={tableConfig} data={contractors} loading={loading} />
      </div>
    </div>
  );
}
