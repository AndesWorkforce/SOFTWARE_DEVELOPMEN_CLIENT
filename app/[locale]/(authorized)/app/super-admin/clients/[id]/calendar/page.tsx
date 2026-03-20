"use client";

import { use } from "react";

import { ClientCalendar } from "@/packages/design-system/components/ClientCalendar";
import { useClientCalendar } from "@/packages/shared-views/clients";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SuperAdminClientCalendarPage({ params }: PageProps) {
  const { id: clientId } = use(params);
  const { clientName, cards, teams } = useClientCalendar(clientId);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <ClientCalendar
        clientId={clientId}
        clientName={clientName}
        cards={cards}
        teams={teams}
      />
    </div>
  );
}
