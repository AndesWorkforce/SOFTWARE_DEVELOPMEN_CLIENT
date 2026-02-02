import { Calendar, UsersRound, ChevronDown, ChevronRight } from "lucide-react";
import type { Client } from "@/packages/api/clients/clients.service";
import type { DataTableConfig } from "@/packages/types/DataTable.types";
import type { FilterPanelConfig } from "@/packages/types/FilterPanel.types";
import type { SelectOption } from "@/packages/design-system";

export const createTableConfig = (
  t: (key: string) => string,
  handleViewCalendar: (client: Client) => void,
  handleViewTeams: (client: Client) => void,
  clients: Client[],
): DataTableConfig<Client> => ({
  columns: [
    {
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
          className="inline-flex items-center gap-1 text-[#0097B2]"
          onClick={(e) => {
            e.stopPropagation();
            handleViewCalendar(row);
          }}
        >
          <Calendar className="w-4.5 h-4.5" />
          <span className="underline text-[16px]">{t("clients.table.view")}</span>
        </button>
      ),
    },
    {
      key: "name",
      title: "Client",
      translationKey: "clients.table.name",
      dataPath: "name",
      type: "text",
      width: "219px",
      align: "left",
    },
    {
      key: "description",
      title: "Description",
      translationKey: "clients.table.description",
      dataPath: (row) => row.description || "N/A",
      type: "custom",
      width: "494px",
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
      width: "208px",
      align: "left",
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
          className="inline-flex items-center gap-1 text-black hover:underline"
        >
          <UsersRound className="w-3.5 h-3.5" />
          <span className="text-sm font-medium underline">{t("clients.table.view")}</span>
        </button>
      ),
    },
  ],
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
    header: {
      height: "50px",
    },
    row: {
      height: "50px",
    },
    cell: {
      height: "50px",
      padding: "0 8px",
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

      const isEven = clients.findIndex((c) => c.id === row.id) % 2 === 1;
      const bg = isEven ? "#E2E2E2" : "#FFFFFF";

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
            } flex items-center justify-center`}
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
              <div className="flex items-baseline gap-1">
                <span className="font-semibold whitespace-nowrap">Calendar:</span>
                <button
                  type="button"
                  className="inline-flex items-center gap-[5px] text-[#0097B2] underline font-medium text-[14px]"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewCalendar(row);
                  }}
                >
                  <Calendar className="w-[14px] h-[14px]" />
                  <span>{t("clients.table.view")}</span>
                </button>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="font-semibold whitespace-nowrap">Client:</span>
                <span className="font-normal flex-1 min-w-0 truncate">{clientName}</span>
              </div>

              {isExpanded ? (
                <p className="m-0">
                  <span className="font-semibold">Description</span>
                  <span className="font-semibold">: </span>
                  <span className="font-normal whitespace-normal break-words">{description}</span>
                </p>
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className="font-semibold whitespace-nowrap">Description:</span>
                  <span className="font-normal flex-1 min-w-0 truncate">{mobileDescription}</span>
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
                      className="inline-flex items-center gap-[5px] underline font-medium text-[14px] max-w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewTeams(row);
                      }}
                    >
                      <UsersRound className="w-[14px] h-[14px]" />
                      <span>{t("clients.table.view")}</span>
                    </button>
                  </p>
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
});

export const createFiltersConfig = (
  t: (key: string) => string,
  filterOptions: { teams: SelectOption[] } | null,
): FilterPanelConfig => {
  const makePlaceholder = (key: string): SelectOption => {
    switch (key) {
      case "teamId":
        return {
          value: "",
          label: t("clients.filters.teamPlaceholder") || "Select team here...",
        };
      default:
        return {
          value: "",
          label: t("formModal.selectPlaceholder") || "Select...",
        };
    }
  };

  const baseFiltersConfig: FilterPanelConfig = {
    filters: [
      {
        key: "name",
        type: "text",
        label: t("clients.filters.name") || "Search Client",
        translationKey: "clients.filters.name",
        placeholder: t("clients.filters.clientPlaceholder") || "Search client here...",
      },
      {
        key: "teamId",
        type: "select",
        label: t("clients.filters.team") || "Team",
        translationKey: "clients.filters.team",
        options: [makePlaceholder("teamId"), ...(filterOptions?.teams || [])],
      },
    ],
    layout: "row",
    showClearButton: true,
    clearButtonPosition: "end",
    clearButtonLabel: t("clients.filters.cleanFilters") || "Clean filters",
    styles: {
      panel: {
        padding: "31px 28px",
        marginBottom: "24px",
      },
      filterRow: {
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: "10px",
      },
    },
  };

  return baseFiltersConfig;
};

export const processFilterOptions = (allTeams: Array<{ id: string; name: string }>) => {
  return {
    teams: allTeams
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((team) => ({
        value: team.id,
        label: team.name,
      })),
  };
};
