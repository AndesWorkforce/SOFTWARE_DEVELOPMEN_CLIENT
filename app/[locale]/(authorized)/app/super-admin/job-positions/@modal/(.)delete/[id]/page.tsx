"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { DeleteJobPositionModal } from "./DeleteJobPositionModal";

export default function DeleteJobPositionModalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  return <DeleteJobPositionModal positionId={id} onClose={() => router.back()} />;
}
