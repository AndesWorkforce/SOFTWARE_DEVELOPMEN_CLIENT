"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { EditContractorModal } from "@/app/[locale]/(authorized)/app/admin/contractors/@modal/(.)edit/[id]/EditContractorModal";

export function EditContractorModalWrapper({
  clientId,
  contractorId,
}: {
  clientId: string;
  contractorId: string;
}) {
  const locale = useLocale();
  const router = useRouter();
  const basePath = `/${locale}/app/admin/clients/${clientId}`;

  const close = () => {
    router.back();
    window.setTimeout(() => {
      router.replace(basePath);
    }, 50);
  };

  return <EditContractorModal contractorId={contractorId} onClose={close} />;
}
