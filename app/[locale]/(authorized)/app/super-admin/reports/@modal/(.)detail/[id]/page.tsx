"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ActivityDetailModal } from "@/packages/design-system";
import {
  adtService,
  type RealtimeMetrics,
  type ContractorSession,
} from "@/packages/api/adt/adt.service";
import type { UserActivity } from "@/packages/api/reports/reports.service";

export default function ActivityDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const t = useTranslations("reports");
  const contractorId = params?.id as string;

  // Obtener fechas de los query params y asegurar formato YYYY-MM-DD
  const getDateString = (dateStr: string | null): string => {
    if (!dateStr) {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    // Si ya está en formato YYYY-MM-DD, devolverlo tal cual
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    // Si tiene hora, solo tomar la parte de la fecha
    if (dateStr.includes("T")) {
      return dateStr.split("T")[0];
    }
    return dateStr;
  };

  const from = getDateString(searchParams?.get("from"));
  const to = getDateString(searchParams?.get("to"));

  const [activity, setActivity] = useState<UserActivity | null>(null);
  const [sessions, setSessions] = useState<ContractorSession[]>([]);
  const [loading, setLoading] = useState(true);

  const formatSecondsToTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const transformRealtimeMetricsToUserActivity = (metric: RealtimeMetrics): UserActivity => {
    return {
      id: metric.contractor_id,
      user: {
        id: metric.contractor_id,
        name: metric.contractor_name || `Contractor ${metric.contractor_id.slice(-6)}`,
        email: metric.contractor_email || `${metric.contractor_id}@example.com`,
      },
      jobPosition: metric.job_position || "N/A",
      client: {
        id: metric.client_id || "unknown",
        name: metric.client_name || "N/A",
      },
      team: {
        id: metric.team_id || "unknown",
        name: metric.team_name || "N/A",
      },
      country: metric.country || "N/A",
      timeWorked: formatSecondsToTime(metric.total_session_time_seconds),
      activityPercentage: Math.round(metric.active_percentage),
      date: metric.workday,
      details: [],
      metrics: {
        totalBeats: metric.total_beats,
        activeBeats: metric.active_beats,
        idleBeats: metric.idle_beats,
        totalKeyboardInputs: metric.total_keyboard_inputs,
        totalMouseClicks: metric.total_mouse_clicks,
        avgKeyboardPerMin: metric.avg_keyboard_per_min,
        avgMousePerMin: metric.avg_mouse_per_min,
        totalSessionTimeSeconds: metric.total_session_time_seconds,
        effectiveWorkSeconds: metric.effective_work_seconds,
        productivityScore: metric.productivity_score,
        appUsage: metric.app_usage,
        browserUsage: metric.browser_usage,
      },
    };
  };

  useEffect(() => {
    const loadActivity = async () => {
      if (!contractorId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Obtener métricas y sesiones en paralelo
        const [metric, contractorSessions] = await Promise.all([
          adtService.getRealtimeMetrics(
            contractorId,
            undefined, // workday (no se usa cuando hay from/to)
            true, // useCache
            from, // from date
            to, // to date
          ),
          adtService.getContractorSessions(contractorId, from, to),
        ]);

        if (metric) {
          const userActivity = transformRealtimeMetricsToUserActivity(metric);
          setActivity(userActivity);
        }

        setSessions(contractorSessions);
      } catch (error) {
        console.error("Error loading activity details:", error);
      } finally {
        setLoading(false);
      }
    };

    loadActivity();
  }, [contractorId, from, to]);

  const handleClose = () => {
    router.back();
  };

  return (
    <ActivityDetailModal
      isOpen={true}
      onClose={handleClose}
      activity={activity}
      t={t}
      dateRange={{ from, to }}
      sessions={sessions}
      isLoading={loading}
    />
  );
}
