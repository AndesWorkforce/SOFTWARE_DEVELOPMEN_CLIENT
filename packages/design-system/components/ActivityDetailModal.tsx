"use client";
import { Modal } from "./Modal";
import type { UserActivity } from "@/packages/api/reports/reports.types";

export interface ActivityDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: UserActivity | null;
  t: (key: string) => string;
}

export const ActivityDetailModal = ({ isOpen, onClose, activity, t }: ActivityDetailModalProps) => {
  if (!activity) return null;

  const formatSecondsToTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m`;
  };

  const getActiveTime = () => {
    if (!activity.metrics) return "00h 00m";
    const totalSeconds = activity.metrics.activeBeats * 60;
    return formatSecondsToTime(totalSeconds);
  };

  const getInactiveTime = () => {
    if (!activity.metrics) return "00h 00m";
    const totalSeconds = activity.metrics.idleBeats * 60;
    return formatSecondsToTime(totalSeconds);
  };

  const getSessionCount = () => {
    return activity.metrics?.totalBeats ? Math.ceil(activity.metrics.totalBeats / 120) : 0;
  };

  const getAvgDuration = () => {
    const sessionCount = getSessionCount();
    if (sessionCount === 0 || !activity.metrics) return "0h 00m";
    const avgSeconds = (activity.metrics.totalBeats * 60) / sessionCount;
    return formatSecondsToTime(avgSeconds);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" showHeader={false}>
      <div className="space-y-6">
        {/* Header with User Info */}
        <div
          className="flex items-center justify-between pb-4 border-b"
          style={{ borderColor: "#E5E5E5" }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold"
              style={{ background: "#0097B2" }}
            >
              {activity.user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-bold" style={{ color: "#000000" }}>
                {activity.user.name}
              </h3>
              <p className="text-sm" style={{ color: "#6B7280" }}>
                {activity.jobPosition} | {activity.team.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: "#000000" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Activity Detail Header */}
        <div>
          <h4 className="text-lg font-bold mb-2" style={{ color: "#000000" }}>
            {t("modal.activityDetail")}
          </h4>
          <p className="text-sm" style={{ color: "#9CA3AF" }}>
            {t("modal.today")}, {activity.date}
          </p>
        </div>

        {/* Agent Dropdown */}
        <div>
          <select
            className="w-full px-4 py-2 rounded-lg border"
            style={{
              borderColor: "#D1D5DB",
              background: "#FFFFFF",
              color: "#000000",
            }}
          >
            <option>Agent VM-Dev-01</option>
          </select>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Time Breakdown */}
            <div
              className="p-6 rounded-lg"
              style={{
                background: "#FFFFFF",
                border: "1px solid #E5E5E5",
              }}
            >
              <h5 className="font-bold mb-4" style={{ color: "#000000" }}>
                {t("modal.timeBreakdown")}
              </h5>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm" style={{ color: "#6B7280" }}>
                      {t("modal.totalTime")}
                    </span>
                    <span className="font-bold text-2xl" style={{ color: "#000000" }}>
                      {activity.timeWorked}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full" style={{ background: "#2EC36D" }} />
                    <span className="text-sm" style={{ color: "#6B7280" }}>
                      {t("modal.activeTime")}
                    </span>
                  </div>
                  <span className="font-bold text-xl" style={{ color: "#2EC36D" }}>
                    {getActiveTime()}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full" style={{ background: "#FF0004" }} />
                    <span className="text-sm" style={{ color: "#6B7280" }}>
                      {t("modal.inactiveTime")}
                    </span>
                  </div>
                  <span className="font-bold text-xl" style={{ color: "#FF0004" }}>
                    {getInactiveTime()}
                  </span>
                </div>
              </div>
            </div>

            {/* Session & Connectivity */}
            <div
              className="p-6 rounded-lg"
              style={{
                background: "#FFFFFF",
                border: "1px solid #E5E5E5",
              }}
            >
              <h5 className="font-bold mb-4" style={{ color: "#000000" }}>
                {t("modal.sessionConnectivity")}
              </h5>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm mb-1" style={{ color: "#6B7280" }}>
                    {t("modal.sessionCount")}
                  </p>
                  <p className="text-3xl font-bold" style={{ color: "#000000" }}>
                    {getSessionCount()}
                  </p>
                </div>
                <div>
                  <p className="text-sm mb-1" style={{ color: "#6B7280" }}>
                    {t("modal.avgDuration")}
                  </p>
                  <p className="text-3xl font-bold" style={{ color: "#000000" }}>
                    {getAvgDuration()}
                  </p>
                </div>
              </div>
              {/* Simple bar chart placeholder */}
              <div className="h-32 flex items-end justify-between gap-1">
                {[20, 40, 30, 50, 35, 45, 25, 40].map((height, index) => (
                  <div
                    key={index}
                    className="flex-1 rounded-t"
                    style={{
                      background: "#0097B2",
                      height: `${height}%`,
                    }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs" style={{ color: "#9CA3AF" }}>
                <span>08:00</span>
                <span>09:00</span>
                <span>11:00</span>
                <span>13:00</span>
                <span>16:00</span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Input Totals */}
            <div
              className="p-6 rounded-lg"
              style={{
                background: "#FFFFFF",
                border: "1px solid #E5E5E5",
              }}
            >
              <h5 className="font-bold mb-4" style={{ color: "#000000" }}>
                {t("modal.inputTotals")}
              </h5>
              <div className="space-y-3">
                <div>
                  <p className="text-sm mb-1" style={{ color: "#6B7280" }}>
                    {t("modal.totalKeyboardInputs")}
                  </p>
                  <p className="text-2xl font-bold" style={{ color: "#000000" }}>
                    {activity.metrics?.totalKeyboardInputs?.toLocaleString() || "0"}
                  </p>
                </div>
                <div>
                  <p className="text-sm mb-1" style={{ color: "#6B7280" }}>
                    {t("modal.totalMouseInputs")}
                  </p>
                  <p className="text-2xl font-bold" style={{ color: "#000000" }}>
                    {activity.metrics?.totalMouseClicks?.toLocaleString() || "0"}
                  </p>
                </div>
              </div>
            </div>

            {/* Top Applications */}
            <div
              className="p-6 rounded-lg"
              style={{
                background: "#FFFFFF",
                border: "1px solid #E5E5E5",
              }}
            >
              <h5 className="font-bold mb-4" style={{ color: "#000000" }}>
                {t("modal.topApplications")}
              </h5>
              <div className="space-y-3">
                {activity.metrics?.appUsage && activity.metrics.appUsage.length > 0 ? (
                  activity.metrics.appUsage.slice(0, 5).map((app, index) => {
                    const icon = app.appName.toLowerCase().includes("code")
                      ? "💻"
                      : app.appName.toLowerCase().includes("chrome")
                        ? "🌐"
                        : app.appName.toLowerCase().includes("figma")
                          ? "🎨"
                          : app.appName.toLowerCase().includes("slack")
                            ? "💬"
                            : app.appName.toLowerCase().includes("teams")
                              ? "📞"
                              : "📱";

                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{icon}</span>
                          <span className="text-sm font-medium" style={{ color: "#000000" }}>
                            {app.appName}
                          </span>
                        </div>
                        <span className="text-sm font-semibold" style={{ color: "#6B7280" }}>
                          {formatSecondsToTime(app.seconds)}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-center py-4" style={{ color: "#9CA3AF" }}>
                    {t("modal.noApplicationData")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
