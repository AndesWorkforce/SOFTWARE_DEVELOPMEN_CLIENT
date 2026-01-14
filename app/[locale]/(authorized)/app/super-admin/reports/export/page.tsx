"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ExportPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect back to reports if accessed directly
    router.push("/app/super-admin/reports");
  }, [router]);

  return null;
}
