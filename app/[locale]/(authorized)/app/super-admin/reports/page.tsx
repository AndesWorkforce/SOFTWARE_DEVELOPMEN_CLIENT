"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button, Select, DateRangePicker, Header } from "@/packages/design-system";
import { Download, ListFilter, List, ChevronDown, ChevronRight } from "lucide-react";
import {
  reportsService,
  type ReportFilters,
  type UserActivity,
  type FilterOptions,
} from "@/packages/api/reports/reports.service";

export default function ReportsPage() {
  const t = useTranslations("reports");
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: {
      start: new Date().toISOString().split("T")[0],
      end: new Date().toISOString().split("T")[0],
    },
  });
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Using mock data for now - replace with real API calls when backend is ready
      const mockActivities = reportsService.getMockActivityData();
      const mockOptions = reportsService.getMockFilterOptions();

      setActivities(mockActivities);
      setFilterOptions(mockOptions);

      // TODO: Replace with real API calls
      // const [activitiesData, optionsData] = await Promise.all([
      //   reportsService.getActivityToday(filters),
      //   reportsService.getFilterOptions(),
      // ]);
      // setActivities(activitiesData);
      // setFilterOptions(optionsData);
    } catch (error) {
      console.error("Error loading reports data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof ReportFilters, value: string | undefined) => {
    setFilters((prev: ReportFilters) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleDateRangeChange = (start: string, end: string) => {
    setFilters((prev: ReportFilters) => ({
      ...prev,
      dateRange: { start, end },
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      dateRange: {
        start: new Date().toISOString().split("T")[0],
        end: new Date().toISOString().split("T")[0],
      },
    });
  };

  return (
    <>
      <Header userName="User" />
      <div
        className="p-4 md:p-8 min-h-screen"
        style={{ background: "#FFFFFF", paddingTop: "75px" }}
      >
        <div className="max-w-full">
          {/* Page Title and Export Button */}
          <div className="mb-6 md:mb-8 flex items-center justify-between">
            <h1 className="text-xl md:text-3xl font-bold" style={{ color: "#000000" }}>
              {t("title")}
            </h1>
            <Button
              variant="primary"
              style={{
                background: "#0097B2",
                color: "#FFFFFF",
                fontSize: "14px",
                padding: "7px 21px",
                height: "35px",
              }}
            >
              <Download className="w-3.5 h-3.5 md:w-5 md:h-5 mr-2" />
              <span className="hidden md:inline">{t("exportPdf")}</span>
              <span className="md:hidden">Export PDF</span>
            </Button>
          </div>

          {/* Filters Panel */}
          <div
            className="mb-6 md:mb-8 rounded-[10px] p-6 md:p-6"
            style={{
              background: "#FFFFFF",
              color: "#000000",
              border: "1px solid rgba(166,166,166,0.5)",
              boxShadow: "0px 4px 4px rgba(166,166,166,0.25)",
            }}
          >
            <div className="flex items-center gap-2 mb-4 md:mb-4">
              <ListFilter className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-sm md:text-lg font-semibold" style={{ color: "#000000" }}>
                {t("applyFilters")}
              </span>
            </div>

            <div className="flex flex-col md:flex-row items-stretch md:items-end gap-3">
              {/* Date Range */}
              <div className="flex-shrink-0" style={{ minWidth: "260px" }}>
                <DateRangePicker
                  label={t("date")}
                  startDate={filters.dateRange?.start || ""}
                  endDate={filters.dateRange?.end || ""}
                  onStartDateChange={(start) =>
                    handleDateRangeChange(start, filters.dateRange?.end || start)
                  }
                  onEndDateChange={(end) =>
                    handleDateRangeChange(filters.dateRange?.start || end, end)
                  }
                />
              </div>

              {/* User + Country row on mobile */}
              <div className="flex gap-3 w-full">
                {/* User */}
                <div className="flex-1" style={{ minWidth: "0" }}>
                  <Select
                    label={t("user")}
                    value={filters.userId || ""}
                    onChange={(e) => handleFilterChange("userId", e.target.value || undefined)}
                    options={[{ value: "", label: "Select..." }, ...(filterOptions?.users || [])]}
                    className="text-black"
                  />
                </div>

                {/* Country */}
                <div className="flex-1" style={{ minWidth: "0" }}>
                  <Select
                    label={t("country")}
                    value={filters.country || ""}
                    onChange={(e) => handleFilterChange("country", e.target.value || undefined)}
                    options={[
                      { value: "", label: "Select..." },
                      ...(filterOptions?.countries || []),
                    ]}
                    className="text-black"
                  />
                </div>
              </div>

              {/* Client + Team row on mobile */}
              <div className="flex gap-3 w-full">
                {/* Client */}
                <div className="flex-1" style={{ minWidth: "0" }}>
                  <Select
                    label={t("client")}
                    value={filters.clientId || ""}
                    onChange={(e) => handleFilterChange("clientId", e.target.value || undefined)}
                    options={[{ value: "", label: "Select..." }, ...(filterOptions?.clients || [])]}
                    className="text-black"
                  />
                </div>

                {/* Team */}
                <div className="flex-1" style={{ minWidth: "0" }}>
                  <Select
                    label={t("team")}
                    value={filters.teamId || ""}
                    onChange={(e) => handleFilterChange("teamId", e.target.value || undefined)}
                    options={[{ value: "", label: "Select..." }, ...(filterOptions?.teams || [])]}
                    className="text-black"
                  />
                </div>
              </div>

              {/* Job Position + Clean filters row on mobile */}
              <div className="flex gap-3 w-full">
                {/* Job Position */}
                <div className="flex-1" style={{ minWidth: "0" }}>
                  <Select
                    label={t("jobPosition")}
                    value={filters.jobPosition || ""}
                    onChange={(e) => handleFilterChange("jobPosition", e.target.value || undefined)}
                    options={[
                      { value: "", label: "Select..." },
                      ...(filterOptions?.jobPositions || []),
                    ]}
                    className="text-black"
                  />
                </div>

                {/* Clean filters button */}
                <div className="flex-1" style={{ minWidth: "0" }}>
                  <div className="h-full flex items-end">
                    <Button
                      variant="danger"
                      onClick={handleClearFilters}
                      style={{
                        background: "#FF0004",
                        color: "#FFFFFF",
                        width: "100%",
                        fontSize: "12px",
                        padding: "9px 16px",
                        height: "35px",
                      }}
                    >
                      {t("cleanFilters")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Today Section */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6" style={{ color: "#000000" }}>
              {t("activityToday")}
            </h2>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : activities.length === 0 ? (
              <div
                className="rounded-lg shadow-md p-12 text-center"
                style={{ background: "#FFFFFF" }}
              >
                <p style={{ color: "#000000" }}>{t("noActivities")}</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div
                  className="hidden md:block rounded-lg shadow-md overflow-hidden"
                  style={{ background: "#FFFFFF" }}
                >
                  <div className="overflow-x-auto">
                    <table className="w-full table-fixed" style={{ tableLayout: "fixed" }}>
                      <thead>
                        <tr>
                          <th
                            className="px-6 py-3 text-center text-base font-semibold"
                            style={{ color: "#000000", width: "200px" }}
                          >
                            {t("table.user")}
                          </th>
                          <th
                            className="px-6 py-3 text-center text-base font-semibold"
                            style={{ color: "#000000", width: "200px" }}
                          >
                            {t("table.jobPosition")}
                          </th>
                          <th
                            className="px-6 py-3 text-center text-base font-semibold"
                            style={{ color: "#000000", width: "160px" }}
                          >
                            {t("table.client")}
                          </th>
                          <th
                            className="px-6 py-3 text-center text-base font-semibold"
                            style={{ color: "#000000", width: "120px" }}
                          >
                            {t("table.team")}
                          </th>
                          <th
                            className="px-6 py-3 text-center text-base font-semibold"
                            style={{ color: "#000000", width: "150px" }}
                          >
                            {t("table.country")}
                          </th>
                          <th
                            className="px-6 py-3 text-center text-base font-semibold"
                            style={{ color: "#000000", width: "100px" }}
                          >
                            {t("table.time")}
                          </th>
                          <th
                            className="px-6 py-3 text-center text-base font-semibold"
                            style={{ color: "#000000", width: "100px" }}
                          >
                            {t("table.activity")}
                          </th>
                          <th
                            className="px-6 py-3 text-center text-base font-semibold"
                            style={{ color: "#000000", width: "100px", whiteSpace: "normal" }}
                          >
                            {t("table.activityDetail")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {activities.map((activity, index) => {
                          const getActivityStyle = (percentage: number) => {
                            return {
                              color: percentage >= 50 ? "#2EC36D" : "#FF0004",
                              fontWeight: 700,
                            } as React.CSSProperties;
                          };

                          const isEvenRow = index % 2 === 1;

                          return (
                            <tr
                              key={activity.id}
                              style={{
                                background: isEvenRow ? "#E2E2E2" : "#FFFFFF",
                                borderBottom: "none",
                              }}
                            >
                              <td
                                className="px-6 py-4 whitespace-nowrap text-base text-center"
                                style={{ color: "#000000", width: "200px" }}
                              >
                                {activity.user.name}
                              </td>
                              <td
                                className="px-6 py-4 whitespace-nowrap text-base text-center"
                                style={{ color: "#000000", width: "200px" }}
                              >
                                {activity.jobPosition}
                              </td>
                              <td
                                className="px-6 py-4 whitespace-nowrap text-base text-center"
                                style={{ color: "#000000", width: "160px" }}
                              >
                                {activity.client.name}
                              </td>
                              <td
                                className="px-6 py-4 whitespace-nowrap text-base text-center"
                                style={{ color: "#000000", width: "120px" }}
                              >
                                {activity.team.name}
                              </td>
                              <td
                                className="px-6 py-4 whitespace-nowrap text-base text-center"
                                style={{ color: "#000000", width: "150px" }}
                              >
                                {activity.country}
                              </td>
                              <td
                                className="px-6 py-4 whitespace-nowrap text-base font-semibold text-center"
                                style={{ color: "#000000", width: "100px" }}
                              >
                                {activity.timeWorked}
                              </td>
                              <td
                                className="px-6 py-4 whitespace-nowrap text-base text-center"
                                style={{ width: "100px" }}
                              >
                                <span style={getActivityStyle(activity.activityPercentage)}>
                                  {activity.activityPercentage}%
                                </span>
                              </td>
                              <td
                                className="px-6 py-4 whitespace-nowrap text-base text-center"
                                style={{ color: "#000000", width: "100px" }}
                              >
                                <button className="mx-auto inline-flex items-center gap-1 hover:text-blue-600 transition-colors">
                                  <List className="w-3.5 h-3.5" />
                                  <span className="underline text-sm">{t("viewDetail")}</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Card View */}
                <div
                  className="md:hidden rounded-[10px] overflow-hidden"
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid rgba(166,166,166,0.5)",
                    boxShadow: "0px 4px 4px rgba(166,166,166,0.25)",
                  }}
                >
                  {activities.map((activity, index) => {
                    const isExpanded = expandedCardId === activity.id;
                    const isEvenRow = index % 2 === 1;
                    const getActivityStyle = (percentage: number) =>
                      ({
                        color: percentage >= 50 ? "#2EC36D" : "#FF0004",
                        fontWeight: 700,
                      }) as React.CSSProperties;

                    return (
                      <div
                        key={activity.id}
                        style={{ background: isEvenRow ? "#E2E2E2" : "#FFFFFF" }}
                        className="p-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-1">
                              <span
                                className="font-semibold"
                                style={{ color: "#000000", fontSize: "16px" }}
                              >
                                User:{" "}
                              </span>
                              <span style={{ color: "#000000", fontSize: "16px" }}>
                                {activity.user.name}
                              </span>
                            </div>
                            <div className="mb-1">
                              <span
                                className="font-semibold"
                                style={{ color: "#000000", fontSize: "16px" }}
                              >
                                Job Position:{" "}
                              </span>
                              <span style={{ color: "#000000", fontSize: "16px" }}>
                                {activity.jobPosition}
                              </span>
                            </div>

                            {isExpanded && (
                              <>
                                <div className="mb-1">
                                  <span
                                    className="font-semibold"
                                    style={{ color: "#000000", fontSize: "16px" }}
                                  >
                                    Team:{" "}
                                  </span>
                                  <span style={{ color: "#000000", fontSize: "16px" }}>
                                    {activity.team.name}
                                  </span>
                                </div>
                                <div className="mb-1">
                                  <span
                                    className="font-semibold"
                                    style={{ color: "#000000", fontSize: "16px" }}
                                  >
                                    Country:{" "}
                                  </span>
                                  <span style={{ color: "#000000", fontSize: "16px" }}>
                                    {activity.country}
                                  </span>
                                </div>
                                <div className="mb-1">
                                  <span
                                    className="font-semibold"
                                    style={{ color: "#000000", fontSize: "16px" }}
                                  >
                                    Time:{" "}
                                  </span>
                                  <span
                                    style={{ color: "#000000", fontSize: "16px", fontWeight: 600 }}
                                  >
                                    {activity.timeWorked}
                                  </span>
                                </div>
                                <div className="mb-1">
                                  <span
                                    className="font-semibold"
                                    style={{ color: "#000000", fontSize: "16px" }}
                                  >
                                    Activity:{" "}
                                  </span>
                                  <span style={getActivityStyle(activity.activityPercentage)}>
                                    {activity.activityPercentage}%
                                  </span>
                                </div>
                                <div className="mb-1">
                                  <span
                                    className="font-semibold"
                                    style={{ color: "#000000", fontSize: "16px" }}
                                  >
                                    Activity Detail:{" "}
                                  </span>
                                </div>
                                <button className="flex items-center gap-1 mt-2 ml-16">
                                  <List className="w-3.5 h-3.5" />
                                  <span className="underline text-sm" style={{ color: "#000000" }}>
                                    View
                                  </span>
                                </button>
                              </>
                            )}
                          </div>
                          <button
                            onClick={() => setExpandedCardId(isExpanded ? null : activity.id)}
                            className="ml-2 flex-shrink-0"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5" style={{ color: "#000000" }} />
                            ) : (
                              <ChevronRight className="w-5 h-5" style={{ color: "#000000" }} />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
