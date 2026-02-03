import { Calendar } from "lucide-react";
import type { Contractor } from "@/packages/types/contractors.types";
import type { DataTableConfig } from "@/packages/types/DataTable.types";
import type { FilterPanelConfig, FilterValues } from "@/packages/types/FilterPanel.types";
import type { SelectOption } from "@/packages/design-system";

export interface FilterOptions {
  countries: SelectOption[];
  clients: SelectOption[];
  teams: SelectOption[];
  jobPositions: SelectOption[];
}

export function filterContractorsLocal(
  contractors: Contractor[],
  filters: FilterValues,
): Contractor[] {
  const name = typeof filters.name === "string" ? filters.name.trim().toLowerCase() : "";
  const country = typeof filters.country === "string" ? filters.country.trim() : "";
  const clientId = typeof filters.clientId === "string" ? filters.clientId.trim() : "";
  const teamId = typeof filters.teamId === "string" ? filters.teamId.trim() : "";
  const jobPosition = typeof filters.jobPosition === "string" ? filters.jobPosition.trim() : "";

  return contractors.filter((c) => {
    if (!c.isActive) return false;
    if (clientId && c.client_id !== clientId) return false;
    if (name && !(c.name || "").toLowerCase().includes(name)) return false;
    if (country && (c.country || "") !== country) return false;
    if (teamId && (c.team_id || "") !== teamId) return false;
    if (jobPosition && (c.job_position || "") !== jobPosition) return false;
    return true;
  });
}

export function createTableConfig(
  t: (key: string) => string,
  handleViewCalendar: (contractor: Contractor) => void,
): DataTableConfig<Contractor> {
  return {
    columns: [
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
            className="inline-flex items-center gap-1.5 text-[#0097B2] hover:opacity-80 transition-opacity"
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
        type: "text",
        minWidth: "220px",
        align: "center",
      },
    ],
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
  };
}

export function createFiltersConfig(
  t: (key: string) => string,
  filterOptions: FilterOptions | null,
): FilterPanelConfig {
  return {
    filters: [
      {
        key: "name",
        type: "text",
        label: t("contractors.filters.name"),
        translationKey: "contractors.filters.name",
        placeholder: t("contractors.filters.userPlaceholder"),
      },
      {
        key: "country",
        type: "select",
        label: t("contractors.filters.country"),
        translationKey: "contractors.filters.country",
        options: [
          { value: "", label: t("contractors.filters.countryPlaceholder") },
          ...(filterOptions?.countries || []),
        ],
      },
      {
        key: "teamId",
        type: "select",
        label: t("contractors.filters.team"),
        translationKey: "contractors.filters.team",
        options: [
          { value: "", label: t("contractors.filters.teamPlaceholder") },
          ...(filterOptions?.teams || []),
        ],
      },
      {
        key: "jobPosition",
        type: "select",
        label: t("contractors.filters.jobPosition"),
        translationKey: "contractors.filters.jobPosition",
        options: [
          { value: "", label: t("contractors.filters.jobPositionPlaceholder") },
          ...(filterOptions?.jobPositions || []),
        ],
      },
    ],
    layout: "row",
    showClearButton: true,
    clearButtonPosition: "end",
    clearButtonLabel: t("contractors.filters.cleanFilters"),
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
}

export function processFilterOptions(
  allContractors: Contractor[],
  allTeams: { id: string; name: string }[],
  clientId: string,
): FilterOptions {
  const activeContractors = allContractors.filter((c) => c.isActive);
  const uniqueCountries = Array.from(
    new Set(
      activeContractors
        .map((c) => c.country)
        .filter((country): country is string => Boolean(country)),
    ),
  ).sort();
  const uniqueJobPositions = Array.from(
    new Set(
      activeContractors.map((c) => c.job_position).filter((pos): pos is string => Boolean(pos)),
    ),
  ).sort();

  return {
    countries: uniqueCountries.map((country) => ({ value: country, label: country })),
    clients: [],
    teams: allTeams
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((team) => ({ value: team.id, label: team.name })),
    jobPositions: uniqueJobPositions.map((pos) => ({ value: pos, label: pos })),
  };
}
