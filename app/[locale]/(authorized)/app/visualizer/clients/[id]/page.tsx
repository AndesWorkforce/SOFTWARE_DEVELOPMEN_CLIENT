"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DataTable, FilterPanel, Header } from "@/packages/design-system";
import { contractorsService } from "@/packages/api/contractors/contractors.service";
import { clientsService } from "@/packages/api/clients/clients.service";
import { teamsService } from "@/packages/api/teams/teams.service";
import type { Contractor } from "@/packages/types/contractors.types";
import type { FilterValues } from "@/packages/types/FilterPanel.types";
import {
  createTableConfig,
  createFiltersConfig,
  processFilterOptions,
  filterContractorsLocal,
  type FilterOptions,
} from "./client-contractors.config";

export default function ClientContractorsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const clientId = params?.id;

  const [clientName, setClientName] = useState<string>("");
  const [contractorsRaw, setContractorsRaw] = useState<Contractor[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterValues>({});

  const handleViewCalendar = useCallback(
    (contractor: Contractor) => {
      const calendarPath = `/${locale}/app/visualizer/contractors/calendar/${contractor.id}`;
      router.push(calendarPath);
    },
    [locale, router],
  );

  const tableConfig = useMemo(
    () => createTableConfig(t, handleViewCalendar),
    [t, handleViewCalendar],
  );

  const filtersConfig = useMemo(() => createFiltersConfig(t, filterOptions), [t, filterOptions]);

  const loadFilterOptions = useCallback(async () => {
    if (!clientId) return;

    try {
      const [allContractors, allTeams] = await Promise.all([
        contractorsService.getAll(),
        teamsService.getAll(),
      ]);

      const options = processFilterOptions(allContractors, allTeams, clientId);
      setFilterOptions(options);
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

  const loadContractors = useCallback(async () => {
    if (!clientId) return;

    try {
      setLoading(true);
      const data = await contractorsService.getAll();
      const clientContractors = data.filter((c) => c.client_id === clientId && c.isActive);
      setContractorsRaw(clientContractors);

      const filtered = filterContractorsLocal(clientContractors, { ...filters, clientId });
      setContractors(filtered);
    } catch (error) {
      console.error("Error loading contractors:", error);
      setContractorsRaw([]);
      setContractors([]);
    } finally {
      setLoading(false);
    }
  }, [clientId, filters]);

  const loadClientName = useCallback(async () => {
    if (!clientId) return;

    try {
      const client = await clientsService.getById(clientId);
      setClientName(client.name);
    } catch (error) {
      console.error("Error loading client name:", error);
      setClientName("");
    }
  }, [clientId]);

  const handleClearFilters = useCallback(() => {
    setFilters({});
  }, []);

  useEffect(() => {
    if (clientId) {
      loadClientName();
      loadFilterOptions();
    }
  }, [clientId, loadClientName, loadFilterOptions]);

  useEffect(() => {
    if (clientId) {
      loadContractors();
    }
  }, [clientId, loadContractors]);

  useEffect(() => {
    const filtered = filterContractorsLocal(contractorsRaw, {
      ...filters,
      clientId: clientId || "",
    });
    setContractors(filtered);
  }, [filters, contractorsRaw, clientId]);

  if (!clientId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-600">{t("common.invalidClient")}</p>
        <Link
          href={`/${locale}/app/visualizer/clients`}
          className="mt-4 text-blue-600 hover:underline"
        >
          {t("common.backToClients")}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#FFFFFF" }}>
      <Header />
      <div className="flex-1 overflow-x-hidden pt-[71px] px-4 md:px-8 pb-4 md:pb-8">
        <div className="max-w-full overflow-x-hidden">
          <div className="mb-6 md:mb-8 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <Link
                href={`/${locale}/app/visualizer/clients`}
                className="text-black hover:opacity-70 transition-opacity"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-xl md:text-3xl font-bold" style={{ color: "#000000" }}>
                {clientName || t("contractors.title")}
              </h1>
            </div>
          </div>

          <FilterPanel
            config={filtersConfig}
            initialValues={filters}
            onChange={setFilters}
            onClear={handleClearFilters}
          />

          <div className="w-full overflow-x-auto">
            <DataTable config={tableConfig} data={contractors} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}
