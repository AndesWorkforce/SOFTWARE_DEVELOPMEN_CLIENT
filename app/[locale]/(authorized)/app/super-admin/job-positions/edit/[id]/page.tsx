"use client";

import { useRouter, useParams } from "next/navigation";
import { useLocale } from "next-intl";
import { EditJobPositionModal } from "@/app/[locale]/(authorized)/app/super-admin/job-positions/@modal/(.)edit/[id]/EditJobPositionModal";

export default function EditJobPositionPage() {
  const router = useRouter();
  const locale = useLocale();
  const params = useParams();
  const positionId = params?.id as string;

  const handleClose = () => {
    router.push(`/${locale}/app/super-admin/job-positions`);
  };

  if (!positionId) return null;

  return <EditJobPositionModal positionId={positionId} onClose={handleClose} />;
}
