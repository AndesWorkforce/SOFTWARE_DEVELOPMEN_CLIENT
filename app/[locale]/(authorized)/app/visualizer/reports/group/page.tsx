"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { GroupReportsView } from "@/packages/design-system";

export default function GroupReportsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();

  const getDefaultDate = () => new Date().toISOString().split("T")[0];

  const [startDate] = useState<string>(() => {
    const fromParam = searchParams?.get("from");
    return fromParam ? fromParam.split("T")[0] : getDefaultDate();
  });

  const [endDate] = useState<string>(() => {
    const toParam = searchParams?.get("to");
    return toParam ? toParam.split("T")[0] : getDefaultDate();
  });

  const [country] = useState(searchParams?.get("country") || "");
  const [clientId] = useState(searchParams?.get("clientId") || "");
  const [teamId] = useState(searchParams?.get("teamId") || "");
  const [jobPosition] = useState(searchParams?.get("jobPosition") || "");

  const handleBack = () => router.push(`/${locale}/app/visualizer/reports`);

  return (
    <GroupReportsView
      startDate={startDate}
      endDate={endDate}
      country={country}
      clientId={clientId}
      teamId={teamId}
      jobPosition={jobPosition}
      onBack={handleBack}
    />
  );
}
