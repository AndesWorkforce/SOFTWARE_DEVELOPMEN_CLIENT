"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { EditJobPositionModal } from "./EditJobPositionModal";

export default function EditJobPositionModalPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  return <EditJobPositionModal positionId={id} onClose={() => router.back()} />;
}
