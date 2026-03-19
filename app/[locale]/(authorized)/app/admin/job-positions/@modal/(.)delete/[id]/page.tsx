"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { DeleteJobPositionModal } from "@/app/[locale]/(authorized)/app/super-admin/job-positions/@modal/(.)delete/[id]/DeleteJobPositionModal";

export default function AdminDeleteJobPositionModalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  return <DeleteJobPositionModal positionId={id} onClose={() => router.back()} />;
}
