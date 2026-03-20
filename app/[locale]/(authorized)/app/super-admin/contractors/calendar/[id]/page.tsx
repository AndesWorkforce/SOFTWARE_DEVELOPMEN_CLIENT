"use client";

import { useRouter } from "next/navigation";
import { use } from "react";
import { ContractorCalendarModal } from "../../@modal/(.)calendar/[id]/ContractorCalendarModal";
import type { CalendarEvent } from "@/packages/design-system";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ContractorCalendarDirectPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);

  const handleClose = () => {
    router.push(`/app/super-admin/contractors`);
  };

  const handleEventClick = (_event: CalendarEvent) => {
    router.push(`/app/super-admin/contractors/contractor-history/${id}`);
  };

  // TODO: Obtener el nombre del contractor desde la API
  const contractorName = "Contractor"; // Placeholder

  return (
    <ContractorCalendarModal
      contractorId={id}
      contractorName={contractorName}
      onClose={handleClose}
      onEventClick={handleEventClick}
    />
  );
}
