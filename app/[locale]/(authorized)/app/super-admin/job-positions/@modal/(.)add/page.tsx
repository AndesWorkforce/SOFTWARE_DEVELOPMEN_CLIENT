"use client";

import { useRouter } from "next/navigation";
import { AddJobPositionModal } from "./AddJobPositionModal";

export default function AddJobPositionModalPage() {
  const router = useRouter();

  return <AddJobPositionModal onClose={() => router.back()} />;
}
