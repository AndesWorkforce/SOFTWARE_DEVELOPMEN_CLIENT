"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { MetricCard, ChartCard, EmptyState } from "@/packages/design-system";
import {
  metricsService,
  type HeartbeatMetrics,
  type EventData,
} from "@/packages/api/metrics/metrics.service";

export default function ClientPage() {
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();
  const [metrics, setMetrics] = useState<HeartbeatMetrics | null>(null);
  const [recentHeartbeats, setRecentHeartbeats] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initial load
    loadMetrics(true);

    // Auto-refresh every 10 seconds (without loading state)
    const interval = setInterval(() => loadMetrics(false), 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMetrics = async (showLoading: boolean = false) => {
    try {
      // Only show loading spinner on initial load
      if (showLoading) {
        setLoading(true);
      }
      setError(null);

      // Get events
      const events = await metricsService.getEvents();

      // Calculate metrics from events
      const data = await metricsService.getMetrics();
      setMetrics(data);

      // Set recent heartbeats (last 20 events, sorted by timestamp)
      const sortedEvents = [...events].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
      setRecentHeartbeats(sortedEvents.slice(0, 20));
    } catch (err) {
      console.error("Error loading metrics:", err);
      const error = err as {
        response?: { status?: number; data?: { message?: string } };
        code?: string;
      };

      // Check if it's an authentication error
      if (error.response?.status === 401) {
        setError(t("dashboard.errors.authError") || "Authentication required. Please login again.");
        setTimeout(() => {
          router.push(`/${locale}/login`);
        }, 2000);
        return;
      }

      // Si no hay datos, mostrar estructura vacía en lugar de error
      if (error.response?.status === 404 || error.code === "ERR_NETWORK") {
        setMetrics({
          totalSessions: 0,
          activeSessions: 0,
          totalEvents: 0,
          averageProductivity: 0,
          topApplications: [],
          productivityTrend: [],
          sessionHistory: [],
        });
        setError(
          error.code === "ERR_NETWORK"
            ? t("dashboard.errors.cannotConnect")
            : t("dashboard.errors.noDataYet"),
        );
      } else {
        setError(error.response?.data?.message || t("dashboard.errors.loadError"));
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);

    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;

    return date.toLocaleString(locale, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActivityStatus = (event: EventData) => {
    const idleTime = event.payload.IdleTime || 0;
    const keyboardInactive = event.payload.Keyboard?.InactiveTime || 0;
    const mouseInactive = event.payload.Mouse?.InactiveTime || 0;

    if (idleTime > 0)
      return {
        status: "idle",
        color: "text-yellow-600 dark:text-yellow-400",
        bg: "bg-yellow-100 dark:bg-yellow-900/30",
      };
    if (keyboardInactive === 0 || mouseInactive === 0)
      return {
        status: "active",
        color: "text-green-600 dark:text-green-400",
        bg: "bg-green-100 dark:bg-green-900/30",
      };
    return {
      status: "inactive",
      color: "text-gray-600 dark:text-gray-400",
      bg: "bg-gray-100 dark:bg-gray-800",
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t("dashboard.title")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{t("dashboard.subtitle")}</p>
        </div>

        {error && (
          <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start gap-3">
            <svg
              className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-400 mb-1">
                {error.includes(t("dashboard.errors.cannotConnect"))
                  ? t("dashboard.errors.connectionIssue")
                  : t("dashboard.errors.noDataAvailable")}
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-400">{error}</p>
            </div>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title={t("dashboard.metrics.totalSessions")}
            value={metrics?.totalSessions || 0}
            subtitle={t("dashboard.subtitles.allTime")}
            loading={loading}
            icon={
              <svg
                className="w-6 h-6 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />

          <MetricCard
            title={t("dashboard.metrics.activeSessions")}
            value={metrics?.activeSessions || 0}
            subtitle={t("dashboard.subtitles.currentlyRunning")}
            loading={loading}
            icon={
              <svg
                className="w-6 h-6 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            }
          />

          <MetricCard
            title={t("dashboard.metrics.totalEvents")}
            value={metrics?.totalEvents.toLocaleString() || 0}
            subtitle={t("dashboard.subtitles.heartbeatsCaptured")}
            loading={loading}
            icon={
              <svg
                className="w-6 h-6 text-purple-600 dark:text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            }
          />

          <MetricCard
            title={t("dashboard.metrics.avgProductivity")}
            value={`${metrics?.averageProductivity || 0}%`}
            subtitle={t("dashboard.subtitles.last7Days")}
            loading={loading}
            trend={{
              value: 5.2,
              isPositive: true,
            }}
            icon={
              <svg
                className="w-6 h-6 text-orange-600 dark:text-orange-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            }
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Heartbeats */}
          <ChartCard
            title={t("dashboard.charts.recentHeartbeats") || "Recent Heartbeats"}
            subtitle={
              t("dashboard.charts.recentHeartbeatsSubtitle") || "Latest activity from agents"
            }
            loading={loading}
          >
            {recentHeartbeats && recentHeartbeats.length > 0 ? (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {recentHeartbeats.map((heartbeat) => {
                  const activityStatus = getActivityStatus(heartbeat);
                  return (
                    <div
                      key={heartbeat.id}
                      className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md transition-all"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {/* Status indicator */}
                          <div
                            className={`w-3 h-3 rounded-full flex-shrink-0 ${
                              activityStatus.status === "active"
                                ? "bg-green-500 animate-pulse"
                                : activityStatus.status === "idle"
                                  ? "bg-yellow-500"
                                  : "bg-gray-400"
                            }`}
                          ></div>

                          {/* Agent ID */}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                Agent ID:
                              </span>
                              <span className="text-xs font-mono text-blue-600 dark:text-blue-400">
                                {heartbeat.agent_id || "unknown"}
                              </span>
                            </div>
                            {heartbeat.session_id && (
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                  Session:
                                </span>
                                <span className="text-xs font-mono text-purple-600 dark:text-purple-400">
                                  {heartbeat.session_id.substring(0, 12)}...
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Status badge and timestamp */}
                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${activityStatus.bg} ${activityStatus.color}`}
                          >
                            {activityStatus.status}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTimestamp(heartbeat.timestamp)}
                          </span>
                        </div>
                      </div>

                      {/* Payload Details */}
                      <div className="space-y-2">
                        {/* Activity Metrics */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-gray-50 dark:bg-gray-900/50 rounded p-2">
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Idle Time
                            </div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              {heartbeat.payload.IdleTime !== undefined
                                ? `${heartbeat.payload.IdleTime}s`
                                : "N/A"}
                            </div>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-900/50 rounded p-2">
                            <div className="text-xs text-gray-500 dark:text-gray-400">Keyboard</div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              {heartbeat.payload.Keyboard?.InactiveTime !== undefined
                                ? `${heartbeat.payload.Keyboard.InactiveTime}s`
                                : "N/A"}
                            </div>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-900/50 rounded p-2">
                            <div className="text-xs text-gray-500 dark:text-gray-400">Mouse</div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              {heartbeat.payload.Mouse?.InactiveTime !== undefined
                                ? `${heartbeat.payload.Mouse.InactiveTime}s`
                                : "N/A"}
                            </div>
                          </div>
                        </div>

                        {/* Active Applications */}
                        {heartbeat.payload.ActiveApplications &&
                          heartbeat.payload.ActiveApplications.length > 0 && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-2">
                              <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">
                                Active Applications ({heartbeat.payload.ActiveApplications.length})
                              </div>
                              <div className="space-y-1">
                                {heartbeat.payload.ActiveApplications.slice(0, 3).map(
                                  (app, idx) => (
                                    <div
                                      key={idx}
                                      className="text-xs text-blue-600 dark:text-blue-400 flex items-center justify-between"
                                    >
                                      <span className="font-medium truncate">{app.name}</span>
                                      <span className="text-gray-500 dark:text-gray-400 ml-2">
                                        {app.duration}min
                                      </span>
                                    </div>
                                  ),
                                )}
                                {heartbeat.payload.ActiveApplications.length > 3 && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                                    +{heartbeat.payload.ActiveApplications.length - 3} more
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                        {/* Full Payload (collapsed by default) */}
                        <details className="group">
                          <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1">
                            <svg
                              className="w-3 h-3 transition-transform group-open:rotate-90"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                            View full payload
                          </summary>
                          <div className="mt-2 p-2 bg-gray-900 dark:bg-black rounded text-xs font-mono text-green-400 overflow-x-auto">
                            <pre>{JSON.stringify(heartbeat.payload, null, 2)}</pre>
                          </div>
                        </details>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                }
                title={t("dashboard.empty.noHeartbeats") || "No Heartbeats"}
                description={
                  t("dashboard.empty.noHeartbeatsDesc") ||
                  "Heartbeat data will appear here once agents start sending events."
                }
              />
            )}
          </ChartCard>

          {/* Productivity Trend */}
          <ChartCard
            title={t("dashboard.charts.productivityTrend")}
            subtitle={t("dashboard.charts.productivityTrendSubtitle")}
            loading={loading}
          >
            {metrics?.productivityTrend && metrics.productivityTrend.length > 0 ? (
              <div className="space-y-3">
                {metrics.productivityTrend.map((day, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-16">
                      {new Date(day.date).toLocaleDateString("en", { weekday: "short" })}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-green-600 dark:bg-green-400 h-2 rounded-full"
                            style={{ width: `${day.productivity}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-12 text-right">
                          {day.productivity}%
                        </span>
                      </div>
                      <div className="flex gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>
                          {t("dashboard.time.active")}: {formatDuration(day.activeTime)}
                        </span>
                        <span>•</span>
                        <span>
                          {t("dashboard.time.idle")}: {formatDuration(day.idleTime)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                {t("dashboard.empty.noProductivityData")}
              </div>
            )}
          </ChartCard>
        </div>

        {/* Recent Sessions */}
        <ChartCard
          title={t("dashboard.charts.recentSessions")}
          subtitle={t("dashboard.charts.recentSessionsSubtitle")}
          loading={loading}
        >
          {metrics?.sessionHistory && metrics.sessionHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="text-left text-sm font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="pb-3">{t("dashboard.table.sessionId")}</th>
                    <th className="pb-3">{t("dashboard.table.startTime")}</th>
                    <th className="pb-3">{t("dashboard.table.duration")}</th>
                    <th className="pb-3">{t("dashboard.table.events")}</th>
                    <th className="pb-3">{t("dashboard.table.productivity")}</th>
                    <th className="pb-3">{t("dashboard.table.status")}</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-700 dark:text-gray-300">
                  {metrics.sessionHistory.map((session) => (
                    <tr
                      key={session.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-3 font-mono text-xs">{session.id.substring(0, 8)}...</td>
                      <td className="py-3">{new Date(session.startTime).toLocaleString()}</td>
                      <td className="py-3">{formatDuration(session.duration)}</td>
                      <td className="py-3">{session.eventsCount}</td>
                      <td className="py-3">
                        <span
                          className={`font-medium ${
                            session.productivity >= 70
                              ? "text-green-600 dark:text-green-400"
                              : session.productivity >= 40
                                ? "text-yellow-600 dark:text-yellow-400"
                                : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {session.productivity}%
                        </span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            session.status === "active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                        >
                          {session.status === "active"
                            ? t("dashboard.status.active")
                            : t("dashboard.status.completed")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              {t("dashboard.empty.noSessionData")}
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
