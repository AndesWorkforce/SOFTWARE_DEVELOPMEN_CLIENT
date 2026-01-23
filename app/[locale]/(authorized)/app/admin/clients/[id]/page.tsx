"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Pencil, Trash2, Calendar } from "lucide-react";
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
  clients: SelectOption[]; // solo el client actual (fijo)
  teams: SelectOption[];
  jobPositions: SelectOption[];
}

function filterContractorsLocal(contractors: Contractor[], filters: FilterValues): Contractor[] {
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

export default function ClientContractorsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ id: string }>();
  const clientId = params?.id;

  const [clientName, setClientName] = useState<string>("");
  const [contractorsRaw, setContractorsRaw] = useState<Contractor[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterValues>({});

  const handleEdit = useCallback(
    (contractor: Contractor) => {
      const editPath = `/${locale}/app/admin/clients/${clientId}/contractors/edit/${contractor.id}`;
      router.push(editPath);
    },
    [clientId, locale, router],
  );

  const handleDelete = useCallback(
    (contractor: Contractor) => {
      const deletePath = `/${locale}/app/admin/clients/${clientId}/contractors/delete/${contractor.id}`;
      router.push(deletePath);
    },
    [clientId, locale, router],
  );

  const tableConfig = useMemo(() => {
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
                    handleDelete(row);
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
    // Misma estructura que contractors/page.tsx, con Client fijo (disabled)
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
          disabled: true,
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

  const loadClientContractors = useCallback(async () => {
    if (!clientId) return;
    try {
      setLoading(true);
      const data = await contractorsService.getByClientId(clientId);

      // Enriquecer con nombres (client/team) para mantener la tabla idéntica
      const [client, allTeams] = await Promise.all([
        clientsService.getById(clientId),
        teamsService.getAll(),
      ]);
      setClientName(client.name || "");

      const teamsMap = new Map(allTeams.map((tm) => [tm.id, tm.name]));
      const enriched = data.map((c) => ({
        ...c,
        client_name: (c as Contractor & { client_name?: string }).client_name || client.name,
        team_name:
          (c as Contractor & { team_name?: string }).team_name ||
          (c.team_id ? teamsMap.get(c.team_id) : undefined),
      }));

      setContractorsRaw(enriched);
    } catch (error) {
      console.error("Error loading client contractors:", error);
      setContractorsRaw([]);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  const loadFilterOptions = useCallback(async () => {
    if (!clientId) return;
    try {
      const [client, allTeams] = await Promise.all([
        clientsService.getById(clientId),
        teamsService.getAll(),
      ]);
      setClientName(client.name || "");

      // Countries / Job positions desde contractors del cliente (ya cargados o cargarlos si no)
      let source = contractorsRaw;
      if (source.length === 0) {
        source = await contractorsService.getByClientId(clientId);
      }

      const countriesSet = new Set<string>();
      const jobPositionsSet = new Set<string>();
      source.forEach((c) => {
        if (c.country) countriesSet.add(c.country);
        if (c.job_position) jobPositionsSet.add(c.job_position);
      });

      setFilterOptions({
        countries: Array.from(countriesSet)
          .sort()
          .map((country) => ({ value: country, label: country })),
        clients: [{ value: client.id, label: client.name }],
        teams: allTeams
          .filter((tm) => tm.client_id === client.id)
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((tm) => ({ value: tm.id, label: tm.name })),
        jobPositions: Array.from(jobPositionsSet)
          .sort()
          .map((p) => ({ value: p, label: p })),
      });
    } catch (error) {
      console.error("Error loading filter options (client contractors):", error);
      setFilterOptions({
        countries: [],
        clients: [],
        teams: [],
        jobPositions: [],
      });
    }
  }, [clientId, contractorsRaw]);

  // Inicializar filtros con el client fijo
  useEffect(() => {
    if (!clientId) return;
    setFilters((prev) => ({ ...prev, clientId }));
  }, [clientId]);

  // Cargar contractors y opciones al montar/cambiar clientId
  useEffect(() => {
    loadClientContractors();
  }, [loadClientContractors]);

  useEffect(() => {
    loadFilterOptions();
  }, [loadFilterOptions]);

  // Recalcular resultado al cambiar filtros o data
  useEffect(() => {
    setContractors(filterContractorsLocal(contractorsRaw, filters));
  }, [contractorsRaw, filters]);

  // Recargar cuando volvemos a la ruta (similar a contractors/page.tsx)
  useEffect(() => {
    if (!clientId) return;
    const basePath = `/${locale}/app/admin/clients/${clientId}`;
    if (pathname === basePath) {
      loadClientContractors();
    }
  }, [pathname, locale, clientId, loadClientContractors]);

  const handleClearFilters = () => {
    // Mantener siempre el client fijo
    setFilters({ clientId });
  };

  if (!clientId) {
    return null;
  }

  return (
    <div className="p-4 md:p-8 min-h-screen" style={{ background: "#FFFFFF" }}>
      <div className="max-w-full">
        <div className="mb-6 md:mb-8 flex items-center justify-between gap-3 flex-wrap min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => router.push(`/${locale}/app/admin/clients`)}
              className="shrink-0 w-[24px] h-[24px] flex items-center justify-center"
              aria-label="Back"
            >
              <ArrowLeft className="w-[24px] h-[24px] text-black" />
            </button>
            <h1
              className="text-xl md:text-3xl font-bold min-w-0 truncate"
              style={{ color: "#000000" }}
            >
              {clientName || ""}
            </h1>
          </div>

          <div className="flex items-center gap-[10px] shrink-0">
            <Link href={`/${locale}/app/admin/clients/${clientId}/teams/add`} className="shrink-0">
              <Button
                variant="outline"
                style={{
                  background: "#FFFFFF",
                  color: "#0097B2",
                  border: "1px solid #B6B4B4",
                  fontSize: "14px",
                  padding: "7px 21px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  borderRadius: "8px",
                  boxShadow: "0px 4px 4px rgba(166,166,166,0.25)",
                  width: "160px",
                }}
                className="h-[35px] md:h-[40px]"
              >
                <Plus className="w-4 h-4 text-[#0097B2]" />
                <span className="font-semibold">{t("teams.createTeam") || "Create Team"}</span>
              </Button>
            </Link>

            <Link
              href={`/${locale}/app/admin/clients/${clientId}/contractors/add`}
              className="shrink-0"
            >
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
        </div>

        <FilterPanel
          config={filtersConfig}
          onChange={setFilters}
          onClear={handleClearFilters}
          loading={loading}
          initialValues={{ clientId }}
        />

        <DataTable config={tableConfig} data={contractors} loading={loading} />
      </div>
    </div>
  );
}
