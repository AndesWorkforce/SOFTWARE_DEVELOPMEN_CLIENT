import { Calendar } from "lucide-react";
import type { Contractor } from "@/packages/types/contractors.types";
import type { DataTableConfig } from "@/packages/types/DataTable.types";
import type { FilterPanelConfig, FilterValues } from "@/packages/types/FilterPanel.types";
import type { SelectOption } from "@/packages/design-system";

interface ActivationKeyCellProps {
  value: string | null;
  contractorId: string;
  ActivationKeyComponent: React.ComponentType<{ value: string | null; contractorId: string }>;
}

export const createTableConfig = (
  t: (key: string) => string,
  handleViewCalendar: (contractor: Contractor) => void,
  ActivationKeyComponent: React.ComponentType<{ value: string | null; contractorId: string }>,
): DataTableConfig<Contractor> => ({
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
      type: "custom",
      minWidth: "220px",
      align: "center",
      render: (value: unknown, row: Contractor) => (
        <ActivationKeyComponent value={value as string} contractorId={row.id} />
      ),
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
  mobileConfig: {
    primaryFields: [
      {
        key: "calendar",
        label: t("contractors.table.calendar"),
        dataPath: "id",
        render: (_value: unknown, row: Contractor) => (
          <button
            type="button"
            className="inline-flex items-center gap-1 text-[#0097B2]"
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
          <ActivationKeyComponent value={value as string} contractorId={row.id} />
        ),
      },
    ],
    expandable: true,
  },
});

export const createFiltersConfig = (
  t: (key: string) => string,
  filterOptions: {
    countries: SelectOption[];
    clients: SelectOption[];
    teams: SelectOption[];
    jobPositions: SelectOption[];
  } | null,
): FilterPanelConfig => {
  const makePlaceholder = (key: string): SelectOption => {
    switch (key) {
      case "country":
        return {
          value: "",
          label: t("contractors.filters.countryPlaceholder") || "Select country here...",
        };
      case "clientId":
        return {
          value: "",
          label: t("contractors.filters.clientPlaceholder") || "Select client here...",
        };
      case "teamId":
        return {
          value: "",
          label: t("contractors.filters.teamPlaceholder") || "Select team here...",
        };
      case "jobPosition":
        return {
          value: "",
          label: t("contractors.filters.jobPositionPlaceholder") || "Select job position here...",
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
        label: t("contractors.filters.name"),
        translationKey: "contractors.filters.name",
        placeholder: t("contractors.filters.userPlaceholder") || "Search user here...",
      },
      {
        key: "country",
        type: "select",
        label: t("contractors.filters.country"),
        translationKey: "contractors.filters.country",
        options: [makePlaceholder("country"), ...(filterOptions?.countries || [])],
      },
      {
        key: "clientId",
        type: "select",
        label: t("contractors.filters.client"),
        translationKey: "contractors.filters.client",
        options: [makePlaceholder("clientId"), ...(filterOptions?.clients || [])],
      },
      {
        key: "teamId",
        type: "select",
        label: t("contractors.filters.team"),
        translationKey: "contractors.filters.team",
        options: [makePlaceholder("teamId"), ...(filterOptions?.teams || [])],
      },
      {
        key: "jobPosition",
        type: "select",
        label: t("contractors.filters.jobPosition"),
        translationKey: "contractors.filters.jobPosition",
        options: [makePlaceholder("jobPosition"), ...(filterOptions?.jobPositions || [])],
      },
    ],
    layout: "row",
    showClearButton: true,
    clearButtonPosition: "end",
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

export const processFilterOptions = (
  allContractors: Contractor[],
  allClients: Array<{ id: string; name: string }>,
  allTeams: Array<{ id: string; name: string }>,
) => {
  const countriesSet = new Set<string>();
  const jobPositionsSet = new Set<string>();

  allContractors.forEach((contractor) => {
    if (contractor.country) {
      countriesSet.add(contractor.country);
    }
    if (contractor.job_position) {
      jobPositionsSet.add(contractor.job_position);
    }
  });

  return {
    countries: Array.from(countriesSet)
      .sort()
      .map((country) => ({ value: country, label: country })),
    clients: allClients
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((client) => ({ value: client.id, label: client.name })),
    teams: allTeams
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((team) => ({ value: team.id, label: team.name })),
    jobPositions: Array.from(jobPositionsSet)
      .sort()
      .map((position) => ({ value: position, label: position })),
  };
};
