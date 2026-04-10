"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useParams, useRouter, usePathname } from "next/navigation";

import type { FilterPanelConfig, FilterValues } from "@/packages/types/FilterPanel.types";
import type { SelectOption } from "@/packages/design-system";
import type { Contractor } from "@/packages/types/contractors.types";
import { contractorsService } from "@/packages/api/contractors/contractors.service";
import { clientsService } from "@/packages/api/clients/clients.service";
import { teamsService } from "@/packages/api/teams/teams.service";
import { getRolePermissions, useRoleRoutes } from "@/packages/role-utils";

import { buildClientContractorsTableConfig } from "./buildClientContractorsTableConfig";
import {
  filterContractorsLocal,
  processVisualizerFilterOptions,
  type ClientContractorsFilterOptions,
} from "./clientContractorsShared";

type ManagedRole = "admin" | "super-admin" | "visualizer";

export function useClientContractorsPage(role: ManagedRole) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ id: string }>();
  const clientId = params?.id;

  const routes = useRoleRoutes(role);
  const permissions = getRolePermissions(role);
  const isVisualizer = role === "visualizer";
  const isSuperAdmin = role === "super-admin";

  const [clientName, setClientName] = useState<string>("");
  const [contractorsRaw, setContractorsRaw] = useState<Contractor[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [filterOptions, setFilterOptions] = useState<ClientContractorsFilterOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterValues>({});

  const handleEdit = useCallback(
    (contractor: Contractor) => {
      if (!clientId) return;
      router.push(routes.clients.contractorEdit(clientId, contractor.id));
    },
    [clientId, router, routes.clients],
  );

  const handleDelete = useCallback(
    (contractor: Contractor) => {
      if (!clientId) return;
      router.push(routes.clients.contractorDelete(clientId, contractor.id));
    },
    [clientId, router, routes.clients],
  );

  const handleViewCalendar = useCallback(
    (contractor: Contractor) => {
      router.push(routes.contractors.calendar(contractor.id));
    },
    [router, routes.contractors],
  );

  const tableConfig = useMemo(() => {
    const showActions = permissions.canEdit && permissions.canDelete;
    return buildClientContractorsTableConfig(
      t,
      {
        handleViewCalendar,
        ...(showActions ? { handleEdit, handleDelete } : {}),
      },
      {
        showActivationKey: isSuperAdmin,
        showActions,
      },
    );
  }, [
    t,
    handleViewCalendar,
    handleEdit,
    handleDelete,
    permissions.canEdit,
    permissions.canDelete,
    isSuperAdmin,
  ]);

  const filtersConfigAdmin = useMemo(() => {
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

  const filtersConfigVisualizer = useMemo((): FilterPanelConfig => {
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
  }, [filterOptions, t]);

  const filtersConfig = isVisualizer ? filtersConfigVisualizer : filtersConfigAdmin;

  const loadManagedClientContractors = useCallback(async () => {
    if (!clientId) return;
    try {
      setLoading(true);
      const data = await contractorsService.getByClientId(clientId);

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

  const loadVisualizerContractors = useCallback(async () => {
    if (!clientId) return;
    try {
      setLoading(true);
      const data = await contractorsService.getAll();
      const [client, allTeams] = await Promise.all([
        clientsService.getById(clientId),
        teamsService.getAll(),
      ]);
      setClientName(client.name || "");

      const teamsMap = new Map(allTeams.map((tm) => [tm.id, tm.name]));
      const clientContractors = data.filter((c) => c.client_id === clientId && c.isActive);
      const enriched = clientContractors.map((c) => ({
        ...c,
        client_name: (c as Contractor & { client_name?: string }).client_name || client.name,
        team_name:
          (c as Contractor & { team_name?: string }).team_name ||
          (c.team_id ? teamsMap.get(c.team_id) : undefined),
      }));

      setContractorsRaw(enriched);
    } catch (error) {
      console.error("Error loading contractors:", error);
      setContractorsRaw([]);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  const loadFilterOptionsManaged = useCallback(async () => {
    if (!clientId) return;
    try {
      const [client, allTeams] = await Promise.all([
        clientsService.getById(clientId),
        teamsService.getAll(),
      ]);
      setClientName(client.name || "");

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

  const loadFilterOptionsVisualizer = useCallback(async () => {
    if (!clientId) return;
    try {
      const [allContractors, allTeams] = await Promise.all([
        contractorsService.getAll(),
        teamsService.getAll(),
      ]);
      setFilterOptions(processVisualizerFilterOptions(allContractors, allTeams));
    } catch (error) {
      console.error("Error loading filter options:", error);
      setFilterOptions({
        countries: [],
        clients: [],
        teams: [],
        jobPositions: [],
      });
    }
  }, [clientId]);

  useEffect(() => {
    if (!clientId || isVisualizer) return;
    setFilters((prev) => ({ ...prev, clientId }));
  }, [clientId, isVisualizer]);

  useEffect(() => {
    if (!clientId) return;
    if (isVisualizer) {
      loadVisualizerContractors();
    } else {
      loadManagedClientContractors();
    }
  }, [clientId, isVisualizer, loadManagedClientContractors, loadVisualizerContractors]);

  useEffect(() => {
    if (!clientId) return;
    if (isVisualizer) {
      loadFilterOptionsVisualizer();
    } else {
      loadFilterOptionsManaged();
    }
  }, [clientId, isVisualizer, loadFilterOptionsManaged, loadFilterOptionsVisualizer]);

  useEffect(() => {
    if (!clientId) return;
    setContractors(
      filterContractorsLocal(contractorsRaw, {
        ...filters,
        clientId,
      }),
    );
  }, [contractorsRaw, filters, clientId]);

  useEffect(() => {
    if (!clientId || isVisualizer) return;
    const basePath = `/${locale}/app/${role}/clients/${clientId}`;
    if (pathname === basePath) {
      loadManagedClientContractors();
    }
  }, [pathname, locale, clientId, role, isVisualizer, loadManagedClientContractors]);

  const handleClearFilters = useCallback(() => {
    if (isVisualizer) {
      setFilters({});
    } else if (clientId) {
      setFilters({ clientId });
    }
  }, [clientId, isVisualizer]);

  const refreshClientDetailData = useCallback(() => {
    if (!clientId) return;
    if (isVisualizer) {
      loadVisualizerContractors();
      loadFilterOptionsVisualizer();
    } else {
      loadManagedClientContractors();
      loadFilterOptionsManaged();
    }
  }, [
    clientId,
    isVisualizer,
    loadManagedClientContractors,
    loadVisualizerContractors,
    loadFilterOptionsManaged,
    loadFilterOptionsVisualizer,
  ]);

  return {
    clientId,
    clientName,
    contractors,
    loading,
    filters,
    setFilters,
    filtersConfig,
    tableConfig,
    handleClearFilters,
    routes,
    permissions,
    t,
    locale,
    addContractorHref: clientId ? routes.clients.contractorAdd(clientId) : "",
    clientsListHref: routes.clients.list,
    refreshClientDetailData,
  };
}
