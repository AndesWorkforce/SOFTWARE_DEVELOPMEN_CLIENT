"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { clientsService, type Client } from "@/packages/api/clients/clients.service";
import { teamsService } from "@/packages/api/teams/teams.service";
import type { FilterPanelConfig, FilterValues } from "@/packages/types/FilterPanel.types";
import type { SelectOption } from "@/packages/design-system";
import { useRoleRoutes, type Role } from "@/packages/role-utils";
import { getRolePermissions } from "@/packages/role-utils";

interface FilterOptions {
  teams: SelectOption[];
}

export function useClientsPage(role: Role) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const routes = useRoleRoutes(role);
  const permissions = getRolePermissions(role);

  const [clients, setClients] = useState<Client[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterValues>({});

  const handleEdit = useCallback(
    (client: Client) => {
      router.push(routes.clients.edit(client.id));
    },
    [router, routes.clients],
  );

  const handleDelete = useCallback(
    (client: Client) => {
      router.push(routes.clients.delete(client.id));
    },
    [router, routes.clients],
  );

  const handleViewTeams = useCallback(
    (client: Client) => {
      router.push(routes.clients.detail(client.id));
    },
    [router, routes.clients],
  );

  const handleViewCalendar = useCallback(
    (client: Client) => {
      if (routes.clients.calendar) {
        router.push(routes.clients.calendar(client.id));
      }
    },
    [router, routes.clients],
  );

  const filtersConfig = useMemo(() => {
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
          label: t("clients.filters.name") || "User",
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
  }, [filterOptions, t]);

  const loadFilterOptions = useCallback(async () => {
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
  }, []);

  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      const name = typeof filters?.name === "string" ? filters.name : undefined;
      const teamId = typeof filters?.teamId === "string" ? filters.teamId : undefined;

      const data = await clientsService.getAll({
        name: name?.trim() ? name.trim() : undefined,
        teamId: teamId?.trim() ? teamId.trim() : undefined,
      });
      setClients(data);
    } catch (error) {
      console.error("Error loading clients:", error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, [filters?.name, filters?.teamId]);

  const handleClearFilters = useCallback(() => {
    setFilters({});
  }, []);

  useEffect(() => {
    loadFilterOptions();
  }, [loadFilterOptions]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  useEffect(() => {
    if (pathname === routes.clients.list && filterOptions !== null) {
      loadClients();
    }
  }, [pathname, routes.clients.list, filterOptions, loadClients]);

  return {
    t,
    router,
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
  };
}
