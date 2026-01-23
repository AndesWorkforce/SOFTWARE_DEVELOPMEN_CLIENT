"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { DeleteContractorModal } from "@/app/[locale]/(authorized)/app/admin/contractors/@modal/(.)delete/[id]/DeleteContractorModal";

export function DeleteContractorModalWrapper({
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

  return <DeleteContractorModal contractorId={contractorId} onClose={close} />;
}
