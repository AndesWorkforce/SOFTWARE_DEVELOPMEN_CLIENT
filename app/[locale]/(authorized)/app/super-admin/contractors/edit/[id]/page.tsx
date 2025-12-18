"use client";

import { useRouter, useParams } from "next/navigation";
import { useLocale } from "next-intl";
import { EditContractorModal } from "@/app/[locale]/(authorized)/app/super-admin/contractors/@modal/(.)edit/[id]/EditContractorModal";

export default function EditContractorPage() {
  const router = useRouter();
  const locale = useLocale();
  const params = useParams();
  const contractorId = params?.id as string;

  const handleClose = () => {
    const basePath = `/${locale}/app/super-admin/contractors`;
    router.push(basePath);
  };

  if (!contractorId) return null;

  return <EditContractorModal contractorId={contractorId} onClose={handleClose} />;
}
