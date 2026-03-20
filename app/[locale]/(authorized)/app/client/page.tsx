"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { ClientCalendar } from "@/packages/design-system/components/ClientCalendar";
import { useClientCalendar } from "@/packages/shared-views/clients";
import { useAuthStore } from "@/packages/store";

export default function ClientPage() {
  const { user } = useAuthStore();
  const clientId = user?.id || "";
  const { clientName, cards, teams } = useClientCalendar(clientId);
  const router = useRouter();
  const locale = useLocale();

  const handleContractorHistoryClick = (contractorId: string, contractorName: string) => {
    router.push(
      `/${locale}/app/client/contractors/contractor-history/${contractorId}?name=${encodeURIComponent(contractorName)}`,
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <ClientCalendar
        clientId={clientId}
        clientName={clientName}
        cards={cards}
        teams={teams}
        onContractorHistoryClick={handleContractorHistoryClick}
      />
    </div>
  );
}
