"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ExportPdfModal from "./ExportPdfModal";
import { adtService, type RealtimeMetrics } from "@/packages/api/adt/adt.service";
import type { FilterOptions } from "@/packages/api/reports/reports.service";

export default function ExportPdfPage() {
  const searchParams = useSearchParams();
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const from = searchParams.get("from") || new Date().toISOString().split("T")[0];
        const to = searchParams.get("to") || from;

        const metrics = await adtService.getAllRealtimeMetrics({ from, to });

        const usersMap = new Map<string, string>();
        const countriesSet = new Set<string>();
        const clientsMap = new Map<string, string>();
        const teamsMap = new Map<string, string>();
        const jobPositionsSet = new Set<string>();

        metrics.forEach((metric: RealtimeMetrics) => {
          if (metric.contractor_name && metric.contractor_id) {
            usersMap.set(metric.contractor_id, metric.contractor_name);
          }
          if (metric.country) {
            countriesSet.add(metric.country);
          }
          if (metric.client_id && metric.client_name) {
            clientsMap.set(metric.client_id, metric.client_name);
          }
          if (metric.team_id && metric.team_name) {
            teamsMap.set(metric.team_id, metric.team_name);
          }
          if (metric.job_position) {
            jobPositionsSet.add(metric.job_position);
          }
        });

        setFilterOptions({
          users: Array.from(usersMap.entries()).map(([value, label]) => ({ value, label })),
          countries: Array.from(countriesSet)
            .sort()
            .map((country) => ({ value: country, label: country })),
          clients: Array.from(clientsMap.entries())
            .sort((a, b) => a[1].localeCompare(b[1]))
            .map(([value, label]) => ({ value, label })),
          teams: Array.from(teamsMap.entries())
            .sort((a, b) => a[1].localeCompare(b[1]))
            .map(([value, label]) => ({ value, label })),
          jobPositions: Array.from(jobPositionsSet)
            .sort()
            .map((jobPosition) => ({ value: jobPosition, label: jobPosition })),
        });
      } catch (error) {
        console.error("❌ Error loading filter options:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFilterOptions();
  }, [searchParams]);

  if (loading) {
    return null;
  }

  return <ExportPdfModal filterOptions={filterOptions} />;
}
