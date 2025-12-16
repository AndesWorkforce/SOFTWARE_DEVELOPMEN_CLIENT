"use client";

import { useRouter, useParams } from "next/navigation";
import { useLocale } from "next-intl";
import { DeleteContractorModal } from "@/app/[locale]/(authorized)/app/super-admin/contractors/@modal/(.)delete/[id]/DeleteContractorModal";

export default function DeleteContractorPage() {
  const router = useRouter();
  const locale = useLocale();
  const params = useParams();
  const contractorId = params?.id as string;

  const handleClose = () => {
    const basePath = `/${locale}/app/super-admin/contractors`;
    router.push(basePath);
  };

  if (!contractorId) return null;

  return <DeleteContractorModal contractorId={contractorId} onClose={handleClose} />;
}
