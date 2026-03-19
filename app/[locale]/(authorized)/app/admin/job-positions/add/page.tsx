"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { AddJobPositionModal } from "@/app/[locale]/(authorized)/app/super-admin/job-positions/@modal/(.)add/AddJobPositionModal";

export default function AdminAddJobPositionPage() {
  const router = useRouter();
  const locale = useLocale();

  const handleClose = () => {
    router.push(`/${locale}/app/admin/job-positions`);
  };

  return <AddJobPositionModal onClose={handleClose} />;
}
