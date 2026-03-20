"use client";

import { useRouter } from "next/navigation";
import { use } from "react";
import { ContractorCalendarModal } from "@/app/[locale]/(authorized)/app/admin/contractors/@modal/(.)calendar/[id]/ContractorCalendarModal";
import type { CalendarEvent } from "@/packages/design-system";

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default function ClientContractorCalendarPage({ params }: PageProps) {
  const router = useRouter();
  const { id, locale } = use(params);

  const handleClose = () => {
    router.push(`/${locale}/app/client/contractors`);
  };

  const handleEventClick = (_event: CalendarEvent) => {
    router.push(`/${locale}/app/client/contractors`);
  };

  return (
    <ContractorCalendarModal
      contractorId={id}
      onClose={handleClose}
      onEventClick={handleEventClick}
    />
  );
}
