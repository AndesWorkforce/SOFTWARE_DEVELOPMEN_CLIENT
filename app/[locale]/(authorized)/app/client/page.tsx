"use client";

import { ClientCalendar } from "@/packages/design-system/components/ClientCalendar";
import { useClientCalendar } from "@/packages/shared-views/clients";
import { useAuthStore } from "@/packages/store";

export default function ClientPage() {
  const { user } = useAuthStore();
  const clientId = user?.id || "";
  const { clientName, cards, teams } = useClientCalendar(clientId);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <ClientCalendar clientId={clientId} clientName={clientName} cards={cards} teams={teams} />
    </div>
  );
}
