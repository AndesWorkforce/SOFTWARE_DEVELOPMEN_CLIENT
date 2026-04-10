import type { Contractor } from "@/packages/types/contractors.types";
import type { FilterValues } from "@/packages/types/FilterPanel.types";
import type { SelectOption } from "@/packages/design-system";

export interface ClientContractorsFilterOptions {
  countries: SelectOption[];
  clients: SelectOption[];
  teams: SelectOption[];
  jobPositions: SelectOption[];
}

export function filterContractorsLocal(
  contractors: Contractor[],
  filters: FilterValues,
): Contractor[] {
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

/** Opciones de filtros para visualizer (lista global de contractors + equipos) */
export function processVisualizerFilterOptions(
  allContractors: Contractor[],
  allTeams: { id: string; name: string }[],
): ClientContractorsFilterOptions {
  const activeContractors = allContractors.filter((c) => c.isActive);
  const uniqueCountries = Array.from(
    new Set(
      activeContractors
        .map((c) => c.country)
        .filter((country): country is string => Boolean(country)),
    ),
  ).sort();
  const uniqueJobPositions = Array.from(
    new Set(
      activeContractors.map((c) => c.job_position).filter((pos): pos is string => Boolean(pos)),
    ),
  ).sort();

  return {
    countries: uniqueCountries.map((country) => ({ value: country, label: country })),
    clients: [],
    teams: allTeams
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((team) => ({ value: team.id, label: team.name })),
    jobPositions: uniqueJobPositions.map((pos) => ({ value: pos, label: pos })),
  };
}
