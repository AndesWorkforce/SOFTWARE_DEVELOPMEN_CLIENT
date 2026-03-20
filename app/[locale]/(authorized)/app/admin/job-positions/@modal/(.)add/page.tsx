"use client";

import { useRouter } from "next/navigation";
import { AddJobPositionModal } from "@/app/[locale]/(authorized)/app/super-admin/job-positions/@modal/(.)add/AddJobPositionModal";

export default function AdminAddJobPositionModalPage() {
  const router = useRouter();

  return <AddJobPositionModal onClose={() => router.back()} />;
}
