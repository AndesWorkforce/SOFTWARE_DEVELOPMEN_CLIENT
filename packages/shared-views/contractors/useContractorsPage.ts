"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { contractorsService } from "@/packages/api/contractors/contractors.service";
import { clientsService } from "@/packages/api/clients/clients.service";
import { teamsService } from "@/packages/api/teams/teams.service";
import type { Contractor } from "@/packages/types/contractors.types";
import type { FilterPanelConfig, FilterValues } from "@/packages/types/FilterPanel.types";
import type { SelectOption } from "@/packages/design-system";
import { useRoleRoutes, type Role } from "@/packages/role-utils";
import { getRolePermissions } from "@/packages/role-utils";

interface FilterOptions {
  countries: SelectOption[];
  clients: SelectOption[];
  teams: SelectOption[];
  jobPositions: SelectOption[];
}

export function useContractorsPage(role: Role) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const routes = useRoleRoutes(role);
  const permissions = getRolePermissions(role);

  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterValues>({});

  const handleEdit = useCallback(
    (contractor: Contractor) => {
      router.push(routes.contractors.edit(contractor.id));
    },
    [router, routes.contractors],
  );

  const handleDelete = useCallback(
    (contractor: Contractor) => {
      router.push(routes.contractors.delete(contractor.id));
    },
    [router, routes.contractors],
  );

  const handleViewCalendar = useCallback(
    (contractor: Contractor) => {
      router.push(routes.contractors.calendar(contractor.id));
    },
    [router, routes.contractors],
  );

  const filtersConfig = useMemo(() => {
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
  }, [filterOptions, t]);

  const loadFilterOptions = useCallback(async () => {
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
  }, []);

  const apiFilters = useMemo(() => {
    const result: {
      name?: string;
      country?: string;
      client_id?: string;
      team_id?: string;
      job_position?: string;
      isActive?: boolean;
    } = {
      isActive: true,
    };

    const name = typeof filters.name === "string" ? filters.name : "";
    const country = typeof filters.country === "string" ? filters.country : "";
    const clientId = typeof filters.clientId === "string" ? filters.clientId : "";
    const teamId = typeof filters.teamId === "string" ? filters.teamId : "";
    const jobPosition = typeof filters.jobPosition === "string" ? filters.jobPosition : "";

    if (name) result.name = name.trim();
    if (country) result.country = country.trim();
    if (clientId) result.client_id = clientId.trim();
    if (teamId) result.team_id = teamId.trim();
    if (jobPosition) result.job_position = jobPosition.trim();

    return result;
  }, [filters.name, filters.country, filters.clientId, filters.teamId, filters.jobPosition]);

  const loadContractors = useCallback(async () => {
    try {
      setLoading(true);
      const data = await contractorsService.getAll(apiFilters);
      setContractors(data);
    } catch (error) {
      console.error("Error loading contractors:", error);
      setContractors([]);
    } finally {
      setLoading(false);
    }
  }, [apiFilters]);

  const handleClearFilters = useCallback(() => {
    setFilters({});
  }, []);

  useEffect(() => {
    loadFilterOptions();
  }, [loadFilterOptions]);

  useEffect(() => {
    loadContractors();
  }, [loadContractors]);

  useEffect(() => {
    if (pathname === routes.contractors.list) {
      loadContractors();
    }
  }, [pathname, routes.contractors.list, loadContractors]);

  return {
    t,
    router,
    contractors,
    loading,
    filters,
    setFilters,
    handleEdit,
    handleDelete,
    handleViewCalendar,
    filtersConfig,
    handleClearFilters,
    routes,
    permissions,
  };
}
