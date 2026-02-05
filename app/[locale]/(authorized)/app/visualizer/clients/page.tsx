"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { DataTable, FilterPanel, Header } from "@/packages/design-system";
import { clientsService, type Client } from "@/packages/api/clients/clients.service";
import { teamsService } from "@/packages/api/teams/teams.service";
import type { FilterValues } from "@/packages/types/FilterPanel.types";
import type { SelectOption } from "@/packages/design-system";
import { createTableConfig, createFiltersConfig, processFilterOptions } from "./clients.config";

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

  const handleViewCalendar = useCallback(
    (client: Client) => {
      router.push(`/${locale}/app/visualizer/clients/${client.id}/calendar`);
    },
    [locale, router],
  );

  const handleViewTeams = useCallback(
    (client: Client) => {
      const path = `/${locale}/app/visualizer/clients/${client.id}`;
      router.push(path);
    },
    [locale, router],
  );

  const tableConfig = useMemo(
    () => createTableConfig(t, handleViewCalendar, handleViewTeams, clients),
    [t, handleViewCalendar, handleViewTeams, clients],
  );

  const filtersConfig = useMemo(() => createFiltersConfig(t, filterOptions), [t, filterOptions]);

  const loadFilterOptions = useCallback(async () => {
    try {
      const allTeams = await teamsService.getAll();
      setFilterOptions(processFilterOptions(allTeams));
    } catch (error) {
      console.error("Error loading filter options:", error);
      setFilterOptions({ teams: [] });
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
    const basePath = `/${locale}/app/visualizer/clients`;

    if (pathname === basePath && filterOptions !== null) {
      loadClients();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, locale]);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#FFFFFF" }}>
      <Header />
      <div className="flex-1 overflow-x-hidden pt-[71px] px-4 md:px-8 pb-4 md:pb-8">
        <div className="max-w-full overflow-x-hidden">
          <div className="mb-6 md:mb-8 flex items-center justify-between gap-3 flex-wrap min-w-0">
            <h1
              className="text-xl md:text-3xl font-bold min-w-0 truncate"
              style={{ color: "#000000" }}
            >
              {t("clients.title") || "Clients"}
            </h1>
          </div>

          <FilterPanel
            config={filtersConfig}
            initialValues={filters}
            onChange={setFilters}
            onClear={handleClearFilters}
          />

          <div className="w-full overflow-x-auto">
            <DataTable config={tableConfig} data={clients} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}
