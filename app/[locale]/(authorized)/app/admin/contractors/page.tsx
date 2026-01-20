"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Plus, Pencil, Trash2, Calendar, Eye, EyeOff, Copy } from "lucide-react";
import { Button, DataTable, FilterPanel } from "@/packages/design-system";
import { contractorsService } from "@/packages/api/contractors/contractors.service";
import { clientsService } from "@/packages/api/clients/clients.service";
import { teamsService } from "@/packages/api/teams/teams.service";
import type { Contractor } from "@/packages/types/contractors.types";
import type { DataTableConfig } from "@/packages/types/DataTable.types";
import type { FilterPanelConfig, FilterValues } from "@/packages/types/FilterPanel.types";
import type { SelectOption } from "@/packages/design-system";

interface FilterOptions {
  countries: SelectOption[];
  clients: SelectOption[];
  teams: SelectOption[];
  jobPositions: SelectOption[];
}

const ActivationKeyCell = ({ value }: { value: string | null }) => {
  const t = useTranslations();
  const [isVisible, setIsVisible] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  if (!value) return <span>N/A</span>;

  const maskedValue = value.length > 6 ? `${value.slice(0, 3)}******${value.slice(-6)}` : "******";

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const toggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(!isVisible);
  };

  return (
    <div className="flex items-center justify-center gap-2 whitespace-normal">
      <span className="text-[14px] font-normal font-mono max-w-[180px] text-left break-all leading-tight">
        {isVisible ? value : maskedValue}
      </span>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={toggleVisibility}
          className="text-[#0097B2] hover:opacity-70 transition-opacity"
          title={isVisible ? "Hide" : "Show"}
        >
          {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
        <div className="relative">
          <button
            onClick={handleCopy}
            className="text-[#0097B2] hover:opacity-70 transition-opacity"
            title="Copy"
          >
            <Copy className="w-4 h-4" />
          </button>
          {isCopied && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded shadow-lg animate-in fade-in zoom-in duration-200 z-10 whitespace-nowrap">
              {t("contractors.table.copied")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ContractorsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterValues>({});

  const handleEdit = useCallback(
    (contractor: Contractor) => {
      const editPath = `/${locale}/app/admin/contractors/edit/${contractor.id}`;
      router.push(editPath);
    },
    [locale, router],
  );

  const handleDelete = useCallback(
    (contractor: Contractor) => {
      const deletePath = `/${locale}/app/admin/contractors/delete/${contractor.id}`;
      router.push(deletePath);
    },
    [locale, router],
  );

  const handleViewCalendar = useCallback(
    (contractor: Contractor) => {
      const calendarPath = `/${locale}/app/admin/contractors/calendar/${contractor.id}`;
      router.push(calendarPath);
    },
    [locale, router],
  );

  const tableConfig = useMemo(() => {
    // Configuración base de tabla
    const baseTableConfig: DataTableConfig<Contractor> = {
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
          render: (value: unknown) => <ActivationKeyCell value={value as string} />,
        },
        {
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(row);
                  }}
                  className="inline-flex items-center gap-1 text-[#0097B2] hover:underline"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span className="text-sm">{t("contractors.table.edit")}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(row);
                  }}
                  className="inline-flex items-center gap-1 text-[#FF0004] hover:underline"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="text-sm">{t("contractors.table.delete")}</span>
                </button>
              </div>
            </div>
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
            render: (value: unknown) => <ActivationKeyCell value={value as string} />,
          },
          {
            key: "actions",
            label: t("contractors.table.action"),
            dataPath: "id",
            render: (_value: unknown, row: Contractor) => (
              <span className="inline-flex flex-row items-center gap-4 flex-wrap">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(row);
                  }}
                  className="inline-flex items-center gap-1 text-[#0097B2] hover:underline text-sm"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>{t("contractors.table.edit")}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(row as Contractor);
                  }}
                  className="inline-flex items-center gap-1 text-[#FF0004] hover:underline text-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t("contractors.table.delete")}</span>
                </button>
              </span>
            ),
          },
        ],
        expandable: true,
      },
    };
    return baseTableConfig;
  }, [t, handleEdit, handleDelete, handleViewCalendar]);

  const filtersConfig = useMemo(() => {
    // Configuración base de filtros
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
          options: [],
        },
        {
          key: "clientId",
          type: "select",
          label: t("contractors.filters.client"),
          translationKey: "contractors.filters.client",
          options: [],
        },
        {
          key: "teamId",
          type: "select",
          label: t("contractors.filters.team"),
          translationKey: "contractors.filters.team",
          options: [],
        },
        {
          key: "jobPosition",
          type: "select",
          label: t("contractors.filters.jobPosition"),
          translationKey: "contractors.filters.jobPosition",
          options: [],
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

    return {
      ...baseFiltersConfig,
      filters: baseFiltersConfig.filters.map((filter) => {
        if (filter.key === "country") {
          return {
            ...filter,
            options: [makePlaceholder("country"), ...(filterOptions?.countries || [])],
          };
        }
        if (filter.key === "clientId") {
          return {
            ...filter,
            options: [makePlaceholder("clientId"), ...(filterOptions?.clients || [])],
          };
        }
        if (filter.key === "teamId") {
          return {
            ...filter,
            options: [makePlaceholder("teamId"), ...(filterOptions?.teams || [])],
          };
        }
        if (filter.key === "jobPosition") {
          return {
            ...filter,
            options: [makePlaceholder("jobPosition"), ...(filterOptions?.jobPositions || [])],
          };
        }
        return filter;
      }),
    };
  }, [filterOptions, t]);

  const loadFilterOptions = async () => {
    try {
      const [allContractors, allClients, allTeams] = await Promise.all([
        contractorsService.getAll(),
        clientsService.getAll(),
        teamsService.getAll(),
      ]);

      // Extraer países únicos de los contractors
      const countriesSet = new Set<string>();
      allContractors.forEach((contractor) => {
        if (contractor.country) {
          countriesSet.add(contractor.country);
        }
      });

      // Extraer posiciones de trabajo únicas de los contractors
      const jobPositionsSet = new Set<string>();
      allContractors.forEach((contractor) => {
        if (contractor.job_position) {
          jobPositionsSet.add(contractor.job_position);
        }
      });

      setFilterOptions({
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
      });
    } catch (error) {
      console.error("Error loading filter options:", error);
      setFilterOptions({
        countries: [],
        clients: [],
        teams: [],
        jobPositions: [],
      });
    }
  };

  const loadContractors = async () => {
    try {
      setLoading(true);

      const apiFilters: {
        name?: string;
        country?: string;
        client_id?: string;
        team_id?: string;
        job_position?: string;
        isActive?: boolean;
      } = {
        // Por defecto, solo mostrar contratistas activos
        isActive: true,
      };

      const name = typeof filters.name === "string" ? filters.name : "";
      const country = typeof filters.country === "string" ? filters.country : "";
      const clientId = typeof filters.clientId === "string" ? filters.clientId : "";
      const teamId = typeof filters.teamId === "string" ? filters.teamId : "";
      const jobPosition = typeof filters.jobPosition === "string" ? filters.jobPosition : "";

      if (name) {
        apiFilters.name = name.trim();
      }
      if (country) {
        apiFilters.country = country.trim();
      }
      if (clientId) {
        apiFilters.client_id = clientId.trim();
      }
      if (teamId) {
        apiFilters.team_id = teamId.trim();
      }
      if (jobPosition) {
        apiFilters.job_position = jobPosition.trim();
      }

      const data = await contractorsService.getAll(apiFilters);

      // El backend ya filtra por isActive y devuelve client_name y team_name
      setContractors(data);
    } catch (error) {
      console.error("Error loading contractors:", error);
      setContractors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  // Cargar opciones de filtros al montar el componente
  useEffect(() => {
    loadFilterOptions();
  }, []);

  // Cargar contractors cuando cambien los filtros
  useEffect(() => {
    loadContractors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.name, filters.country, filters.clientId, filters.teamId, filters.jobPosition]);

  useEffect(() => {
    const basePath = `/${locale}/app/admin/contractors`;

    if (pathname === basePath && filterOptions !== null) {
      loadContractors();
      loadFilterOptions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, locale]);

  return (
    <div className="p-4 md:p-8 min-h-screen" style={{ background: "#FFFFFF" }}>
      <div className="max-w-full">
        <div className="mb-6 md:mb-8 flex items-center justify-between">
          <h1 className="text-xl md:text-3xl font-bold" style={{ color: "#000000" }}>
            {t("contractors.title")}
          </h1>
          <Link href={`/${locale}/app/admin/contractors/add`}>
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
              }}
              className="md:text-[15px] h-[35px] md:h-[40px]"
            >
              <Plus className="w-[14px] h-[14px] md:w-5 md:h-5" />
              <span className="font-semibold">{t("contractors.addContractor")}</span>
            </Button>
          </Link>
        </div>

        <FilterPanel
          config={filtersConfig}
          onChange={setFilters}
          onClear={handleClearFilters}
          loading={loading}
        />

        <DataTable config={tableConfig} data={contractors} loading={loading} />
      </div>
    </div>
  );
}
