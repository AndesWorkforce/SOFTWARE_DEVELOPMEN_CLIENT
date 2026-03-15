"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Plus, Pencil, Trash2, Calendar, Copy } from "lucide-react";
import { Button, DataTable, FilterPanel } from "@/packages/design-system";
import { contractorsService } from "@/packages/api/contractors/contractors.service";
import { clientsService } from "@/packages/api/clients/clients.service";
import { teamsService } from "@/packages/api/teams/teams.service";
import type { Contractor } from "@/packages/types/contractors.types";
import type { DataTableConfig } from "@/packages/types/DataTable.types";
import type { FilterPanelConfig, FilterValues } from "@/packages/types/FilterPanel.types";
import type { SelectOption } from "@/packages/design-system";

const ActivationKeyCell = ({
  value,
  contractorId,
}: {
  value: string | null;
  contractorId: string;
}) => {
  const t = useTranslations();
  const [isCopied, setIsCopied] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  if (!value) return <span>N/A</span>;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCopying) return;

    try {
      setIsCopying(true);
      // Obtener la clave completa desde el backend
      const fullKey = await contractorsService.getFullActivationKey(contractorId);
      await navigator.clipboard.writeText(fullKey);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Error copying activation key:", error);
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <div className="inline-flex items-center justify-start md:justify-center gap-2 whitespace-normal">
      <span className="text-[14px] font-normal font-mono max-w-[180px] text-left break-all leading-tight">
        {value}
      </span>
      <div className="flex items-center gap-2 shrink-0">
        <div className="relative">
          <button
            onClick={handleCopy}
            disabled={isCopying}
            className={`text-[#0097B2] hover:opacity-70 transition-opacity ${
              isCopying ? "cursor-wait opacity-50" : "cursor-pointer"
            }`}
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
      const editPath = `/${locale}/app/super-admin/clients/${clientId}/contractors/edit/${contractor.id}`;
      router.push(editPath);
    },
    [clientId, locale, router],
  );

  const handleDelete = useCallback(
    (contractor: Contractor) => {
      const deletePath = `/${locale}/app/super-admin/clients/${clientId}/contractors/delete/${contractor.id}`;
      router.push(deletePath);
    },
    [clientId, locale, router],
  );

  const handleViewCalendar = useCallback(
    (contractor: Contractor) => {
      const calendarPath = `/${locale}/app/super-admin/contractors/calendar/${contractor.id}`;
      router.push(calendarPath);
    },
    [locale, router],
  );

  const tableConfig = useMemo(() => {
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
                  className="inline-flex items-center gap-1 text-[#0097B2] hover:underline cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span className="text-sm">{t("contractors.table.edit")}</span>
                </button>
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
                  className="inline-flex items-center gap-1 text-[#0097B2] hover:underline text-sm cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>{t("contractors.table.edit")}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(row as Contractor);
                  }}
                  className="inline-flex items-center gap-1 text-[#FF0004] hover:underline text-sm cursor-pointer"
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
    const basePath = `/${locale}/app/super-admin/clients/${clientId}`;
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
        <div className="mb-6 md:mb-8 flex items-center justify-between">
          <h1 className="text-xl md:text-3xl font-bold text-black">
            {clientName || t("contractors.title")}
          </h1>
          <Link href={`/${locale}/app/super-admin/clients/${clientId}/contractors/add`}>
            <Button
              variant="primary"
              className="md:text-[15px] h-[35px] md:h-[40px] bg-[#0097B2] text-white text-[15px] font-semibold px-[21px] py-[7px] flex items-center gap-[10px] rounded-[8px] shadow-[0px_4px_4px_rgba(166,166,166,0.25)] cursor-pointer"
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
          initialValues={{ clientId }}
        />

        <DataTable config={tableConfig} data={contractors} loading={loading} />
      </div>
    </div>
  );
}
