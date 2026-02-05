"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  UsersRound,
  ChevronDown,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { Button, DataTable, FilterPanel } from "@/packages/design-system";
import type { Client } from "@/packages/api/clients/clients.service";
import type { DataTableConfig } from "@/packages/types/DataTable.types";
import { useClientsPage } from "./useClientsPage";
import type { Role } from "@/packages/role-utils";

interface ClientsPageProps {
  role: Role;
}

export function ClientsPage({ role }: ClientsPageProps) {
  const {
    t,
    clients,
    loading,
    filters,
    setFilters,
    handleEdit,
    handleDelete,
    handleViewTeams,
    handleViewCalendar,
    filtersConfig,
    handleClearFilters,
    routes,
    permissions,
  } = useClientsPage(role);

  const tableConfig = useMemo(() => {
    const columns: DataTableConfig<Client>["columns"] = [];

    // Calendar column for visualizer
    if (permissions.showCalendar && routes.clients.calendar) {
      columns.push({
        key: "calendar",
        title: "Calendar",
        translationKey: "clients.table.calendar",
        dataPath: "id",
        type: "custom",
        width: "85px",
        align: "center",
        render: (_value: unknown, row: Client) => (
          <button
            type="button"
            className="inline-flex items-center gap-1 text-[#0097B2] cursor-pointer hover:opacity-80 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              handleViewCalendar(row);
            }}
          >
            <Calendar className="w-4.5 h-4.5" />
            <span className="underline text-[16px]">{t("clients.table.view")}</span>
          </button>
        ),
      });
    }

    // Standard columns
    columns.push(
      {
        key: "name",
        title: "Name Client",
        translationKey: "clients.table.name",
        dataPath: "name",
        type: "text",
        width: "160px",
        align: "center",
      },
      {
        key: "description",
        title: "Description",
        translationKey: "clients.table.description",
        dataPath: (row) => row.description || "N/A",
        type: "custom",
        width: "557px",
        align: "left",
        render: (value: unknown) => (
          <span className="block w-full whitespace-normal break-words">{String(value ?? "")}</span>
        ),
      },
      {
        key: "email",
        title: "Email",
        translationKey: "clients.table.email",
        dataPath: (row) => row.email || "N/A",
        type: "text",
        width: "190px",
        align: "center",
      },
      {
        key: "teams",
        title: "Teams",
        translationKey: "clients.table.teams",
        dataPath: "id",
        type: "custom",
        width: "130px",
        align: "center",
        render: (_value: unknown, row: Client) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewTeams(row);
            }}
            className="inline-flex items-center gap-1 text-black hover:underline cursor-pointer"
          >
            <UsersRound className="w-3.5 h-3.5" />
            <span className="text-sm font-medium underline">{t("clients.table.view")}</span>
          </button>
        ),
      },
    );

    // Actions column (only if user can edit or delete)
    if (permissions.canEdit || permissions.canDelete) {
      columns.push({
        key: "actions",
        title: "Action",
        translationKey: "clients.table.action",
        dataPath: "id",
        type: "custom",
        width: "100px",
        align: "left",
        render: (_value: unknown, row: Client) => (
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
                  <span className="text-sm">{t("clients.table.edit")}</span>
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
                  <span className="text-sm">{t("clients.table.delete")}</span>
                </button>
              )}
            </div>
          </div>
        ),
      });
    }

    const baseTableConfig: DataTableConfig<Client> = {
      columns,
      rowKey: "id",
      striped: true,
      evenRowColor: "#E2E2E2",
      oddRowColor: "#FFFFFF",
      emptyState: {
        message: t("clients.noClients") || "No clients found",
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
          background: "#FFFFFF",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
        },
      },
      mobileConfig: {
        customCard: (row, isExpanded, onToggle) => {
          const clientName = row.name || "";
          const description = row.description || "";
          const mobileDescription =
            description.length > 30 ? `${description.slice(0, 30).trimEnd()}...` : description;

          const isEven =
            baseTableConfig.striped && clients.findIndex((c) => c.id === row.id) % 2 === 1;
          const bg = isEven
            ? baseTableConfig.evenRowColor || "#E2E2E2"
            : baseTableConfig.oddRowColor || "#FFFFFF";

          return (
            <div
              key={row.id}
              style={{ background: bg }}
              className={`relative w-full max-w-full overflow-hidden box-border px-[11px] ${
                isExpanded ? "py-[6px]" : "py-[9px]"
              }`}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle();
                }}
                className={`absolute right-[10px] ${
                  isExpanded ? "top-[8px]" : "top-[15px]"
                } flex items-center justify-center cursor-pointer`}
                aria-label={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-black" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-black" />
                )}
              </button>

              <div className={`w-full min-w-0 ${isExpanded ? "pt-[6px]" : ""} pr-[34px]`}>
                <div className="text-[16px] leading-[25px] text-black min-w-0">
                  {permissions.showCalendar && routes.clients.calendar && (
                    <div className="flex items-baseline gap-1">
                      <span className="font-semibold whitespace-nowrap">Calendar:</span>
                      <button
                        type="button"
                        className="inline-flex items-center gap-[5px] text-[#0097B2] underline font-medium text-[14px] cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewCalendar(row);
                        }}
                      >
                        <Calendar className="w-[14px] h-[14px]" />
                        <span>{t("clients.table.view")}</span>
                      </button>
                    </div>
                  )}

                  <div className="flex items-baseline gap-1">
                    <span className="font-semibold whitespace-nowrap">Client:</span>
                    <span className="font-normal flex-1 min-w-0 truncate">{clientName}</span>
                  </div>

                  {isExpanded ? (
                    <p className="m-0">
                      <span className="font-semibold">Description</span>
                      <span className="font-semibold">: </span>
                      <span className="font-normal whitespace-normal break-words">
                        {description}
                      </span>
                    </p>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="font-semibold whitespace-nowrap">Description:</span>
                      <span className="font-normal flex-1 min-w-0 truncate">
                        {mobileDescription}
                      </span>
                    </div>
                  )}

                  {isExpanded && (
                    <>
                      <p className="m-0">
                        <span className="font-semibold">Email</span>
                        <span className="font-semibold">: </span>
                        <span className="font-normal">{row.email || "N/A"}</span>
                      </p>

                      <p className="m-0">
                        <span className="font-semibold">Team</span>
                        <span className="font-semibold">: </span>
                        <button
                          type="button"
                          className="inline-flex items-center gap-[5px] underline font-medium text-[14px] max-w-full cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewTeams(row);
                          }}
                        >
                          <UsersRound className="w-[14px] h-[14px]" />
                          <span>{t("clients.table.view")}</span>
                        </button>
                      </p>

                      {(permissions.canEdit || permissions.canDelete) && (
                        <p className="m-0">
                          <span className="font-semibold">{t("clients.table.action")}</span>
                          <span className="font-semibold">: </span>
                          <span className="inline-flex flex-wrap items-center gap-[20px] max-w-full">
                            {permissions.canEdit && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(row);
                                }}
                                className="inline-flex items-center gap-1 text-[#0097B2] hover:underline text-sm cursor-pointer"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                                <span>{t("clients.table.edit")}</span>
                              </button>
                            )}
                            {permissions.canDelete && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(row);
                                }}
                                className="inline-flex items-center gap-1 text-[#FF0004] hover:underline text-sm cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>{t("clients.table.delete")}</span>
                              </button>
                            )}
                          </span>
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        },
        primaryFields: [],
        expandable: true,
      },
    };
    return baseTableConfig;
  }, [
    t,
    handleEdit,
    handleDelete,
    handleViewTeams,
    handleViewCalendar,
    clients,
    permissions,
    routes.clients,
  ]);

  return (
    <div className="p-4 md:p-8 min-h-screen overflow-x-hidden" style={{ background: "#FFFFFF" }}>
      <div className="max-w-full overflow-x-hidden">
        <div className="mb-6 md:mb-8 flex items-center justify-between gap-3 flex-wrap min-w-0">
          <h1
            className="text-xl md:text-3xl font-bold min-w-0 truncate"
            style={{ color: "#000000" }}
          >
            {t("clients.title") || "Clients"}
          </h1>
          {permissions.canAdd && (
            <Link href={routes.clients.add} className="shrink-0">
              <Button
                variant="primary"
                style={{
                  background: "#0097B2",
                  color: "#FFFFFF",
                  fontSize: "14px",
                  padding: "7px 21px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  borderRadius: "8px",
                  boxShadow: "0px 4px 4px rgba(166,166,166,0.25)",
                  cursor: "pointer",
                }}
                className="md:text-[16px] h-[35px] md:h-[40px]"
              >
                <Plus className="w-[14px] h-[14px] md:w-5 md:h-5" />
                <span className="font-semibold">{t("clients.addClient") || "Add Client"}</span>
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

        <DataTable config={tableConfig} data={clients} loading={loading} />
      </div>
    </div>
  );
}
