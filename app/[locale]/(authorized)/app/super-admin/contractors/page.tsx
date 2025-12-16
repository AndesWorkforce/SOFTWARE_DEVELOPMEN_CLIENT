"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Plus, Pencil, Trash2, Calendar } from "lucide-react";
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
      const editPath = `/${locale}/app/super-admin/contractors/edit/${contractor.id}`;
      router.push(editPath);
    },
    [locale, router],
  );

  const handleDelete = useCallback(
    (contractor: Contractor) => {
      const deletePath = `/${locale}/app/super-admin/contractors/delete/${contractor.id}`;
      router.push(deletePath);
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
          type: "action",
          width: "110px",
          align: "center",
          config: {
            action: {
              label: "View",
              onClick: () => {
                // TODO: Implementar vista de calendario
              },
              icon: <Calendar className="w-3.5 h-3.5" />,
            },
          },
        },
        {
          key: "user",
          title: "User",
          translationKey: "contractors.table.user",
          dataPath: "name",
          type: "text",
          width: "160px",
          align: "center",
        },
        {
          key: "email",
          title: "Email",
          translationKey: "contractors.table.email",
          dataPath: "email",
          type: "text",
          width: "170px",
          align: "center",
        },
        {
          key: "jobPosition",
          title: "Job Position",
          translationKey: "contractors.table.jobPosition",
          dataPath: "job_position",
          type: "text",
          width: "160px",
          align: "center",
        },
        {
          key: "client",
          title: "Client",
          translationKey: "contractors.table.client",
          dataPath: (row) => row.client_name || "N/A",
          type: "text",
          width: "160px",
          align: "center",
        },
        {
          key: "team",
          title: "Team",
          translationKey: "contractors.table.team",
          dataPath: (row) => row.team_name || "N/A",
          type: "text",
          width: "160px",
          align: "center",
        },
        {
          key: "country",
          title: "Country",
          translationKey: "contractors.table.country",
          dataPath: "country",
          type: "text",
          width: "110px",
          align: "center",
        },
        {
          key: "actions",
          title: "Action",
          translationKey: "contractors.table.action",
          dataPath: "id",
          type: "custom",
          width: "100px",
          align: "left",
          render: (_value: unknown, row: Contractor) => (
            <div className="flex flex-col gap-1 items-start">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(row);
                }}
                className="inline-flex items-center gap-1 text-[#0097B2] hover:underline"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span className="text-sm font-semibold">Edit</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(row);
                }}
                className="inline-flex items-center gap-1 text-[#FF0004] hover:underline"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="text-sm font-semibold">Delete</span>
              </button>
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
            render: () => (
              <button
                type="button"
                className="inline-flex items-center gap-1 underline"
                onClick={(e) => {
                  e.stopPropagation();
                  // En el futuro se puede conectar con la vista de calendario específica
                }}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>View</span>
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
                  <span className="font-semibold">Edit</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(row as Contractor);
                  }}
                  className="inline-flex items-center gap-1 text-[#FF0004] hover:underline text-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="font-semibold">Delete</span>
                </button>
              </span>
            ),
          },
        ],
        expandable: true,
      },
    };
    return baseTableConfig;
  }, [t, handleEdit, handleDelete]);

  const filtersConfig = useMemo(() => {
    // Configuración base de filtros (diseño alineado con Figma)
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
      } = {};

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

      const data = await contractorsService.getAll(
        Object.keys(apiFilters).length > 0 ? apiFilters : undefined,
      );

      // Enriquecer con información de clientes y equipos si no viene del backend
      const allClients = await clientsService.getAll();
      const allTeams = await teamsService.getAll();

      const enrichedData = data.map((contractor) => {
        const client = allClients.find((c) => c.id === contractor.client_id);
        const team = contractor.team_id ? allTeams.find((t) => t.id === contractor.team_id) : null;

        return {
          ...contractor,
          client_name: contractor.client_name || client?.name,
          team_name: contractor.team_name || team?.name,
        };
      });

      // Mostrar solo contratistas activos
      const activeContractors = enrichedData.filter((contractor) => contractor.isActive);
      setContractors(activeContractors);
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
  }, [filters.name, filters.country, filters.clientId, filters.teamId, filters.jobPosition]);

  // Recargar contractors cuando volvemos a la página de contractors
  useEffect(() => {
    const basePath = `/${locale}/app/super-admin/contractors`;

    // Si estamos en la ruta base de contractors y ya se cargaron las opciones de filtros
    if (pathname === basePath && filterOptions !== null) {
      loadContractors();
    }
  }, [pathname, locale]);

  return (
    <div className="p-4 md:p-8 min-h-screen" style={{ background: "#FFFFFF" }}>
      <div className="max-w-full">
        <div className="mb-6 md:mb-8 flex items-center justify-between">
          <h1 className="text-xl md:text-3xl font-bold" style={{ color: "#000000" }}>
            {t("contractors.title")}
          </h1>
          <Link href={`/${locale}/app/super-admin/contractors/add`}>
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
              }}
              className="md:text-[16px] h-[35px] md:h-[40px]"
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
