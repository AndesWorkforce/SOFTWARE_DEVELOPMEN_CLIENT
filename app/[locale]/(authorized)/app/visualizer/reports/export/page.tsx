"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ExportPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/app/visualizer/reports");
  }, [router]);

  return null;
}
