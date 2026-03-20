"use client";

import { useRouter, useParams } from "next/navigation";
import { useLocale } from "next-intl";
import { DeleteJobPositionModal } from "@/app/[locale]/(authorized)/app/super-admin/job-positions/@modal/(.)delete/[id]/DeleteJobPositionModal";

export default function DeleteJobPositionPage() {
  const router = useRouter();
  const locale = useLocale();
  const params = useParams();
  const positionId = params?.id as string;

  const handleClose = () => {
    router.push(`/${locale}/app/super-admin/job-positions`);
  };

  if (!positionId) return null;

  return <DeleteJobPositionModal positionId={positionId} onClose={handleClose} />;
}
