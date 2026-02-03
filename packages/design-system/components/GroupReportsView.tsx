"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import ReactCountryFlag from "react-country-flag";
import { 
  ArrowLeft, 
  FileText, 
  ChevronDown, 
  Calendar,
  Users,
  Target,
  Keyboard,
  Mouse,
  ChartNoAxesCombined,
  ChartNoAxesColumnIncreasing,
  ChartNoAxesColumnDecreasing,
  Hourglass,
  Earth,
  User,
  Briefcase,
  NotebookTabs
} from "lucide-react";
import { 
  Button, 
  DataTable,
  ProductivityDurationChart,
  getCountryCode,
  FilterCarouselMobile
} from "@/packages/design-system";
import {
  adtService,
  type RealtimeMetrics,
  type GroupedAvgDuration,
} from "@/packages/api/adt/adt.service";
import type { DataTableConfig } from "@/packages/types/DataTable.types";

// Componente interno para los selectores de fecha con estilo Figma
const ReportDateSelector = ({ 
  label, 
  value, 
  displayValue, 
  onChange, 
  icon 
}: { 
  label: string; 
  value: string; 
  displayValue: string;
  onChange: (val: string) => void; 
  icon: React.ReactNode;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.showPicker();
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="flex-1 bg-white border border-[rgba(166,166,166,0.5)] rounded-[5px] px-[15px] py-[10px] flex items-center justify-between relative cursor-pointer hover:bg-gray-50 transition-colors h-[56px] min-w-0"
    >
      <div className="flex items-center gap-[5px] min-w-0 flex-1">
        <div className="text-black shrink-0">{icon}</div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] text-[#6D6D6D] truncate mb-0">{label}</p>
          <p className="text-[14px] font-medium text-black truncate">
            {displayValue}
          </p>
        </div>
      </div>
      <ChevronDown className="w-6 h-6 text-black shrink-0 ml-2" />
      <input 
        ref={inputRef}
        type="date" 
        className="absolute inset-0 opacity-0 pointer-events-none" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

// Componente interno para los filtros select con estilo Figma
const FigmaSelectFilter = ({
  label,
  value,
  options,
  onChange,
  icon,
  disabled = false,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (val: string) => void;
  icon: React.ReactNode;
  disabled?: boolean;
}) => {
  const selectRef = useRef<HTMLSelectElement>(null);

  const handleClick = () => {
    if (!disabled && selectRef.current) {
      selectRef.current.focus();
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`flex-1 bg-white border border-[rgba(166,166,166,0.5)] rounded-[5px] px-[15px] py-[10px] flex items-center justify-between relative cursor-pointer hover:bg-gray-50 transition-colors h-[56px] min-w-0 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className="flex items-center gap-[5px] min-w-0 flex-1">
        <div className="text-black shrink-0">{icon}</div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] text-[#6D6D6D] truncate mb-0">{label}</p>
          <select
            ref={selectRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="text-[14px] font-medium text-black bg-transparent border-none outline-none cursor-pointer w-full appearance-none"
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <ChevronDown className="w-6 h-6 text-black shrink-0 ml-2" />
    </div>
  );
};

// Componente interno para el resumen de contratistas en mobile
const ContractorSummaryMobile = ({
  contractors,
  clientName,
  teamName,
  date,
}: {
  contractors: RealtimeMetrics[];
  clientName: string;
  teamName: string;
  date: string;
}) => {
  const t = useTranslations("reports");
  const [expandedContractors, setExpandedContractors] = useState<Set<string>>(new Set());

  const formatSecondsToTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m`;
  };

  const toggleContractor = (contractorId: string) => {
    const newExpanded = new Set(expandedContractors);
    if (newExpanded.has(contractorId)) {
      newExpanded.delete(contractorId);
    } else {
      newExpanded.add(contractorId);
    }
    setExpandedContractors(newExpanded);
  };

  const groupSummary = useMemo(() => {
    if (contractors.length === 0) return null;
    const totalSeconds = contractors.reduce((acc, m) => acc + m.total_session_time_seconds, 0);
    const avgSeconds = totalSeconds / contractors.length;
    const avgProductivity = Math.round(
      contractors.reduce((acc, m) => acc + m.productivity_score, 0) / contractors.length
    );
    return { contractors: contractors.length, avgSeconds, avgProductivity };
  }, [contractors]);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold text-black">{t("sessionSummary")}</h3>
        <p className="text-[#6D6D6D] text-sm font-light">
          Client {clientName} | Team {teamName}
        </p>
        <p className="text-[#6D6D6D] text-sm font-light">
          {new Date(date + "T12:00:00").toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>

      {groupSummary && (
        <div className="flex flex-col gap-2">
          <div className="bg-white border border-[rgba(166,166,166,0.5)] rounded-[5px] p-3 flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-lg">
              <NotebookTabs className="w-6 h-6 text-[#0097B2]" />
            </div>
            <div>
              <p className="text-[12px] text-[#6D6D6D]">{t("totalTeam")}</p>
              <p className="text-base font-semibold text-[#0097B2]">{groupSummary.contractors}</p>
            </div>
          </div>
          <div className="bg-white border border-[rgba(166,166,166,0.5)] rounded-[5px] p-3 flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-lg">
              <Hourglass className="w-6 h-6 text-[#0097B2]" />
            </div>
            <div>
              <p className="text-[12px] text-[#6D6D6D]">{t("totalAvgDuration")}</p>
              <p className="text-base font-semibold text-[#0097B2]">{formatSecondsToTime(groupSummary.avgSeconds)}</p>
            </div>
          </div>
          <div className="bg-white border border-[rgba(166,166,166,0.5)] rounded-[5px] p-3 flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-lg">
              <Target className="w-6 h-6 text-[#0097B2]" />
            </div>
            <div>
              <p className="text-[12px] text-[#6D6D6D]">{t("totalAvgProductivity")}</p>
              <p className="text-base font-semibold text-[#0097B2]">{groupSummary.avgProductivity}%</p>
            </div>
          </div>
        </div>
      )}

      <div className="border border-[rgba(166,166,166,0.5)] rounded-[10px] overflow-hidden shadow-[0px_4px_4px_rgba(166,166,166,0.25)]">
        <DataTable
          config={{
            columns: [
              {
                key: "contractor_name",
                title: "Contractor",
                dataPath: "contractor_name",
                type: "text",
                align: "center",
              },
              {
                key: "job_position",
                title: "Job Position",
                dataPath: "job_position",
                type: "text",
                align: "center",
              },
              {
                key: "country",
                title: "Country",
                dataPath: "country",
                type: "text",
                align: "center",
              },
              {
                key: "working_time",
                title: "Working Time",
                dataPath: (row) => formatSecondsToTime(row.total_session_time_seconds),
                type: "text",
                align: "center",
              },
              {
                key: "avg_active",
                title: "Average Active",
                dataPath: (row) => formatSecondsToTime(row.effective_work_seconds),
                type: "text",
                align: "center",
              },
              {
                key: "productivity",
                title: "Productivity",
                dataPath: (row) => Math.round(row.productivity_score || 0),
                type: "percentage",
                align: "center",
                config: {
                  percentage: {
                    thresholds: [{ value: 70, color: "#0097B2" }],
                    defaultColor: "#FF0004",
                  }
                }
              },
            ],
            rowKey: "contractor_id",
            striped: true,
            evenRowColor: "#E2E2E2",
            oddRowColor: "#FFFFFF",
          }}
          data={contractors}
          loading={false}
        />
      </div>
    </div>
  );
};

// Tipo local para opciones de filtro con parentValue
interface FilterOptionWithParent {
  value: string;
  label: string;
  parentValue?: string;
}

interface GroupFilterOptions {
  users: FilterOptionWithParent[];
  countries: FilterOptionWithParent[];
  clients: FilterOptionWithParent[];
  teams: FilterOptionWithParent[];
  jobPositions: FilterOptionWithParent[];
}

export function GroupReportsView({
  startDate: initialStartDate,
  endDate: initialEndDate,
  country: initialCountry,
  clientId: initialClientId,
  teamId: initialTeamId,
  jobPosition: initialJobPosition,
  onBack,
}: {
  startDate: string;
  endDate: string;
  country: string;
  clientId: string;
  teamId: string;
  jobPosition: string;
  onBack: () => void;
}) {
  const t = useTranslations("reports");
  const locale = useLocale();

  const [startDate, setStartDate] = useState<string>(initialStartDate);
  const [endDate, setEndDate] = useState<string>(initialEndDate);
  const [country, setCountry] = useState(initialCountry);
  const [clientId, setClientId] = useState(initialClientId);
  const [teamId, setTeamId] = useState(initialTeamId);
  const [jobPosition, setJobPosition] = useState(initialJobPosition);

  const [metrics, setMetrics] = useState<RealtimeMetrics[]>([]);
  const [filterOptions, setFilterOptions] = useState<GroupFilterOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [groupedDurationData, setGroupedDurationData] = useState<GroupedAvgDuration[]>([]);

  const formatSecondsToTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toLocaleString()}h ${minutes.toString().padStart(2, "0")}m`;
  };

  const formatDateForDisplay = (dateStr: string) => {
    try {
      const date = new Date(dateStr + "T12:00:00"); 
      return date.toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
        month: "long",
        year: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  const extractFilterOptionsFromMetrics = (metrics: RealtimeMetrics[]): GroupFilterOptions => {
    const countriesSet = new Set<string>();
    const clientsMap = new Map<string, string>();
    const teamsMap = new Map<string, { teamId: string; name: string; clientId: string }>();
    const jobPositionsSet = new Set<string>();

    metrics.forEach((metric) => {
      if (metric.country) {
        countriesSet.add(metric.country);
      }
      if (metric.client_id && metric.client_name) {
        clientsMap.set(metric.client_id, metric.client_name);
      }
      if (metric.team_id && metric.team_name && metric.client_id) {
        const compositeKey = `${metric.team_id}-${metric.client_id}`;
        teamsMap.set(compositeKey, { 
          teamId: metric.team_id, 
          name: metric.team_name, 
          clientId: metric.client_id 
        });
      }
      if (metric.job_position) {
        jobPositionsSet.add(metric.job_position);
      }
    });

    const teamsResult = Array.from(teamsMap.values())
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((data) => ({ value: data.teamId, label: data.name, parentValue: data.clientId }));
    
    const clientsResult = Array.from(clientsMap.entries())
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([value, label]) => ({ value, label }));

    return {
      users: [],
      countries: Array.from(countriesSet)
        .sort()
        .map((country) => ({ value: country, label: country })),
      clients: clientsResult,
      teams: teamsResult,
      jobPositions: Array.from(jobPositionsSet)
        .sort()
        .map((position) => ({ value: position, label: position })),
    };
  };

  const loadFilterOptions = async () => {
    try {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);

      const fromDate = thirtyDaysAgo.toISOString().split("T")[0];
      const toDate = today.toISOString().split("T")[0];

      const allMetrics = await adtService.getAllRealtimeMetrics({
        from: fromDate,
        to: toDate,
        useCache: true,
      });

      const extractedOptions = extractFilterOptionsFromMetrics(allMetrics || []);
      setFilterOptions(extractedOptions);
    } catch (error) {
      console.error("❌ Error loading filter options:", error);
      setFilterOptions({
        users: [],
        countries: [],
        clients: [],
        teams: [],
        jobPositions: [],
      });
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const adtFilters = {
        from: startDate,
        to: endDate,
        country: country,
        client_id: clientId,
        team_id: teamId,
        job_position: jobPosition,
        useCache: true,
      };

      const result = await adtService.getAllRealtimeMetrics(adtFilters);
      setMetrics(result || []);
    } catch (error) {
      console.error("Error loading group metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    if (teamId && clientId) {
      const currentTeam = filterOptions?.teams?.find(t => t.value === teamId);
      if (currentTeam && currentTeam.parentValue !== clientId) {
        setTeamId("");
      }
    } else if (teamId && !clientId) {
      setTeamId("");
    }
  }, [clientId, filterOptions?.teams, teamId]);

  useEffect(() => {
    loadData();
  }, [startDate, endDate, country, clientId, teamId, jobPosition]);

  const loadGroupedDurationData = async () => {
    try {
      const data = await adtService.getGroupedAvgSessionDuration(
        startDate,
        endDate,
        clientId || undefined,
        teamId || undefined,
        jobPosition || undefined,
        country || undefined,
        30
      );
      setGroupedDurationData(data);
    } catch (error) {
      console.error("Error loading grouped duration data:", error);
      setGroupedDurationData([]);
    }
  };

  useEffect(() => {
    loadGroupedDurationData();
  }, [startDate, endDate, clientId, teamId, jobPosition, country]);

  const summaryMetrics = useMemo(() => {
    if (metrics.length === 0) return null;

    const totalContractors = metrics.length;
    const avgProductivity = Math.round(metrics.reduce((acc, m) => acc + m.productivity_score, 0) / totalContractors);
    const totalKeyboard = metrics.reduce((acc, m) => acc + m.total_keyboard_inputs, 0);
    const totalMouse = metrics.reduce((acc, m) => acc + m.total_mouse_clicks, 0);

    const sortedByActivity = [...metrics].sort((a, b) => b.active_percentage - a.active_percentage);
    const mostActive = sortedByActivity[0];
    const leastActive = sortedByActivity[sortedByActivity.length - 1];

    const totalSeconds = metrics.reduce((acc, m) => acc + m.total_session_time_seconds, 0);
    const totalActiveSeconds = metrics.reduce((acc, m) => acc + m.effective_work_seconds, 0);
    const totalIdleSeconds = metrics.reduce((acc, m) => acc + (m.idle_beats * 15), 0);

    const avgSeconds = totalSeconds / totalContractors;
    const avgActiveSeconds = totalActiveSeconds / totalContractors;
    const avgIdleSeconds = totalIdleSeconds / totalContractors;

    const clientsSet = new Set(metrics.map(m => m.client_id).filter(Boolean));
    const teamsSet = new Set(metrics.map(m => m.team_id).filter(Boolean));
    const totalSessions = metrics.reduce((acc, m) => acc + (m.total_beats / 4), 0);

    return {
      totalContractors,
      avgProductivity,
      totalKeyboard,
      totalMouse,
      mostActive,
      leastActive,
      totalSeconds,
      avgSeconds,
      avgActiveSeconds,
      avgIdleSeconds,
      totalClients: clientsSet.size,
      totalTeams: teamsSet.size,
      totalSessions: Math.round(totalSessions),
    };
  }, [metrics]);

  const chartData = useMemo(() => {
    return groupedDurationData.map(item => ({
      hour: item.group_name,
      duration: item.avg_duration_hours,
      productivity: 0
    }));
  }, [groupedDurationData]);

  const groupedMetrics = useMemo(() => {
    if (!metrics.length) return [];

    let filteredMetrics = metrics;
    if (jobPosition) {
      filteredMetrics = metrics.filter(m => m.job_position === jobPosition);
    }

    if (clientId && teamId) {
      return [{
        clientId,
        clientName: filterOptions?.clients.find(c => c.value === clientId)?.label || "Unknown",
        teamId,
        teamName: filterOptions?.teams.find(t => t.value === teamId)?.label || "Unknown",
        contractors: filteredMetrics.filter(m => m.client_id === clientId && m.team_id === teamId)
      }];
    }

    if (clientId) {
      const clientMetrics = filteredMetrics.filter(m => m.client_id === clientId);
      const teamsMap = new Map<string, { teamId: string; teamName: string; contractors: RealtimeMetrics[] }>();
      
      clientMetrics.forEach(metric => {
        if (metric.team_id && metric.team_name) {
          if (!teamsMap.has(metric.team_id)) {
            teamsMap.set(metric.team_id, {
              teamId: metric.team_id,
              teamName: metric.team_name,
              contractors: []
            });
          }
          teamsMap.get(metric.team_id)!.contractors.push(metric);
        }
      });

      const clientName = filterOptions?.clients.find(c => c.value === clientId)?.label || "Unknown";
      return Array.from(teamsMap.values()).map(team => ({
        clientId,
        clientName,
        teamId: team.teamId,
        teamName: team.teamName,
        contractors: team.contractors
      }));
    }

    const clientsMap = new Map<string, {
      clientId: string;
      clientName: string;
      teams: Map<string, { teamId: string; teamName: string; contractors: RealtimeMetrics[] }>;
    }>();

    filteredMetrics.forEach(metric => {
      if (!metric.client_id || !metric.client_name) return;
      
      if (!clientsMap.has(metric.client_id)) {
        clientsMap.set(metric.client_id, {
          clientId: metric.client_id,
          clientName: metric.client_name,
          teams: new Map()
        });
      }

      const client = clientsMap.get(metric.client_id)!;
      
      if (metric.team_id && metric.team_name) {
        if (!client.teams.has(metric.team_id)) {
          client.teams.set(metric.team_id, {
            teamId: metric.team_id,
            teamName: metric.team_name,
            contractors: []
          });
        }
        client.teams.get(metric.team_id)!.contractors.push(metric);
      }
    });

    const result: Array<{
      clientId: string;
      clientName: string;
      teamId: string;
      teamName: string;
      contractors: RealtimeMetrics[];
    }> = [];

    clientsMap.forEach(client => {
      client.teams.forEach(team => {
        result.push({
          clientId: client.clientId,
          clientName: client.clientName,
          teamId: team.teamId,
          teamName: team.teamName,
          contractors: team.contractors
        });
      });
    });

    return result;
  }, [metrics, clientId, teamId, jobPosition, filterOptions]);

  const tableConfig: DataTableConfig<RealtimeMetrics> = useMemo(() => ({
    columns: [
      {
        key: "contractor_name",
        title: "Contractor",
        dataPath: "contractor_name",
        type: "text",
        align: "center",
      },
      {
        key: "job_position",
        title: "Job Position",
        dataPath: "job_position",
        type: "text",
        align: "center",
      },
      {
        key: "country",
        title: "Country",
        dataPath: "country",
        type: "text",
        align: "center",
      },
      {
        key: "working_time",
        title: "Working Time",
        dataPath: (row) => formatSecondsToTime(row.total_session_time_seconds),
        type: "text",
        align: "center",
      },
      {
        key: "avg_active",
        title: "Average Active",
        dataPath: (row) => formatSecondsToTime(row.effective_work_seconds),
        type: "text",
        align: "center",
      },
      {
        key: "productivity",
        title: "Productivity",
        dataPath: (row) => Math.round(row.productivity_score || 0),
        type: "percentage",
        align: "center",
        config: {
          percentage: {
            thresholds: [{ value: 70, color: "#0097B2" }],
            defaultColor: "#FF0004",
          }
        }
      },
    ],
    rowKey: "contractor_id",
    striped: true,
    evenRowColor: "#E2E2E2",
    oddRowColor: "#FFFFFF",
  }), []);

  return (
    <div className="p-2 md:p-8 min-h-screen bg-[#FFFFFF] w-full" style={{ overflowX: 'hidden', boxSizing: 'border-box' }}>
      <div className="max-w-full flex flex-col gap-4 md:gap-6 w-full" style={{ boxSizing: 'border-box' }}>
        
        {/* Header Section */}
        <div className="flex items-center justify-between w-full max-w-full min-w-0 overflow-hidden">
          <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1 overflow-hidden">
            {onBack && (
              <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-full transition-colors text-black shrink-0">
                <ArrowLeft className="w-6 h-6" />
              </button>
            )}
            <h1 className="text-xl md:text-2xl font-semibold text-black truncate min-w-0">{t("previewReport")}</h1>
          </div>
          <Button
            variant="primary"
            style={{
              background: "#9CA3AF",
              color: "#FFFFFF",
              fontSize: "14px",
              padding: "7px 21px",
              height: "35px",
              fontWeight: 600,
              boxShadow: "0px 4px 4px rgba(166,166,166,0.25)"
            }}
            className="shrink-0 ml-2"
          >
            <FileText className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">{t("exportPdf")}</span>
            <span className="sm:hidden">PDF</span>
          </Button>
        </div>

        {/* Mobile Layout */}
        <div className="flex flex-col lg:hidden gap-1 md:gap-5 w-full min-w-0" style={{ overflowX: 'hidden' }}>
          {/* Filtros - Carousel Mobile */}
          <div className="w-full min-w-0 overflow-hidden" style={{ boxSizing: 'border-box', maxWidth: '100%', width: '100%' }}>
            <FilterCarouselMobile>
              <ReportDateSelector 
                label={t("date")} 
                value={startDate} 
                displayValue={formatDateForDisplay(startDate)}
                onChange={setStartDate}
                icon={<Calendar className="w-[25px] h-[25px]" />}
              />
              
              <ReportDateSelector 
                label="To" 
                value={endDate} 
                displayValue={formatDateForDisplay(endDate)}
                onChange={setEndDate}
                icon={<Calendar className="w-[25px] h-[25px]" />}
              />

              <FigmaSelectFilter
                label={t("country")}
                value={country}
                options={[{ value: "", label: "All" }, ...(filterOptions?.countries || [])]}
                onChange={setCountry}
                icon={<Earth className="w-[25px] h-[25px]" />}
              />
              
              <FigmaSelectFilter
                label={t("client")}
                value={clientId}
                options={[{ value: "", label: "All" }, ...(filterOptions?.clients || [])]}
                onChange={setClientId}
                icon={<User className="w-[25px] h-[25px]" />}
              />

              <FigmaSelectFilter
                label={t("team")}
                value={teamId}
                options={[
                  { value: "", label: clientId ? "All" : "Select..." },
                  ...(clientId 
                    ? (filterOptions?.teams || []).filter(team => team.parentValue === clientId)
                    : []
                  )
                ]}
                onChange={setTeamId}
                icon={<Users className="w-[25px] h-[25px]" />}
                disabled={!clientId}
              />

              <FigmaSelectFilter
                label={t("jobPosition")}
                value={jobPosition}
                options={[
                  { value: "", label: teamId ? "All" : "Select..." },
                  ...(teamId ? (filterOptions?.jobPositions || []) : [])
                ]}
                onChange={setJobPosition}
                icon={<Briefcase className="w-[25px] h-[25px]" />}
                disabled={!teamId}
              />
            </FilterCarouselMobile>
          </div>

          {loading ? (
            <div className="p-20 text-center text-black">{t("loading")}</div>
          ) : (
            <>
              {/* Summary Metrics - Mobile */}
              <div className="bg-white border border-[rgba(166,166,166,0.5)] rounded-[5px] px-[17px] py-[28px] flex flex-col gap-[10px] w-full">
                <h3 className="text-[16px] font-semibold text-black">{t("summaryMetrics")}</h3>
                <div className="flex flex-col gap-[10px] w-full">
                  <div className="flex gap-[10px] w-full">
                    <div className="bg-white border border-[rgba(166,166,166,0.25)] rounded-[5px] p-[10px] flex-1 flex items-center gap-[10px] h-[63px]">
                      <Users className="w-[30px] h-[30px] text-black shrink-0" />
                      <div className="flex flex-col items-start leading-none min-w-0">
                        <p className="text-[12px] font-light text-black mb-1">{t("totalContractors")}</p>
                        <p className="text-[20px] font-semibold text-black">{summaryMetrics?.totalContractors || 0}</p>
                      </div>
                    </div>
                    <div className="bg-white border border-[rgba(166,166,166,0.25)] rounded-[5px] p-[10px] flex-1 flex items-center gap-[10px] h-[63px]">
                      <ChartNoAxesCombined className="w-[30px] h-[30px] text-black shrink-0" />
                      <div className="flex flex-col items-start leading-none min-w-0">
                        <p className="text-[12px] font-light text-black mb-1">{t("averageProductivity")}</p>
                        <p className="text-[20px] font-semibold text-[#0097B2]">{summaryMetrics?.avgProductivity || 0}%</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-[10px] w-full">
                    <div className="bg-white border border-[rgba(166,166,166,0.25)] rounded-[5px] p-[10px] flex-1 flex items-center gap-[10px] h-[63px]">
                      <Keyboard className="w-[30px] h-[30px] text-black shrink-0" />
                      <div className="flex flex-col items-start leading-none min-w-0">
                        <p className="text-[12px] font-light text-black mb-1">{t("totalKeyboardInputs")}</p>
                        <p className="text-[20px] font-semibold text-black">{summaryMetrics?.totalKeyboard.toLocaleString() || 0}</p>
                      </div>
                    </div>
                    <div className="bg-white border border-[rgba(166,166,166,0.25)] rounded-[5px] p-[10px] flex-1 flex items-center gap-[10px] h-[63px]">
                      <Mouse className="w-[30px] h-[30px] text-black shrink-0" />
                      <div className="flex flex-col items-start leading-none min-w-0">
                        <p className="text-[12px] font-light text-black mb-1">{t("totalMouseInputs")}</p>
                        <p className="text-[20px] font-semibold text-black">{summaryMetrics?.totalMouse.toLocaleString() || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Most Active and Least Active - Mobile (lado a lado) */}
              <div className="flex gap-[10px] w-full">
                <div className="bg-white border border-[rgba(166,166,166,0.5)] rounded-[5px] p-[10px] flex-1 flex items-center gap-[10px] h-[68px]">
                  <ChartNoAxesColumnIncreasing className="w-[30px] h-[30px] text-[#0097B2] shrink-0" />
                  <div className="flex-1 min-w-0 flex flex-col">
                    <p className="text-[9px] font-light text-[#0097B2] leading-none mb-1">{t("mostActiveContractor")}</p>
                    <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                      <p className="text-[11px] font-semibold text-black truncate min-w-0">{summaryMetrics?.mostActive?.contractor_name || "N/A"}</p>
                      {summaryMetrics?.mostActive?.country && getCountryCode(summaryMetrics.mostActive.country) && (
                        <ReactCountryFlag
                          countryCode={getCountryCode(summaryMetrics.mostActive.country)!}
                          svg
                          style={{
                            width: '12px',
                            height: '12px',
                          }}
                          title={summaryMetrics.mostActive.country}
                          className="shrink-0"
                        />
                      )}
                      <div className="bg-[rgba(51,211,117,0.5)] px-[10px] py-[3px] rounded-[5px] flex items-center justify-center shrink-0">
                        <span className="text-[9px] font-medium text-[#166534] leading-none">
                          {Math.round(summaryMetrics?.mostActive?.active_percentage || 0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-[rgba(166,166,166,0.5)] rounded-[5px] p-[10px] flex-1 flex items-center gap-[10px] h-[68px]">
                  <ChartNoAxesColumnDecreasing className="w-[30px] h-[30px] text-[#FF0004] shrink-0" />
                  <div className="flex-1 min-w-0 flex flex-col">
                    <p className="text-[9px] font-light text-[#FF0004] leading-none mb-1">{t("leastActiveContractor")}</p>
                    <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                      <p className="text-[11px] font-semibold text-black truncate min-w-0">{summaryMetrics?.leastActive?.contractor_name || "N/A"}</p>
                      {summaryMetrics?.leastActive?.country && getCountryCode(summaryMetrics.leastActive.country) && (
                        <ReactCountryFlag
                          countryCode={getCountryCode(summaryMetrics.leastActive.country)!}
                          svg
                          style={{
                            width: '12px',
                            height: '12px',
                          }}
                          title={summaryMetrics.leastActive.country}
                          className="shrink-0"
                        />
                      )}
                      <div className="bg-[rgba(255,0,4,0.25)] px-[10px] py-[3px] rounded-[5px] flex items-center justify-center shrink-0">
                        <span className="text-[9px] font-medium text-[#FF0004] leading-none">
                          {Math.round(summaryMetrics?.leastActive?.active_percentage || 0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Time Breakdown - Mobile */}
              <div className="bg-white border border-[rgba(166,166,166,0.5)] rounded-[5px] px-[20px] py-[28px] flex flex-col gap-[15px] w-full">
                <h3 className="text-[16px] font-semibold text-black">{t("modal.timeBreakdown")}</h3>
                <div className="flex items-center justify-between w-full gap-[5px]">
                  <div className="flex flex-col items-center min-w-0 flex-1">
                    <p className="text-[20px] font-semibold text-black">{formatSecondsToTime(summaryMetrics?.totalSeconds || 0)}</p>
                    <p className="text-[12px] font-light text-black">{t("totalTimeWorked")}</p>
                  </div>
                  <div className="flex flex-col items-center min-w-0 flex-1">
                    <div className="flex items-center gap-[5px] mb-1">
                      <div className="w-[10px] h-[10px] rounded-full bg-[#0097B2] shrink-0" />
                      <span className="text-[12px] font-light text-black">{t("averageActivity")}</span>
                    </div>
                    <p className="text-[20px] font-semibold text-black">{formatSecondsToTime(summaryMetrics?.avgActiveSeconds || 0)}</p>
                  </div>
                  <div className="flex flex-col items-center min-w-0 flex-1">
                    <div className="flex items-center gap-[5px] mb-1">
                      <div className="w-[10px] h-[10px] rounded-full bg-[#FF0004] shrink-0" />
                      <span className="text-[12px] font-light text-black">{t("averageIdle")}</span>
                    </div>
                    <p className="text-[20px] font-semibold text-black">{formatSecondsToTime(summaryMetrics?.avgIdleSeconds || 0)}</p>
                  </div>
                </div>
              </div>

              {/* Sessions & Connectivity - Mobile */}
              <div className="bg-white border border-[rgba(166,166,166,0.5)] rounded-[5px] px-[20px] py-[28px] flex flex-col gap-[25px] w-full overflow-hidden">
                <h3 className="text-[16px] font-semibold text-black">{t("modal.sessionConnectivity")}</h3>
                <div className="flex gap-[10px] w-full">
                  <div className="bg-white border border-[rgba(166,166,166,0.45)] rounded-[5px] p-[10px] flex-1 flex flex-col justify-center min-w-0">
                    <p className="text-[10px] font-light text-black">{t("totalClients")}</p>
                    <p className="text-[20px] font-semibold text-[#0097B2]">{summaryMetrics?.totalClients || 0}</p>
                  </div>
                  <div className="bg-white border border-[rgba(166,166,166,0.25)] rounded-[5px] p-[10px] flex-1 flex flex-col justify-center min-w-0">
                    <p className="text-[10px] font-light text-black">{t("totalTeams")}</p>
                    <p className="text-[20px] font-semibold text-[#0097B2]">{summaryMetrics?.totalTeams || 0}</p>
                  </div>
                  <div className="bg-white border border-[rgba(166,166,166,0.25)] rounded-[5px] p-[10px] flex-1 flex flex-col justify-center min-w-0">
                    <p className="text-[10px] font-light text-black">{t("totalSessionCount")}</p>
                    <p className="text-[20px] font-semibold text-[#0097B2]">{summaryMetrics?.totalSessions || 0}</p>
                  </div>
                </div>
                <div className="w-full min-h-[280px] overflow-hidden">
                  <ProductivityDurationChart hourlyData={chartData} />
                </div>
              </div>

              {/* Session Summary - Mobile */}
              {groupedMetrics.length > 0 ? (
                groupedMetrics.map((group, groupIndex) => (
                  <div key={`${group.clientId}-${group.teamId}-${groupIndex}`} className="bg-white border border-[rgba(166,166,166,0.5)] rounded-[5px] px-[20px] py-[28px] w-full">
                    <ContractorSummaryMobile
                      contractors={group.contractors}
                      clientName={group.clientName}
                      teamName={group.teamName}
                      date={startDate}
                    />
                  </div>
                ))
              ) : (
                <div className="bg-white border border-[rgba(166,166,166,0.5)] rounded-[5px] p-5 w-full">
                  <p className="text-base text-gray-500 text-center">{t("noActivities")}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex flex-col gap-6 w-full">
          {/* Filters Section (Figma style) */}
          <div className="flex flex-col md:flex-row gap-[10px] w-full">
          <ReportDateSelector 
            label={t("date")} 
            value={startDate} 
            displayValue={formatDateForDisplay(startDate)}
            onChange={setStartDate}
            icon={<Calendar className="w-7 h-7" />}
          />
          <ReportDateSelector 
            label="To" 
            value={endDate} 
            displayValue={formatDateForDisplay(endDate)}
            onChange={setEndDate}
            icon={<Calendar className="w-7 h-7" />}
          />
          <FigmaSelectFilter
            label={t("country")}
            value={country}
            options={[{ value: "", label: "All" }, ...(filterOptions?.countries || [])]}
            onChange={setCountry}
            icon={<Earth className="w-[30px] h-[30px]" />}
          />
          <FigmaSelectFilter
            label={t("client")}
            value={clientId}
            options={[{ value: "", label: "All" }, ...(filterOptions?.clients || [])]}
            onChange={setClientId}
            icon={<User className="w-[30px] h-[30px]" />}
          />
          <FigmaSelectFilter
            label={t("team")}
            value={teamId}
            options={[
              { value: "", label: clientId ? "All" : "Select..." },
              ...(clientId 
                ? (filterOptions?.teams || []).filter(team => team.parentValue === clientId)
                : []
              )
            ]}
            onChange={setTeamId}
            icon={<Users className="w-[30px] h-[30px]" />}
            disabled={!clientId}
          />
          <FigmaSelectFilter
            label={t("jobPosition")}
            value={jobPosition}
            options={[
              { value: "", label: teamId ? "All" : "Select..." },
              ...(teamId ? (filterOptions?.jobPositions || []) : [])
            ]}
            onChange={setJobPosition}
            icon={<Briefcase className="w-[30px] h-[30px]" />}
            disabled={!teamId}
          />
        </div>

        {loading ? (
          <div className="p-20 text-center text-black">{t("loading")}</div>
        ) : (
          <>
            {/* Top Cards Section */}
            <div className="flex flex-col lg:flex-row gap-5">
              {/* Summary Metrics */}
              <div className="bg-white border border-[rgba(166,166,166,0.5)] rounded-[5px] px-[17px] py-[28px] flex flex-col gap-[10px] w-full lg:w-[45%]">
                <h3 className="text-[20px] font-semibold text-black leading-none mb-2">{t("summaryMetrics")}</h3>
                <div className="flex flex-col gap-[10px]">
                  <div className="flex gap-[10px]">
                    {/* Total Contractors */}
                    <div className="bg-white border border-[rgba(166,166,166,0.25)] rounded-[5px] p-[10px] flex-1 flex items-center gap-[10px] h-[63px]">
                      <Users className="w-[30px] h-[30px] text-black" />
                      <div className="flex flex-col items-start leading-none">
                        <p className="text-[12px] font-light text-black mb-1">{t("totalContractors")}</p>
                        <p className="text-[20px] font-semibold text-black">{summaryMetrics?.totalContractors || 0}</p>
                      </div>
                    </div>
                    {/* Average Productivity */}
                    <div className="bg-white border border-[rgba(166,166,166,0.25)] rounded-[5px] p-[10px] flex-1 flex items-center gap-[10px] h-[63px]">
                      <ChartNoAxesCombined className="w-[30px] h-[30px] text-black" />
                      <div className="flex flex-col items-start leading-none">
                        <p className="text-[12px] font-light text-black mb-1">{t("averageProductivity")}</p>
                        <p className="text-[20px] font-semibold text-[#0097B2]">{summaryMetrics?.avgProductivity || 0}%</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-[10px]">
                    {/* Total Keyboard */}
                    <div className="bg-white border border-[rgba(166,166,166,0.25)] rounded-[5px] p-[10px] flex-1 flex items-center gap-[10px] h-[63px]">
                      <Keyboard className="w-[30px] h-[30px] text-black" />
                      <div className="flex flex-col items-start leading-none">
                        <p className="text-[12px] font-light text-black mb-1">{t("totalKeyboardInputs")}</p>
                        <p className="text-[20px] font-semibold text-black">{summaryMetrics?.totalKeyboard.toLocaleString() || 0}</p>
                      </div>
                    </div>
                    {/* Total Mouse */}
                    <div className="bg-white border border-[rgba(166,166,166,0.25)] rounded-[5px] p-[10px] flex-1 flex items-center gap-[10px] h-[63px]">
                      <Mouse className="w-[30px] h-[30px] text-black" />
                      <div className="flex flex-col items-start leading-none">
                        <p className="text-[12px] font-light text-black mb-1">{t("totalMouseInputs")}</p>
                        <p className="text-[20px] font-semibold text-black">{summaryMetrics?.totalMouse.toLocaleString() || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Contractors and Time Breakdown */}
              <div className="flex flex-col gap-5 flex-1">
                {/* Rankings */}
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Most Active Contractor */}
                  <div className="bg-white border border-[rgba(166,166,166,0.5)] rounded-[5px] p-[10px] flex-1 flex items-center gap-[10px]">
                    <ChartNoAxesColumnIncreasing className="w-[30px] h-[30px] text-[#0097B2] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-light text-[#0097B2] leading-none mb-1">{t("mostActiveContractor")}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[14px] font-semibold text-black truncate">{summaryMetrics?.mostActive?.contractor_name || "N/A"}</p>
                        {summaryMetrics?.mostActive?.country && getCountryCode(summaryMetrics.mostActive.country) && (
                          <ReactCountryFlag
                            countryCode={getCountryCode(summaryMetrics.mostActive.country)!}
                            svg
                            style={{
                              width: '20px',
                              height: '20px',
                            }}
                            title={summaryMetrics.mostActive.country}
                          />
                        )}
                        <div className="bg-[rgba(51,211,117,0.5)] px-[15px] py-[4px] rounded-[5px] h-[22px] flex items-center justify-center shrink-0">
                          <span className="text-[15px] font-medium text-[#166534] leading-none">
                            {Math.round(summaryMetrics?.mostActive?.active_percentage || 0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Least Active Contractor */}
                  <div className="bg-white border border-[rgba(166,166,166,0.5)] rounded-[5px] p-[10px] flex-1 flex items-center gap-[10px]">
                    <ChartNoAxesColumnDecreasing className="w-[30px] h-[30px] text-[#FF0004] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-light text-[#FF0004] leading-none mb-1">{t("leastActiveContractor")}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[14px] font-semibold text-black truncate">{summaryMetrics?.leastActive?.contractor_name || "N/A"}</p>
                        {summaryMetrics?.leastActive?.country && getCountryCode(summaryMetrics.leastActive.country) && (
                          <ReactCountryFlag
                            countryCode={getCountryCode(summaryMetrics.leastActive.country)!}
                            svg
                            style={{
                              width: '20px',
                              height: '20px',
                            }}
                            title={summaryMetrics.leastActive.country}
                          />
                        )}
                        <div className="bg-[rgba(255,0,4,0.25)] px-[15px] py-[4px] rounded-[5px] h-[22px] flex items-center justify-center shrink-0">
                          <span className="text-[15px] font-medium text-[#FF0004] leading-none">
                            {Math.round(summaryMetrics?.leastActive?.active_percentage || 0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Time Breakdown */}
                <div className="bg-white border border-[rgba(166,166,166,0.5)] rounded-[5px] p-6 flex flex-col gap-4">
                  <h3 className="text-xl font-semibold text-black">{t("modal.timeBreakdown")}</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xl font-semibold text-black">{formatSecondsToTime(summaryMetrics?.totalSeconds || 0)}</p>
                      <p className="text-[12px] font-light text-black">{t("totalTimeWorked")}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#0097B2]" />
                        <span className="text-[12px] font-light text-black">{t("averageActivity")}</span>
                      </div>
                      <p className="text-xl font-semibold text-black">{formatSecondsToTime(summaryMetrics?.avgActiveSeconds || 0)}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#FF0004]" />
                        <span className="text-[12px] font-light text-black">{t("averageIdle")}</span>
                      </div>
                      <p className="text-xl font-semibold text-black">{formatSecondsToTime(summaryMetrics?.avgIdleSeconds || 0)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sessions & Connectivity Section */}
            <div className="bg-white border border-[rgba(166,166,166,0.5)] rounded-[5px] p-6 flex flex-col gap-6">
              <h3 className="text-xl font-semibold text-black">{t("modal.sessionConnectivity")}</h3>
              <div className="flex gap-4">
                <div className="bg-white border border-[rgba(166,166,166,0.25)] rounded-[5px] p-3 flex-1 flex flex-col justify-center">
                  <p className="text-[12px] font-light text-black">{t("totalClients")}</p>
                  <p className="text-xl font-semibold text-[#0097B2]">{summaryMetrics?.totalClients || 0}</p>
                </div>
                <div className="bg-white border border-[rgba(166,166,166,0.25)] rounded-[5px] p-3 flex-1 flex flex-col justify-center">
                  <p className="text-[12px] font-light text-black">{t("totalTeams")}</p>
                  <p className="text-xl font-semibold text-[#0097B2]">{summaryMetrics?.totalTeams || 0}</p>
                </div>
                <div className="bg-white border border-[rgba(166,166,166,0.25)] rounded-[5px] p-3 flex-1 flex flex-col justify-center">
                  <p className="text-[12px] font-light text-black">{t("totalSessionCount")}</p>
                  <p className="text-xl font-semibold text-[#0097B2]">{summaryMetrics?.totalSessions || 0}</p>
                </div>
              </div>
              <div className="h-[300px]">
                <ProductivityDurationChart hourlyData={chartData} />
              </div>
            </div>

            {/* Session Summary Table */}
            <div className="bg-white border border-[rgba(166,166,166,0.5)] rounded-[5px] p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h3 className="text-xl font-semibold text-black">Session Summary</h3>
                <p className="text-[#6D6D6D] text-sm font-light">{formatDateForDisplay(startDate)}</p>
              </div>
              
              {loading ? (
                <div className="p-20 text-center text-black">{t("loading")}</div>
              ) : groupedMetrics.length === 0 ? (
                <div className="p-20 text-center text-black">{t("noActivities")}</div>
              ) : (
                groupedMetrics.map((group, groupIndex) => {
                  const contractors = group.contractors;
                  let groupSummary: { contractors: number; avgSeconds: number; avgProductivity: number } | null = null;
                  if (contractors.length > 0) {
                    const totalSeconds = contractors.reduce((acc, m) => acc + m.total_session_time_seconds, 0);
                    const avgSeconds = totalSeconds / contractors.length;
                    const avgProductivity = Math.round(
                      contractors.reduce((acc, m) => acc + m.productivity_score, 0) / contractors.length
                    );
                    groupSummary = { contractors: contractors.length, avgSeconds, avgProductivity };
                  }

                  return (
                    <div key={`${group.clientId}-${group.teamId}-${groupIndex}`} className="flex flex-col gap-4">
                      {/* Header del grupo */}
                      <div className="flex flex-col gap-1">
                        <p className="text-[#0097B2] font-medium text-base">
                          Client {group.clientName} | Team {group.teamName}
                        </p>
                      </div>

                      {/* Tabla para este grupo */}
                      <div className="border border-[rgba(166,166,166,0.5)] rounded-[10px] overflow-hidden shadow-[0px_4px_4px_rgba(166,166,166,0.25)]">
                        <DataTable
                          config={tableConfig}
                          data={group.contractors}
                          loading={false}
                        />
                      </div>

                      {/* Summary del grupo */}
                      {groupSummary && (
                        <div className="bg-white border border-[rgba(166,166,166,0.5)] rounded-[5px] p-4 flex gap-10 items-center">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-50 p-2 rounded-lg">
                              <NotebookTabs className="w-6 h-6 text-[#0097B2]" />
                            </div>
                            <div>
                              <p className="text-[12px] text-[#6D6D6D]">{t("totalTeam")}</p>
                              <p className="text-base font-semibold text-[#0097B2]">{groupSummary.contractors}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-50 p-2 rounded-lg">
                              <Hourglass className="w-6 h-6 text-[#0097B2]" />
                            </div>
                            <div>
                              <p className="text-[12px] text-[#6D6D6D]">{t("totalAvgDuration")}</p>
                              <p className="text-base font-semibold text-[#0097B2]">{formatSecondsToTime(groupSummary.avgSeconds)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-50 p-2 rounded-lg">
                              <Target className="w-6 h-6 text-[#0097B2]" />
                            </div>
                            <div>
                              <p className="text-[12px] text-[#6D6D6D]">{t("totalAvgProductivity")}</p>
                              <p className="text-base font-semibold text-[#0097B2]">{groupSummary.avgProductivity}%</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
        </div>
      </div>
    </div>
  );
}

