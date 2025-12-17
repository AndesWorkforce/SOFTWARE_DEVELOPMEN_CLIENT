"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Plus, Pencil, Trash2, UsersRound, ChevronDown, ChevronRight } from "lucide-react";
import { Button, DataTable, FilterPanel } from "@/packages/design-system";
import { clientsService, type Client } from "@/packages/api/clients/clients.service";
import { teamsService } from "@/packages/api/teams/teams.service";
import type { DataTableConfig } from "@/packages/types/DataTable.types";
import type { FilterPanelConfig, FilterValues } from "@/packages/types/FilterPanel.types";
import type { SelectOption } from "@/packages/design-system";

interface FilterOptions {
  teams: SelectOption[];
}

export default function ClientsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [clients, setClients] = useState<Client[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterValues>({});

  const handleEdit = useCallback(
    (client: Client) => {
      const editPath = `/${locale}/app/super-admin/clients/edit/${client.id}`;
      router.push(editPath);
    },
    [locale, router],
  );

  const handleDelete = useCallback(
    (client: Client) => {
      const deletePath = `/${locale}/app/super-admin/clients/delete/${client.id}`;
      router.push(deletePath);
    },
    [locale, router],
  );

  const handleViewTeams = useCallback(
    (client: Client) => {
      // Navegar a la vista de contractors del client seleccionado
      const path = `/${locale}/app/super-admin/clients/${client.id}`;
      router.push(path);
    },
    [locale, router],
  );

  const tableConfig = useMemo(() => {
    const baseTableConfig: DataTableConfig<Client> = {
      columns: [
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
            <span className="block w-full whitespace-normal break-words">
              {String(value ?? "")}
            </span>
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
              className="inline-flex items-center gap-1 text-black hover:underline"
            >
              <UsersRound className="w-3.5 h-3.5" />
              <span className="text-sm font-medium underline">View</span>
            </button>
          ),
        },
        {
          key: "actions",
          title: "Action",
          translationKey: "clients.table.action",
          dataPath: "id",
          type: "custom",
          width: "100px",
          align: "left",
          render: (_value: unknown, row: Client) => (
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
        message: t("clients.noClients") || "No clients found",
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
          background: "#FFFFFF",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
        },
      },
      mobileConfig: {
        // Custom card to match Figma mobile list (expanded vs collapsed)
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
                          <span>View</span>
                        </button>
                      </p>

                      <p className="m-0">
                        <span className="font-semibold">Action</span>
                        <span className="font-semibold">: </span>
                        <span className="inline-flex flex-wrap items-center gap-[20px] max-w-full">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(row);
                            }}
                            className="inline-flex items-center gap-[10px] text-[#0097B2] text-[14px] font-semibold"
                          >
                            <Pencil className="w-[14px] h-[14px]" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(row);
                            }}
                            className="inline-flex items-center gap-[10px] text-[#FF0004] text-[14px] font-semibold"
                          >
                            <Trash2 className="w-[14px] h-[14px]" />
                            <span>Delete</span>
                          </button>
                        </span>
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        },
        // prevent default renderer
        primaryFields: [],
        expandable: true,
      },
    };
    return baseTableConfig;
  }, [t, handleEdit, handleDelete, handleViewTeams, clients]);

  const filtersConfig = useMemo(() => {
    const baseFiltersConfig: FilterPanelConfig = {
      filters: [
        {
          key: "name",
          type: "text",
          label: t("clients.filters.name") || "User",
          translationKey: "clients.filters.name",
          placeholder: t("clients.filters.clientPlaceholder") || "Search user here...",
        },
        {
          key: "teamId",
          type: "select",
          label: t("clients.filters.team") || "Team",
          translationKey: "clients.filters.team",
          options: [],
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

    return {
      ...baseFiltersConfig,
      filters: baseFiltersConfig.filters.map((filter) => {
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
      const allTeams = await teamsService.getAll();

      setFilterOptions({
        teams: allTeams
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((team) => ({ value: team.id, label: team.name })),
      });
    } catch (error) {
      console.error("Error loading filter options:", error);
      setFilterOptions({
        teams: [],
      });
    }
  };

  const loadClients = async () => {
    try {
      setLoading(true);
      // Por ahora no pasamos filtros ya que el backend no los acepta
      const data = await clientsService.getAll();
      setClients(data);
    } catch (error) {
      console.error("Error loading clients:", error);
      setClients([]);
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

  // Cargar clients cuando cambien los filtros (por ahora no se aplican, pero dejamos la estructura)
  useEffect(() => {
    loadClients();
  }, [filters.name, filters.teamId]);

  // Recargar clients cuando volvemos a la página de clients
  useEffect(() => {
    const basePath = `/${locale}/app/super-admin/clients`;

    if (pathname === basePath && filterOptions !== null) {
      loadClients();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, locale]);

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
          <Link href={`/${locale}/app/super-admin/clients/add`} className="shrink-0">
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
              className="md:text-[16px] h-[35px] md:h-[45px]"
            >
              <Plus className="w-[14px] h-[14px] md:w-5 md:h-5" />
              <span className="font-semibold">{t("clients.addClient") || "Add Client"}</span>
            </Button>
          </Link>
        </div>

        <FilterPanel
          config={filtersConfig}
          onChange={setFilters}
          onClear={handleClearFilters}
          loading={loading}
        />

        <DataTable config={tableConfig} data={clients} loading={loading} />
      </div>
    </div>
  );
}
