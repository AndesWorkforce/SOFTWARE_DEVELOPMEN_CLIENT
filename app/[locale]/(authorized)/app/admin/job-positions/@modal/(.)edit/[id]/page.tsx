"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { EditJobPositionModal } from "@/app/[locale]/(authorized)/app/super-admin/job-positions/@modal/(.)edit/[id]/EditJobPositionModal";

export default function AdminEditJobPositionModalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  return <EditJobPositionModal positionId={id} onClose={() => router.back()} />;
}
